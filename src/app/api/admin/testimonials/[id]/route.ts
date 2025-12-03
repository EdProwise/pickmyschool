import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  adminId: number;
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Verify authorization
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin role required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse request body
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

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    // Check if testimonial exists
    const existing = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (parentName !== undefined) updateData.parentName = parentName.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (rating !== undefined) updateData.rating = rating;
    if (testimonialText !== undefined) updateData.testimonialText = testimonialText.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim();
    if (featured !== undefined) updateData.featured = featured;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    // Update testimonial
    const updated = await db
      .update(testimonials)
      .set(updateData)
      .where(eq(testimonials.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Verify authentication
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Verify authorization
    if (decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. Super admin role required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Check if testimonial exists
    const existing = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete testimonial
    const deleted = await db
      .delete(testimonials)
      .where(eq(testimonials.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Testimonial deleted successfully',
        deletedId: parseInt(id),
        deleted: deleted[0],
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