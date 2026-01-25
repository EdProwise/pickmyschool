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

async function getAuthSchoolId(payload: JWTPayload): Promise<number | null> {
  const userRecord = await User.findById(payload.userId);

  if (userRecord && userRecord.schoolId) {
    const school = await School.findById(userRecord.schoolId);
    return school ? school.id : null;
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
        { error: 'Only school users can manage logo', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { logoUrl, bannerImageUrl } = body;

    const schoolId = await getAuthSchoolId(payload);

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl || null;
      updateData.logo = logoUrl || null;
    }

    if (bannerImageUrl !== undefined) {
      updateData.bannerImageUrl = bannerImageUrl || null;
      updateData.bannerImage = bannerImageUrl || null;
    }

    await updateSchool(schoolId, updateData);

    const updatedProfile = await getSchool(schoolId);

    return NextResponse.json({
      logoUrl: updatedProfile?.logoUrl,
      bannerImageUrl: updatedProfile?.bannerImageUrl,
      message: 'Images updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('POST logo error:', error);
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
        { error: 'Only school users can manage logo', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { field } = body;

    if (!field || !['logoUrl', 'bannerImageUrl'].includes(field)) {
      return NextResponse.json(
        { error: 'Invalid field. Use logoUrl or bannerImageUrl', code: 'INVALID_FIELD' },
        { status: 400 }
      );
    }

    const schoolId = await getAuthSchoolId(payload);

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (field === 'logoUrl') {
      updateData.logoUrl = null;
      updateData.logo = null;
    } else if (field === 'bannerImageUrl') {
      updateData.bannerImageUrl = null;
      updateData.bannerImage = null;
    }

    await updateSchool(schoolId, updateData);

    return NextResponse.json({
      message: `${field} deleted successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE logo error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
