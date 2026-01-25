import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Review } from '@/lib/models';
import { updateSchoolStats } from '@/lib/schoolsHelper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  role: string;
  email: string;
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;

    const tokenPayload = extractAndVerifyToken(request);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (tokenPayload.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can update reviews', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (review.userId.toString() !== tokenPayload.userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this review', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, reviewText, photos } = body;

    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Rating must be an integer between 1 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
    }

    if (reviewText !== undefined) {
      if (typeof reviewText !== 'string' || reviewText.trim() === '') {
        return NextResponse.json(
          { error: 'Review text must be a non-empty string', code: 'INVALID_REVIEW_TEXT' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      approvalStatus: 'approved'
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

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedReview) {
      return NextResponse.json(
        { error: 'Failed to update review', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    await updateSchoolStats(review.schoolId);

    return NextResponse.json({ ...updatedReview.toObject(), id: updatedReview._id }, { status: 200 });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id } = await params;

    const tokenPayload = extractAndVerifyToken(request);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (tokenPayload.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can delete reviews', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (review.userId.toString() !== tokenPayload.userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this review', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const schoolId = review.schoolId;

    await Review.findByIdAndDelete(id);

    await updateSchoolStats(schoolId);

    return NextResponse.json(
      { 
        message: 'Review deleted successfully', 
        reviewId: id 
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
