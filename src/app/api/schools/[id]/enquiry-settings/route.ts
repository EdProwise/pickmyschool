import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { EnquiryFormSettings } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const schoolId = parseInt(id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const settings = await EnquiryFormSettings.findOne({ schoolId }).lean();

    const defaultFields = [
      { id: 'name', label: 'Student Name', type: 'text', required: true, enabled: true },
      { id: 'email', label: 'Email Address', type: 'email', required: true, enabled: true },
      { id: 'phone', label: 'Phone Number', type: 'tel', required: true, enabled: true },
      { id: 'class', label: 'Applying for Class', type: 'text', required: true, enabled: true },
      { id: 'message', label: 'Message/Questions', type: 'textarea', required: false, enabled: true },
    ];

    if (!settings) {
      return NextResponse.json({
        schoolId,
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
    console.error('GET public enquiry-settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
