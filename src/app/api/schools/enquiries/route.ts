import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Enquiry, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Extract and verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
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

    // Get school admin's schoolId from users collection
    const userRecord = await User.findById(userId);
    
    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const schoolId = userRecord.schoolId;

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

    // Build query object
    const query: any = { schoolId };

    if (status) {
      query.status = status;
    }

    if (studentClass) {
      query.studentClass = studentClass;
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Get total count for metadata
    const total = await Enquiry.countDocuments(query);

    // Get status breakdown
    const statusBreakdownResult = await Enquiry.aggregate([
      { $match: { schoolId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusBreakdown: Record<string, number> = {};
    statusBreakdownResult.forEach(row => {
      statusBreakdown[row._id] = row.count;
    });

    // Query enquiries with pagination
    const enquiriesResult = await Enquiry.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Calculate hasMore
    const hasMore = (offset + enquiriesResult.length) < total;

    return NextResponse.json({
      enquiries: enquiriesResult.map(e => ({ ...e, id: e._id })),
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
