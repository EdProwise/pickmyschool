import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Result, User, School } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const schoolIdParam = searchParams.get('schoolId');
    const year = searchParams.get('year');
    
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

    const query: any = { schoolId: numericSchoolId };
    if (year) {
      query.year = parseInt(year);
    }

    const schoolResults = await Result.find(query)
      .sort({ year: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(schoolResults.map(r => ({ ...r, id: r._id })), { status: 200 });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'school' || !user.schoolId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const school = await School.findById(user.schoolId);
      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      const numericSchoolId = school.id;

      const body = await request.json();
      const {
        year,
        examType,
        classLevel,
        passPercentage,
        totalStudents,
        distinction,
        firstClass,
        toppers,
        achievements,
        certificateImages
      } = body;

      if (!year || !examType) {
        return NextResponse.json({ error: 'Year and exam type are required' }, { status: 400 });
      }
      
      const newResult = await Result.create({
        schoolId: numericSchoolId,
      year,
      examType,
      classLevel: classLevel || null,
      passPercentage: passPercentage || null,
      totalStudents: totalStudents || null,
      distinction: distinction || null,
      firstClass: firstClass || null,
      toppers: toppers || [],
      achievements: achievements || null,
      certificateImages: certificateImages || [],
    });

    return NextResponse.json({ ...newResult.toObject(), id: newResult._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating result:', error);
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'school' || !user.schoolId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const school = await School.findById(user.schoolId);
      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      const numericSchoolId = school.id;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json({ error: 'Result ID is required' }, { status: 400 });
      }

      const body = await request.json();
      const { id: _id, ...payload } = body;

      const existingResult = await Result.findById(id);
      
      if (!existingResult || existingResult.schoolId !== numericSchoolId) {
      return NextResponse.json({ error: 'Result not found or unauthorized' }, { status: 404 });
    }

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );

    return NextResponse.json({ ...updatedResult!.toObject(), id: updatedResult!._id }, { status: 200 });
  } catch (error) {
    console.error('Error updating result:', error);
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
      
      if (!user || user.role !== 'school' || !user.schoolId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const school = await School.findById(user.schoolId);
      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }
      const numericSchoolId = school.id;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json({ error: 'Result ID is required' }, { status: 400 });
      }

      const existingResult = await Result.findById(id);
      
      if (!existingResult || existingResult.schoolId !== numericSchoolId) {
      return NextResponse.json({ error: 'Result not found or unauthorized' }, { status: 404 });
    }

    await Result.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Result deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting result:', error);
    return NextResponse.json({ error: 'Failed to delete result' }, { status: 500 });
  }
}
