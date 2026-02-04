import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Enquiry, User, School, Notification } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  role: string;
}

function verifySchoolToken(request: NextRequest): { user: JWTPayload | null; error: NextResponse | null } {
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
    if (decoded.role !== 'school') {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Only school admins can access this endpoint', code: 'FORBIDDEN' },
          { status: 403 }
        )
      };
    }
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

// POST - Create a new enquiry manually from school dashboard
export async function POST(request: NextRequest) {
  try {
    const { user, error } = verifySchoolToken(request);
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get school admin's schoolId
    const userRecord = await User.findById(user.userId);
    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userSchoolId = userRecord.schoolId;
    if (!userSchoolId) {
      return NextResponse.json(
        { error: 'School admin not associated with any school', code: 'NO_SCHOOL_ASSOCIATED' },
        { status: 400 }
      );
    }

    const school = await School.findById(userSchoolId);
    if (!school) {
      return NextResponse.json(
        { error: 'School not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { studentName, studentEmail, studentPhone, studentClass, message, studentAddress, studentState, studentAge, studentGender } = body;

    // Validate required fields
    if (!studentName || !studentEmail || !studentPhone || !studentClass) {
      return NextResponse.json(
        { 
          error: 'studentName, studentEmail, studentPhone, and studentClass are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = studentEmail.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Create the enquiry
    const newEnquiry = await Enquiry.create({
      schoolId: school.id,
      studentName: studentName.trim(),
      studentEmail: trimmedEmail,
      studentPhone: studentPhone.trim(),
      studentClass: studentClass.trim(),
      message: message ? message.trim() : null,
      status: 'New',
      studentAddress: studentAddress ? studentAddress.trim() : null,
      studentState: studentState || null,
      studentAge: studentAge || null,
      studentGender: studentGender || null,
    });

    return NextResponse.json(
      {
        enquiry: { ...newEnquiry.toObject(), id: newEnquiry._id },
        message: 'Enquiry created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST schools/enquiries error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

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

    const userSchoolId = userRecord.schoolId;

    if (!userSchoolId) {
      return NextResponse.json(
        { error: 'School admin not associated with any school', code: 'NO_SCHOOL_ASSOCIATED' },
        { status: 400 }
      );
    }

    // Get the numeric school ID
    const school = await School.findById(userSchoolId);
    if (!school) {
      return NextResponse.json(
        { error: 'School not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }
    const schoolId = school.id;

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
