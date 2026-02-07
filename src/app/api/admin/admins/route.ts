import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SuperAdmin } from '@/lib/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  adminId: string;
  role: string;
}

/**
 * Verify that the request has a valid super admin token
 */
function verifySuperAdminToken(request: NextRequest): { valid: boolean; adminId?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.role !== 'super_admin') {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true, adminId: decoded.adminId };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * GET - List all admins (only accessible by super admin with isSuperAdmin: true)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = verifySuperAdminToken(request);
    
    if (!authResult.valid) {
      return NextResponse.json({ 
        error: authResult.error || 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    await connectToDatabase();

    // Check if the requesting admin is the main super admin
    const requestingAdmin = await SuperAdmin.findById(authResult.adminId);
    if (!requestingAdmin || !requestingAdmin.isSuperAdmin) {
      return NextResponse.json({ 
        error: 'Only the main Super Admin can manage other admins',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const admins = await SuperAdmin.find({}).select('-password').sort({ createdAt: -1 });

    return NextResponse.json(admins, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new admin (only accessible by super admin with isSuperAdmin: true)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = verifySuperAdminToken(request);
    
    if (!authResult.valid) {
      return NextResponse.json({ 
        error: authResult.error || 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    await connectToDatabase();

    // Check if the requesting admin is the main super admin
    const requestingAdmin = await SuperAdmin.findById(authResult.adminId);
    if (!requestingAdmin || !requestingAdmin.isSuperAdmin) {
      return NextResponse.json({ 
        error: 'Only the main Super Admin can create new admins',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required (email, password, name)', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long', code: 'WEAK_PASSWORD' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const existingAdmin = await SuperAdmin.findOne({ email: sanitizedEmail });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin with this email already exists', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await SuperAdmin.create({
      email: sanitizedEmail,
      password: hashedPassword,
      name: name.trim(),
      isSuperAdmin: false, // Regular admins cannot be super admins
    });

    const { password: _, ...adminWithoutPassword } = newAdmin.toObject();

    return NextResponse.json(
      { admin: { ...adminWithoutPassword, id: newAdmin._id }, message: 'Admin created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
