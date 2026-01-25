import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { StudentAchievement, User, School } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const schoolIdParam = searchParams.get('schoolId');

    if (!schoolIdParam) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    let numericSchoolId: number;
    
    // Check if it's a numeric ID or an ObjectId
    if (/^\d+$/.test(schoolIdParam)) {
      numericSchoolId = parseInt(schoolIdParam);
    } else {
      // It might be an ObjectId, resolve it to numeric ID
      const school = await School.findById(schoolIdParam);
      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      numericSchoolId = school.id;
    }

    const achievements = await StudentAchievement.find({ schoolId: numericSchoolId })
      .sort({ year: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(achievements.map(a => ({ ...a, id: a._id })));
  } catch (error) {
    console.error('Failed to fetch student achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch student achievements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'school' || !user.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { year, studentName, marks, classLevel, section, achievement, images } = body;

    if (!year || !studentName || !classLevel || !achievement) {
      return NextResponse.json(
        { error: 'Year, student name, class, and achievement are required' },
        { status: 400 }
      );
    }

    // Get numeric schoolId from user's school
    const userWithSchool = await User.findById(decoded.userId).populate('schoolId');
    if (!userWithSchool || !userWithSchool.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    const numericSchoolId = (userWithSchool.schoolId as any).id;

    const newAchievement = await StudentAchievement.create({
      schoolId: numericSchoolId,
      year,
      studentName,
      marks: marks || null,
      classLevel,
      section: section || null,
      achievement,
      images: Array.isArray(images) ? images : [],
      featured: false,
    });

    return NextResponse.json({ ...newAchievement.toObject(), id: newAchievement._id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create student achievement:', error);
    return NextResponse.json({ error: 'Failed to create student achievement: ' + (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userRecord = await User.findById(decoded.userId);

    if (!userRecord || userRecord.role !== 'school' || !userRecord.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get numeric schoolId from user's school
    const userWithSchool = await User.findById(decoded.userId).populate('schoolId');
    if (!userWithSchool || !userWithSchool.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    const numericSchoolId = (userWithSchool.schoolId as any).id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { year, studentName, marks, classLevel, section, achievement, images } = body;

    const existingAchievement = await StudentAchievement.findById(id);
    if (!existingAchievement || existingAchievement.schoolId !== numericSchoolId) {
      return NextResponse.json({ error: 'Achievement not found or unauthorized' }, { status: 404 });
    }

    const updated = await StudentAchievement.findByIdAndUpdate(
      id,
      {
        year,
        studentName,
        marks: marks || null,
        classLevel,
        section: section || null,
        achievement,
        images: Array.isArray(images) ? images : [],
      },
      { new: true }
    ).lean();

    return NextResponse.json({ ...updated, id: updated._id });
  } catch (error) {
    console.error('Failed to update student achievement:', error);
    return NextResponse.json({ error: 'Failed to update student achievement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userRecord = await User.findById(decoded.userId);

    if (!userRecord || userRecord.role !== 'school' || !userRecord.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get numeric schoolId from user's school
    const userWithSchool = await User.findById(decoded.userId).populate('schoolId');
    if (!userWithSchool || !userWithSchool.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    const numericSchoolId = (userWithSchool.schoolId as any).id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    const existingAchievement = await StudentAchievement.findById(id);
    if (!existingAchievement || existingAchievement.schoolId !== numericSchoolId) {
      return NextResponse.json({ error: 'Achievement not found or unauthorized' }, { status: 404 });
    }

    await StudentAchievement.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Failed to delete student achievement:', error);
    return NextResponse.json({ error: 'Failed to delete student achievement' }, { status: 500 });
  }
}
