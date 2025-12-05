import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; role: string; schoolId?: number };
    
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const school = await db.select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (school.length === 0) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Increment profile views
    await db.update(schools)
      .set({ 
        profileViews: school[0].profileViews !== null ? school[0].profileViews + 1 : 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schools.id, schoolId));

    // Fetch updated school with incremented views
    const updatedSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    return NextResponse.json(updatedSchool[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    // Check if school exists
    const existingSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    const isCreating = existingSchool.length === 0;

    // Prepare update data with type conversions and validation
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Basic Info
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.establishmentYear !== undefined) updateData.establishmentYear = parseInt(body.establishmentYear);
    if (body.schoolType !== undefined) updateData.schoolType = String(body.schoolType).trim();
    if (body.k12Level !== undefined) updateData.k12Level = String(body.k12Level).trim();
    if (body.board !== undefined) updateData.board = String(body.board).trim();
    if (body.gender !== undefined) updateData.gender = String(body.gender).trim();
    if (body.isInternational !== undefined) updateData.isInternational = Boolean(body.isInternational);
    if (body.streamsAvailable !== undefined) updateData.streamsAvailable = String(body.streamsAvailable).trim();
    if (body.languages !== undefined) updateData.languages = String(body.languages).trim();
    if (body.totalStudents !== undefined) updateData.totalStudents = String(body.totalStudents).trim();
    if (body.totalTeachers !== undefined) updateData.totalTeachers = parseInt(body.totalTeachers);
    if (body.logoUrl !== undefined) updateData.logoUrl = String(body.logoUrl).trim();
    
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
    if (body.computerCount !== undefined) updateData.computerCount = parseInt(body.computerCount);
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
    if (body.feesMin !== undefined) updateData.feesMin = parseInt(body.feesMin);
    if (body.feesMax !== undefined) updateData.feesMax = parseInt(body.feesMax);
    if (body.rating !== undefined) updateData.rating = parseFloat(body.rating);
    if (body.reviewCount !== undefined) updateData.reviewCount = parseInt(body.reviewCount);
    if (body.profileViews !== undefined) updateData.profileViews = parseInt(body.profileViews);
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.latitude !== undefined) updateData.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) updateData.longitude = parseFloat(body.longitude);
    
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
      if (typeof body.feesStructure !== 'object') {
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
      if (typeof body.facilityImages !== 'object') {
        return NextResponse.json(
          { error: 'facilityImages must be an object', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      updateData.facilityImages = body.facilityImages;
    }

    if (body.virtualTourVideos !== undefined) {
      // Accept both a single string and an array, coerce to array
      let vids: string[] = [];
      if (Array.isArray(body.virtualTourVideos)) {
        vids = body.virtualTourVideos.filter((u: any) => typeof u === 'string' && u.trim() !== '').map((u: string) => u.trim());
      } else if (typeof body.virtualTourVideos === 'string') {
        const s = body.virtualTourVideos.trim();
        if (s) vids = [s];
      } else {
        return NextResponse.json(
          { error: 'virtualTourVideos must be a string or an array of strings', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      updateData.virtualTourVideos = vids;
    }

    if (isCreating) {
      // Create new school with specific ID
      updateData.id = schoolId;
      updateData.createdAt = new Date().toISOString();
      updateData.rating = updateData.rating || 0;
      updateData.reviewCount = updateData.reviewCount || 0;
      updateData.profileViews = updateData.profileViews || 0;
      updateData.featured = updateData.featured || false;

      // Validate required fields for creation
      if (!updateData.name || !updateData.city || !updateData.board) {
        return NextResponse.json(
          { 
            error: 'Required fields missing: name, city, and board are required for creating a school', 
            code: 'VALIDATION_ERROR' 
          },
          { status: 400 }
        );
      }

      // Insert and then fetch (avoid RETURNING *)
      await db.insert(schools)
        .values(updateData);

      const created = await db.select()
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);

      return NextResponse.json({
        school: created[0],
        message: "School created successfully"
      }, { status: 201 });
    } else {
      // Update existing school and then fetch (avoid RETURNING *)
      try {
        await db.update(schools)
          .set(updateData)
          .where(eq(schools.id, schoolId));
      } catch (err: any) {
        const msg = String(err?.message || err);
        // Fallback for older DBs that don't have virtual_tour_videos column
        if (msg.includes('no such column') && msg.includes('virtual_tour_videos')) {
          const fallbackUpdate: any = { updatedAt: updateData.updatedAt };
          if (Array.isArray(updateData.virtualTourVideos) && updateData.virtualTourVideos.length > 0) {
            fallbackUpdate.virtualTourUrl = String(updateData.virtualTourVideos[0]);
          }
          // Remove the problematic column
          await db.update(schools)
            .set(fallbackUpdate)
            .where(eq(schools.id, schoolId));
        } else {
          throw err;
        }
      }

      const refreshed = await db.select()
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);

      if (refreshed.length === 0) {
        return NextResponse.json(
          { error: 'School not found', code: 'SCHOOL_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        school: refreshed[0],
        message: "School updated successfully"
      }, { status: 200 });
    }
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    if (decoded.role !== 'school' && decoded.role !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Not authorized to delete schools',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if school exists
    const existingSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (existingSchool.length === 0) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Verify ownership if not super admin
    if (decoded.role === 'school' && decoded.schoolId !== schoolId) {
      return NextResponse.json({ 
        error: 'You are not authorized to delete this school',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Delete the school
    await db.delete(schools).where(eq(schools.id, schoolId));

    return NextResponse.json({
      message: "School deleted successfully",
      schoolId: schoolId
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}