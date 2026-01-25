import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, Enquiry, Review, School } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: string;
  role: string;
}

async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    if (decoded.role !== 'school') {
      return { error: NextResponse.json({ error: 'Forbidden: School access only' }, { status: 403 }) };
    }

    return { user: decoded };
  } catch (error) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const auth = await authenticateRequest(request);
    if ('error' in auth) {
      return auth.error;
    }

    const { user } = auth;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get user's school ID
    const userRecord = await User.findById(user.userId);

    if (!userRecord || !userRecord.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const school = await School.findById(userRecord.schoolId);
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }
    const schoolId = school.id;

    // Build date filters for enquiries and reviews
    const enquiryQuery: any = { schoolId };
    const reviewQuery: any = { schoolId };

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      
      enquiryQuery.createdAt = dateFilter;
      reviewQuery.createdAt = dateFilter;
    }

    // 1. Enquiry Statistics
    const enquiryStatsByStatus = await Enquiry.aggregate([
      { $match: enquiryQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const enquiryStats = enquiryStatsByStatus.map(row => ({
      status: row._id,
      count: row.count
    }));

    // 2. Enquiry Trend (Last 30 days or custom range)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendStartDate = startDate ? new Date(startDate) : thirtyDaysAgo;
    const trendEndDate = endDate ? new Date(endDate) : new Date();

    const enquiryTrendResult = await Enquiry.aggregate([
      {
        $match: {
          schoolId,
          createdAt: { $gte: trendStartDate, $lte: trendEndDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const enquiryTrend = enquiryTrendResult.map(row => ({
      date: row._id,
      count: row.count
    }));

    // 3. Class-wise Enquiries
    const classWiseEnquiriesResult = await Enquiry.aggregate([
      { $match: enquiryQuery },
      { $group: { _id: '$studentClass', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const classWiseEnquiries = classWiseEnquiriesResult.map(row => ({
      class: row._id,
      count: row.count
    }));

    // 4. Review Statistics
    const reviewStatsResult = await Review.aggregate([
      { $match: reviewQuery },
      { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
    ]);

    const reviewStats = reviewStatsResult.map(row => ({
      approvalStatus: row._id,
      total: row.count
    }));

    // 5. Average Rating & Total Ratings
    const avgRatingResult = await Review.aggregate([
      { 
        $match: { 
          schoolId, 
          approvalStatus: 'approved' 
        } 
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const avgRatingData = avgRatingResult[0] || { avgRating: 0, totalRatings: 0 };

    // 6. Rating Distribution
    const ratingDistributionResult = await Review.aggregate([
      { 
        $match: { 
          schoolId, 
          approvalStatus: 'approved' 
        } 
      },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const ratingDistribution = ratingDistributionResult.map(row => ({
      rating: row._id,
      count: row.count
    }));

    // 7. Conversion Funnel
    const totalEnquiries = await Enquiry.countDocuments(enquiryQuery);
    
    const contactedEnquiries = await Enquiry.countDocuments({
      ...enquiryQuery,
      status: { $in: ['In Progress', 'Converted', 'Closed'] }
    });

    const convertedEnquiries = await Enquiry.countDocuments({
      ...enquiryQuery,
      status: 'Converted'
    });

    // 8. Recent Activities
    const recentEnquiries = await Enquiry.find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentReviews = await Review.find({ schoolId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Prepare response
    const analytics = {
      enquiryStats: {
        byStatus: enquiryStats,
        total: totalEnquiries,
        trend: enquiryTrend,
        byClass: classWiseEnquiries,
      },
      conversionFunnel: {
        totalEnquiries,
        contacted: contactedEnquiries,
        converted: convertedEnquiries,
        contactRate: totalEnquiries > 0 
          ? ((contactedEnquiries / totalEnquiries) * 100).toFixed(1)
          : '0',
        conversionRate: totalEnquiries > 0
          ? ((convertedEnquiries / totalEnquiries) * 100).toFixed(1)
          : '0',
      },
      reviewStats: {
        byStatus: reviewStats,
        averageRating: avgRatingData.avgRating ? avgRatingData.avgRating.toFixed(1) : '0',
        totalRatings: avgRatingData.totalRatings,
        distribution: ratingDistribution,
      },
      recentActivity: {
        enquiries: recentEnquiries.map(e => ({
          id: e._id,
          studentName: e.studentName,
          studentClass: e.studentClass,
          status: e.status,
          createdAt: e.createdAt,
        })),
        reviews: recentReviews.map((r: any) => ({
          id: r._id,
          studentName: r.userId?.name || 'Unknown',
          rating: r.rating,
          approvalStatus: r.approvalStatus,
          createdAt: r.createdAt,
        })),
      },
      dateRange: {
        start: startDate || trendStartDate.toISOString(),
        end: endDate || trendEndDate.toISOString(),
      },
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics: ' + error.message },
      { status: 500 }
    );
  }
}
