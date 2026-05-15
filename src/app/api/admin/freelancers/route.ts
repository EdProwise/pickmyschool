import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer, FreelancerLead, FreelancerEarning, School, SiteSettings } from '@/lib/models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

interface JWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyAdminToken(request: NextRequest): { isValid: boolean; payload?: JWTPayload; error?: string; code?: string } {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false, error: 'No token provided', code: 'NO_TOKEN' };
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    if (decoded.role !== 'super_admin') {
      return { isValid: false, error: 'Access forbidden: Super admin only', code: 'FORBIDDEN' };
    }
    return { isValid: true, payload: decoded };
  } catch {
    return { isValid: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' };
  }
}

function generateReferralCode(name: string): string {
  const prefix = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
}

// GET - list all freelancers
export async function GET(request: NextRequest) {
  const authResult = verifyAdminToken(request);
  if (!authResult.isValid) {
    return NextResponse.json({ error: authResult.error, code: authResult.code }, { status: authResult.code === 'FORBIDDEN' ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const freelancers = await Freelancer.find().select('-password').sort({ createdAt: -1 }).lean();

    // Aggregate lead counts per freelancer per status
    const leadCounts = await FreelancerLead.aggregate([
      { $group: { _id: { freelancerId: '$freelancerId', status: '$status' }, count: { $sum: 1 } } },
    ]);

    // Build a map: freelancerId -> { new, contacted, converted, rejected }
    const leadMap: Record<string, { new: number; contacted: number; converted: number; rejected: number }> = {};
    for (const row of leadCounts) {
      const id = row._id.freelancerId?.toString();
      if (!id) continue;
      if (!leadMap[id]) leadMap[id] = { new: 0, contacted: 0, converted: 0, rejected: 0 };
      const s = row._id.status as keyof typeof leadMap[string];
      if (s in leadMap[id]) leadMap[id][s] = row.count;
    }

    // Aggregate paid amounts per freelancer from FreelancerEarning
    const paidAgg = await FreelancerEarning.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$freelancerId', totalPaid: { $sum: '$amount' } } },
    ]);
    const paidMap: Record<string, number> = {};
    for (const row of paidAgg) {
      paidMap[row._id.toString()] = row.totalPaid;
    }

    // Compute totalEarnings per freelancer from converted leads + school commissions
    const settings = await SiteSettings.findOne().select('commissionSettings').lean();
    const freelancerCommPct: number = (settings as any)?.commissionSettings?.freelancerCommissionPercent ?? 0;

    const convertedLeads = await FreelancerLead.find({ status: 'converted' }).lean();
    const schoolNames = [...new Set(
      convertedLeads.map((l: any) => l.schoolInterested as string).filter(Boolean)
    )];

    const schoolDocs = schoolNames.length > 0
      ? await School.find({
          name: { $in: schoolNames.map(n => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) },
        }).select('name daySchoolCommission hostelSchoolCommission').lean()
      : [];

    const schoolMap: Record<string, any> = {};
    for (const s of schoolDocs as any[]) {
      schoolMap[(s as any).name.toLowerCase().trim()] = s;
    }

    const earningsMap: Record<string, number> = {};
    if (freelancerCommPct > 0) {
      for (const lead of convertedLeads as any[]) {
        if (!lead.schoolInterested) continue;
        const schoolDoc = schoolMap[lead.schoolInterested.toLowerCase().trim()];
        if (!schoolDoc) continue;
        const isHostel = lead.schoolType?.toLowerCase().includes('hostel') ||
          lead.schoolType?.toLowerCase().includes('residential') ||
          lead.schoolType?.toLowerCase().includes('boarding');
        const commAmt = isHostel
          ? schoolDoc.hostelSchoolCommission?.amount ?? null
          : schoolDoc.daySchoolCommission?.amount ?? null;
        if (commAmt == null) continue;
        const earned = Math.round(commAmt * (freelancerCommPct / 100));
        const fid = lead.freelancerId?.toString();
        if (fid) earningsMap[fid] = (earningsMap[fid] ?? 0) + earned;
      }
    }

    const enriched = freelancers.map((f: any) => {
      const id = f._id.toString();
      const counts = leadMap[id] || { new: 0, contacted: 0, converted: 0, rejected: 0 };
      const totalPaid = paidMap[id] ?? 0;
      const totalEarnings = earningsMap[id] ?? 0;
      return { ...f, leadCounts: counts, totalPaid, totalEarnings };
    });

    const totalActive = enriched.filter((f: any) => f.status === 'active').length;
    const totalLeads = enriched.reduce((sum: number, f: any) => sum + (f.totalLeads || 0), 0);
    const totalEarnings = enriched.reduce((sum: number, f: any) => sum + (f.totalEarnings || 0), 0);

    return NextResponse.json({
      freelancers: enriched,
      stats: { total: enriched.length, totalActive, totalLeads, totalEarnings },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - add a new freelancer
export async function POST(request: NextRequest) {
  const authResult = verifyAdminToken(request);
  if (!authResult.isValid) {
    return NextResponse.json({ error: authResult.error, code: authResult.code }, { status: authResult.code === 'FORBIDDEN' ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, password, phone, city } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await Freelancer.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let referralCode = generateReferralCode(name);
    let attempts = 0;
    while (await Freelancer.findOne({ referralCode }) && attempts < 10) {
      referralCode = generateReferralCode(name);
      attempts++;
    }

    const freelancer = new Freelancer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone?.trim(),
      city: city?.trim(),
      referralCode,
      status: 'active',
      totalLeads: 0,
      totalEarnings: 0,
    });

    await freelancer.save();
    const { password: _, ...data } = freelancer.toObject();
    return NextResponse.json({ freelancer: { ...data, id: freelancer._id }, message: 'Freelancer created' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - update status (active/inactive)
export async function PATCH(request: NextRequest) {
  const authResult = verifyAdminToken(request);
  if (!authResult.isValid) {
    return NextResponse.json({ error: authResult.error, code: authResult.code }, { status: authResult.code === 'FORBIDDEN' ? 403 : 401 });
  }

  try {
    await connectToDatabase();
    const { freelancerId, status } = await request.json();

    if (!freelancerId || !status) {
      return NextResponse.json({ error: 'freelancerId and status required' }, { status: 400 });
    }

    const freelancer = await Freelancer.findByIdAndUpdate(
      freelancerId,
      { $set: { status } },
      { new: true }
    ).select('-password');

    if (!freelancer) return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 });

    return NextResponse.json({ freelancer, message: 'Status updated' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
