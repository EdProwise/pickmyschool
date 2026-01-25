import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const schoolId = parseInt(id);
    
    const school = await School.findOne({ id: schoolId }).select('featured');
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }
    
    const newFeaturedStatus = !school.featured;
    
    await School.findOneAndUpdate(
      { id: schoolId },
      { $set: { featured: newFeaturedStatus } }
    );
    
    return NextResponse.json({
      success: true,
      featured: newFeaturedStatus,
      message: `School ${newFeaturedStatus ? 'marked as' : 'removed from'} featured`,
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle featured status' },
      { status: 500 }
    );
  }
}
