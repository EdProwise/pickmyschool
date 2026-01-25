import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { EnquiryFormSettings, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function getAuthSchoolId(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7);
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'school') return null;

    const userRecord = await User.findById(decoded.userId);
    if (!userRecord) return null;

    return userRecord.schoolId;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const schoolId = await getAuthSchoolId(request);
    if (!schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await EnquiryFormSettings.findOne({ schoolId }).lean();

    if (!settings) {
      // Return default settings
      const defaultFields = [
        { id: 'name', label: 'Student Name', type: 'text', required: true, enabled: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true, enabled: true },
        { id: 'phone', label: 'Phone Number', type: 'tel', required: true, enabled: true },
        { id: 'class', label: 'Applying for Class', type: 'text', required: true, enabled: true },
        { id: 'message', label: 'Message/Questions', type: 'textarea', required: false, enabled: true },
      ];

      return NextResponse.json({
        title: 'Admission Enquiry',
        description: 'Please fill out the form below to enquire about admissions.',
        fields: defaultFields,
        successMessage: 'Thank you for your enquiry! We will get back to you soon.',
        buttonText: 'Submit Enquiry',
        themeColor: '#04d3d3',
        isActive: true,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET enquiry-settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const schoolId = await getAuthSchoolId(request);
    if (!schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, fields, successMessage, buttonText, themeColor, isActive } = body;

    const updated = await EnquiryFormSettings.findOneAndUpdate(
      { schoolId },
      {
        $set: {
          title: title || 'Admission Enquiry',
          description,
          fields,
          successMessage,
          buttonText,
          themeColor,
          isActive: isActive !== undefined ? isActive : true,
        }
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ message: 'Settings updated successfully', data: updated });
  } catch (error) {
    console.error('POST enquiry-settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
