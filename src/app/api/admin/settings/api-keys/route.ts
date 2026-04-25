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

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ error: authResult.error, code: authResult.code }, { status });
    }

    await connectToDatabase();
    const col = mongoose.connection.db!.collection('sitesettings');
    const settings = await col.findOne({});

    return NextResponse.json({
      geminiApiKey: (settings?.geminiApiKey as string) || '',
      gmailUser: (settings?.gmailUser as string) || '',
      gmailAppPassword: (settings?.gmailAppPassword as string) || '',
      googleMapsApiKey: (settings?.googleMapsApiKey as string) || '',
    });
  } catch (error) {
    console.error('GET api-keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    if (!authResult.isValid) {
      const status = authResult.code === 'FORBIDDEN' ? 403 : 401;
      return NextResponse.json({ error: authResult.error, code: authResult.code }, { status });
    }

    await connectToDatabase();
    const body = await request.json();
    const { geminiApiKey, gmailUser, gmailAppPassword, googleMapsApiKey } = body;

    const update: Record<string, string> = {};

    if (typeof geminiApiKey === 'string' && geminiApiKey.trim()) {
      update.geminiApiKey = geminiApiKey.trim();
    }
    if (typeof gmailUser === 'string' && gmailUser.trim()) {
      update.gmailUser = gmailUser.trim();
    }
    if (typeof gmailAppPassword === 'string' && gmailAppPassword.trim()) {
      update.gmailAppPassword = gmailAppPassword.trim();
    }
    if (typeof googleMapsApiKey === 'string' && googleMapsApiKey.trim()) {
      update.googleMapsApiKey = googleMapsApiKey.trim();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const col = mongoose.connection.db!.collection('sitesettings');
    await col.updateOne(
      {},
      { $set: update },
      { upsert: true }
    );

    invalidateSettingsCache();
    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('PUT api-keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
