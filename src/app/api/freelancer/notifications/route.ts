import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { FreelancerNotification } from '@/lib/models';
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

// GET - list notifications
export async function GET(request: NextRequest) {
  const decoded = getFreelancerFromToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const notifications = await FreelancerNotification.find({ freelancerId: decoded.freelancerId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        _id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        metadata: n.metadata,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - mark notifications as read
export async function PATCH(request: NextRequest) {
  const decoded = getFreelancerFromToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await request.json().catch(() => ({}));
    const { id } = body; // if id provided, mark single; otherwise mark all

    if (id) {
      await FreelancerNotification.updateOne(
        { _id: id, freelancerId: decoded.freelancerId },
        { $set: { isRead: true } }
      );
    } else {
      await FreelancerNotification.updateMany(
        { freelancerId: decoded.freelancerId, isRead: false },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
