import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Validate user role
    if (decoded.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school admins can moderate reviews', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Validate review ID
    const reviewId = params.id;
    if (!reviewId || isNaN(parseInt(reviewId))) {
      return NextResponse.json(
        { error: 'Valid review ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Query review by ID
    const reviewResult = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(reviewId)))
      .limit(1);

    if (reviewResult.length === 0) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    const review = reviewResult[0];

    // Get user's schoolId from users table
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (userResult.length === 0 || !userResult[0].schoolId) {
      return NextResponse.json(
        { error: 'User not found or no school association', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Verify review.schoolId matches user's schoolId
    if (review.schoolId !== user.schoolId) {
      return NextResponse.json(
        { 
          error: 'Not authorized to moderate reviews for this school', 
          code: 'UNAUTHORIZED_SCHOOL' 
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { approvalStatus } = body;

    // Validate approvalStatus
    const validStatuses = ['approved', 'rejected'];
    if (!approvalStatus || !validStatuses.includes(approvalStatus)) {
      return NextResponse.json(
        { 
          error: 'Invalid approval status. Must be "approved" or "rejected"', 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Update review
    const updatedReview = await db
      .update(reviews)
      .set({
        approvalStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reviews.id, parseInt(reviewId)))
      .returning();

    return NextResponse.json(
      {
        review: updatedReview[0],
        message: 'Review moderation status updated',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/reviews/[id]/moderate error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}