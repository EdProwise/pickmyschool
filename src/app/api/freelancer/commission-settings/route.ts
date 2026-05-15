import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SiteSettings } from '@/lib/models';
import jwt from 'jsonwebtoken';

function verifyFreelancerToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  try {
    const decoded = jwt.verify(
      authHeader.split(' ')[1],
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { role: string };
    return decoded.role === 'freelancer';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!verifyFreelancerToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne().lean();
    return NextResponse.json({
      commissionSettings: settings?.commissionSettings ?? null,
    });
  } catch (error) {
    console.error('GET freelancer commission-settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
