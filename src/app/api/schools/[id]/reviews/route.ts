import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, users } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = params.id;

    // Validate schoolId
    if (!schoolId || isNaN(parseInt(schoolId))) {
      return NextResponse.json(
        { 
          error: 'Valid school ID is required',
          code: 'INVALID_SCHOOL_ID'
        },
        { status: 400 }
      );
    }

    const parsedSchoolId = parseInt(schoolId);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50);
    const offset = (page - 1) * limit;

    // Get reviews with user names
    const reviewsWithUsers = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        schoolId: reviews.schoolId,
        rating: reviews.rating,
        reviewText: reviews.reviewText,
        photos: reviews.photos,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        studentName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.schoolId, parsedSchoolId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.schoolId, parsedSchoolId));

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Calculate average rating
    const allReviews = await db
      .select({
        rating: reviews.rating,
      })
      .from(reviews)
      .where(eq(reviews.schoolId, parsedSchoolId));

    let averageRating = 0;
    if (allReviews.length > 0) {
      const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = Math.round((sum / allReviews.length) * 100) / 100;
    }

    return NextResponse.json({
      reviews: reviewsWithUsers,
      metadata: {
        total,
        page,
        limit,
        totalPages,
        averageRating,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}