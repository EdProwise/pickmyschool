import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyAdminToken(request: NextRequest): { isValid: boolean; payload?: JWTPayload; error?: string; code?: string } {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false, error: 'No token provided', code: 'NO_TOKEN' };
    }
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    if (decoded.role !== 'super_admin') {
      return { isValid: false, error: 'Access forbidden: Super admin only', code: 'FORBIDDEN' };
    }
    return { isValid: true, payload: decoded };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { isValid: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' };
    }
    return { isValid: false, error: 'Token verification failed', code: 'INVALID_TOKEN' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ error: authResult.error, code: authResult.code }, { status });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'student' | 'school' | null (all)
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '500');

    const query: Record<string, any> = {};
    if (role && (role === 'student' || role === 'school')) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('name role email phone city emailVerified isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalSchools = await User.countDocuments({ role: 'school' });
    const totalVerified = await User.countDocuments({ emailVerified: true });
    const totalActive = await User.countDocuments({ isActive: { $ne: false } });

    return NextResponse.json({
      users,
      stats: { total, totalStudents, totalSchools, totalVerified, totalActive },
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: update a user's role, emailVerified, or isActive
export async function PATCH(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ error: authResult.error, code: authResult.code }, { status });
    }

    await connectToDatabase();
    const body = await request.json();
    const { userId, role, emailVerified, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const update: Record<string, any> = {};
    if (role !== undefined && (role === 'student' || role === 'school')) {
      update.role = role;
    }
    if (emailVerified !== undefined) {
      update.emailVerified = Boolean(emailVerified);
    }
    if (isActive !== undefined) {
      update.isActive = Boolean(isActive);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(userId, update, { new: true })
      .select('name role email phone city emailVerified isActive')
      .lean();

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('PATCH /api/admin/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
