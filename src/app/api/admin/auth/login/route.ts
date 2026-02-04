import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SuperAdmin } from '@/lib/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email, password } = body;

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

    const sanitizedEmail = email.trim().toLowerCase();

    // Debug: Check all admins in database
    const allAdmins = await SuperAdmin.find({});
    console.log('All super admins in database:', allAdmins.map(a => ({ email: a.email, name: a.name })));

    const admin = await SuperAdmin.findOne({ email: sanitizedEmail });
    console.log('Looking for admin with email:', sanitizedEmail, 'Found:', admin ? 'Yes' : 'No');

    if (!admin) {
      // If no admin exists at all, create the default one
      if (allAdmins.length === 0) {
        console.log('No admins found, creating default admin...');
        const bcryptLib = await import('bcrypt');
        const hashedPassword = await bcryptLib.default.hash('SuperAdmin@123', 10);
        await SuperAdmin.create({
          email: 'edprowise@pickmyschool.com',
          password: hashedPassword,
          name: 'EdProwise Admin',
        });
        console.log('Default admin created. Please try logging in again.');
        return NextResponse.json(
          { 
            error: 'Admin account was just created. Please try logging in again with: edprowise@pickmyschool.com / SuperAdmin@123',
            code: 'ADMIN_CREATED'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

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

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: 'super_admin'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const { password: _, ...adminWithoutPassword } = admin.toObject();

    return NextResponse.json(
      {
        admin: { ...adminWithoutPassword, id: admin._id },
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
