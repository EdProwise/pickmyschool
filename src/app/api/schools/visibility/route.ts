import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, School } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { updateSchool } from '@/lib/schoolsHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  role: string;
}

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (decoded.role !== 'school') {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { user: decoded };
  } catch (error) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const auth = await authenticateRequest(request);
    if ('error' in auth) {
      return auth.error;
    }

    const { user } = auth;
    const { isPublic } = await request.json();

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' },
        { status: 400 }
      );
    }

    // Get user record to get schoolId
    const userRecord = await User.findById(user.userId);

    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // The helper uses numeric ID, but userRecord.schoolId might be numeric or ObjectId
    // Looking at IUser schema, schoolId is a ref to School (ObjectId).
    // Wait, the previous developer's schoolsHelper used numeric ID.
    // Let's check how the user model stores schoolId.
    
    // In src/lib/models/index.ts:
    // schoolId?: mongoose.Types.ObjectId; (ref: 'School')
    // But School has a numeric 'id' field too.
    
    // If userRecord.schoolId is an ObjectId, we need to find the school and get its numeric ID
    const school = await School.findById(userRecord.schoolId);
    if (!school) {
       return NextResponse.json(
        { error: 'School details not found' },
        { status: 404 }
      );
    }

    await updateSchool(school.id, { isPublic });

    return NextResponse.json({ 
      success: true, 
      isPublic,
      message: isPublic ? 'School page is now public' : 'School page is now private'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Visibility toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const auth = await authenticateRequest(request);
    if ('error' in auth) {
      return auth.error;
    }

    const { user } = auth;

    const userRecord = await User.findById(user.userId);

    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    const school = await School.findById(userRecord.schoolId);
    if (!school) {
       return NextResponse.json(
        { error: 'School details not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      isPublic: school.isPublic
    }, { status: 200 });
  } catch (error: any) {
    console.error('Get visibility error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
