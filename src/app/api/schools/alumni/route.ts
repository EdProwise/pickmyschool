import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Alumni, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const featured = searchParams.get('featured');
    
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const query: any = { schoolId: parseInt(schoolId) };
    if (featured === 'true') {
      query.featured = true;
    }

    const schoolAlumni = await Alumni.find(query)
      .sort({ batchYear: -1, displayOrder: 1 })
      .lean();

    return NextResponse.json(schoolAlumni.map(a => ({ ...a, id: a._id })), { status: 200 });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    return NextResponse.json({ error: 'Failed to fetch alumni' }, { status: 500 });
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

    const body = await request.json();
    const {
      name,
      batchYear,
      classLevel,
      section,
      currentPosition,
      company,
      achievements,
      photoUrl,
      linkedinUrl,
      quote,
      featured,
      displayOrder
    } = body;

    if (!name || !batchYear) {
      return NextResponse.json({ error: 'Name and batch year are required' }, { status: 400 });
    }
    
    const newAlumni = await Alumni.create({
      schoolId: user.schoolId,
      name,
      batchYear,
      classLevel: classLevel || null,
      section: section || null,
      currentPosition: currentPosition || null,
      company: company || null,
      achievements: achievements || null,
      photoUrl: photoUrl || null,
      linkedinUrl: linkedinUrl || null,
      quote: quote || null,
      featured: featured || false,
      displayOrder: displayOrder || null,
    });

    return NextResponse.json({ ...newAlumni.toObject(), id: newAlumni._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating alumni:', error);
    return NextResponse.json({ error: 'Failed to create alumni' }, { status: 500 });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Alumni ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { id: _id, ...payload } = body;

    const existingAlumni = await Alumni.findById(id);
    
    if (!existingAlumni || existingAlumni.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Alumni not found or unauthorized' }, { status: 404 });
    }

    const updatedAlumni = await Alumni.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );

    return NextResponse.json({ ...updatedAlumni!.toObject(), id: updatedAlumni!._id }, { status: 200 });
  } catch (error) {
    console.error('Error updating alumni:', error);
    return NextResponse.json({ error: 'Failed to update alumni' }, { status: 500 });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Alumni ID is required' }, { status: 400 });
    }

    const existingAlumni = await Alumni.findById(id);
    
    if (!existingAlumni || existingAlumni.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Alumni not found or unauthorized' }, { status: 404 });
    }

    await Alumni.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Alumni deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting alumni:', error);
    return NextResponse.json({ error: 'Failed to delete alumni' }, { status: 500 });
  }
}
