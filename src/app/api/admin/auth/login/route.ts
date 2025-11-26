import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { superAdmin } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation: Check if email and password are provided
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Sanitize email: trim and lowercase
    const sanitizedEmail = email.trim().toLowerCase();

    // Database operation: Query super_admin table by email
    const adminResult = await db.select()
      .from(superAdmin)
      .where(eq(superAdmin.email, sanitizedEmail))
      .limit(1);

    // Check if super admin exists
    if (adminResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const admin = adminResult[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: 'super_admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Prepare response without password
    const { password: _, ...adminWithoutPassword } = admin;

    // Success response
    return NextResponse.json(
      {
        admin: adminWithoutPassword,
        token,
        message: 'Login successful'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}