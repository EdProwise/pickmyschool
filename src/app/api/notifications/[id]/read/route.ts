import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  role: string;
}

interface SuperAdminJWTPayload {
  adminId: string;
  email: string;
}

function verifyToken(request: NextRequest): { user: JWTPayload | null; error: NextResponse | null } {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      )
    };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return { user: decoded, error: null };
  } catch (error) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    };
  }
}

function verifySuperAdminToken(request: NextRequest): { admin: SuperAdminJWTPayload | null; error: NextResponse | null } {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      admin: null,
      error: NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      )
    };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SuperAdminJWTPayload;
    return { admin: decoded, error: null };
  } catch (error) {
    return {
      admin: null,
      error: NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    };
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id: notificationId } = await params;

    const { user, error: userError } = verifyToken(request);
    
    if (!user) {
      const { admin, error: adminError } = verifySuperAdminToken(request);
      
      if (!admin) {
        return adminError || userError;
      }
      
      const notification = await Notification.findOne({
        _id: notificationId,
        recipientType: 'super_admin'
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { $set: { isRead: true } },
        { new: true }
      );

      return NextResponse.json(
        {
          notification: { ...updatedNotification!.toObject(), id: updatedNotification!._id },
          message: 'Notification marked as read'
        },
        { status: 200 }
      );
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: user.userId,
      recipientType: user.role
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { $set: { isRead: true } },
      { new: true }
    );

    return NextResponse.json(
      {
        notification: { ...updatedNotification!.toObject(), id: updatedNotification!._id },
        message: 'Notification marked as read'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('PATCH notification read error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
