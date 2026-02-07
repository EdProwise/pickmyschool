import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Enquiry, Notification, School } from '@/lib/models';
import { getSchool } from '@/lib/schoolsHelper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
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
    await connectToDatabase();
    
    const authHeader = request.headers.get('Authorization');
    let studentId: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        if (decoded.role === 'student') {
          studentId = decoded.userId;
        }
      } catch (error) {
        console.log('Invalid token, proceeding as guest');
      }
    }

    const body = await request.json();
    const { schoolId, studentName, studentEmail, studentPhone, studentClass, message } = body;

    if (!schoolId || !studentName || !studentEmail || !studentPhone || !studentClass) {
      return NextResponse.json(
        { 
          error: 'schoolId, studentName, studentEmail, studentPhone, and studentClass are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = studentEmail.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    const parsedSchoolId = parseInt(schoolId);
    if (isNaN(parsedSchoolId)) {
      return NextResponse.json(
        { error: 'Invalid schoolId', code: 'INVALID_SCHOOL_ID' },
        { status: 400 }
      );
    }

    const school = await getSchool(parsedSchoolId);

    if (!school) {
      return NextResponse.json(
        { error: 'School not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const newEnquiry = await Enquiry.create({
      studentId: studentId,
      schoolId: parsedSchoolId,
      studentName: studentName.trim(),
      studentEmail: trimmedEmail,
      studentPhone: studentPhone.trim(),
      studentClass: studentClass.trim(),
      message: message ? message.trim() : null,
      status: 'New',
    });

    if (school.userId) {
      try {
        await Notification.create({
          recipientId: school.userId,
          recipientType: 'school',
          title: 'New Enquiry Received',
          message: `New enquiry from ${studentName.trim()} for ${studentClass.trim()}. Contact: ${studentPhone.trim()}`,
          type: 'enquiry',
          relatedId: newEnquiry._id,
          isRead: false,
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    }

      // Forward to EdproWise Booster Webhook (use school's configured webhook or default)
      const webhookUrl = school.whatsappWebhookUrl || 'https://edprowisebooster.edprowise.com/api/webhooks/external-enquiry';
      const apiKey = school.whatsappApiKey || 'epb_1100ec6ae820e021c94b3ff55b42e727871bca4f403325e4';
      
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: apiKey,
            name: studentName.trim(),
            phone: studentPhone.trim(),
            email: trimmedEmail,
            message: message ? message.trim() : `Interested in admission for class ${studentClass.trim()}`,
            source: 'PickMySchool'
          })
        });
        console.log('Enquiry forwarded to EdproWise Booster:', webhookUrl, 'Response status:', webhookResponse.status);
      } catch (webhookError) {
        console.error('Failed to forward enquiry to EdproWise Booster:', webhookError);
      }

    return NextResponse.json(
      {
        enquiry: { ...newEnquiry.toObject(), id: newEnquiry._id },
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
    const { user, error } = verifyToken(request);
    if (error) return error;
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can submit enquiries', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const query: any = { studentId: user.userId };
    if (status) {
      query.status = status;
    }

    const studentEnquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const enquiriesWithSchools = await Promise.all(
      studentEnquiries.map(async (enquiry) => {
        const school = await getSchool(enquiry.schoolId);

        return {
          ...enquiry,
          id: enquiry._id,
          school: school ? {
            name: school.name,
            city: school.city,
            contactEmail: school.contactEmail,
            contactPhone: school.contactPhone,
          } : null,
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
