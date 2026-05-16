import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer } from '@/lib/models';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendFreelancerVerificationEmail, generateVerificationToken } from '@/lib/email';

function generateReferralCode(name: string): string {
  const prefix = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, password, phone, city, referredBy } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const existing = await Freelancer.findOne({ email: sanitizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let referralCode = generateReferralCode(name);
    let attempts = 0;
    while (await Freelancer.findOne({ referralCode }) && attempts < 10) {
      referralCode = generateReferralCode(name);
      attempts++;
    }

    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const freelancer = new Freelancer({
      name: name.trim(),
      email: sanitizedEmail,
      password: hashedPassword,
      phone: phone?.trim(),
      city: city?.trim(),
      referralCode,
      referredBy: referredBy?.trim(),
      status: 'active',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
      totalLeads: 0,
      totalEarnings: 0,
    });

    await freelancer.save();

    // Send verification email (non-blocking on failure)
    try {
      await sendFreelancerVerificationEmail(sanitizedEmail, verificationToken, name.trim());
    } catch (emailError) {
      console.error('Failed to send verification email (account still created):', emailError);
    }

    return NextResponse.json(
      { message: 'Account created. Please check your email to verify your account before logging in.', code: 'VERIFY_EMAIL' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Freelancer register error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
