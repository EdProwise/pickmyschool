import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer } from '@/lib/models';
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
    const freelancers = await Freelancer.find().select('-password').sort({ createdAt: -1 });
    const totalActive = freelancers.filter(f => f.status === 'active').length;
    const totalLeads = freelancers.reduce((sum, f) => sum + (f.totalLeads || 0), 0);
    const totalEarnings = freelancers.reduce((sum, f) => sum + (f.totalEarnings || 0), 0);

    return NextResponse.json({
      freelancers,
      stats: { total: freelancers.length, totalActive, totalLeads, totalEarnings },
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
