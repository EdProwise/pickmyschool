import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { enquiries, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const VALID_STATUSES = ['New', 'In Progress', 'Converted', 'Closed'];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and validate enquiry ID
    const id = parseInt(params.id);
    if (!id || isNaN(id)) {
      return NextResponse.json(
        {
          error: 'Enquiry ID is required',
          code: 'MISSING_ID',
        },
        { status: 400 }
      );
    }

    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: 'No authorization token provided',
          code: 'NO_TOKEN',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    // Verify user role is "school"
    if (decoded.role !== 'school') {
      return NextResponse.json(
        {
          error: 'Only school admins can update enquiries',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Get user's schoolId
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userRecord.length === 0 || !userRecord[0].schoolId) {
      return NextResponse.json(
        {
          error: 'School admin account not found or not associated with a school',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const userSchoolId = userRecord[0].schoolId;

    // Get enquiry record
    const enquiryRecord = await db
      .select()
      .from(enquiries)
      .where(eq(enquiries.id, id))
      .limit(1);

    if (enquiryRecord.length === 0) {
      return NextResponse.json(
        {
          error: 'Enquiry not found',
          code: 'ENQUIRY_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Verify enquiry belongs to user's school
    if (enquiryRecord[0].schoolId !== userSchoolId) {
      return NextResponse.json(
        {
          error: 'Not authorized to update this enquiry',
          code: 'NOT_AUTHORIZED',
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { status, notes, followUpDate } = body;

    // Validate status if provided
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            error: 'Invalid status value. Must be: New, In Progress, Converted, or Closed',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    // Validate followUpDate if provided
    if (followUpDate !== undefined && followUpDate !== null) {
      const date = new Date(followUpDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          {
            error: 'Invalid date format for followUpDate',
            code: 'INVALID_DATE',
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (followUpDate !== undefined) {
      updateData.followUpDate = followUpDate;
    }

    // Update enquiry
    const updated = await db
      .update(enquiries)
      .set(updateData)
      .where(eq(enquiries.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update enquiry',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        enquiry: updated[0],
        message: 'Enquiry updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT enquiry error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}