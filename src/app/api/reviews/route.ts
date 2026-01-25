import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Review, User, Notification, School } from '@/lib/models';
import { getSchool, updateSchoolStats } from '@/lib/schoolsHelper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface DecodedToken {
  userId: string;
  role: string;
  email: string;
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

    await connectToDatabase();

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

    const existingReview = await Review.findOne({
      userId: decoded.userId,
      schoolId: schoolId
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this school', code: 'DUPLICATE_REVIEW' },
        { status: 409 }
      );
    }

    const school = await getSchool(schoolId);

    if (!school) {
      return NextResponse.json(
        { error: 'School not found', code: 'SCHOOL_NOT_FOUND' },
        { status: 404 }
      );
    }

    const newReview = await Review.create({
      userId: decoded.userId,
      schoolId: schoolId,
      rating: rating,
      reviewText: reviewText.trim(),
      photos: photos || [],
      approvalStatus: 'approved',
    });

    await updateSchoolStats(schoolId);

    if (school.userId) {
      try {
        const studentInfo = await User.findById(decoded.userId).select('name');
        const studentName = studentInfo?.name || 'A student';
        const stars = '⭐'.repeat(rating);

        await Notification.create({
          recipientId: school.userId,
          recipientType: 'school',
          title: 'New Review Posted',
          message: `${studentName} has posted a ${rating}-star review ${stars} for your school.`,
          type: 'review',
          relatedId: newReview._id,
          isRead: false,
        });
      } catch (notifError) {
        console.error('Failed to create notification for school:', notifError);
      }
    }

    return NextResponse.json({ ...newReview.toObject(), id: newReview._id }, { status: 201 });
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
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const schoolIdParam = searchParams.get('schoolId');
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const decoded = verifyToken(request);
    const isSchoolUser = decoded?.role === 'school';

    const query: any = {};

    if (schoolIdParam) {
      const schoolId = parseInt(schoolIdParam);
      if (isNaN(schoolId)) {
        return NextResponse.json(
          { error: 'Invalid schoolId parameter', code: 'INVALID_SCHOOL_ID' },
          { status: 400 }
        );
      }
      query.schoolId = schoolId;
    }

    if (isSchoolUser) {
      if (statusParam && ['pending', 'approved', 'rejected'].includes(statusParam)) {
        query.approvalStatus = statusParam;
      }
      // If statusParam is missing or not in the list, return all reviews for schools
    } else {
      query.approvalStatus = 'approved';
    }

    const reviewsList = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const reviewsWithStudentInfo = await Promise.all(
      reviewsList.map(async (review) => {
        const user = await User.findById(review.userId).select('name');

        return {
          ...review,
          id: review._id,
          studentName: user?.name || 'Unknown User',
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
