import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'No authorization token provided',
          code: 'NO_TOKEN' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Query chat history for authenticated user
    const chatRecord = await db.select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .limit(1);

    // If no chat history found, return null with message
    if (chatRecord.length === 0) {
      return NextResponse.json({
        chat: null,
        message: 'No chat history found'
      }, { status: 200 });
    }

    // Return chat history
    return NextResponse.json({
      chat: chatRecord[0]
    }, { status: 200 });

  } catch (error) {
    console.error('GET chat history error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}