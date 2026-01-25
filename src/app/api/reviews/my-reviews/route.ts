import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Review } from '@/lib/models';
import { getSchool } from '@/lib/schoolsHelper';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    let decoded: { userId: string };
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token payload', code: 'INVALID_TOKEN_PAYLOAD' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userReviews = await Review.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    const reviewsWithSchools = await Promise.all(
      userReviews.map(async (review) => {
        const school = await getSchool(review.schoolId);
        return {
          ...review,
          id: review._id,
          schoolName: school?.name || 'Unknown School',
        };
      })
    );

    return NextResponse.json(reviewsWithSchools, { status: 200 });

  } catch (error) {
    console.error('GET /api/reviews/my-reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
