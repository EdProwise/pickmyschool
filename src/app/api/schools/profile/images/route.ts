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
        { error: 'Only school users can manage images', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrl, imageUrls } = body;

    let urlsToAdd: string[] = [];

    if (imageUrl) {
      if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        return NextResponse.json(
          { error: 'Invalid image URL', code: 'INVALID_IMAGE_URL' },
          { status: 400 }
        );
      }
      urlsToAdd = [imageUrl.trim()];
    } else if (imageUrls) {
      if (!Array.isArray(imageUrls)) {
        return NextResponse.json(
          { error: 'Invalid image URLs format', code: 'INVALID_IMAGE_URL' },
          { status: 400 }
        );
      }
      urlsToAdd = imageUrls.filter((url: any) => typeof url === 'string' && url.trim() !== '').map((url: string) => url.trim());
    } else {
      return NextResponse.json(
        { error: 'Image URL is required', code: 'MISSING_IMAGE_URL' },
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

    const currentGallery = Array.isArray(school.galleryImages) ? school.galleryImages : (Array.isArray(school.gallery) ? school.gallery : []);

    const set = new Set(currentGallery);
    for (const u of urlsToAdd) set.add(u);
    const updatedGallery = Array.from(set);

    await updateSchool(school.id, {
      galleryImages: updatedGallery,
      gallery: updatedGallery,
      updatedAt: new Date()
    });

    const updatedProfile = await getSchool(school.id);

    return NextResponse.json(updatedProfile, { status: 201 });

  } catch (error) {
    console.error('POST images error:', error);
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
        { error: 'Only school users can manage images', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return NextResponse.json(
        { error: 'Image URL is required', code: 'MISSING_IMAGE_URL' },
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

    const currentGallery = Array.isArray(school.galleryImages) ? school.galleryImages : (Array.isArray(school.gallery) ? school.gallery : []);

    const updatedGallery = currentGallery.filter((url: string) => url !== imageUrl.trim());

    if (updatedGallery.length === currentGallery.length) {
      return NextResponse.json(
        { error: 'Image not found in gallery', code: 'IMAGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    await updateSchool(school.id, {
      galleryImages: updatedGallery,
      gallery: updatedGallery,
      updatedAt: new Date()
    });

    const updatedProfile = await getSchool(school.id);

    return NextResponse.json({
      ...updatedProfile,
      message: 'Image deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE images error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
