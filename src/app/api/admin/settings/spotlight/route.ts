import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteSettings, schools } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  role: string;
  email: string;
}

function verifyAdminToken(request: NextRequest): { isValid: boolean; payload?: JWTPayload; error?: string; code?: string } {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false, error: 'No token provided', code: 'NO_TOKEN' };
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return { isValid: false, error: 'Server configuration error', code: 'SERVER_ERROR' };
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    if (decoded.role !== 'super_admin') {
      return { isValid: false, error: 'Access forbidden: Super admin only', code: 'FORBIDDEN' };
    }

    return { isValid: true, payload: decoded };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { isValid: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' };
    }
    return { isValid: false, error: 'Token verification failed', code: 'INVALID_TOKEN' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ 
        error: authResult.error,
        code: authResult.code 
      }, { status });
    }

    const settingsRecords = await db.select()
      .from(siteSettings)
      .limit(1);

    if (settingsRecords.length === 0) {
      return NextResponse.json({ 
        settings: null 
      }, { status: 200 });
    }

    const settings = settingsRecords[0];

    if (settings.spotlightSchoolId) {
      const schoolRecords = await db.select()
        .from(schools)
        .where(eq(schools.id, settings.spotlightSchoolId))
        .limit(1);

      if (schoolRecords.length > 0) {
        return NextResponse.json({ 
          settings: {
            ...settings,
            school: schoolRecords[0]
          }
        }, { status: 200 });
      }
    }

    return NextResponse.json({ 
      settings: {
        ...settings,
        school: null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ 
        error: authResult.error,
        code: authResult.code 
      }, { status });
    }

    const body = await request.json();
    const { schoolId } = body;

    if (!schoolId || typeof schoolId !== 'number' || isNaN(schoolId)) {
      return NextResponse.json({ 
        error: 'Valid schoolId is required',
        code: 'INVALID_SCHOOL_ID' 
      }, { status: 400 });
    }

    const schoolRecords = await db.select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (schoolRecords.length === 0) {
      return NextResponse.json({ 
        error: 'School not found',
        code: 'SCHOOL_NOT_FOUND' 
      }, { status: 404 });
    }

    const existingSettings = await db.select()
      .from(siteSettings)
      .limit(1);

    let updatedSettings;

    if (existingSettings.length > 0) {
      updatedSettings = await db.update(siteSettings)
        .set({
          spotlightSchoolId: schoolId,
          updatedAt: new Date().toISOString()
        })
        .where(eq(siteSettings.id, existingSettings[0].id))
        .returning();
    } else {
      updatedSettings = await db.insert(siteSettings)
        .values({
          spotlightSchoolId: schoolId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
    }

    return NextResponse.json({ 
      settings: updatedSettings[0],
      message: 'Spotlight school updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}