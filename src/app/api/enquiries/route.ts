import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries, schools } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: number;
  role: string;
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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { user, error } = verifyToken(request);
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Authorization check - only students can submit enquiries
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can submit enquiries', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { schoolId, studentName, studentEmail, studentPhone, studentClass, message } = body;

    // Validate required fields
    if (!schoolId || !studentName || !studentEmail || !studentPhone || !studentClass) {
      return NextResponse.json(
        { 
          error: 'schoolId, studentName, studentEmail, studentPhone, and studentClass are required',
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

    // Validate schoolId is a valid integer
    const parsedSchoolId = parseInt(schoolId);
    if (isNaN(parsedSchoolId)) {
      return NextResponse.json(
        { error: 'Invalid schoolId', code: 'INVALID_SCHOOL_ID' },
        { status: 400 }
      );
    }

    // Verify school exists
    const school = await db.select()
      .from(schools)
      .where(eq(schools.id, parsedSchoolId))
      .limit(1);

    if (school.length === 0) {
      return NextResponse.json(
        { error: 'School not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Create enquiry
    const now = new Date().toISOString();
    const newEnquiry = await db.insert(enquiries)
      .values({
        studentId: user.userId,
        schoolId: parsedSchoolId,
        studentName: studentName.trim(),
        studentEmail: trimmedEmail,
        studentPhone: studentPhone.trim(),
        studentClass: studentClass.trim(),
        message: message ? message.trim() : null,
        status: 'New',
        notes: null,
        followUpDate: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(
      {
        enquiry: newEnquiry[0],
        message: 'Enquiry submitted successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST enquiries error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { user, error } = verifyToken(request);
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    // Authorization check - only students can view their enquiries
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can submit enquiries', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build query conditions
    const conditions = [eq(enquiries.studentId, user.userId)];
    
    if (status) {
      conditions.push(eq(enquiries.status, status));
    }

    // Fetch enquiries for the authenticated student
    const studentEnquiries = await db.select()
      .from(enquiries)
      .where(and(...conditions))
      .orderBy(desc(enquiries.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch school details for each enquiry
    const enquiriesWithSchools = await Promise.all(
      studentEnquiries.map(async (enquiry) => {
        const schoolDetails = await db.select({
          name: schools.name,
          city: schools.city,
          contactEmail: schools.contactEmail,
          contactPhone: schools.contactPhone,
        })
        .from(schools)
        .where(eq(schools.id, enquiry.schoolId))
        .limit(1);

        return {
          ...enquiry,
          school: schoolDetails[0] || null,
        };
      })
    );

    return NextResponse.json(enquiriesWithSchools, { status: 200 });

  } catch (error) {
    console.error('GET enquiries error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}