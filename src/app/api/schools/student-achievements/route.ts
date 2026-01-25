import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { StudentAchievement, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const achievements = await StudentAchievement.find({ schoolId: parseInt(schoolId) })
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
    const school = await (user as any).populate('schoolId');
    const numericSchoolId = school.schoolId.id;

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

    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'school' || !user.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { year, studentName, marks, classLevel, section, achievement, images } = body;

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

    if (!updated) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

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

    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'school' || !user.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    await StudentAchievement.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Failed to delete student achievement:', error);
    return NextResponse.json({ error: 'Failed to delete student achievement' }, { status: 500 });
  }
}
