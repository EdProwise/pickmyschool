import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { getSchools } from '@/lib/schoolsHelper';

interface JWTPayload {
  adminId: string;
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

    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Not authorized to access this resource', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const board = searchParams.get('board');
    const featuredParam = searchParams.get('featured');

    const filters: any = {};
    if (search) filters.search = search;
    if (city) filters.city = city;
    if (board) filters.board = board;
    if (featuredParam === 'true') filters.featured = true;
    if (featuredParam === 'false') filters.featured = false;

    const results = await getSchools(filters, { limit, offset });

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
