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
      return NextResponse.json({ error: 'Only school users can upload files' }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }
    if (!type || !['image', 'document', 'video'].includes(type)) {
      return NextResponse.json({ error: 'Invalid file type. Must be image, document, or video' }, { status: 400 });
    }

    const fileUrls: string[] = [];

    for (const file of files) {
      let isValid = false;
      let maxSize = 0;

      if (type === 'image') {
        isValid = file.type.startsWith('image/');
        maxSize = 5 * 1024 * 1024; // 5MB
      } else if (type === 'document') {
        isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
        maxSize = 10 * 1024 * 1024; // 10MB
      } else if (type === 'video') {
        isValid = ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type);
        maxSize = 50 * 1024 * 1024; // 50MB
      }

      if (!isValid) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Expected ${type}.` },
          { status: 400 }
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
          { status: 400 }
        );
      }

      // Convert to base64 data URL (works on Vercel / read-only filesystems)
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      fileUrls.push(`data:${file.type};base64,${base64}`);
    }

    return NextResponse.json({
      success: true,
      urls: fileUrls,
      count: fileUrls.length,
      type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
