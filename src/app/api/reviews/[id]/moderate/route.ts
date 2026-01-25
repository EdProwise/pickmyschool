import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Review, User } from '@/lib/models';
import { updateSchoolStats } from '@/lib/schoolsHelper';
import jwt from 'jsonwebtoken';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id: reviewId } = await params;

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

    if (decoded.role !== 'school') {
      return NextResponse.json(
        { error: 'Only school admins can moderate reviews', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found', code: 'REVIEW_NOT_FOUND' },
        { status: 404 }
      );
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.schoolId) {
      return NextResponse.json(
        { error: 'User not found or no school association', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (review.schoolId !== user.schoolId) {
      return NextResponse.json(
        { 
          error: 'Not authorized to moderate reviews for this school', 
          code: 'UNAUTHORIZED_SCHOOL' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { approvalStatus } = body;

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

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { $set: { approvalStatus } },
      { new: true }
    );

    await updateSchoolStats(review.schoolId);

    return NextResponse.json(
      {
        review: { ...updatedReview!.toObject(), id: updatedReview!._id },
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
