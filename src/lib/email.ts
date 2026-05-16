import nodemailer from 'nodemailer';
import { getSiteSettings } from '@/lib/site-settings';

async function getTransporter() {
  const settings = await getSiteSettings();
  const user = settings.gmailUser;
  const pass = settings.gmailAppPassword;

  if (!user || !pass) {
    throw new Error('Gmail credentials not configured. Please set them in Admin > Settings > Email Settings.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function getFromAddress() {
  const settings = await getSiteSettings();
  return settings.gmailUser || '';
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  const from = await getFromAddress();

  const mailOptions = {
    from: `"PickMySchool" <${from}>`,
    to: email,
    subject: 'Verify your email - PickMySchool',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #3b82f6 100%); padding: 3px; border-radius: 16px;">
              <div style="background-color: white; border-radius: 14px; padding: 40px; text-align: center;">
                <div style="margin-bottom: 30px;">
                  <h1 style="color: #18181b; margin: 0; font-size: 28px; font-weight: 700;">
                    <span style="color: #18181b;">Pick</span><span style="color: #04d3d3;">MySchool</span>
                  </h1>
                </div>

                <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                  Verify your email address
                </h2>

                <p style="color: #71717a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi ${name},<br><br>
                  Thank you for signing up! Please verify your email address by clicking the button below.
                </p>

                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; margin: 20px 0;">
                  Verify Email Address
                </a>

                <p style="color: #a1a1aa; font-size: 14px; margin: 30px 0 0 0;">
                  This link will expire in 24 hours.<br>
                  If you didn't create an account, you can safely ignore this email.
                </p>

                <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">

                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                  If the button doesn't work, copy and paste this link:<br>
                  <a href="${verificationUrl}" style="color: #06b6d4; word-break: break-all;">${verificationUrl}</a>
                </p>
              </div>
            </div>

            <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} PickMySchool. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const from = await getFromAddress();

  const mailOptions = {
    from: `"PickMySchool" <${from}>`,
    to: email,
    subject: 'Reset your password - PickMySchool',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #3b82f6 100%); padding: 3px; border-radius: 16px;">
              <div style="background-color: white; border-radius: 14px; padding: 40px; text-align: center;">
                <div style="margin-bottom: 30px;">
                  <h1 style="color: #18181b; margin: 0; font-size: 28px; font-weight: 700;">
                    <span style="color: #18181b;">Pick</span><span style="color: #04d3d3;">MySchool</span>
                  </h1>
                </div>

                <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                  Reset your password
                </h2>

                <p style="color: #71717a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi ${name},<br><br>
                  We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
                </p>

                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; margin: 20px 0;">
                  Reset Password
                </a>

                <p style="color: #a1a1aa; font-size: 14px; margin: 30px 0 0 0;">
                  This link will expire in 1 hour.<br>
                  If you didn't request a password reset, please contact support.
                </p>

                <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">

                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                  If the button doesn't work, copy and paste this link:<br>
                  <a href="${resetUrl}" style="color: #06b6d4; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
            </div>

            <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} PickMySchool. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendFreelancerVerificationEmail(email: string, token: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/freelancer/verify-email?token=${token}`;
  const from = await getFromAddress();

  const mailOptions = {
    from: `"PickMySchool Freelancer Portal" <${from}>`,
    to: email,
    subject: 'Verify your email – PickMySchool Freelancer Portal',
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0;background-color:#f0fdf4;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);padding:3px;border-radius:16px;">
              <div style="background-color:white;border-radius:14px;padding:40px;text-align:center;">
                <div style="margin-bottom:24px;">
                  <div style="width:64px;height:64px;margin:0 auto 16px;background:linear-gradient(135deg,#059669,#0d9488);border-radius:50%;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:28px;">💼</span>
                  </div>
                  <h1 style="color:#18181b;margin:0;font-size:26px;font-weight:700;">
                    <span style="color:#18181b;">Pick</span><span style="color:#04d3d3;">MySchool</span>
                  </h1>
                  <p style="color:#059669;font-size:13px;font-weight:600;margin:4px 0 0;">FREELANCER PORTAL</p>
                </div>
                <h2 style="color:#18181b;margin:0 0 12px;font-size:22px;font-weight:600;">Verify your email address</h2>
                <p style="color:#52525b;font-size:15px;line-height:1.7;margin:0 0 28px;">
                  Hi <strong>${name}</strong>,<br><br>
                  Welcome to the PickMySchool Freelancer Portal! Please verify your email address to activate your account and start generating leads.
                </p>
                <a href="${verificationUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#0d9488 100%);color:white;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:600;margin:8px 0;">
                  Verify Email Address
                </a>
                <p style="color:#a1a1aa;font-size:13px;margin:28px 0 0;">
                  This link expires in 24 hours.<br>
                  If you didn't create an account, you can safely ignore this email.
                </p>
                <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
                <p style="color:#a1a1aa;font-size:12px;margin:0;">
                  If the button doesn't work, copy and paste:<br>
                  <a href="${verificationUrl}" style="color:#059669;word-break:break-all;">${verificationUrl}</a>
                </p>
              </div>
            </div>
            <p style="color:#a1a1aa;font-size:12px;text-align:center;margin-top:20px;">
              © ${new Date().getFullYear()} PickMySchool. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Freelancer verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send freelancer verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendFreelancerLeadStatusEmail(
  freelancerEmail: string,
  freelancerName: string,
  studentName: string,
  parentName: string,
  newStatus: string,
  schoolName: string,
) {
  const from = await getFromAddress();

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string; message: string }> = {
    contacted: {
      label: 'Contacted',
      color: '#b45309',
      bg: '#fef3c7',
      icon: '📞',
      message: 'The school has contacted this lead and is in discussion.',
    },
    converted: {
      label: 'Converted',
      color: '#065f46',
      bg: '#d1fae5',
      icon: '🎉',
      message: 'Great news! This lead has been converted. Your commission will be processed accordingly.',
    },
    rejected: {
      label: 'Rejected',
      color: '#991b1b',
      bg: '#fee2e2',
      icon: '❌',
      message: 'Unfortunately this lead was not taken forward by the school.',
    },
  };

  const cfg = statusConfig[newStatus] || { label: newStatus, color: '#18181b', bg: '#f4f4f5', icon: '📋', message: 'The status of your lead has been updated.' };

  const mailOptions = {
    from: `"PickMySchool Freelancer Portal" <${from}>`,
    to: freelancerEmail,
    subject: `Lead Update: ${studentName} – ${cfg.label} | PickMySchool`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0;background-color:#f0fdf4;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);padding:3px;border-radius:16px;">
              <div style="background-color:white;border-radius:14px;padding:40px;">
                <div style="text-align:center;margin-bottom:28px;">
                  <h1 style="color:#18181b;margin:0;font-size:24px;font-weight:700;">
                    <span style="color:#18181b;">Pick</span><span style="color:#04d3d3;">MySchool</span>
                  </h1>
                  <p style="color:#059669;font-size:12px;font-weight:600;margin:4px 0 0;">FREELANCER PORTAL</p>
                </div>
                <p style="color:#52525b;font-size:15px;margin:0 0 20px;">Hi <strong>${freelancerName}</strong>,</p>
                <div style="background:${cfg.bg};border-left:4px solid ${cfg.color};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                  <p style="margin:0;font-size:18px;font-weight:700;color:${cfg.color};">${cfg.icon} Lead Status: ${cfg.label}</p>
                  <p style="margin:6px 0 0;font-size:14px;color:${cfg.color};">${cfg.message}</p>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:10px 16px;font-weight:600;color:#6b7280;width:40%;border-bottom:1px solid #e5e7eb;">Student Name</td>
                    <td style="padding:10px 16px;color:#18181b;border-bottom:1px solid #e5e7eb;">${studentName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 16px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Parent Name</td>
                    <td style="padding:10px 16px;color:#18181b;border-bottom:1px solid #e5e7eb;">${parentName}</td>
                  </tr>
                  <tr style="background:#f9fafb;">
                    <td style="padding:10px 16px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">School</td>
                    <td style="padding:10px 16px;color:#18181b;border-bottom:1px solid #e5e7eb;">${schoolName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 16px;font-weight:600;color:#6b7280;">New Status</td>
                    <td style="padding:10px 16px;"><span style="background:${cfg.bg};color:${cfg.color};padding:3px 10px;border-radius:20px;font-weight:600;font-size:13px;">${cfg.label}</span></td>
                  </tr>
                </table>
                <p style="color:#71717a;font-size:13px;margin:0;">
                  Log in to your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/freelancer/track-lead" style="color:#059669;font-weight:600;">Freelancer Portal</a> to track all your leads.
                </p>
                <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
                <p style="color:#a1a1aa;font-size:12px;margin:0;text-align:center;">
                  © ${new Date().getFullYear()} PickMySchool. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Freelancer lead status email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send freelancer lead status email:', error);
    // Don't throw — status update should still succeed even if email fails
  }
}

export function generateVerificationToken(): string {

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least 1 special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function sendAdminPasswordResetEmail(email: string, token: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;
  const from = await getFromAddress();

  const mailOptions = {
    from: `"PickMySchool Admin" <${from}>`,
    to: email,
    subject: 'Reset your Admin password - PickMySchool',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #1e1b4b;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); padding: 3px; border-radius: 16px;">
              <div style="background-color: #1e1b4b; border-radius: 14px; padding: 40px; text-align: center;">
                <div style="margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 36px;">🛡️</span>
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                    <span style="color: white;">Pick</span><span style="color: #04d3d3;">MySchool</span>
                  </h1>
                  <p style="color: #a78bfa; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">ADMIN PORTAL</p>
                </div>

                <h2 style="color: white; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                  Reset your admin password
                </h2>

                <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Hi ${name},<br><br>
                  We received a request to reset your admin password. Click the button below to set a new password.
                </p>

                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; margin: 20px 0;">
                  Reset Admin Password
                </a>

                <p style="color: #71717a; font-size: 14px; margin: 30px 0 0 0;">
                  This link will expire in 1 hour.<br>
                  If you didn't request this, please secure your account immediately.
                </p>

                <hr style="border: none; border-top: 1px solid #3f3f46; margin: 30px 0;">

                <p style="color: #71717a; font-size: 12px; margin: 0;">
                  If the button doesn't work, copy and paste this link:<br>
                  <a href="${resetUrl}" style="color: #06b6d4; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
            </div>

            <p style="color: #71717a; font-size: 12px; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} PickMySchool. Admin Portal - Authorized Personnel Only.
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send admin password reset email:', error);
    throw new Error('Failed to send admin password reset email');
  }
}
