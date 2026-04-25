import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.substring(7), process.env.JWT_SECRET || 'your-secret-key') as { role: string };
    if (decoded.role !== 'super_admin') return null;
    return decoded;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}-${random}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/blogs/${filename}` });
  } catch (error) {
    console.error('Blog upload error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + (error as Error).message }, { status: 500 });
  }
}
