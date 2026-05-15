import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School, FreelancerLead, Freelancer } from '@/lib/models';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = verifyToken(request);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const schoolId = parseInt(id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const school = await School.findOne({ id: schoolId })
      .select('id name daySchoolCommission hostelSchoolCommission')
      .lean();

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const schoolName = ((school as any).name as string).trim();
    const escapedName = schoolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const leads = await FreelancerLead.find({
      schoolInterested: { $regex: escapedName, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Gather freelancer details
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
    });
  } catch (error) {
    console.error('Admin school earning error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
