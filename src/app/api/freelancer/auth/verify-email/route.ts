import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer } from '@/lib/models';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required', code: 'MISSING_TOKEN' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const freelancer = await Freelancer.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });

    if (!freelancer) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link. Please register again.', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    if (freelancer.emailVerified) {
      return NextResponse.json({ message: 'Email already verified. You can log in.', code: 'ALREADY_VERIFIED' });
    }

    freelancer.emailVerified = true;
    freelancer.emailVerificationToken = undefined;
    freelancer.emailVerificationExpiry = undefined;
    await freelancer.save();

    return NextResponse.json({ message: 'Email verified successfully! You can now log in.', code: 'VERIFIED' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
