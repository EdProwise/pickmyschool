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

async function authenticateAndFindSchool(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: NextResponse.json({ error: 'Missing or invalid authorization header', code: 'MISSING_AUTH_HEADER' }, { status: 401 }) };
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return { error: NextResponse.json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, { status: 401 }) };
    }

    if (decoded.role !== 'school') {
      return { error: NextResponse.json({ error: 'Access denied. School role required', code: 'FORBIDDEN_ROLE' }, { status: 403 }) };
    }

    const userRecord = await User.findById(decoded.userId);

    if (!userRecord || !userRecord.schoolId) {
      return { error: NextResponse.json({ error: 'School profile not found', code: 'PROFILE_NOT_FOUND' }, { status: 404 }) };
    }

    const school = await School.findById(userRecord.schoolId);
    if (!school) {
      return { error: NextResponse.json({ error: 'School details not found', code: 'SCHOOL_NOT_FOUND' }, { status: 404 }) };
    }

    return { success: true, schoolId: school.id, school, decoded };
  } catch (err) {
    console.error('Authentication error:', err);
    return { error: NextResponse.json({ error: 'Authentication error: ' + (err as Error).message }, { status: 500 }) };
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const authResult = await authenticateAndFindSchool(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { schoolId, school } = authResult;

    const body = await request.json();
    const { videoUrl, videoUrls } = body;

    if (!videoUrl && !videoUrls) {
      return NextResponse.json({
        error: 'Either videoUrl or videoUrls must be provided',
        code: 'MISSING_VIDEO_URLS'
      }, { status: 400 });
    }

    let urlsToAdd: string[] = [];
    
    if (videoUrl) {
      const trimmedUrl = (videoUrl as string).trim();
      if (trimmedUrl) urlsToAdd.push(trimmedUrl);
    }

    if (videoUrls && Array.isArray(videoUrls)) {
      urlsToAdd = [...urlsToAdd, ...videoUrls.map((url: string) => String(url).trim()).filter(Boolean)];
    }

    const currentVideos = Array.isArray(school.virtualTourVideos) ? school.virtualTourVideos : (school.virtualTourUrl ? [school.virtualTourUrl] : []);

    const mergedVideos = Array.from(new Set([...currentVideos, ...urlsToAdd]));

    await updateSchool(schoolId, {
      virtualTourVideos: mergedVideos,
      virtualTourUrl: mergedVideos[0] || null,
      updatedAt: new Date()
    });

    const updatedProfile = await getSchool(schoolId);

    return NextResponse.json(updatedProfile, { status: 201 });
  } catch (error) {
    console.error('POST videos error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const authResult = await authenticateAndFindSchool(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { schoolId, school } = authResult;

    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json({
        error: 'videoUrl is required',
        code: 'MISSING_VIDEO_URL'
      }, { status: 400 });
    }

    const trimmedVideoUrl = videoUrl.trim();
    const currentVideos = Array.isArray(school.virtualTourVideos) ? school.virtualTourVideos : (school.virtualTourUrl ? [school.virtualTourUrl] : []);

    const updatedVideos = currentVideos.filter(url => url !== trimmedVideoUrl);

    if (updatedVideos.length === currentVideos.length) {
      return NextResponse.json({
        error: 'Video URL not found',
        code: 'VIDEO_NOT_FOUND'
      }, { status: 404 });
    }

    await updateSchool(schoolId, {
      virtualTourVideos: updatedVideos,
      virtualTourUrl: updatedVideos[0] || null,
      updatedAt: new Date()
    });

    const updatedProfile = await getSchool(schoolId);

    return NextResponse.json({
      ...updatedProfile,
      message: 'Video deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE video error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
