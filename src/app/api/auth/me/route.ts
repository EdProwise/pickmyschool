import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    // Validate token format
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid token format', code: 'INVALID_FORMAT' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify and decode JWT token
    let decoded: { userId: number; email: string; role: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Extract userId from decoded token
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token payload', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Query database for user
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRecords.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const user = userRecords[0];

    // Remove password field from user object
    const { password, ...userWithoutPassword } = user;

    // Return user object
    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/me error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}