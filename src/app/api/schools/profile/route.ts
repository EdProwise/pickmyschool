import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    const profile = await db.select()
      .from(schools)
      .where(eq(schools.id, user.userId))
      .limit(1);

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

    // Check if profile exists
    const existingProfile = await db.select()
      .from(schools)
      .where(eq(schools.id, user.userId))
      .limit(1);

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

    // Basic Info - text fields
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.establishmentYear !== undefined) updateData.establishmentYear = parseInt(body.establishmentYear);
    if (body.schoolType !== undefined) updateData.schoolType = String(body.schoolType).trim();
    if (body.board !== undefined) updateData.board = String(body.board).trim();
    if (body.medium !== undefined) updateData.medium = String(body.medium).trim();
    if (body.classesOffered !== undefined) updateData.classesOffered = String(body.classesOffered).trim();
    
    // Contact fields
    if (body.address !== undefined) updateData.address = String(body.address).trim();
    if (body.city !== undefined) updateData.city = String(body.city).trim();
    if (body.state !== undefined) updateData.state = String(body.state).trim();
    if (body.pincode !== undefined) updateData.pincode = String(body.pincode).trim();
    if (body.contactEmail !== undefined) updateData.contactEmail = String(body.contactEmail).trim().toLowerCase();
    if (body.contactPhone !== undefined) updateData.contactPhone = String(body.contactPhone).trim();
    
    // Images and media
    if (body.logo !== undefined) updateData.logo = String(body.logo).trim();
    if (body.bannerImage !== undefined) updateData.bannerImage = String(body.bannerImage).trim();
    
    // Numeric fields
    if (body.feesMin !== undefined) updateData.feesMin = parseInt(body.feesMin);
    if (body.feesMax !== undefined) updateData.feesMax = parseInt(body.feesMax);
    if (body.rating !== undefined) updateData.rating = parseFloat(body.rating);
    if (body.reviewCount !== undefined) updateData.reviewCount = parseInt(body.reviewCount);
    if (body.profileViews !== undefined) updateData.profileViews = parseInt(body.profileViews);
    
    // Location
    if (body.latitude !== undefined) updateData.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) updateData.longitude = parseFloat(body.longitude);
    
    // Text area
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.studentTeacherRatio !== undefined) updateData.studentTeacherRatio = String(body.studentTeacherRatio).trim();
    
    // Boolean field
    if (body.featured !== undefined) {
      updateData.featured = body.featured === true || body.featured === 1 || body.featured === '1' || body.featured === 'true';
    }
    
    // JSON fields - validate structure
    if (body.facilities !== undefined) {
      try {
        const facilities = typeof body.facilities === 'string' ? JSON.parse(body.facilities) : body.facilities;
        if (!Array.isArray(facilities)) {
          return NextResponse.json(
            { error: 'facilities must be an array', code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        }
        updateData.facilities = facilities;
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON format for facilities', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
    }

    if (body.gallery !== undefined) {
      try {
        const gallery = typeof body.gallery === 'string' ? JSON.parse(body.gallery) : body.gallery;
        if (!Array.isArray(gallery)) {
          return NextResponse.json(
            { error: 'gallery must be an array', code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        }
        updateData.gallery = gallery;
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON format for gallery', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
    }

    if (isCreating) {
      // Create new profile
      updateData.id = user.userId;
      updateData.createdAt = new Date().toISOString();
      updateData.rating = updateData.rating || 0;
      updateData.reviewCount = updateData.reviewCount || 0;
      updateData.profileViews = updateData.profileViews || 0;
      updateData.featured = updateData.featured || false;

      const newProfile = await db.insert(schools)
        .values(updateData)
        .returning();

      return NextResponse.json(newProfile[0], { status: 200 });
    } else {
      // Update existing profile
      const updatedProfile = await db.update(schools)
        .set(updateData)
        .where(eq(schools.id, user.userId))
        .returning();

      if (updatedProfile.length === 0) {
        return NextResponse.json(
          { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
          { status: 404 }
        );
      }

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