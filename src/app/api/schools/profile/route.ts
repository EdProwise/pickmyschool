import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, School } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { getSchool, updateSchool, createSchool } from '@/lib/schoolsHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

async function authenticateRequest(request: NextRequest): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      )
    };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.role !== 'school') {
      return {
        error: NextResponse.json(
          { error: 'Only school users can access this endpoint', code: 'FORBIDDEN' },
          { status: 403 }
        )
      };
    }

    return { user: decoded };
  } catch (error) {
    console.error('JWT verification error:', error);
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // FIX: await the async authenticateRequest function
    const auth = await authenticateRequest(request);
    if ('error' in auth) {
      return auth.error;
    }

    const { user } = auth;

    // Find user record
    const userRecord = await User.findById(user.userId);

    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // schoolId is an ObjectId, but schoolsHelper uses numeric ID.
    const school = await School.findById(userRecord.schoolId).lean();

    if (!school) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Explicitly cast to plain object and ensure numeric id is preserved
    // Mongoose lean() might still have an 'id' virtual or property naming collision
    const schoolData = {
      ...school,
      id: Number(school.id), // Ensure it's the numeric ID field from schema
      mongoId: school._id.toString()
    };

    return NextResponse.json(schoolData, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // FIX: await the async authenticateRequest function
    const auth = await authenticateRequest(request);
    if ('error' in auth) {
      return auth.error;
    }

    const { user } = auth;
    const body = await request.json();

    // Helper parsers to avoid NaN updates
    const toIntOrNull = (val: unknown) => {
      if (val === null || val === undefined || val === '') return null;
      const n = parseInt(String(val), 10);
      return Number.isFinite(n) ? n : null;
    };
    const toFloatOrNull = (val: unknown) => {
      if (val === null || val === undefined || val === '') return null;
      const n = parseFloat(String(val));
      return Number.isFinite(n) ? n : null;
    };
    const toBool = (val: unknown): boolean => {
      if (val === true || val === 1 || val === '1' || val === 'true') return true;
      return false;
    };
    const toStringOrNull = (val: unknown): string | null => {
      if (val === null || val === undefined || val === '') return null;
      return String(val).trim();
    };

    // Check if profile exists
    const userRecord = await User.findById(user.userId);

    let targetSchoolNumericId: number | null = null;
    let targetSchoolObjectId: any = null;
    let isCreating = false;

    if (userRecord && userRecord.schoolId) {
      targetSchoolObjectId = userRecord.schoolId;
      const existing = await School.findById(targetSchoolObjectId);
      if (existing) {
        targetSchoolNumericId = existing.id;
      } else {
        isCreating = true;
      }
    } else {
      isCreating = true;
    }

    // Validate required fields for creation
    if (isCreating) {
      if (!body.name || !body.city || !body.board) {
        return NextResponse.json(
          { 
            error: 'Required fields missing: name, city, and board are required', 
            code: 'VALIDATION_ERROR' 
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data with type conversions and validation
    const updateData: any = {
      updatedAt: new Date()
    };

    // Basic Info - comprehensive fields
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.establishmentYear !== undefined) updateData.establishmentYear = toIntOrNull(body.establishmentYear);
    if (body.schoolType !== undefined) updateData.schoolType = toStringOrNull(body.schoolType);
    if (body.k12Level !== undefined) updateData.k12Level = toStringOrNull(body.k12Level);
    if (body.board !== undefined) updateData.board = String(body.board).trim();
    if (body.gender !== undefined) updateData.gender = toStringOrNull(body.gender);
    if (body.isInternational !== undefined) updateData.isInternational = toBool(body.isInternational);
    if (body.streamsAvailable !== undefined) updateData.streamsAvailable = toStringOrNull(body.streamsAvailable);
    if (body.languages !== undefined) updateData.languages = toStringOrNull(body.languages);
    if (body.totalStudents !== undefined) updateData.totalStudents = toStringOrNull(body.totalStudents);
    if (body.totalTeachers !== undefined) updateData.totalTeachers = toIntOrNull(body.totalTeachers);
    if (body.logoUrl !== undefined) updateData.logoUrl = toStringOrNull(body.logoUrl);
    if (body.aboutSchool !== undefined) updateData.aboutSchool = toStringOrNull(body.aboutSchool);
    if (body.bannerImageUrl !== undefined) updateData.bannerImageUrl = toStringOrNull(body.bannerImageUrl);
    if (body.studentTeacherRatio !== undefined) updateData.studentTeacherRatio = toStringOrNull(body.studentTeacherRatio);
    if (body.description !== undefined) updateData.description = toStringOrNull(body.description);
    if (body.contactEmail !== undefined) updateData.contactEmail = toStringOrNull(body.contactEmail);
    if (body.contactPhone !== undefined) updateData.contactPhone = toStringOrNull(body.contactPhone);
    if (body.feesMin !== undefined) updateData.feesMin = toIntOrNull(body.feesMin);
    if (body.feesMax !== undefined) updateData.feesMax = toIntOrNull(body.feesMax);
    if (body.rating !== undefined) updateData.rating = toFloatOrNull(body.rating);
    if (body.reviewCount !== undefined) updateData.reviewCount = toIntOrNull(body.reviewCount);
    if (body.profileViews !== undefined) updateData.profileViews = toIntOrNull(body.profileViews);
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.latitude !== undefined) updateData.latitude = toFloatOrNull(body.latitude);
    if (body.longitude !== undefined) updateData.longitude = toFloatOrNull(body.longitude);
    
    // Contact Info
    if (body.address !== undefined) updateData.address = toStringOrNull(body.address);
    if (body.city !== undefined) updateData.city = String(body.city).trim();
    if (body.state !== undefined) updateData.state = toStringOrNull(body.state);
    if (body.country !== undefined) updateData.country = toStringOrNull(body.country);
    if (body.website !== undefined) updateData.website = toStringOrNull(body.website);
    if (body.contactNumber !== undefined) updateData.contactNumber = toStringOrNull(body.contactNumber);
    if (body.whatsappNumber !== undefined) updateData.whatsappNumber = toStringOrNull(body.whatsappNumber);
    if (body.email !== undefined) updateData.email = toStringOrNull(body.email)?.toLowerCase();
    if (body.facebookUrl !== undefined) updateData.facebookUrl = toStringOrNull(body.facebookUrl);
    if (body.instagramUrl !== undefined) updateData.instagramUrl = toStringOrNull(body.instagramUrl);
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = toStringOrNull(body.linkedinUrl);
    if (body.youtubeUrl !== undefined) updateData.youtubeUrl = toStringOrNull(body.youtubeUrl);
    if (body.googleMapUrl !== undefined) updateData.googleMapUrl = toStringOrNull(body.googleMapUrl);
    
    // Academic Facilities
    if (body.classroomType !== undefined) updateData.classroomType = String(body.classroomType).trim();
    if (body.hasLibrary !== undefined) updateData.hasLibrary = Boolean(body.hasLibrary);
    if (body.hasComputerLab !== undefined) updateData.hasComputerLab = Boolean(body.hasComputerLab);
    if (body.computerCount !== undefined) updateData.computerCount = toIntOrNull(body.computerCount);
    if (body.hasPhysicsLab !== undefined) updateData.hasPhysicsLab = Boolean(body.hasPhysicsLab);
    if (body.hasChemistryLab !== undefined) updateData.hasChemistryLab = Boolean(body.hasChemistryLab);
    if (body.hasBiologyLab !== undefined) updateData.hasBiologyLab = Boolean(body.hasBiologyLab);
    if (body.hasMathsLab !== undefined) updateData.hasMathsLab = Boolean(body.hasMathsLab);
    if (body.hasLanguageLab !== undefined) updateData.hasLanguageLab = Boolean(body.hasLanguageLab);
    if (body.hasRoboticsLab !== undefined) updateData.hasRoboticsLab = Boolean(body.hasRoboticsLab);
    if (body.hasStemLab !== undefined) updateData.hasStemLab = Boolean(body.hasStemLab);
    if (body.hasAuditorium !== undefined) updateData.hasAuditorium = Boolean(body.hasAuditorium);
    
    // Sports & Fitness
    if (body.hasPlayground !== undefined) updateData.hasPlayground = Boolean(body.hasPlayground);
    if (body.sportsFacilities !== undefined) updateData.sportsFacilities = String(body.sportsFacilities).trim();
    if (body.hasSwimmingPool !== undefined) updateData.hasSwimmingPool = Boolean(body.hasSwimmingPool);
    if (body.hasFitnessCentre !== undefined) updateData.hasFitnessCentre = Boolean(body.hasFitnessCentre);
    if (body.hasYoga !== undefined) updateData.hasYoga = Boolean(body.hasYoga);
    if (body.hasMartialArts !== undefined) updateData.hasMartialArts = Boolean(body.hasMartialArts);
    if (body.hasMusicDance !== undefined) updateData.hasMusicDance = Boolean(body.hasMusicDance);
    if (body.hasHorseRiding !== undefined) updateData.hasHorseRiding = Boolean(body.hasHorseRiding);
    
    // Technology & Digital
    if (body.hasSmartBoard !== undefined) updateData.hasSmartBoard = Boolean(body.hasSmartBoard);
    if (body.hasWifi !== undefined) updateData.hasWifi = Boolean(body.hasWifi);
    if (body.hasCctv !== undefined) updateData.hasCctv = Boolean(body.hasCctv);
    if (body.hasElearning !== undefined) updateData.hasElearning = Boolean(body.hasElearning);
    if (body.hasAcClassrooms !== undefined) updateData.hasAcClassrooms = Boolean(body.hasAcClassrooms);
    if (body.hasAiTools !== undefined) updateData.hasAiTools = Boolean(body.hasAiTools);
    
    // Transport
    if (body.hasTransport !== undefined) updateData.hasTransport = Boolean(body.hasTransport);
    if (body.hasGpsBuses !== undefined) updateData.hasGpsBuses = Boolean(body.hasGpsBuses);
    if (body.hasCctvBuses !== undefined) updateData.hasCctvBuses = Boolean(body.hasCctvBuses);
    if (body.hasBusCaretaker !== undefined) updateData.hasBusCaretaker = Boolean(body.hasBusCaretaker);
    
    // Health & Safety
    if (body.hasMedicalRoom !== undefined) updateData.hasMedicalRoom = Boolean(body.hasMedicalRoom);
    if (body.hasDoctorNurse !== undefined) updateData.hasDoctorNurse = Boolean(body.hasDoctorNurse);
    if (body.hasFireSafety !== undefined) updateData.hasFireSafety = Boolean(body.hasFireSafety);
    if (body.hasCleanWater !== undefined) updateData.hasCleanWater = Boolean(body.hasCleanWater);
    if (body.hasSecurityGuards !== undefined) updateData.hasSecurityGuards = Boolean(body.hasSecurityGuards);
    if (body.hasAirPurifier !== undefined) updateData.hasAirPurifier = Boolean(body.hasAirPurifier);
    
    // Boarding
    if (body.hasHostel !== undefined) updateData.hasHostel = Boolean(body.hasHostel);
    if (body.hasMess !== undefined) updateData.hasMess = Boolean(body.hasMess);
    if (body.hasHostelStudyRoom !== undefined) updateData.hasHostelStudyRoom = Boolean(body.hasHostelStudyRoom);
    if (body.hasAcHostel !== undefined) updateData.hasAcHostel = Boolean(body.hasAcHostel);
    
    // Others
    if (body.hasCafeteria !== undefined) updateData.hasCafeteria = Boolean(body.hasCafeteria);
    if (body.virtualTourUrl !== undefined) updateData.virtualTourUrl = String(body.virtualTourUrl).trim();
    if (body.prospectusUrl !== undefined) updateData.prospectusUrl = String(body.prospectusUrl).trim();
    if (body.newsletterUrl !== undefined) updateData.newsletterUrl = String(body.newsletterUrl).trim();
    
    // Legacy fields
    if (body.logo !== undefined) updateData.logo = String(body.logo).trim();
    if (body.bannerImage !== undefined) updateData.bannerImage = String(body.bannerImage).trim();
    if (body.pincode !== undefined) updateData.pincode = String(body.pincode).trim();
    if (body.medium !== undefined) updateData.medium = String(body.medium).trim();
    if (body.classesOffered !== undefined) updateData.classesOffered = String(body.classesOffered).trim();
    
    // Array/JSON fields
    if (body.galleryImages !== undefined) updateData.galleryImages = Array.isArray(body.galleryImages) ? body.galleryImages : [];
    if (body.awards !== undefined) updateData.awards = Array.isArray(body.awards) ? body.awards : [];
    if (body.feesStructure !== undefined) updateData.feesStructure = body.feesStructure;
    if (body.facilities !== undefined) updateData.facilities = Array.isArray(body.facilities) ? body.facilities : [];
    if (body.gallery !== undefined) updateData.gallery = Array.isArray(body.gallery) ? body.gallery : [];
    if (body.facilityImages !== undefined) updateData.facilityImages = body.facilityImages;
    if (body.virtualTourVideos !== undefined) updateData.virtualTourVideos = Array.isArray(body.virtualTourVideos) ? body.virtualTourVideos : [];

    // WhatsApp API settings
    if (body.whatsappWebhookUrl !== undefined) updateData.whatsappWebhookUrl = toStringOrNull(body.whatsappWebhookUrl);
    if (body.whatsappApiKey !== undefined) updateData.whatsappApiKey = toStringOrNull(body.whatsappApiKey);

    if (isCreating) {
      updateData.userId = user.userId;
      const createdProfile = await createSchool(updateData);
      
      // Update user record with schoolId
      await User.findByIdAndUpdate(user.userId, { schoolId: createdProfile._id });

      return NextResponse.json({ 
        ...createdProfile, 
        id: Number(createdProfile.id),
        mongoId: createdProfile._id.toString()
      }, { status: 200 });
    } else {
      const updated = await updateSchool(targetSchoolNumericId!, updateData);
      return NextResponse.json({ 
        ...updated, 
        id: Number(updated.id),
        mongoId: updated._id.toString()
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
