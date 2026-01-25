import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Review, User } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const schoolId = parseInt(id);

    // Validate schoolId
    if (isNaN(schoolId)) {
      return NextResponse.json(
        { 
          error: 'Valid school ID is required',
          code: 'INVALID_SCHOOL_ID'
        },
        { status: 400 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50);
    const skip = (page - 1) * limit;

    // Build query
    const query = { schoolId, approvalStatus: 'approved' };

    // Get reviews with user names
    const reviewsWithUsers = await Review.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Review.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate average rating
    const stats = await Review.aggregate([
      { $match: query },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 100) / 100 : 0;

    return NextResponse.json({
      reviews: reviewsWithUsers.map((r: any) => ({
        ...r,
        id: r._id,
        studentName: r.userId?.name || 'Anonymous'
      })),
      metadata: {
        total,
        page,
        limit,
        totalPages,
        averageRating,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
