import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, School } from '@/lib/models';
import { updateSchool } from '@/lib/schoolsHelper';
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

async function getAuthSchool(payload: JWTPayload) {
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
        { error: 'Only school users can cleanup documents', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const school = await getAuthSchool(payload);

    if (!school) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const schoolDocSize = JSON.stringify(school).length;
    const schoolDocSizeMB = schoolDocSize / (1024 * 1024);

    console.log(`Cleanup requested for school ${school.id}, current size: ${schoolDocSizeMB.toFixed(2)}MB`);

    const cleanupData: any = {};
    let cleanedFields = [];

    // Truncate gallery images to first 10
    if (Array.isArray(school.galleryImages) && school.galleryImages.length > 10) {
      const originalCount = school.galleryImages.length;
      cleanupData.galleryImages = school.galleryImages.slice(0, 10);
      cleanedFields.push(`galleryImages (truncated from ${originalCount} to 10)`);
    }

    // Clear facility images if very large
    if (school.facilityImages && JSON.stringify(school.facilityImages).length > 5 * 1024 * 1024) {
      cleanupData.facilityImages = {};
      cleanedFields.push('facilityImages (cleared)');
    }

    // Clear virtual tour videos if large
    if (Array.isArray(school.virtualTourVideos) && JSON.stringify(school.virtualTourVideos).length > 3 * 1024 * 1024) {
      cleanupData.virtualTourVideos = [];
      cleanedFields.push('virtualTourVideos (cleared)');
    }

    // Clear unnecessary large text fields if present
    if (school.description && school.description.length > 50000) {
      cleanupData.description = school.description.substring(0, 50000);
      cleanedFields.push('description (truncated)');
    }

    if (cleanedFields.length === 0) {
      return NextResponse.json({
        message: 'School document is within acceptable size limits',
        sizeMB: schoolDocSizeMB.toFixed(2),
        cleaned: false,
        clearedFields: []
      }, { status: 200 });
    }

    // Apply cleanup
    const updated = await updateSchool(school.id, cleanupData);

    const newSize = JSON.stringify(updated).length;
    const newSizeMB = newSize / (1024 * 1024);
    const reducedMB = (schoolDocSizeMB - newSizeMB).toFixed(2);

    console.log(`Cleanup completed: reduced from ${schoolDocSizeMB.toFixed(2)}MB to ${newSizeMB.toFixed(2)}MB (saved ${reducedMB}MB)`);

    return NextResponse.json({
      message: 'School document cleaned up successfully',
      clearedFields,
      previousSizeMB: schoolDocSizeMB.toFixed(2),
      newSizeMB: newSizeMB.toFixed(2),
      reducedMB,
      cleaned: true
    }, { status: 200 });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
