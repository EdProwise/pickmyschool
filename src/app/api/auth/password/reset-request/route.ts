import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, PasswordResetToken } from '@/lib/models';
import { sendPasswordResetEmail, generateVerificationToken } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordResetToken.create({
      userId: user._id,
      token,
      expiresAt,
    });

    await sendPasswordResetEmail(user.email, token, user.name);

    return NextResponse.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
