import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, Enquiry, School } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { getAllSchools } from '@/lib/schoolsHelper';

async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string };
    
    return decoded;
  } catch (error) {
    return null;
  }
}

interface RecommendationScore {
  schoolId: number;
  score: number;
  reasons: string[];
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const decoded = await verifyToken(request);
    
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ 
        error: 'Authentication required. Students only.',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '8'), 20);

    // Get user data
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's enquiries to understand preferences
    const userEnquiries = await Enquiry.find({ studentId: decoded.userId }).lean();

    const enquiredSchoolIds = userEnquiries.map(e => e.schoolId);

    // Get user's saved schools
    const savedSchoolIds = (user.savedSchools as number[]) || [];

    // Get all schools that match user's city preference
    const allSchools = await getAllSchools({
      isPublic: true,
      limit: 1000
    });

    // Calculate recommendation scores
    const scores: RecommendationScore[] = [];

    for (const school of allSchools) {
      // Skip if already enquired or saved
      if (enquiredSchoolIds.includes(school.id) || savedSchoolIds.includes(school.id)) {
        continue;
      }

      let score = 0;
      const reasons: string[] = [];

      // 1. Location match (highest priority) - 40 points
      if (user.city && school.city?.toLowerCase() === user.city.toLowerCase()) {
        score += 40;
        reasons.push(`Located in your city (${user.city})`);
      } else if (user.city && school.city) {
        // Partial match (state/region)
        score += 10;
      }

      // 2. Rating (30 points max)
      if (school.rating && school.rating > 0) {
        score += school.rating * 6; // 5-star school gets 30 points
        if (school.rating >= 4.5) {
          reasons.push(`Highly rated (${school.rating.toFixed(1)} ⭐)`);
        } else if (school.rating >= 4.0) {
          reasons.push(`Well-rated (${school.rating.toFixed(1)} ⭐)`);
        }
      }

      // 3. Review count indicates popularity (10 points max)
      if (school.reviewCount && school.reviewCount > 0) {
        score += Math.min(school.reviewCount / 2, 10);
        if (school.reviewCount >= 10) {
          reasons.push(`Popular choice (${school.reviewCount} reviews)`);
        }
      }

      // 4. Profile views (popularity) - 10 points max
      if (school.profileViews && school.profileViews > 0) {
        score += Math.min(school.profileViews / 100, 10);
      }

      // 5. Featured schools - 5 points
      if (school.featured) {
        score += 5;
        reasons.push('Featured school');
      }

      // 6. Board preference based on user's enquiry history
      if (enquiredSchoolIds.length > 0) {
        const enquiredSchools = allSchools.filter(s => enquiredSchoolIds.includes(s.id));
        const preferredBoards = enquiredSchools.map(s => s.board);
        
        if (preferredBoards.includes(school.board)) {
          score += 15;
          reasons.push(`Matches your preference (${school.board})`);
        }
      }

      // 7. Affordable fees (if fees info available) - 10 points
      if (school.feesMin && school.feesMax) {
        const avgFees = (school.feesMin + school.feesMax) / 2;
        
        // Lower fees get higher scores (relative scoring)
        if (avgFees < 100000) {
          score += 10;
          reasons.push('Budget-friendly');
        } else if (avgFees < 200000) {
          score += 5;
        }
      }

      // 8. Facilities (comprehensive schools) - 10 points
      if (school.facilities && Array.isArray(school.facilities)) {
        const facilityCount = school.facilities.length;
        if (facilityCount >= 10) {
          score += 10;
          reasons.push(`Excellent facilities (${facilityCount}+)`);
        } else if (facilityCount >= 5) {
          score += 5;
          reasons.push('Good facilities');
        }
      }

      // 9. Has virtual tour - 5 points
      if (school.virtualTourUrl || (school.virtualTourVideos && (school.virtualTourVideos as string[]).length > 0)) {
        score += 5;
        reasons.push('Virtual tour available');
      }

      // 10. Complete profile - 5 points
      if (school.description && (school.logo || school.logoUrl) && school.contactNumber && school.email) {
        score += 5;
      }

      // 11. International school (if user showed interest)
      if (school.isInternational) {
        score += 5;
        reasons.push('International curriculum');
      }

      // Add randomness factor (0-5 points) to diversify recommendations
      score += Math.random() * 5;

      // Only include schools with reasonable scores
      if (score > 10 && reasons.length > 0) {
        scores.push({
          schoolId: school.id,
          score,
          reasons
        });
      }
    }

    // Sort by score and get top recommendations
    scores.sort((a, b) => b.score - a.score);
    const topRecommendations = scores.slice(0, limit);

    // Get full school details
    const recommendedSchools = allSchools
      .filter(s => topRecommendations.some(r => r.schoolId === s.id))
      .map(school => {
        const scoreData = topRecommendations.find(r => r.schoolId === school.id);
        return {
          ...school,
          recommendationScore: scoreData?.score,
          recommendationReasons: scoreData?.reasons
        };
      })
      .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));

    return NextResponse.json({
      recommendations: recommendedSchools,
      metadata: {
        userCity: user.city,
        totalAnalyzed: allSchools.length,
        totalRecommendations: recommendedSchools.length,
        basedOn: {
          enquiries: userEnquiries.length,
          savedSchools: savedSchoolIds.length,
          location: !!user.city
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate recommendations: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
