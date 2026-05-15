import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = verifyToken(request);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const schoolId = parseInt(id);

    if (isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const body = await request.json();
    const { daySchoolCommission, hostelSchoolCommission } = body;

    const updateFields: Record<string, unknown> = {};

    if (daySchoolCommission !== undefined && daySchoolCommission !== null) {
      updateFields.daySchoolCommission = {
        amount: Number(daySchoolCommission.amount) || 0,
        effectiveFrom: daySchoolCommission.effectiveFrom ?? '',
      };
    }

    if (hostelSchoolCommission !== undefined && hostelSchoolCommission !== null) {
      updateFields.hostelSchoolCommission = {
        amount: Number(hostelSchoolCommission.amount) || 0,
        effectiveFrom: hostelSchoolCommission.effectiveFrom ?? '',
      };
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No commission data provided' }, { status: 400 });
    }

    // Use native MongoDB driver to bypass Mongoose strict mode caching issues
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not available');

    const result = await db.collection('schools').updateOne(
      { id: schoolId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Commission updated successfully',
      daySchoolCommission: updateFields.daySchoolCommission ?? null,
      hostelSchoolCommission: updateFields.hostelSchoolCommission ?? null,
    });
  } catch (error) {
    console.error('Update commission error:', error);
    return NextResponse.json(
      { error: 'Failed to update commission: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
