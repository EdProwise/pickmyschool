import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, users, schools } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface DecodedToken {
  userId: number;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

function verifyToken(request: NextRequest): DecodedToken | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can create reviews', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { schoolId, rating, reviewText, photos } = body;

    if (!schoolId || typeof schoolId !== 'number') {
      return NextResponse.json(
        { error: 'Valid schoolId is required', code: 'INVALID_SCHOOL_ID' },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== 'number') {
      return NextResponse.json(
        { error: 'Valid rating is required', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5', code: 'RATING_OUT_OF_RANGE' },
        { status: 400 }
      );
    }

    if (!reviewText || typeof reviewText !== 'string' || reviewText.trim() === '') {
      return NextResponse.json(
        { error: 'Review text is required and cannot be empty', code: 'INVALID_REVIEW_TEXT' },
        { status: 400 }
      );
    }

    if (photos && !Array.isArray(photos)) {
      return NextResponse.json(
        { error: 'Photos must be an array', code: 'INVALID_PHOTOS_FORMAT' },
        { status: 400 }
      );
    }

    const existingReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, decoded.userId),
          eq(reviews.schoolId, schoolId)
        )
      )
      .limit(1);

    if (existingReviews.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this school', code: 'DUPLICATE_REVIEW' },
        { status: 409 }
      );
    }

    const school = await db
      .select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (school.length === 0) {
      return NextResponse.json(
        { error: 'School not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const newReview = await db
      .insert(reviews)
      .values({
        userId: decoded.userId,
        schoolId: schoolId,
        rating: rating,
        reviewText: reviewText.trim(),
        photos: photos || [],
        approvalStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdParam = searchParams.get('schoolId');
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let conditions = [];

    if (schoolIdParam) {
      const schoolId = parseInt(schoolIdParam);
      if (isNaN(schoolId)) {
        return NextResponse.json(
          { error: 'Invalid schoolId parameter', code: 'INVALID_SCHOOL_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(reviews.schoolId, schoolId));
    }

    if (statusParam) {
      conditions.push(eq(reviews.approvalStatus, statusParam));
    } else {
      conditions.push(eq(reviews.approvalStatus, 'approved'));
    }

    let reviewsList;
    if (conditions.length > 1) {
      reviewsList = await db
        .select()
        .from(reviews)
        .where(and(...conditions))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);
    } else if (conditions.length === 1) {
      reviewsList = await db
        .select()
        .from(reviews)
        .where(conditions[0])
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      reviewsList = await db
        .select()
        .from(reviews)
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const reviewsWithStudentInfo = await Promise.all(
      reviewsList.map(async (review) => {
        const user = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, review.userId))
          .limit(1);

        return {
          ...review,
          studentName: user.length > 0 ? user[0].name : 'Unknown User',
        };
      })
    );

    return NextResponse.json(reviewsWithStudentInfo, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}