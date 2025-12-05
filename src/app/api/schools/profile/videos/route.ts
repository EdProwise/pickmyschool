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

async function authenticateAndFindSchool(request: NextRequest) {
  try {
    // Extract and verify JWT token
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

    // Check role is school
    if (decoded.role !== 'school') {
      return { error: NextResponse.json({ error: 'Access denied. School role required', code: 'FORBIDDEN_ROLE' }, { status: 403 }) };
    }

    // School lookup logic - matching images API pattern
    let targetSchoolId: number | null = null;

    // Step 1: Try to find school by userId from token
    const schoolByUserId = await db.select()
      .from(schools)
      .where(eq(schools.userId, decoded.userId))
      .limit(1);

    if (schoolByUserId.length > 0) {
      targetSchoolId = schoolByUserId[0].id;
    } else {
      // Step 2: Query users table to get user.schoolId
      const user = await db.select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user.length > 0 && user[0].schoolId) {
        // Step 3: Find school by schools.id == user.schoolId
        const schoolBySchoolId = await db.select()
          .from(schools)
          .where(eq(schools.id, user[0].schoolId))
          .limit(1);

        if (schoolBySchoolId.length > 0) {
          targetSchoolId = schoolBySchoolId[0].id;

          // Step 4: Link school to user if userId not set
          if (!schoolBySchoolId[0].userId) {
            await db.update(schools)
              .set({
                userId: decoded.userId,
                updatedAt: new Date().toISOString()
              })
              .where(eq(schools.id, targetSchoolId));
          }
        }
      }
    }

    // Step 5: If no school found, return 404
    if (!targetSchoolId) {
      return { error: NextResponse.json({ error: 'School profile not found', code: 'SCHOOL_NOT_FOUND' }, { status: 404 }) };
    }

    return { targetSchoolId, userId: decoded.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: NextResponse.json({ error: 'Authentication failed: ' + (error as Error).message, code: 'AUTH_FAILED' }, { status: 500 }) };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and find school
    const authResult = await authenticateAndFindSchool(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { targetSchoolId } = authResult;

    // Parse request body
    const body = await request.json();
    const { videoUrl, videoUrls } = body;

    // Validation: at least one must be provided
    if (!videoUrl && !videoUrls) {
      return NextResponse.json({
        error: 'Either videoUrl or videoUrls must be provided',
        code: 'MISSING_VIDEO_URLS'
      }, { status: 400 });
    }

    // Build array of URLs to add
    let urlsToAdd: string[] = [];
    
    if (videoUrl) {
      const trimmedUrl = (videoUrl as string).trim();
      if (!trimmedUrl) {
        return NextResponse.json({
          error: 'videoUrl cannot be empty',
          code: 'INVALID_VIDEO_URL'
        }, { status: 400 });
      }
      urlsToAdd.push(trimmedUrl);
    }

    if (videoUrls) {
      if (!Array.isArray(videoUrls)) {
        return NextResponse.json({
          error: 'videoUrls must be an array',
          code: 'INVALID_VIDEO_URLS_FORMAT'
        }, { status: 400 });
      }

      for (const url of videoUrls) {
        if (typeof url !== 'string') {
          return NextResponse.json({
            error: 'All video URLs must be strings',
            code: 'INVALID_VIDEO_URL_TYPE'
          }, { status: 400 });
        }
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
          return NextResponse.json({
            error: 'Video URLs cannot be empty',
            code: 'EMPTY_VIDEO_URL'
          }, { status: 400 });
        }
        urlsToAdd.push(trimmedUrl);
      }
    }

    // Get existing school data
    const existingSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, targetSchoolId))
      .limit(1);

    if (existingSchool.length === 0) {
      return NextResponse.json({
        error: 'School profile not found',
        code: 'SCHOOL_NOT_FOUND'
      }, { status: 404 });
    }

    // Get existing virtualTourVideos - handle as array directly from Drizzle
    let existingVideos: string[] = [];
    const raw = existingSchool[0].virtualTourVideos;
    if (raw) {
      if (Array.isArray(raw)) {
        existingVideos = raw;
      } else if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          existingVideos = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          existingVideos = [];
        }
      }
    }

    // Merge new URLs with existing using Set for deduplication
    const mergedVideos = Array.from(new Set([...existingVideos, ...urlsToAdd]));

    // Update school - manually stringify for SQLite compatibility
    await db.update(schools)
      .set({
        virtualTourVideos: JSON.stringify(mergedVideos),
        updatedAt: new Date().toISOString()
      })
      .where(eq(schools.id, targetSchoolId));

    // Fetch updated school
    const updatedSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, targetSchoolId))
      .limit(1);

    return NextResponse.json(updatedSchool[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and find school
    const authResult = await authenticateAndFindSchool(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { targetSchoolId } = authResult;

    // Parse request body with error handling
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json({
          error: 'Request body is required',
          code: 'MISSING_BODY'
        }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }

    const { videoUrl } = body;

    // Validation: videoUrl required
    if (!videoUrl) {
      return NextResponse.json({
        error: 'videoUrl is required',
        code: 'MISSING_VIDEO_URL'
      }, { status: 400 });
    }

    if (typeof videoUrl !== 'string') {
      return NextResponse.json({
        error: 'videoUrl must be a string',
        code: 'INVALID_VIDEO_URL_TYPE'
      }, { status: 400 });
    }

    const trimmedVideoUrl = videoUrl.trim();
    if (!trimmedVideoUrl) {
      return NextResponse.json({
        error: 'videoUrl cannot be empty',
        code: 'EMPTY_VIDEO_URL'
      }, { status: 400 });
    }

    // Get existing school data
    const existingSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, targetSchoolId))
      .limit(1);

    if (existingSchool.length === 0) {
      return NextResponse.json({
        error: 'School profile not found',
        code: 'SCHOOL_NOT_FOUND'
      }, { status: 404 });
    }

    // Get existing virtualTourVideos - handle as array directly from Drizzle
    let existingVideos: string[] = [];
    const raw = existingSchool[0].virtualTourVideos;
    if (raw) {
      if (Array.isArray(raw)) {
        existingVideos = raw;
      } else if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          existingVideos = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          existingVideos = [];
        }
      }
    }

    // Check if videoUrl exists in array
    if (!existingVideos.includes(trimmedVideoUrl)) {
      return NextResponse.json({
        error: 'Video URL not found in virtual tour videos',
        code: 'VIDEO_NOT_FOUND'
      }, { status: 404 });
    }

    // Filter out the videoUrl
    const updatedVideos = existingVideos.filter(url => url !== trimmedVideoUrl);

    // Update school - manually stringify for SQLite compatibility
    await db.update(schools)
      .set({
        virtualTourVideos: JSON.stringify(updatedVideos),
        updatedAt: new Date().toISOString()
      })
      .where(eq(schools.id, targetSchoolId));

    // Fetch updated school
    const updatedSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, targetSchoolId))
      .limit(1);

    return NextResponse.json({
      ...updatedSchool[0],
      message: 'Video deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}