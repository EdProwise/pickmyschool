import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Freelancer } from '@/lib/models';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      freelancerId: string;
      role: string;
    };

    if (decoded.role !== 'freelancer') {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    await connectToDatabase();
    const freelancer = await Freelancer.findById(decoded.freelancerId).select('-password');
    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ freelancer: { ...freelancer.toObject(), id: freelancer._id } });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      freelancerId: string;
      role: string;
    };

    if (decoded.role !== 'freelancer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, phone, city, bankDetails } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (city) updateData.city = city.trim();
    if (bankDetails) updateData.bankDetails = bankDetails;

    const freelancer = await Freelancer.findByIdAndUpdate(
      decoded.freelancerId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    return NextResponse.json({ freelancer: { ...freelancer!.toObject(), id: freelancer!._id }, message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
