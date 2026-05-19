import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School, User, Freelancer, FreelancerLead } from '@/lib/models';
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

export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectToDatabase();

    const [totalSchools, totalStudents, totalFreelancers, stateAgg, freelancerList, convertedLeads] = await Promise.all([
      School.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Freelancer.countDocuments(),
      // Group schools by state
      School.aggregate([
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      // All freelancers with basic info
      Freelancer.find().select('name totalLeads totalEarnings').lean(),
      // Converted leads grouped by freelancerId
      FreelancerLead.aggregate([
        { $match: { status: 'converted' } },
        { $group: { _id: '$freelancerId', converted: { $sum: 1 } } },
      ]),
    ]);

    // Build conversion map
    const conversionMap: Record<string, number> = {};
    for (const c of convertedLeads) {
      conversionMap[c._id.toString()] = c.converted;
    }

    // Build top 10 freelancers by conversion %
    const freelancerStats = (freelancerList as any[])
      .map(f => {
        const total = f.totalLeads || 0;
        const converted = conversionMap[f._id.toString()] || 0;
        const conversionPct = total > 0 ? Math.round((converted / total) * 100) : 0;
        return { name: f.name, total, converted, conversionPct };
      })
      .filter(f => f.total > 0)
      .sort((a, b) => b.conversionPct - a.conversionPct || b.converted - a.converted)
      .slice(0, 10);

    // State stats — filter out null/empty
    const stateStats = (stateAgg as any[])
      .filter(s => s._id)
      .map(s => ({ state: s._id, count: s.count }));

    return NextResponse.json({
      totalSchools,
      totalStudents,
      totalFreelancers,
      stateStats,
      topFreelancers: freelancerStats,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
