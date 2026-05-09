import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { FreelancerEarning, FreelancerLead } from '@/lib/models';
import jwt from 'jsonwebtoken';

function getFreelancerFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      freelancerId: string;
      role: string;
    };
    if (decoded.role !== 'freelancer') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const decoded = getFreelancerFromToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();

    const earnings = await FreelancerEarning.find({ freelancerId: decoded.freelancerId })
      .populate('leadId', 'parentName studentName schoolInterested status')
      .sort({ createdAt: -1 });

    const totalPaid = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const totalPending = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({ earnings, totalPaid, totalPending });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
