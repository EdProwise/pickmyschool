import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer } from '@/lib/models';
import { sendFreelancerVerificationEmail, generateVerificationToken } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const freelancer = await Freelancer.findOne({ email: email.trim().toLowerCase() });

    if (!freelancer) {
      // Return success to prevent email enumeration
      return NextResponse.json({ message: 'If that email is registered, a verification link has been sent.' });
    }

    if (freelancer.emailVerified) {
      return NextResponse.json({ error: 'This email is already verified. Please log in.', code: 'ALREADY_VERIFIED' }, { status: 400 });
    }

    // Generate a new token and expiry
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    freelancer.emailVerificationToken = verificationToken;
    freelancer.emailVerificationExpiry = verificationExpiry;
    await freelancer.save();

    await sendFreelancerVerificationEmail(freelancer.email, verificationToken, freelancer.name);

    return NextResponse.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Failed to resend verification email. Please try again.' }, { status: 500 });
  }
}
