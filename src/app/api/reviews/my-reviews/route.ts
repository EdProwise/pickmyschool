import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, schools } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    let decoded: { userId: number };
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
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

    // Query user's reviews with school information
    const userReviews = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        schoolId: reviews.schoolId,
        rating: reviews.rating,
        reviewText: reviews.reviewText,
        photos: reviews.photos,
        approvalStatus: reviews.approvalStatus,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        schoolName: schools.name,
      })
      .from(reviews)
      .leftJoin(schools, eq(reviews.schoolId, schools.id))
      .where(eq(reviews.userId, decoded.userId))
      .orderBy(desc(reviews.createdAt));

    return NextResponse.json(userReviews, { status: 200 });

  } catch (error) {
    console.error('GET /api/reviews/my-reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}