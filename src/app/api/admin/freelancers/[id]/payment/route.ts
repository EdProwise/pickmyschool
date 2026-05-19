import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer, FreelancerEarning, FreelancerNotification } from '@/lib/models';
import jwt from 'jsonwebtoken';

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.substring(7), process.env.JWT_SECRET || 'your-secret-key') as {
      adminId: string; role: string; email: string;
    };
    if (decoded.role !== 'super_admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: freelancerId } = await params;

  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, amount, paymentDate } = body;

    const freelancer = await Freelancer.findById(freelancerId).select('-password');
    if (!freelancer) return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 });

    // Compute current totalPaid
    const paidAgg = await FreelancerEarning.aggregate([
      { $match: { freelancerId: freelancer._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const currentPaid: number = paidAgg[0]?.total ?? 0;
    const totalEarnings: number = freelancer.totalEarnings ?? 0;
    const balance = Math.max(0, totalEarnings - currentPaid);

    let payAmount = 0;
    if (action === 'pay-now') {
      if (balance <= 0) {
        return NextResponse.json({ error: 'No balance to pay' }, { status: 400 });
      }
      payAmount = balance;
    } else if (action === 'manual') {
      const amt = Number(amount);
      if (!amt || amt <= 0) {
        return NextResponse.json({ error: 'Please enter a valid amount greater than 0' }, { status: 400 });
      }
      payAmount = amt;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // For manual adjustments, use the admin-provided date; for pay-now use current time
    const paidAt = action === 'manual' && paymentDate
      ? new Date(paymentDate)
      : new Date();

    await FreelancerEarning.create({
      freelancerId: freelancer._id,
      amount: payAmount,
      type: 'commission',
      status: 'paid',
      description: action === 'pay-now' ? 'Admin payment (Pay Now)' : 'Manual adjustment by admin',
      paidAt,
    });

    const newTotalPaid = currentPaid + payAmount;
    const newBalance = Math.max(0, totalEarnings - newTotalPaid);

    // In-app notification for the freelancer
    try {
      await FreelancerNotification.create({
        freelancerId: freelancer._id,
        type: 'payment',
        title: 'Payment Received 💰',
        message: `₹${payAmount.toLocaleString('en-IN')} has been paid to you by admin.`,
        metadata: { amount: payAmount, paidAt: paidAt.toISOString() },
      });
    } catch (notifErr) {
      console.error('Failed to create payment notification:', notifErr);
    }

    return NextResponse.json({ success: true, totalPaid: newTotalPaid, balance: newBalance });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
