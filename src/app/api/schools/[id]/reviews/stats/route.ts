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

    // Get counts for all statuses
    const statusCounts = await Review.aggregate([
      { $match: { schoolId: id } },
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts: { [key: string]: number } = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    statusCounts.forEach((row) => {
      if (row._id && counts.hasOwnProperty(row._id)) {
        counts[row._id] = row.count;
      }
    });

    // Query approved reviews for rating distribution
    const ratingStatsResult = await Review.aggregate([
      { $match: { schoolId: id, approvalStatus: 'approved' } },
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

    let totalScore = 0;
    const totalApproved = counts.approved;

    ratingStatsResult.forEach((row) => {
      const rating = row._id.toString();
      const count = row.count;
      if (ratingDistribution.hasOwnProperty(rating)) {
        ratingDistribution[rating] = count;
      }
      totalScore += (row._id * count);
    });

    const averageRating = totalApproved > 0 ? parseFloat((totalScore / totalApproved).toFixed(2)) : 0;

    return NextResponse.json(
      {
        averageRating,
        totalReviews: totalApproved, // Maintain backward compatibility if needed, but we have counts now
        ratingDistribution,
        counts,
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
