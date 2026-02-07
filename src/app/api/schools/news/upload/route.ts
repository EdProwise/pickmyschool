import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const payload = verifyToken(request);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Role verification
    if (payload.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school users can upload files' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string; // 'image', 'document', or 'video'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!type || !['image', 'document', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be image, document, or video' },
        { status: 400 }
      );
    }

    // Validate file types and sizes based on type
    const fileUrls: string[] = [];
    
    for (const file of files) {
      let isValid = false;
      let maxSize = 0;

      if (type === 'image') {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        isValid = validTypes.includes(file.type);
        maxSize = 5 * 1024 * 1024; // 5MB
      } else if (type === 'document') {
        const validTypes = ['application/pdf'];
        isValid = validTypes.includes(file.type);
        maxSize = 10 * 1024 * 1024; // 10MB
      } else if (type === 'video') {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        isValid = validTypes.includes(file.type);
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

        // Save file to local storage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop() || 'bin';
        const filename = `${timestamp}-${randomString}.${extension}`;
        
        // Determine upload directory based on type
        const typeFolder = type === 'image' ? 'images' : type === 'document' ? 'documents' : 'videos';
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'news', typeFolder);
        
        // Ensure directory exists
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        
        // Write file to disk
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        // Return public URL
        const publicUrl = `/uploads/news/${typeFolder}/${filename}`;
        fileUrls.push(publicUrl);
    }

    return NextResponse.json({ 
      success: true,
      urls: fileUrls,
      count: fileUrls.length,
      type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
