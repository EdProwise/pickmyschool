import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';

interface AdminJWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyAdminToken(request: NextRequest): { isValid: boolean; payload?: AdminJWTPayload; error?: string; code?: string } {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false, error: 'No token provided', code: 'NO_TOKEN' };
    }
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as AdminJWTPayload;
    if (decoded.role !== 'super_admin') {
      return { isValid: false, error: 'Access forbidden: Super admin only', code: 'FORBIDDEN' };
    }
    return { isValid: true, payload: decoded };
  } catch {
    return { isValid: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ error: authResult.error, code: authResult.code }, { status });
    }

    await connectToDatabase();

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

    const redirectUrl = user.role === 'school' ? '/dashboard/school/basic-info' : '/dashboard/student';

    return NextResponse.json({ token, role: user.role, redirectUrl, name: user.name });
  } catch (error) {
    console.error('POST /api/admin/users/impersonate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
