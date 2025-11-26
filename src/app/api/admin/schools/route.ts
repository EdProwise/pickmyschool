import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools } from '@/db/schema';
import { eq, like, and, desc, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: number;
  role: string;
  email: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Check if user is super admin
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Not authorized to access this resource', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const board = searchParams.get('board');
    const featuredParam = searchParams.get('featured');

    // Build query with filters
    let query = db.select().from(schools);
    const conditions = [];

    // Search filter (name or city)
    if (search) {
      conditions.push(
        or(
          like(schools.name, `%${search}%`),
          like(schools.city, `%${search}%`)
        )
      );
    }

    // City filter
    if (city) {
      conditions.push(eq(schools.city, city));
    }

    // Board filter
    if (board) {
      conditions.push(eq(schools.board, board));
    }

    // Featured filter
    if (featuredParam === 'true' || featuredParam === 'false') {
      const featuredValue = featuredParam === 'true';
      conditions.push(eq(schools.featured, featuredValue));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Order by rating descending and apply pagination
    const results = await query
      .orderBy(desc(schools.rating))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}