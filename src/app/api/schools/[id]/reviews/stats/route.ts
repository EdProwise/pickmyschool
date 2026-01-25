import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Review, School } from '@/lib/models';
import { getSchool } from '@/lib/schoolsHelper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const { id: schoolId } = await params;

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

    // Verify school exists using helper
    const school = await getSchool(id);

    if (!school) {
      return NextResponse.json(
        {
          error: 'School not found',
          code: 'SCHOOL_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Query approved reviews for statistics
    const query = { schoolId: id, approvalStatus: 'approved' };
    
    const statsResult = await Review.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize rating distribution
    const ratingDistribution: { [key: string]: number } = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    let totalReviews = 0;
    let totalScore = 0;

    statsResult.forEach((row) => {
      const rating = row._id.toString();
      const count = row.count;
      if (ratingDistribution.hasOwnProperty(rating)) {
        ratingDistribution[rating] = count;
      }
      totalReviews += count;
      totalScore += (row._id * count);
    });

    const averageRating = totalReviews > 0 ? parseFloat((totalScore / totalReviews).toFixed(2)) : 0;

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
