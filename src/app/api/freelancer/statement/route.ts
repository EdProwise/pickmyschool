import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { FreelancerEarning, FreelancerLead, School, SiteSettings } from '@/lib/models';
import jwt from 'jsonwebtoken';

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

    // 1. All converted leads sorted ascending by date
    const leads = await FreelancerLead.find({
      freelancerId: decoded.freelancerId,
      status: 'converted',
    }).sort({ convertedAt: 1, createdAt: 1 }).lean();

    // 2. Compute per-lead earnings using the same logic as /api/freelancer/leads
    const settings = await SiteSettings.findOne().select('commissionSettings').lean();
    const freelancerCommPct: number =
      (settings as any)?.commissionSettings?.freelancerCommissionPercent ?? 0;

    const schoolNames = [
      ...new Set(
        (leads as any[]).filter(l => l.schoolInterested).map(l => l.schoolInterested as string)
      ),
    ];

    const schoolDocs =
      schoolNames.length > 0
        ? await School.find({
            name: {
              $in: schoolNames.map(
                n => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
              ),
            },
          })
            .select('name daySchoolCommission hostelSchoolCommission')
            .lean()
        : [];

    const schoolMap: Record<string, any> = {};
    for (const s of schoolDocs as any[]) {
      schoolMap[s.name.toLowerCase().trim()] = s;
    }

    // 3. Group converted leads by date
    const convMap: Record<
      string,
      { dateKey: string; date: string; students: number; schoolNames: string[]; earned: number }
    > = {};

    for (const lead of leads as any[]) {
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      const dateKey = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      if (!convMap[dateKey]) {
        convMap[dateKey] = { dateKey, date: display, students: 0, schoolNames: [], earned: 0 };
      }

      // Use computed earnings if possible, otherwise fall back to stored earnings
      let earning = lead.earnings ?? 0;
      if (lead.schoolInterested && freelancerCommPct > 0) {
        const schoolDoc = schoolMap[lead.schoolInterested.toLowerCase().trim()];
        if (schoolDoc) {
          const isHostel =
            lead.schoolType?.toLowerCase().includes('hostel') ||
            lead.schoolType?.toLowerCase().includes('residential') ||
            lead.schoolType?.toLowerCase().includes('boarding');
          const commAmt = isHostel
            ? schoolDoc.hostelSchoolCommission?.amount ?? null
            : schoolDoc.daySchoolCommission?.amount ?? null;
          if (commAmt != null) {
            earning = Math.round(commAmt * (freelancerCommPct / 100));
          }
        }
      }

      convMap[dateKey].students += 1;
      convMap[dateKey].earned += earning;
      if (
        lead.schoolInterested &&
        !convMap[dateKey].schoolNames.includes(lead.schoolInterested)
      ) {
        convMap[dateKey].schoolNames.push(lead.schoolInterested);
      }
    }

    const conversions = Object.values(convMap).sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey)
    );

    // 4. All paid earnings (manual adj + pay-now) sorted ascending by paidAt
    const earnings = await FreelancerEarning.find({
      freelancerId: decoded.freelancerId,
      status: 'paid',
    })
      .sort({ paidAt: 1, createdAt: 1 })
      .lean();

    const payments = (earnings as any[]).map(e => {
      const d = new Date(e.paidAt ?? e.createdAt);
      return {
        dateKey: d.toISOString().slice(0, 10),
        date: d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        amount: e.amount,
        description: e.description ?? 'Payment Received',
      };
    });

    return NextResponse.json({ conversions, payments });
  } catch (error) {
    console.error('Statement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
