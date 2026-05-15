import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SiteSettings } from '@/lib/models';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyAdminToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(
      authHeader.substring(7),
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;
    return decoded.role === 'super_admin' ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyAdminToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const settings = await SiteSettings.findOne().lean();

    return NextResponse.json({
      commissionSettings: settings?.commissionSettings ?? null,
    });
  } catch (error) {
    console.error('GET commission settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const decoded = verifyAdminToken(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const body = await request.json();
    const { pmsCommissionPercent, freelancerCommissionPercent, effectiveFrom } = body;

    const commissionSettings = {
      pmsCommissionPercent: pmsCommissionPercent !== undefined ? Number(pmsCommissionPercent) : undefined,
      freelancerCommissionPercent: freelancerCommissionPercent !== undefined ? Number(freelancerCommissionPercent) : undefined,
      effectiveFrom: effectiveFrom ?? '',
    };

    // Use native driver to avoid Mongoose strict mode caching issues
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not available');

    const existing = await SiteSettings.findOne();
    if (existing) {
      await db.collection('sitesettings').updateOne(
        { _id: existing._id },
        { $set: { commissionSettings } }
      );
    } else {
      await SiteSettings.create({ commissionSettings });
    }

    return NextResponse.json({
      success: true,
      message: 'Commission settings saved successfully',
      commissionSettings,
    });
  } catch (error) {
    console.error('PUT commission settings error:', error);
    return NextResponse.json(
      { error: 'Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
