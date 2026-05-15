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
        { error: 'Only school users can manage documents', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prospectusUrl, newsletterUrl } = body;

    if (!prospectusUrl && !newsletterUrl) {
      return NextResponse.json(
        { error: 'At least one document URL is required', code: 'MISSING_DOCUMENT_URL' },
        { status: 400 }
      );
    }

    // Validate URLs are strings
    if (prospectusUrl && typeof prospectusUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prospectus URL', code: 'INVALID_PROSPECTUS_URL' },
        { status: 400 }
      );
    }

    if (newsletterUrl && typeof newsletterUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid newsletter URL', code: 'INVALID_NEWSLETTER_URL' },
        { status: 400 }
      );
    }

    const school = await getAuthSchool(payload);

    if (!school) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update school with document URLs
    const updateData: any = {};
    if (prospectusUrl) {
      updateData.prospectusUrl = prospectusUrl.trim();
    }
    if (newsletterUrl) {
      updateData.newsletterUrl = newsletterUrl.trim();
    }

    // Clean up oversized fields before updating to avoid MongoDB 16MB limit
    // If the school is too large, truncate gallery/facility images
    const schoolDocSize = JSON.stringify(school).length;
    const schoolDocSizeMB = schoolDocSize / (1024 * 1024);

    if (schoolDocSizeMB > 14) {
      console.warn(`School ${school.id} is ${schoolDocSizeMB.toFixed(2)}MB - cleaning up before update`);

      // Truncate gallery images to first 10
      if (Array.isArray(school.galleryImages) && school.galleryImages.length > 10) {
        updateData.galleryImages = school.galleryImages.slice(0, 10);
      }

      // Clear facility images if very large
      if (school.facilityImages && JSON.stringify(school.facilityImages).length > 5 * 1024 * 1024) {
        updateData.facilityImages = {};
      }

      // Clear virtual tour videos if large
      if (Array.isArray(school.virtualTourVideos) && JSON.stringify(school.virtualTourVideos).length > 3 * 1024 * 1024) {
        updateData.virtualTourVideos = [];
      }
    }

    const updated = await updateSchool(school.id, updateData);

    return NextResponse.json({
      prospectusUrl: updated.prospectusUrl || null,
      newsletterUrl: updated.newsletterUrl || null,
      message: 'Documents updated successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'INTERNAL_ERROR' },
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
        { error: 'Only school users can manage documents', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { documentType } = body; // 'prospectus' or 'newsletter'

    if (!documentType || (documentType !== 'prospectus' && documentType !== 'newsletter')) {
      return NextResponse.json(
        { error: 'Invalid document type', code: 'INVALID_DOCUMENT_TYPE' },
        { status: 400 }
      );
    }

    const school = await getAuthSchool(payload);

    if (!school) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete document URL
    const updateData: any = {};
    if (documentType === 'prospectus') {
      updateData.prospectusUrl = null;
    } else {
      updateData.newsletterUrl = null;
    }

    const updated = await updateSchool(school.id, updateData);

    return NextResponse.json({
      prospectusUrl: updated.prospectusUrl || null,
      newsletterUrl: updated.newsletterUrl || null,
      message: 'Document deleted successfully'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
