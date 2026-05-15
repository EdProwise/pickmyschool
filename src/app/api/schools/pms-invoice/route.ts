import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { School, User, FreelancerLead, Freelancer } from '@/lib/models';

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

    const userRecord = await User.findById(decoded.userId).select('schoolId').lean();
    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json({ error: 'No school associated with this account' }, { status: 403 });
    }

    const school = await School.findById(userRecord.schoolId)
      .select('id name daySchoolCommission hostelSchoolCommission')
      .lean();

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const schoolName = (school.name as string).trim();
    const escapedName = schoolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Fetch all leads for this school
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
      grade: lead.grade,
      schoolInterested: lead.schoolInterested,
      schoolType: lead.schoolType,
      status: lead.status,
      createdAt: lead.createdAt,
      convertedAt: lead.convertedAt ?? null,
      freelancer: freelancerMap[lead.freelancerId?.toString()] || null,
    }));

    return NextResponse.json({
      leads: result,
      schoolName,
      daySchoolCommission: (school as any).daySchoolCommission ?? null,
      hostelSchoolCommission: (school as any).hostelSchoolCommission ?? null,
    }, { status: 200 });
  } catch (error) {
    console.error('PMS invoice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
