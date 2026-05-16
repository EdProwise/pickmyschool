import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer } from '@/lib/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required', code: 'MISSING_CREDENTIALS' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const freelancer = await Freelancer.findOne({ email: sanitizedEmail, status: 'active' });

    if (!freelancer) {
      return NextResponse.json(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, freelancer.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Block login if email not verified (strict false check so existing users without the field can still login)
    if (freelancer.emailVerified === false) {
      return NextResponse.json(
        { error: 'Please verify your email address before logging in. Check your inbox for the verification link.', code: 'EMAIL_NOT_VERIFIED' },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      { freelancerId: freelancer._id, email: freelancer.email, role: 'freelancer' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const { password: _, ...freelancerData } = freelancer.toObject();

    return NextResponse.json(
      { freelancer: { ...freelancerData, id: freelancer._id }, token, message: 'Login successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Freelancer login error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
