import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { SchoolPayment, School } from '@/lib/models';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(auth, process.env.JWT_SECRET || 'secret') as any;
    if (decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const numericId = parseInt(id);
    const school = await School.findOne({ id: numericId }).lean() as any;
    if (!school) {
      return NextResponse.json({ payments: [] });
    }
    const schoolObjectId = school._id;

    const payments = await SchoolPayment.find({ schoolId: schoolObjectId }).sort({ receivedDate: -1 }).lean();

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
