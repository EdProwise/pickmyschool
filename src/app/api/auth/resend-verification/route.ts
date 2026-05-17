import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, EmailVerificationToken } from '@/lib/models';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      // Return success to prevent email enumeration
      return NextResponse.json({ message: 'If that email is registered, a verification link has been sent.' });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'This email is already verified. Please log in.', code: 'ALREADY_VERIFIED' },
        { status: 400 }
      );
    }

    // Delete any existing tokens for this user
    await EmailVerificationToken.deleteMany({ userId: user._id });

    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const tokenDoc = new EmailVerificationToken({
      userId: user._id,
      token: verificationToken,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    await tokenDoc.save();

    await sendVerificationEmail(user.email, verificationToken, user.name);

    return NextResponse.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email. Please try again.' },
      { status: 500 }
    );
  }
}
