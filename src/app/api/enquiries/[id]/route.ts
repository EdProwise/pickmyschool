import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Enquiry, User, Notification, School } from '@/lib/models';
import jwt from 'jsonwebtoken';

const VALID_STATUSES = ['New', 'In Progress', 'Converted', 'Lost'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id: paramId } = await params;

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

    if (decoded.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school admins can update enquiries', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const userRecord = await User.findById(decoded.userId);

    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json(
        { error: 'School admin account not found or not associated with a school', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userSchoolId = userRecord.schoolId;

    // Get the numeric school ID from the school record
    const school = await School.findById(userSchoolId);
    if (!school) {
      return NextResponse.json(
        { error: 'Associated school not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }
    const numericSchoolId = school.id;

    const enquiryRecord = await Enquiry.findById(paramId);

    if (!enquiryRecord) {
      return NextResponse.json(
        { error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (Number(enquiryRecord.schoolId) !== Number(numericSchoolId)) {
      return NextResponse.json(
        { error: 'Not authorized to update this enquiry', code: 'NOT_AUTHORIZED' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, notes, followUpDate, studentAddress, studentState, studentAge, studentGender } = body;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value. Must be: New, In Progress, Converted, or Lost', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
    }

    if (followUpDate !== undefined && followUpDate !== null) {
      const date = new Date(followUpDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format for followUpDate', code: 'INVALID_DATE' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      let notesHistory = [];
      try {
        notesHistory = JSON.parse(enquiryRecord.notes || '[]');
        if (!Array.isArray(notesHistory)) {
          notesHistory = enquiryRecord.notes ? [{ date: enquiryRecord.createdAt, text: enquiryRecord.notes }] : [];
        }
      } catch (e) {
        notesHistory = enquiryRecord.notes ? [{ date: enquiryRecord.createdAt, text: enquiryRecord.notes }] : [];
      }

      if (typeof notes === 'string' && notes.trim() !== '') {
        notesHistory.push({
          date: new Date().toISOString(),
          text: notes.trim(),
        });
        updateData.notes = JSON.stringify(notesHistory);
      } else if (Array.isArray(notes)) {
        updateData.notes = JSON.stringify(notes);
      }
    }

    if (followUpDate !== undefined) {
      updateData.followUpDate = followUpDate;
    }

    if (studentAddress !== undefined) {
      updateData.studentAddress = studentAddress;
    }

    if (studentState !== undefined) {
      updateData.studentState = studentState;
    }

    if (studentAge !== undefined) {
      updateData.studentAge = studentAge;
    }

    if (studentGender !== undefined) {
      updateData.studentGender = studentGender;
    }

    const updated = await Enquiry.findByIdAndUpdate(
      paramId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update enquiry', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    if (status !== undefined && enquiryRecord.status !== status) {
      try {
        const statusMessages: Record<string, string> = {
          'In Progress': 'Your enquiry is now being processed by the school.',
          'Converted': 'Great news! Your enquiry has been converted. The school will contact you soon.',
          'Lost': 'Your enquiry has been marked as lost.',
        };

        if (statusMessages[status] && enquiryRecord.studentId) {
          await Notification.create({
            recipientId: enquiryRecord.studentId,
            recipientType: 'student',
            title: 'Enquiry Status Updated',
            message: `Your enquiry status has been updated to "${status}". ${statusMessages[status]}`,
            type: 'enquiry_update',
            relatedId: paramId,
            isRead: false,
          });
        }
      } catch (notifError) {
        console.error('Failed to create notification for student:', notifError);
      }
    }

    return NextResponse.json(
      {
        enquiry: { ...updated.toObject(), id: updated._id },
        message: 'Enquiry updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT enquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
