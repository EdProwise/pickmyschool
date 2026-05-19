import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Notification, SuperAdmin } from '@/lib/models';
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

// GET - list notifications for the admin
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const adminDoc = await SuperAdmin.findById(admin.adminId).lean();
    if (!adminDoc) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    const notifications = await Notification.find({ recipientId: adminDoc._id })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        _id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
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
  const admin = verifyAdminToken(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const adminDoc = await SuperAdmin.findById(admin.adminId).lean();
    if (!adminDoc) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (id) {
      await Notification.updateOne(
        { _id: id, recipientId: adminDoc._id },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.updateMany(
        { recipientId: adminDoc._id, isRead: false },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
