import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: number;
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

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const payload = verifyToken(request);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Role verification
    if (payload.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school users can manage images', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { imageUrl, imageUrls } = body;

    // Validate input - support both single and multiple images
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
      
      // Validate all URLs in array
      for (const url of imageUrls) {
        if (typeof url !== 'string' || url.trim() === '') {
          return NextResponse.json(
            { error: 'Invalid image URL', code: 'INVALID_IMAGE_URL' },
            { status: 400 }
          );
        }
      }
      urlsToAdd = imageUrls.map((url: string) => url.trim());
    } else {
      return NextResponse.json(
        { error: 'Image URL is required', code: 'MISSING_IMAGE_URL' },
        { status: 400 }
      );
    }

    // Find school profile by userId
    const schoolProfile = await db.select()
      .from(schools)
      .where(eq(schools.userId, payload.userId))
      .limit(1);

    if (schoolProfile.length === 0) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get existing gallery images
    const existingGallery = schoolProfile[0].gallery as string[] | null;
    const currentGallery = Array.isArray(existingGallery) ? existingGallery : [];

    // Add new images to gallery
    const updatedGallery = [...currentGallery, ...urlsToAdd];

    // Update school profile
    const updatedProfile = await db.update(schools)
      .set({
        gallery: updatedGallery,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schools.userId, payload.userId))
      .returning();

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update profile', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedProfile[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const payload = verifyToken(request);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Role verification
    if (payload.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school users can manage images', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { imageUrl } = body;

    // Validate input
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return NextResponse.json(
        { error: 'Image URL is required', code: 'MISSING_IMAGE_URL' },
        { status: 400 }
      );
    }

    // Find school profile by userId
    const schoolProfile = await db.select()
      .from(schools)
      .where(eq(schools.userId, payload.userId))
      .limit(1);

    if (schoolProfile.length === 0) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get existing gallery images
    const existingGallery = schoolProfile[0].gallery as string[] | null;
    const currentGallery = Array.isArray(existingGallery) ? existingGallery : [];

    // Check if image exists in gallery
    const imageIndex = currentGallery.indexOf(imageUrl.trim());
    
    if (imageIndex === -1) {
      return NextResponse.json(
        { error: 'Image not found in gallery', code: 'IMAGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Remove image from gallery
    const updatedGallery = currentGallery.filter((url: string) => url !== imageUrl.trim());

    // Update school profile
    const updatedProfile = await db.update(schools)
      .set({
        gallery: updatedGallery,
        updatedAt: new Date().toISOString()
      })
      .where(eq(schools.userId, payload.userId))
      .returning();

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update profile', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...updatedProfile[0],
      message: 'Image deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}