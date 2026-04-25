import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { invalidateSettingsCache } from '@/lib/site-settings';

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

// One-time seed: only sets fields that are not already present in the DB
export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ error: authResult.error, code: authResult.code }, { status });
    }

    const body = await request.json();
    const { geminiApiKey, gmailUser, gmailAppPassword, googleMapsApiKey } = body;

    await connectToDatabase();
    const col = mongoose.connection.db!.collection('sitesettings');
    const existing = await col.findOne({});

    const setOnInsert: Record<string, string> = {};
    // Only seed fields that are missing or empty
    if (!existing?.geminiApiKey && geminiApiKey) setOnInsert.geminiApiKey = geminiApiKey;
    if (!existing?.gmailUser && gmailUser) setOnInsert.gmailUser = gmailUser;
    if (!existing?.gmailAppPassword && gmailAppPassword) setOnInsert.gmailAppPassword = gmailAppPassword;
    if (!existing?.googleMapsApiKey && googleMapsApiKey) setOnInsert.googleMapsApiKey = googleMapsApiKey;

    if (Object.keys(setOnInsert).length > 0) {
      await col.updateOne({}, { $set: setOnInsert }, { upsert: true });
      invalidateSettingsCache();
    }

    return NextResponse.json({ message: 'Seed completed', seeded: Object.keys(setOnInsert) });
  } catch (error) {
    console.error('Seed credentials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
