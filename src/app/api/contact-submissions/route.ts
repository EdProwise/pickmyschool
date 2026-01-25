import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ContactSubmission, SuperAdmin, Notification } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { 
      schoolName, 
      contactPerson, 
      name,
      email, 
      phone, 
      city, 
      interestedCity,
      message,
      subject,
      interestedClass,
      currentClass
    } = body;

    const finalContactPerson = contactPerson || name;
    const finalCity = city || interestedCity;
    const finalInterestedClass = interestedClass || currentClass;
    const finalSchoolName = schoolName || (subject === 'Expert Consultation Request' ? 'Expert Consultation' : null);

    if (!finalContactPerson || !email || !phone || !finalCity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const submission = await ContactSubmission.create({
      schoolName: finalSchoolName,
      contactPerson: finalContactPerson,
      email,
      phone,
      city: finalCity,
      message: message || null,
      subject: subject || (schoolName ? 'School Partnership Enquiry' : 'General Enquiry'),
      interestedClass: finalInterestedClass || null,
      status: 'new',
    });

    const allAdmins = await SuperAdmin.find();
    
    for (const admin of allAdmins) {
      await Notification.create({
        recipientId: admin._id,
        recipientType: 'super_admin',
        title: 'New Contact Submission',
        message: `New ${submission.subject} from ${finalContactPerson} in ${finalCity}`,
        type: 'contact_submission',
        relatedId: submission._id,
        isRead: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Submission received successfully',
      data: { ...submission.toObject(), id: submission._id },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating contact submission:', error);
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const submissions = await ContactSubmission.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: submissions.map(s => ({ ...s, id: s._id })),
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
