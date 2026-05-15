import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { FreelancerLead, Freelancer, School, SiteSettings } from '@/lib/models';
import jwt from 'jsonwebtoken';

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.substring(7), process.env.JWT_SECRET || 'your-secret-key') as {
      adminId: string; role: string; email: string;
    };
    if (decoded.role !== 'super_admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: freelancerId } = await params;

  try {
    await connectToDatabase();

    const freelancer = await Freelancer.findById(freelancerId).select('-password').lean();
    if (!freelancer) return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 });

    const leads = await FreelancerLead.find({ freelancerId }).sort({ createdAt: -1 }).lean();

    // Fetch freelancer commission % from site settings
    const settings = await SiteSettings.findOne().select('commissionSettings').lean();
    const freelancerCommPct: number = (settings as any)?.commissionSettings?.freelancerCommissionPercent ?? 0;

    // Collect unique school names from converted leads
    const convertedLeads = leads.filter((l: any) => l.status === 'converted' && l.schoolInterested);
    const schoolNames = [...new Set(convertedLeads.map((l: any) => l.schoolInterested as string))];

    const schoolDocs = schoolNames.length > 0
      ? await School.find({
          name: { $in: schoolNames.map(n => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) },
        }).select('name daySchoolCommission hostelSchoolCommission').lean()
      : [];

    const schoolMap: Record<string, any> = {};
    for (const s of schoolDocs as any[]) {
      schoolMap[s.name.toLowerCase().trim()] = s;
    }

    const enrichedLeads = leads.map((lead: any) => {
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
      return { ...lead, _id: lead._id.toString(), computedEarnings };
    });

    return NextResponse.json({ freelancer, leads: enrichedLeads, freelancerCommPct });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
