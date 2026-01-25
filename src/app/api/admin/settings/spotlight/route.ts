import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SiteSettings } from '@/lib/models';
import { getSchool } from '@/lib/schoolsHelper';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: string;
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
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

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

    await connectToDatabase();

    const settings = await SiteSettings.findOne().lean();

    if (!settings) {
      return NextResponse.json({ 
        settings: null 
      }, { status: 200 });
    }

    if (settings.spotlightSchoolId) {
      const school = await getSchool(settings.spotlightSchoolId);

      if (school) {
        return NextResponse.json({ 
          settings: {
            ...settings,
            id: settings._id,
            school
          }
        }, { status: 200 });
      }
    }

    return NextResponse.json({ 
      settings: {
        ...settings,
        id: settings._id,
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

    await connectToDatabase();

    const body = await request.json();
    const { schoolId } = body;

    if (!schoolId || typeof schoolId !== 'number' || isNaN(schoolId)) {
      return NextResponse.json({ 
        error: 'Valid schoolId is required',
        code: 'INVALID_SCHOOL_ID' 
      }, { status: 400 });
    }

    const school = await getSchool(schoolId);

    if (!school) {
      return NextResponse.json({ 
        error: 'School not found',
        code: 'SCHOOL_NOT_FOUND' 
      }, { status: 404 });
    }

    const existingSettings = await SiteSettings.findOne();

    let updatedSettings;

    if (existingSettings) {
      updatedSettings = await SiteSettings.findByIdAndUpdate(
        existingSettings._id,
        { $set: { spotlightSchoolId: schoolId } },
        { new: true }
      );
    } else {
      updatedSettings = await SiteSettings.create({
        spotlightSchoolId: schoolId,
      });
    }

    return NextResponse.json({ 
      settings: { ...updatedSettings!.toObject(), id: updatedSettings!._id },
      message: 'Spotlight school updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
