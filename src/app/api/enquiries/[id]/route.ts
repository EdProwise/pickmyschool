import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Enquiry, User, Notification, School } from '@/lib/models';
import jwt from 'jsonwebtoken';

const VALID_STATUSES = ['New', 'In Progress', 'Converted', 'Lost'];

type NotesHistoryItem = {
  date: string;
  text: string;
};

function normalizeNotesDate(value: unknown, fallbackDate: Date | string) {
  if (typeof value === 'string' && value.trim()) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (fallbackDate instanceof Date) return fallbackDate.toISOString();
  if (typeof fallbackDate === 'string' && fallbackDate.trim()) return fallbackDate;
  return new Date().toISOString();
}

function normalizeNotesHistory(value: unknown, fallbackDate: Date | string): NotesHistoryItem[] {
  const toEntry = (candidate: unknown): NotesHistoryItem | null => {
    if (typeof candidate === 'string') {
      const text = candidate.trim();
      if (!text) return null;
      return { date: normalizeNotesDate(undefined, fallbackDate), text };
    }

    if (candidate && typeof candidate === 'object') {
      const rawText =
        typeof (candidate as any).text === 'string'
          ? (candidate as any).text
          : typeof (candidate as any).message === 'string'
            ? (candidate as any).message
            : '';
      const text = rawText.trim();
      if (!text) return null;
      const date = normalizeNotesDate((candidate as any).date ?? (candidate as any).createdAt, fallbackDate);
      return { date, text };
    }

    return null;
  };

  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(toEntry).filter((entry): entry is NotesHistoryItem => Boolean(entry));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(toEntry).filter((entry): entry is NotesHistoryItem => Boolean(entry));
      }
      const single = toEntry(parsed);
      return single ? [single] : [{ date: normalizeNotesDate(undefined, fallbackDate), text: trimmed }];
    } catch {
      return [{ date: normalizeNotesDate(undefined, fallbackDate), text: trimmed }];
    }
  }

  const single = toEntry(value);
  return single ? [single] : [];
}

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
    const { status, notes, message, followUpDate, studentAddress, studentState, studentAge, studentGender, tags, leadAssigned, studentName, studentEmail, studentPhone, studentClass } = body;

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
      const notesHistory = normalizeNotesHistory((enquiryRecord as any).notes, enquiryRecord.createdAt || new Date());

      if (typeof notes === 'string') {
        const trimmedNotes = notes.trim();
        if (trimmedNotes !== '') {
          notesHistory.push({
            date: new Date().toISOString(),
            text: trimmedNotes,
          });
          updateData.notes = JSON.stringify(notesHistory);
        }
      } else if (Array.isArray(notes) || (notes && typeof notes === 'object')) {
        updateData.notes = JSON.stringify(normalizeNotesHistory(notes, enquiryRecord.createdAt || new Date()));
      }
    }

    if (message !== undefined) {
      if (typeof message === 'string') {
        const trimmedMessage = message.trim();
        updateData.message = trimmedMessage === '' ? null : trimmedMessage;
      } else {
        updateData.message = null;
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

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : [];
    }

    if (leadAssigned !== undefined) {
      updateData.leadAssigned = leadAssigned;
    }

    if (studentName !== undefined) {
      const trimmed = typeof studentName === 'string' ? studentName.trim() : '';
      if (trimmed) updateData.studentName = trimmed;
    }

    if (studentEmail !== undefined) {
      const trimmed = typeof studentEmail === 'string' ? studentEmail.trim().toLowerCase() : '';
      updateData.studentEmail = trimmed || null;
    }

    if (studentPhone !== undefined) {
      const trimmed = typeof studentPhone === 'string' ? studentPhone.trim() : '';
      updateData.studentPhone = trimmed || null;
    }

    if (studentClass !== undefined) {
      updateData.studentClass = typeof studentClass === 'string' ? studentClass.trim() : '';
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

export async function DELETE(
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
        { error: 'Only school admins can delete enquiries', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const userRecord = await User.findById(decoded.userId).lean();
    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json(
        { error: 'School admin account not found or not associated with a school', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    let numericSchoolId: number | null = null;
    const school = await School.findById(userRecord.schoolId).lean();
    if (school?.id !== undefined && school?.id !== null) {
      numericSchoolId = Number(school.id);
    } else if (!Number.isNaN(Number(userRecord.schoolId))) {
      numericSchoolId = Number(userRecord.schoolId);
    }
    if (numericSchoolId === null || Number.isNaN(numericSchoolId)) {
      return NextResponse.json(
        { error: 'Associated school not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }

    let enquiryRecord = await Enquiry.findById(paramId);
    if (!enquiryRecord && !Number.isNaN(Number(paramId))) {
      enquiryRecord = await Enquiry.findOne({ id: Number(paramId) });
    }
    if (!enquiryRecord) {
      return NextResponse.json(
        { error: 'Enquiry not found', code: 'ENQUIRY_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (Number(enquiryRecord.schoolId) !== Number(numericSchoolId)) {
      return NextResponse.json(
        { error: 'Not authorized to delete this enquiry', code: 'NOT_AUTHORIZED' },
        { status: 403 }
      );
    }

    const deleteResult = await Enquiry.deleteOne({ _id: enquiryRecord._id });
    if (!deleteResult.deletedCount) {
      return NextResponse.json(
        { error: 'Failed to delete enquiry', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Enquiry deleted successfully', deletedId: String(enquiryRecord._id) },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE enquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
