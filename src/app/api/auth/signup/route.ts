import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, Notification, SuperAdmin, EmailVerificationToken } from '@/lib/models';
import bcrypt from 'bcrypt';
import { validatePassword, generateVerificationToken, sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { role, email, password, name, phone, city, class: studentClass, schoolId } = body;

    if (!role || !email || !password || !name) {
      return NextResponse.json(
        { 
          error: "Role, email, password, and name are required",
          code: "MISSING_FIELDS" 
        },
        { status: 400 }
      );
    }

    if (role !== 'student' && role !== 'school') {
      return NextResponse.json(
        { 
          error: "Role must be either 'student' or 'school'",
          code: "INVALID_ROLE" 
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: passwordValidation.errors.join('. '),
          code: "INVALID_PASSWORD",
          passwordErrors: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return NextResponse.json(
        { 
          error: "Email already exists",
          code: "EMAIL_EXISTS" 
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const currentTimestamp = new Date().toISOString();

    const userData: any = {
      role,
      email: trimmedEmail,
      password: hashedPassword,
      name: name.trim(),
      emailVerified: false,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };

    if (phone) {
      userData.phone = phone.trim();
    }

    if (city) {
      userData.city = city.trim();
    }

    if (role === 'student') {
      userData.savedSchools = [];
      if (studentClass) {
        userData.class = studentClass.trim();
      }
    }

    if (role === 'school' && schoolId) {
      userData.schoolId = parseInt(schoolId);
    }

    const newUser = new User(userData);
    await newUser.save();

    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const tokenDoc = new EmailVerificationToken({
      userId: newUser._id,
      token: verificationToken,
      expiresAt,
      createdAt: currentTimestamp,
    });
    await tokenDoc.save();

    try {
      await sendVerificationEmail(trimmedEmail, verificationToken, name.trim());
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    try {
      const admin = await SuperAdmin.findOne();
      
      if (admin) {
        const roleLabel = role === 'student' ? 'Student' : 'School';
        const notification = new Notification({
          recipientId: admin._id,
          recipientType: 'super_admin',
          title: `New ${roleLabel} Signup`,
          message: `${name.trim()} (${trimmedEmail}) has signed up as a ${roleLabel}.`,
          type: 'signup',
          relatedId: newUser._id,
          isRead: false,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        });
        await notification.save();
      }
    } catch (notifError) {
      console.error('Failed to create notification for super admin:', notifError);
    }

    const userObj = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return NextResponse.json(
      {
        user: {
          ...userWithoutPassword,
          id: newUser._id.toString()
        },
        message: "Account created! Please check your email to verify your account.",
        requiresVerification: true
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
