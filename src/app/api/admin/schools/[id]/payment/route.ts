import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { SchoolPayment } from '@/lib/models';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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
    const { amount, receivedDate } = await req.json();

    if (!amount || !receivedDate) {
      return NextResponse.json({ error: 'Missing amount or receivedDate' }, { status: 400 });
    }

    const schoolId = params.id;
    const payment = await SchoolPayment.create({
      schoolId,
      amount,
      receivedDate: new Date(receivedDate),
    });

    // Get total paid for this school
    const payments = await SchoolPayment.find({ schoolId }).lean();
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    return NextResponse.json({ success: true, payment, totalPaid });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
