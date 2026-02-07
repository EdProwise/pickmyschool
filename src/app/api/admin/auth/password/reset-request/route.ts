import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SuperAdmin, AdminPasswordResetToken } from '@/lib/models';
import { sendAdminPasswordResetEmail, generateVerificationToken } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const admin = await SuperAdmin.findOne({ email: email.toLowerCase() });

    // Always return success message to prevent email enumeration
    if (!admin) {
      return NextResponse.json({ message: 'If an admin account exists with this email, a reset link has been sent.' });
    }

    // Delete any existing reset tokens for this admin
    await AdminPasswordResetToken.deleteMany({ adminId: admin._id });

    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await AdminPasswordResetToken.create({
      adminId: admin._id,
      token,
      expiresAt,
    });

    await sendAdminPasswordResetEmail(admin.email, token, admin.name);

    return NextResponse.json({ message: 'If an admin account exists with this email, a reset link has been sent.' });
  } catch (error) {
    console.error('Admin password reset request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
