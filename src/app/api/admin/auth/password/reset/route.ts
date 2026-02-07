import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SuperAdmin, AdminPasswordResetToken } from '@/lib/models';
import { validatePassword } from '@/lib/email';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { token, password } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 });
    }

    // Find the reset token
    const resetToken = await AdminPasswordResetToken.findOne({ token });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await AdminPasswordResetToken.deleteOne({ _id: resetToken._id });
      return NextResponse.json({ error: 'Reset token has expired. Please request a new one.' }, { status: 400 });
    }

    // Find the admin
    const admin = await SuperAdmin.findById(resetToken.adminId);

    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update admin password
    await SuperAdmin.updateOne(
      { _id: admin._id },
      { password: hashedPassword }
    );

    // Delete the used token
    await AdminPasswordResetToken.deleteOne({ _id: resetToken._id });

    return NextResponse.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Admin password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

// GET endpoint to verify token validity
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 });
    }

    const resetToken = await AdminPasswordResetToken.findOne({ token });

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'Invalid reset token' }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      await AdminPasswordResetToken.deleteOne({ _id: resetToken._id });
      return NextResponse.json({ valid: false, error: 'Reset token has expired' }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ valid: false, error: 'Failed to verify token' }, { status: 500 });
  }
}
