import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, schools } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = params.id;

    // Validate ID is valid integer
    if (!schoolId || isNaN(parseInt(schoolId))) {
      return NextResponse.json(
        {
          error: 'Valid school ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const id = parseInt(schoolId);

    // Verify school exists
    const school = await db
      .select()
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1);

    if (school.length === 0) {
      return NextResponse.json(
        {
          error: 'School not found',
          code: 'SCHOOL_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Query approved reviews for statistics
    const approvedReviews = await db
      .select({
        rating: reviews.rating,
      })
      .from(reviews)
      .where(and(eq(reviews.schoolId, id), eq(reviews.approvalStatus, 'approved')));

    // Calculate total reviews
    const totalReviews = approvedReviews.length;

    // Calculate average rating
    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = parseFloat((sum / totalReviews).toFixed(2));
    }

    // Initialize rating distribution with all ratings 1-5 set to 0
    const ratingDistribution: { [key: string]: number } = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    // Fill in actual counts from query results
    approvedReviews.forEach((review) => {
      const ratingKey = review.rating.toString();
      if (ratingDistribution.hasOwnProperty(ratingKey)) {
        ratingDistribution[ratingKey]++;
      }
    });

    // Return statistics
    return NextResponse.json(
      {
        averageRating,
        totalReviews,
        ratingDistribution,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET reviews stats error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}