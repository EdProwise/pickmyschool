import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SchoolPayment, School } from '@/lib/models';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  schoolId: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    const schoolId = decoded.schoolId;

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID not found in token' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch school to get numeric ID
    const school = await School.findOne({ userId: schoolId }).select('_id').lean();
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Fetch payments for this school
    const payments = await SchoolPayment.find({ schoolId: school._id })
      .sort({ receivedDate: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Statement of account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
