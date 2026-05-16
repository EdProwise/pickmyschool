import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SchoolPayment, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; schoolId?: string };

    await connectToDatabase();

    // Get school's _id from the user's schoolId field
    const userRecord = await User.findById(decoded.userId).select('schoolId').lean();
    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json({ error: 'No school associated with this account' }, { status: 403 });
    }

    // Fetch payments for this school
    const payments = await SchoolPayment.find({ schoolId: userRecord.schoolId })
      .sort({ receivedDate: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Statement of account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
