import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      console.log('Login attempt failed: User not found for email:', sanitizedEmail);
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
      
    if (!isPasswordValid) {
      console.log('Login attempt failed: Invalid password for user:', sanitizedEmail);
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      schoolId: user.schoolId
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    console.log('Login successful for user:', sanitizedEmail, 'Role:', user.role);

    return NextResponse.json(
      {
        user: {
          ...userWithoutPassword,
          id: user._id.toString()
        },
        token,
        message: 'Login successful'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
