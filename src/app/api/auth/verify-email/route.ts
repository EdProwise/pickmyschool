import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, EmailVerificationToken } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required', code: 'MISSING_TOKEN' },
        { status: 400 }
      );
    }

    const verificationRecord = await EmailVerificationToken.findOne({
      token: token,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(verificationRecord.userId, {
      $set: { emailVerified: true }
    });

    await EmailVerificationToken.findByIdAndDelete(verificationRecord._id);

    return NextResponse.json(
      { message: 'Email verified successfully! You can now login.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required', code: 'MISSING_TOKEN' },
        { status: 400 }
      );
    }

    const verificationRecord = await EmailVerificationToken.findOne({
      token: token,
      expiresAt: { $gt: new Date() }
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(verificationRecord.userId, {
      $set: { emailVerified: true }
    });

    await EmailVerificationToken.findByIdAndDelete(verificationRecord._id);

    return NextResponse.json(
      { message: 'Email verified successfully! You can now login.', verified: true },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
