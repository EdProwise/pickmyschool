import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { FreelancerLead, Freelancer, School, SiteSettings } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { sendSchoolLeadNotificationEmail } from '@/lib/email';

function getFreelancerFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      freelancerId: string;
      role: string;
    };
    if (decoded.role !== 'freelancer') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const decoded = getFreelancerFromToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const leads = await FreelancerLead.find({ freelancerId: decoded.freelancerId }).sort({ createdAt: -1 }).lean();

    // Fetch freelancer commission % from site settings
    const settings = await SiteSettings.findOne().select('commissionSettings').lean();
    const freelancerCommPct: number = (settings as any)?.commissionSettings?.freelancerCommissionPercent ?? 0;

    // For converted leads, look up each school's commission to compute earnings
    const convertedLeads = leads.filter((l: any) => l.status === 'converted' && l.schoolInterested);
    const schoolNames = [...new Set(convertedLeads.map((l: any) => l.schoolInterested as string))];

    // Fetch matching schools
    const schoolDocs = schoolNames.length > 0
      ? await School.find({
          name: { $in: schoolNames.map(n => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) },
        }).select('name daySchoolCommission hostelSchoolCommission').lean()
      : [];

    // Build a map by lowercase name for quick lookup
    const schoolMap: Record<string, any> = {};
    for (const s of schoolDocs as any[]) {
      schoolMap[s.name.toLowerCase().trim()] = s;
    }

    const result = leads.map((lead: any) => {
      let computedEarnings: number | null = null;
      if (lead.status === 'converted' && lead.schoolInterested && freelancerCommPct > 0) {
        const schoolDoc = schoolMap[lead.schoolInterested.toLowerCase().trim()];
        if (schoolDoc) {
          const isHostel = lead.schoolType?.toLowerCase().includes('hostel') ||
            lead.schoolType?.toLowerCase().includes('residential') ||
            lead.schoolType?.toLowerCase().includes('boarding');
          const commAmt = isHostel
            ? schoolDoc.hostelSchoolCommission?.amount ?? null
            : schoolDoc.daySchoolCommission?.amount ?? null;
          if (commAmt != null) {
            computedEarnings = Math.round(commAmt * (freelancerCommPct / 100));
          }
        }
      }
      return { ...lead, _id: lead._id.toString(), computedEarnings, convertedAt: (lead as any).convertedAt ?? null };
    });

    return NextResponse.json({ leads: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const decoded = getFreelancerFromToken(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();
    const body = await request.json();
    const { parentName, studentName, phone, email, city, grade, schoolInterested, notes, studentCity, studentState, schoolType } = body;

    if (!parentName || !studentName || !phone || !grade) {
      return NextResponse.json(
        { error: 'Parent name, student name, phone and grade are required' },
        { status: 400 }
      );
    }

    const lead = new FreelancerLead({
      freelancerId: decoded.freelancerId,
      parentName: parentName.trim(),
      studentName: studentName.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      city: city?.trim() || '',
      grade: grade.trim(),
      schoolInterested: schoolInterested?.trim(),
      notes: notes?.trim(),
      studentCity: studentCity?.trim(),
      studentState: studentState?.trim(),
      schoolType: schoolType?.trim(),
      status: 'new',
      earnings: 0,
    });

    await lead.save();

    // Increment total leads count
    await Freelancer.findByIdAndUpdate(decoded.freelancerId, { $inc: { totalLeads: 1 } });

    // Notify the school if schoolInterested is provided
    if (schoolInterested?.trim()) {
      try {
        const escapedName = schoolInterested.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const targetSchool = await School.findOne({
          name: { $regex: `^${escapedName}$`, $options: 'i' },
        }).select('name email contactEmail').lean();

        if (targetSchool) {
          const schoolEmail = (targetSchool as any).contactEmail || (targetSchool as any).email;
          if (schoolEmail) {
            const freelancerDoc = await Freelancer.findById(decoded.freelancerId).select('name').lean();
            await sendSchoolLeadNotificationEmail(
              schoolEmail,
              (targetSchool as any).name,
              parentName.trim(),
              studentName.trim(),
              phone.trim(),
              grade.trim(),
              'PMS Lead',
              {
                city: city?.trim(),
                schoolType: schoolType?.trim(),
                freelancerName: (freelancerDoc as any)?.name,
              },
            );
          }
        }
      } catch (emailErr) {
        console.error('Failed to send school PMS lead notification:', emailErr);
      }
    }

    return NextResponse.json({ lead, message: 'Lead submitted successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
