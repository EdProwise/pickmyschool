import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    const featuredSchools = await School.find({ featured: true })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();

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
