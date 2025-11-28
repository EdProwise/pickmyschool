import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: number;
  role: string;
}

function extractAndVerifyToken(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
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
    const id = params.id;

    // Validate ID format
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const reviewId = parseInt(id);

    // Extract and verify JWT token
    const tokenPayload = extractAndVerifyToken(request);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Validate user role is 'student'
    if (tokenPayload.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can update reviews', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Query review by ID
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const review = existingReview[0];

    // Verify review ownership
    if (review.userId !== tokenPayload.userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this review', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { rating, reviewText, photos } = body;

    // Validate rating if provided
    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be an integer between 1 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
    }

    // Validate reviewText if provided
    if (reviewText !== undefined) {
      if (typeof reviewText !== 'string' || reviewText.trim() === '') {
        return NextResponse.json(
          { error: 'Review text must be a non-empty string', code: 'INVALID_REVIEW_TEXT' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
      approvalStatus: 'pending' // Reset approval status on any edit
    };

    if (rating !== undefined) {
      updateData.rating = rating;
    }

    if (reviewText !== undefined) {
      updateData.reviewText = reviewText.trim();
    }

    if (photos !== undefined) {
      updateData.photos = photos;
    }

    // Update review
    const updatedReview = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, reviewId))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update review', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedReview[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID format
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const reviewId = parseInt(id);

    // Extract and verify JWT token
    const tokenPayload = extractAndVerifyToken(request);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Validate user role is 'student'
    if (tokenPayload.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can delete reviews', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Query review by ID
    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const review = existingReview[0];

    // Verify review ownership
    if (review.userId !== tokenPayload.userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this review', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Delete review
    const deletedReview = await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    if (deletedReview.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete review', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Review deleted successfully', 
        reviewId: reviewId 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}