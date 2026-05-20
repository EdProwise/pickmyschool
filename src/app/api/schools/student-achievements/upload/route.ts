import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.substring(7), JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    if (payload.role !== 'school') {
      return NextResponse.json({ error: 'Only school users can upload images' }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only images are allowed.` },
          { status: 400 }
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 5MB.` },
          { status: 400 }
        );
      }
    }

    const imageUrls: string[] = [];
    for (const file of files) {
      // Convert to base64 data URL (works on Vercel / read-only filesystems)
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      imageUrls.push(`data:${file.type};base64,${base64}`);
    }

    return NextResponse.json({
      success: true,
      urls: imageUrls,
      count: imageUrls.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
