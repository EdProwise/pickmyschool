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

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { user, error: userError } = verifyToken(request);
    
    if (!user) {
      const { admin, error: adminError } = verifySuperAdminToken(request);
      
      if (!admin) {
        return adminError || userError;
      }
      
      const searchParams = request.nextUrl.searchParams;
      const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
      const offset = parseInt(searchParams.get('offset') ?? '0');
      const unreadOnly = searchParams.get('unreadOnly') === 'true';

      const query: any = { recipientType: 'super_admin' };
      
      if (unreadOnly) {
        query.isRead = false;
      }

      const adminNotifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

      return NextResponse.json(adminNotifications.map(n => ({ ...n, id: n._id })), { status: 200 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const query: any = {
      recipientId: user.userId,
      recipientType: user.role
    };
    
    if (unreadOnly) {
      query.isRead = false;
    }

    const userNotifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return NextResponse.json(userNotifications.map(n => ({ ...n, id: n._id })), { status: 200 });

  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { recipientId, recipientType, title, message, type, relatedId } = body;

    if (!recipientId || !recipientType || !title || !message || !type) {
      return NextResponse.json(
        { 
          error: 'recipientId, recipientType, title, message, and type are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    if (!['school', 'student', 'super_admin'].includes(recipientType)) {
      return NextResponse.json(
        { 
          error: 'recipientType must be school, student, or super_admin',
          code: 'INVALID_RECIPIENT_TYPE'
        },
        { status: 400 }
      );
    }

    if (!['enquiry', 'enquiry_update', 'signup', 'review'].includes(type)) {
      return NextResponse.json(
        { 
          error: 'type must be enquiry, enquiry_update, signup, or review',
          code: 'INVALID_TYPE'
        },
        { status: 400 }
      );
    }

    const newNotification = await Notification.create({
      recipientId: recipientId,
      recipientType,
      title: title.trim(),
      message: message.trim(),
      type,
      relatedId: relatedId || null,
      isRead: false,
    });

    return NextResponse.json(
      {
        notification: { ...newNotification.toObject(), id: newNotification._id },
        message: 'Notification created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
