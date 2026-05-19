import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { School, User, FreelancerLead, Freelancer, FreelancerNotification } from '@/lib/models';
import { sendFreelancerLeadStatusEmail } from '@/lib/email';

async function verifySchoolToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifySchoolToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    // Resolve school the same way the profile API does:
    // userId in the JWT is the User's MongoDB _id (ObjectId as string).
    // The User document holds schoolId as a ref to School._id.
    const userRecord = await User.findById(decoded.userId).select('schoolId').lean();

    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json({ error: 'No school associated with this account' }, { status: 403 });
    }

    // schoolId on User is a ref to School._id (ObjectId)
    const school = await School.findById(userRecord.schoolId).select('id name').lean();

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const schoolName = (school.name as string).trim();

    // Escape special regex chars in school name
    const escapedName = schoolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Find freelancer leads where schoolInterested contains this school's name (case-insensitive)
    const leads = await FreelancerLead.find({
      schoolInterested: { $regex: escapedName, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Gather freelancer details in bulk
    const freelancerIds = [
      ...new Set(leads.map((l: any) => l.freelancerId?.toString()).filter(Boolean)),
    ];
    const freelancers = await Freelancer.find({ _id: { $in: freelancerIds } })
      .select('name email phone')
      .lean();
    const freelancerMap: Record<string, { name: string; email: string; phone?: string }> = {};
    freelancers.forEach((f: any) => {
      freelancerMap[f._id.toString()] = { name: f.name, email: f.email, phone: f.phone };
    });

    const result = leads.map((lead: any) => ({
      _id: lead._id.toString(),
      parentName: lead.parentName,
      studentName: lead.studentName,
      phone: lead.phone,
      city: lead.city,
      studentCity: lead.studentCity,
      studentState: lead.studentState,
      grade: lead.grade,
      schoolInterested: lead.schoolInterested,
      schoolType: lead.schoolType,
      status: lead.status,
      earnings: lead.earnings,
      notes: lead.notes,
      createdAt: lead.createdAt,
      convertedAt: (lead as any).convertedAt ?? null,
      freelancer: freelancerMap[lead.freelancerId?.toString()] || null,
    }));

    return NextResponse.json({ leads: result, schoolName }, { status: 200 });
  } catch (error) {
    console.error('PMS leads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const VALID_STATUSES = ['new', 'contacted', 'converted', 'rejected'];

export async function PATCH(request: NextRequest) {
  try {
    const decoded = await verifySchoolToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    // Verify the school user has a valid school
    const userRecord = await User.findById(decoded.userId).select('schoolId').lean();
    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json({ error: 'No school associated with this account' }, { status: 403 });
    }

    const school = await School.findById(userRecord.schoolId).select('name').lean();
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const body = await request.json();
    const { leadId, status } = body;

    if (!leadId || !status) {
      return NextResponse.json({ error: 'leadId and status are required' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    // Verify this lead belongs to this school (schoolInterested contains school name)
    const schoolName = (school.name as string).trim();
    const escapedName = schoolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const lead = await FreelancerLead.findOne({
      _id: leadId,
      schoolInterested: { $regex: escapedName, $options: 'i' },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found or does not belong to your school' }, { status: 404 });
    }

    lead.status = status;
    if (status === 'converted' && !lead.convertedAt) {
      (lead as any).convertedAt = new Date();
    }
    await lead.save();

    // Send email + in-app notification for actionable status changes
    if (['contacted', 'converted', 'rejected'].includes(status)) {
      try {
        const freelancer = await Freelancer.findById(lead.freelancerId).select('name email').lean();
        if (freelancer) {
          await sendFreelancerLeadStatusEmail(
            (freelancer as any).email,
            (freelancer as any).name,
            lead.studentName,
            lead.parentName,
            status,
            schoolName,
          );
        }
      } catch (emailErr) {
        console.error('Failed to send lead status email:', emailErr);
      }

      // In-app notification
      try {
        const statusLabel = status === 'converted' ? 'Converted ✅' : status === 'contacted' ? 'Contacted 📞' : 'Rejected ❌';
        await FreelancerNotification.create({
          freelancerId: lead.freelancerId,
          type: 'lead_status',
          title: `Lead ${statusLabel}`,
          message: `${schoolName} updated ${lead.studentName}'s lead status to "${status}".`,
          metadata: { leadId: lead._id.toString(), status, schoolName, studentName: lead.studentName },
        });
      } catch (notifErr) {
        console.error('Failed to create lead notification:', notifErr);
      }
    }

    return NextResponse.json({ success: true, status: lead.status, convertedAt: (lead as any).convertedAt, message: 'Lead status updated' });
  } catch (error) {
    console.error('PATCH PMS lead error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
