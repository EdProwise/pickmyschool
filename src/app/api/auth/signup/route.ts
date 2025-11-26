import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, email, password, name, phone, city, class: studentClass, schoolId } = body;

    // Validate required fields
    if (!role || !email || !password || !name) {
      return NextResponse.json(
        { 
          error: "Role, email, password, and name are required",
          code: "MISSING_FIELDS" 
        },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'student' && role !== 'school') {
      return NextResponse.json(
        { 
          error: "Role must be either 'student' or 'school'",
          code: "INVALID_ROLE" 
        },
        { status: 400 }
      );
    }

    // Validate email format
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { 
          error: "Password must be at least 6 characters",
          code: "PASSWORD_TOO_SHORT" 
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, trimmedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { 
          error: "Email already exists",
          code: "EMAIL_EXISTS" 
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const currentTimestamp = new Date().toISOString();
    const userData: any = {
      role,
      email: trimmedEmail,
      password: hashedPassword,
      name: name.trim(),
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };

    // Add optional fields if provided
    if (phone) {
      userData.phone = phone.trim();
    }

    if (city) {
      userData.city = city.trim();
    }

    // Role-specific fields
    if (role === 'student') {
      userData.savedSchools = JSON.stringify([]);
      if (studentClass) {
        userData.class = studentClass.trim();
      }
    }

    if (role === 'school' && schoolId) {
      userData.schoolId = parseInt(schoolId);
    }

    // Insert user into database
    const [newUser] = await db.insert(users)
      .values(userData)
      .returning();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Parse savedSchools JSON if it exists
    const responseUser = {
      ...userWithoutPassword,
      savedSchools: userWithoutPassword.savedSchools 
        ? JSON.parse(userWithoutPassword.savedSchools as string)
        : undefined
    };

    return NextResponse.json(
      {
        user: responseUser,
        message: "User registered successfully"
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