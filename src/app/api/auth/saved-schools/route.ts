import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId).select('savedSchools').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const savedSchools = user.savedSchools || [];
    return NextResponse.json({ savedSchools });
  } catch (error) {
    console.error('Get saved schools error:', error);
    return NextResponse.json(
      { error: 'Failed to get saved schools' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { schoolId, action } = body;

    if (!schoolId || !action) {
      return NextResponse.json(
        { error: 'schoolId and action are required' },
        { status: 400 }
      );
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "add" or "remove"' },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.userId).select('savedSchools');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let savedSchools: number[] = (user.savedSchools as number[]) || [];

    if (action === 'add') {
      if (!savedSchools.includes(schoolId)) {
        savedSchools = [...savedSchools, schoolId];
      }
    } else {
      savedSchools = savedSchools.filter((id) => id !== schoolId);
    }

    await User.findByIdAndUpdate(decoded.userId, { $set: { savedSchools } });

    return NextResponse.json({
      success: true,
      savedSchools,
      message: action === 'add' ? 'School saved successfully' : 'School removed from saved',
    });
  } catch (error) {
    console.error('Save school error:', error);
    return NextResponse.json(
      { error: 'Failed to save school' },
      { status: 500 }
    );
  }
}
