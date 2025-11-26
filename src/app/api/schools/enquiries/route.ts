import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries, users } from '@/db/schema';
import { eq, desc, asc, gte, lte, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const { userId, role } = decoded;

    // Check if user has school admin role
    if (role !== 'school') {
      return NextResponse.json(
        { error: 'Only school admins can access this endpoint', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get school admin's schoolId from users table
    const userRecord = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const schoolId = userRecord[0].schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School admin not associated with any school', code: 'NO_SCHOOL_ASSOCIATED' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const studentClass = searchParams.get('studentClass');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sortField = searchParams.get('sort') ?? 'createdAt';
    const sortOrder = searchParams.get('order') ?? 'desc';

    // Build where conditions
    const conditions = [eq(enquiries.schoolId, schoolId)];

    if (status) {
      conditions.push(eq(enquiries.status, status));
    }

    if (studentClass) {
      conditions.push(eq(enquiries.studentClass, studentClass));
    }

    if (fromDate) {
      conditions.push(gte(enquiries.createdAt, fromDate));
    }

    if (toDate) {
      conditions.push(lte(enquiries.createdAt, toDate));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count for metadata
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(enquiries)
      .where(whereCondition);

    const total = Number(totalResult[0]?.count ?? 0);

    // Get status breakdown
    const statusBreakdownResult = await db.select({
      status: enquiries.status,
      count: sql<number>`count(*)`
    })
      .from(enquiries)
      .where(eq(enquiries.schoolId, schoolId))
      .groupBy(enquiries.status);

    const statusBreakdown: Record<string, number> = {};
    statusBreakdownResult.forEach(row => {
      statusBreakdown[row.status] = Number(row.count);
    });

    // Build sort order
    const sortColumn = sortField === 'status' ? enquiries.status : enquiries.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Query enquiries with pagination
    const enquiriesResult = await db.select()
      .from(enquiries)
      .where(whereCondition)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    // Calculate hasMore
    const hasMore = (offset + enquiriesResult.length) < total;

    return NextResponse.json({
      enquiries: enquiriesResult,
      metadata: {
        total,
        limit,
        offset,
        hasMore,
        statusBreakdown
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET enquiries error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}