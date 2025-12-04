import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

function authenticateRequest(request: NextRequest): { user: JWTPayload } | { error: NextResponse } {
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
    const auth = authenticateRequest(request);
    if ('error' in auth) {
      return auth.error;
    }

    const { user } = auth;

    // First try to find by userId
    let profile = await db.select()
      .from(schools)
      .where(eq(schools.userId, user.userId))
      .limit(1);

    // If not found, check if user has a schoolId and fetch by that
    if (profile.length === 0) {
      const userRecord = await db.select()
        .from(users)
        .where(eq(users.id, user.userId))
        .limit(1);

      if (userRecord.length > 0 && userRecord[0].schoolId) {
        profile = await db.select()
          .from(schools)
          .where(eq(schools.id, userRecord[0].schoolId))
          .limit(1);
        
        // Update the school row to have the userId
        if (profile.length > 0) {
          await db.update(schools)
            .set({ userId: user.userId })
            .where(eq(schools.id, userRecord[0].schoolId));
        }
      }
    }

    if (profile.length === 0) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile[0], { status: 200 });
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
    const auth = authenticateRequest(request);
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

    // Check if profile exists by userId first
    let existingProfile = await db.select()
      .from(schools)
      .where(eq(schools.userId, user.userId))
      .limit(1);

    // If not found by userId, check user's schoolId
    let targetSchoolId: number | null = null;
    if (existingProfile.length === 0) {
      const userRecord = await db.select()
        .from(users)
        .where(eq(users.id, user.userId))
        .limit(1);

      if (userRecord.length > 0 && userRecord[0].schoolId) {
        existingProfile = await db.select()
          .from(schools)
          .where(eq(schools.id, userRecord[0].schoolId))
          .limit(1);
        
        targetSchoolId = userRecord[0].schoolId;
      }
    } else if (existingProfile.length > 0) {
      targetSchoolId = existingProfile[0].id;
    }

    const isCreating = existingProfile.length === 0;

    // Validate required fields for creation
    if (isCreating) {
      if (!body.name || !body.city || !body.board) {
        return NextResponse.json(
          { 
            error: 'Required fields missing: name, city, and board are required for creating a profile', 
            code: 'VALIDATION_ERROR' 
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data with type conversions and validation
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Basic Info - comprehensive fields
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.establishmentYear !== undefined) {
      const v = toIntOrNull(body.establishmentYear);
      updateData.establishmentYear = v;
    }
    if (body.schoolType !== undefined) updateData.schoolType = String(body.schoolType).trim();
    if (body.k12Level !== undefined) updateData.k12Level = String(body.k12Level).trim();
    if (body.board !== undefined) updateData.board = String(body.board).trim();
    if (body.gender !== undefined) updateData.gender = String(body.gender).trim();
    if (body.isInternational !== undefined) updateData.isInternational = Boolean(body.isInternational);
    if (body.streamsAvailable !== undefined) updateData.streamsAvailable = String(body.streamsAvailable).trim();
    if (body.languages !== undefined) updateData.languages = String(body.languages).trim();
    if (body.totalStudents !== undefined) updateData.totalStudents = String(body.totalStudents).trim();
    if (body.totalTeachers !== undefined) {
      const v = toIntOrNull(body.totalTeachers);
      updateData.totalTeachers = v;
    }
    if (body.logoUrl !== undefined) updateData.logoUrl = String(body.logoUrl).trim();
    if (body.aboutSchool !== undefined) updateData.aboutSchool = String(body.aboutSchool).trim();
    if (body.bannerImageUrl !== undefined) updateData.bannerImageUrl = String(body.bannerImageUrl).trim();
    
    // Contact Info
    if (body.address !== undefined) updateData.address = String(body.address).trim();
    if (body.city !== undefined) updateData.city = String(body.city).trim();
    if (body.state !== undefined) updateData.state = String(body.state).trim();
    if (body.country !== undefined) updateData.country = String(body.country).trim();
    if (body.website !== undefined) updateData.website = String(body.website).trim();
    if (body.contactNumber !== undefined) updateData.contactNumber = String(body.contactNumber).trim();
    if (body.whatsappNumber !== undefined) updateData.whatsappNumber = String(body.whatsappNumber).trim();
    if (body.email !== undefined) updateData.email = String(body.email).trim().toLowerCase();
    if (body.facebookUrl !== undefined) updateData.facebookUrl = String(body.facebookUrl).trim();
    if (body.instagramUrl !== undefined) updateData.instagramUrl = String(body.instagramUrl).trim();
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = String(body.linkedinUrl).trim();
    if (body.youtubeUrl !== undefined) updateData.youtubeUrl = String(body.youtubeUrl).trim();
    if (body.googleMapUrl !== undefined) updateData.googleMapUrl = String(body.googleMapUrl).trim();
    
    // Academic Facilities
    if (body.classroomType !== undefined) updateData.classroomType = String(body.classroomType).trim();
    if (body.hasLibrary !== undefined) updateData.hasLibrary = Boolean(body.hasLibrary);
    if (body.hasComputerLab !== undefined) updateData.hasComputerLab = Boolean(body.hasComputerLab);
    if (body.computerCount !== undefined) {
      const v = toIntOrNull(body.computerCount);
      updateData.computerCount = v;
    }
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
    if (body.studentTeacherRatio !== undefined) updateData.studentTeacherRatio = String(body.studentTeacherRatio).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.contactEmail !== undefined) updateData.contactEmail = String(body.contactEmail).trim().toLowerCase();
    if (body.contactPhone !== undefined) updateData.contactPhone = String(body.contactPhone).trim();
    if (body.feesMin !== undefined) {
      const v = toIntOrNull(body.feesMin);
      updateData.feesMin = v;
    }
    if (body.feesMax !== undefined) {
      const v = toIntOrNull(body.feesMax);
      updateData.feesMax = v;
    }
    if (body.rating !== undefined) {
      const v = toFloatOrNull(body.rating);
      updateData.rating = v;
    }
    if (body.reviewCount !== undefined) {
      const v = toIntOrNull(body.reviewCount);
      updateData.reviewCount = v;
    }
    if (body.profileViews !== undefined) {
      const v = toIntOrNull(body.profileViews);
      updateData.profileViews = v;
    }
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.latitude !== undefined) {
      const v = toFloatOrNull(body.latitude);
      updateData.latitude = v;
    }
    if (body.longitude !== undefined) {
      const v = toFloatOrNull(body.longitude);
      updateData.longitude = v;
    }
    
    // JSON fields
    if (body.galleryImages !== undefined) {
      if (!Array.isArray(body.galleryImages)) {
        return NextResponse.json(
          { error: 'galleryImages must be an array', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      updateData.galleryImages = body.galleryImages;
    }

    if (body.awards !== undefined) {
      if (!Array.isArray(body.awards)) {
        return NextResponse.json(
          { error: 'awards must be an array', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      updateData.awards = body.awards;
    }

    if (body.feesStructure !== undefined) {
      if (typeof body.feesStructure !== 'object' || Array.isArray(body.feesStructure)) {
        return NextResponse.json(
          { error: 'feesStructure must be an object', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      updateData.feesStructure = body.feesStructure;
    }

    if (body.facilities !== undefined) {
      if (!Array.isArray(body.facilities)) {
        return NextResponse.json(
          { error: 'facilities must be an array', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      updateData.facilities = body.facilities;
    }

    if (body.gallery !== undefined) {
      if (!Array.isArray(body.gallery)) {
        return NextResponse.json(
          { error: 'gallery must be an array', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      updateData.gallery = body.gallery;
    }

    if (body.facilityImages !== undefined) {
      if (typeof body.facilityImages !== 'object' || Array.isArray(body.facilityImages)) {
        return NextResponse.json(
          { error: 'facilityImages must be an object', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      console.log('Saving facilityImages:', JSON.stringify(body.facilityImages));
      updateData.facilityImages = body.facilityImages;
    }

    if (isCreating) {
      // Create new profile
      updateData.userId = user.userId;
      updateData.createdAt = new Date().toISOString();
      updateData.rating = updateData.rating ?? 0;
      updateData.reviewCount = updateData.reviewCount ?? 0;
      updateData.profileViews = updateData.profileViews ?? 0;
      updateData.featured = updateData.featured ?? false;

      const newProfile = await db.insert(schools)
        .values(updateData)
        .returning();

      // Link user to this school
      await db.update(users)
        .set({ schoolId: newProfile[0].id })
        .where(eq(users.id, user.userId));

      return NextResponse.json(newProfile[0], { status: 200 });
    } else {
      // Ensure userId is set
      if (!updateData.userId) {
        updateData.userId = user.userId;
      }

      if (!targetSchoolId) {
        return NextResponse.json(
          { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Filter out fields that don't exist in the current DB (handles older DBs without new columns)
      const currentRow = existingProfile[0] || {};
      const allowedCols = new Set(Object.keys(currentRow as Record<string, any>));
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([k]) => allowedCols.has(k))
      );
      const pruned = Object.keys(updateData).filter((k) => !allowedCols.has(k));
      if (pruned.length) {
        console.warn('Pruned unsupported columns from update:', pruned);
      }

      // Update existing profile by schoolId
      const updatedProfile = await db.update(schools)
        .set(filteredUpdateData)
        .where(eq(schools.id, targetSchoolId))
        .returning();

      if (updatedProfile.length === 0) {
        return NextResponse.json(
          { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
          { status: 404 }
        );
      }

      console.log('Updated school profile:', updatedProfile[0].id, 'facilityImages:', updatedProfile[0].facilityImages ? 'present' : 'null');

      return NextResponse.json(updatedProfile[0], { status: 200 });
    }
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}