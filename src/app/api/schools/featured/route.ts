import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    let featuredSchools = await School.find({ rating: { $gt: 0 }, isPublic: { $ne: false } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();

    // Fallback: if no rated schools exist, return any public schools sorted by views
    if (featuredSchools.length === 0) {
      featuredSchools = await School.find({ isPublic: { $ne: false } })
        .sort({ profileViews: -1 })
        .limit(limit)
        .lean();
    }

    const formattedSchools = featuredSchools.map(school => ({
      ...school,
      id: school.id,
    }));

    return NextResponse.json(formattedSchools, { status: 200 });
  } catch (error) {
    console.error('Featured schools error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured schools' },
      { status: 500 }
    );
  }
}
