import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userRecord = await User.findById(decoded.userId);
    if (!userRecord?.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const { visible } = await request.json();
    if (typeof visible !== 'boolean') {
      return NextResponse.json({ error: 'visible must be a boolean' }, { status: 400 });
    }

    await School.findByIdAndUpdate(userRecord.schoolId, { brochureVisible: visible });

    return NextResponse.json({ success: true, brochureVisible: visible });
  } catch (error: any) {
    console.error('Brochure visibility error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update visibility' }, { status: 500 });
  }
}
