import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Enquiry, User, School, Notification } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  role: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeForDuplicate(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function buildDuplicateQuery(schoolId: number, payload: { studentName: string; studentPhone: string; studentClass: string }) {
  return {
    schoolId,
    studentName: { $regex: `^\\s*${escapeRegExp(payload.studentName)}\\s*$`, $options: 'i' },
    studentPhone: { $regex: `^\\s*${escapeRegExp(payload.studentPhone)}\\s*$` },
    studentClass: { $regex: `^\\s*${escapeRegExp(payload.studentClass)}\\s*$`, $options: 'i' },
  };
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
    const {
      studentName,
      studentEmail,
      studentPhone,
      studentClass,
      message,
      studentAddress,
      studentState,
      studentAge,
      studentGender,
      enquiries,
      allowBlank,
    } = body;

    const shouldAllowBlank = Boolean(allowBlank);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const normalizeField = (value: unknown) => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    const buildEnquiryPayload = (record: any, index?: number) => {
      const normalizedName = normalizeField(record.studentName);
      const normalizedEmail = normalizeField(record.studentEmail).toLowerCase();
      const normalizedPhone = normalizeField(record.studentPhone);
      const normalizedClass = normalizeField(record.studentClass);

      if (!shouldAllowBlank) {
        if (!normalizedName || !normalizedEmail || !normalizedPhone || !normalizedClass) {
          throw new Error('studentName, studentEmail, studentPhone, and studentClass are required');
        }
      }

      if (normalizedEmail && !emailRegex.test(normalizedEmail)) {
        throw new Error(index !== undefined ? `Invalid email format in row ${index + 1}` : 'Invalid email format');
      }

      return {
        schoolId: school.id,
        studentName: normalizedName,
        studentEmail: normalizedEmail,
        studentPhone: normalizedPhone,
        studentClass: normalizedClass,
        message: normalizeField(record.message) || null,
        status: 'New',
        studentAddress: normalizeField(record.studentAddress) || null,
        studentState: normalizeField(record.studentState) || null,
        studentAge: normalizeField(record.studentAge) || null,
        studentGender: normalizeField(record.studentGender) || null,
      };
    };

    if (Array.isArray(enquiries)) {
      const created: any[] = [];
      const failed: Array<{ row: number; error: string }> = [];
      const seenInBatch = new Set<string>();

      for (let i = 0; i < enquiries.length; i += 1) {
        try {
          const payload = buildEnquiryPayload(enquiries[i], i);

          // Duplicate detection requires all 3 fields to be present.
          if (payload.studentName && payload.studentPhone && payload.studentClass) {
            const duplicateKey = `${normalizeForDuplicate(payload.studentName)}|${normalizeForDuplicate(payload.studentPhone)}|${normalizeForDuplicate(payload.studentClass)}`;
            if (seenInBatch.has(duplicateKey)) {
              throw new Error('Duplicate enquiry: same Student Name, Phone and Class already exists in import file');
            }

            const existingDuplicate = await Enquiry.findOne(
              buildDuplicateQuery(school.id, {
                studentName: payload.studentName,
                studentPhone: payload.studentPhone,
                studentClass: payload.studentClass,
              })
            ).lean();

            if (existingDuplicate) {
              throw new Error('Duplicate enquiry: same Student Name, Phone and Class already exists');
            }

            seenInBatch.add(duplicateKey);
          }

          const createdEnquiry = await Enquiry.create(payload);
          created.push({ ...createdEnquiry.toObject(), id: createdEnquiry._id });
        } catch (rowError: any) {
          failed.push({ row: i + 1, error: rowError?.message || 'Failed to import row' });
        }
      }

      return NextResponse.json(
        {
          message: 'Enquiries import processed',
          importedCount: created.length,
          failedCount: failed.length,
          failedRows: failed,
          enquiries: created,
        },
        { status: 201 }
      );
    }

    let newEnquiryPayload: any;
    try {
      newEnquiryPayload = buildEnquiryPayload({
        studentName,
        studentEmail,
        studentPhone,
        studentClass,
        message,
        studentAddress,
        studentState,
        studentAge,
        studentGender,
      });
    } catch (validationError: any) {
      return NextResponse.json(
        {
          error: validationError?.message || 'Invalid enquiry payload',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (newEnquiryPayload.studentName && newEnquiryPayload.studentPhone && newEnquiryPayload.studentClass) {
      const existingDuplicate = await Enquiry.findOne(
        buildDuplicateQuery(school.id, {
          studentName: newEnquiryPayload.studentName,
          studentPhone: newEnquiryPayload.studentPhone,
          studentClass: newEnquiryPayload.studentClass,
        })
      ).lean();

      if (existingDuplicate) {
        return NextResponse.json(
          {
            error: 'Duplicate enquiry: same Student Name, Phone and Class already exists',
            code: 'DUPLICATE_ENQUIRY',
          },
          { status: 409 }
        );
      }
    }

    const newEnquiry = await Enquiry.create(newEnquiryPayload);

    const webhookUrl = school.whatsappWebhookUrl || 'https://edprowisebooster.edprowise.com/api/webhooks/external-enquiry';
    const apiKey = school.whatsappApiKey || 'epb_1100ec6ae820e021c94b3ff55b42e727871bca4f403325e4';

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey,
          name: newEnquiryPayload.studentName,
          phone: newEnquiryPayload.studentPhone,
          email: newEnquiryPayload.studentEmail,
          message: newEnquiryPayload.message || `Manual enquiry added for class ${newEnquiryPayload.studentClass}`,
          source: 'PickMySchool - Manual'
        })
      });
      console.log('Manual enquiry forwarded to EdproWise Booster:', webhookUrl, 'Response status:', webhookResponse.status);
    } catch (webhookError) {
      console.error('Failed to forward manual enquiry to EdproWise Booster:', webhookError);
    }

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
      const limit = Math.min(parseInt(searchParams.get('limit') ?? '1000'), 1000);
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
