import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  adminId: string;
  role: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin role required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      parentName,
      location,
      rating,
      testimonialText,
      avatarUrl,
      featured,
      displayOrder,
    } = body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    const existing = await Testimonial.findById(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (parentName !== undefined) updateData.parentName = parentName.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (rating !== undefined) updateData.rating = parseInt(rating);
    if (testimonialText !== undefined) updateData.testimonialText = testimonialText.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl ? avatarUrl.trim() : null;
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder ? parseInt(displayOrder) : null;

    const updated = await Testimonial.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({ ...updated!.toObject(), id: updated!._id }, { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin role required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const existing = await Testimonial.findById(id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await Testimonial.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: 'Testimonial deleted successfully',
        deletedId: id,
        deleted: deleted ? { ...deleted.toObject(), id: deleted._id } : null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
