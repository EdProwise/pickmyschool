import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Sanitize email input
    const sanitizedEmail = email.trim().toLowerCase();

    // Query user by email
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    // Check if user exists
    if (userRecords.length === 0) {
      console.log('Login attempt failed: User not found for email:', sanitizedEmail);
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const user = userRecords[0];

    // Verify password
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

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Log successful authentication
    console.log('Login successful for user:', sanitizedEmail, 'Role:', user.role);

    // Return success response
    return NextResponse.json(
      {
        user: userWithoutPassword,
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