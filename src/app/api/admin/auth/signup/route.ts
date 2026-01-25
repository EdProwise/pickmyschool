import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SuperAdmin } from '@/lib/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          error: 'All fields are required (email, password, name)',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const existingAdmin = await SuperAdmin.findOne({ email: sanitizedEmail });

    if (existingAdmin) {
      return NextResponse.json(
        { 
          error: 'An admin with this email already exists',
          code: 'EMAIL_EXISTS'
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await SuperAdmin.create({
      email: sanitizedEmail,
      password: hashedPassword,
      name: name.trim(),
    });

    const token = jwt.sign(
      {
        adminId: newAdmin._id,
        email: newAdmin.email,
        role: 'super_admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const { password: _, ...adminWithoutPassword } = newAdmin.toObject();

    return NextResponse.json(
      {
        admin: { ...adminWithoutPassword, id: newAdmin._id },
        token,
        message: 'Admin account created successfully'
      },
      { status: 201 }
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
