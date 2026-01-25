import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, School } from '@/lib/models';
import { getSchool, updateSchool } from '@/lib/schoolsHelper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

async function getSchoolProfile(payload: JWTPayload) {
  const userRecord = await User.findById(payload.userId);

  if (userRecord && userRecord.schoolId) {
    const school = await School.findById(userRecord.schoolId);
    return school;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const payload = verifyToken(request);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    if (payload.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school users can manage facility images', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { facilityName, imageUrls } = body;

    if (!facilityName || typeof facilityName !== 'string') {
      return NextResponse.json(
        { error: 'facilityName is required', code: 'MISSING_FACILITY_NAME' },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'imageUrls array is required', code: 'MISSING_IMAGE_URLS' },
        { status: 400 }
      );
    }

    const profile = await getSchoolProfile(payload);

    if (!profile) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentFacilityImages = (profile.facilityImages as Record<string, string[]>) || {};
    const currentImages = currentFacilityImages[facilityName] || [];
    
    const updatedFacilityImages = {
      ...currentFacilityImages,
      [facilityName]: [...currentImages, ...imageUrls]
    };

    await updateSchool(profile.id, {
      facilityImages: updatedFacilityImages,
      updatedAt: new Date()
    });

    return NextResponse.json({
      facilityImages: updatedFacilityImages,
      message: 'Facility images added successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('POST facility images error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const payload = verifyToken(request);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    if (payload.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school users can manage facility images', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { facilityName, imageUrl } = body;

    if (!facilityName || typeof facilityName !== 'string') {
      return NextResponse.json(
        { error: 'facilityName is required', code: 'MISSING_FACILITY_NAME' },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'imageUrl is required', code: 'MISSING_IMAGE_URL' },
        { status: 400 }
      );
    }

    const profile = await getSchoolProfile(payload);

    if (!profile) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentFacilityImages = (profile.facilityImages as Record<string, string[]>) || {};
    const currentImages = currentFacilityImages[facilityName] || [];
    
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);
    
    const updatedFacilityImages = {
      ...currentFacilityImages,
      [facilityName]: updatedImages
    };

    if (updatedImages.length === 0) {
      delete updatedFacilityImages[facilityName];
    }

    await updateSchool(profile.id, {
      facilityImages: updatedFacilityImages,
      updatedAt: new Date()
    });

    return NextResponse.json({
      facilityImages: updatedFacilityImages,
      message: 'Facility image deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE facility images error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
