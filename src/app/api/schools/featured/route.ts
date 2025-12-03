import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 20);

    // Get top-rated schools sorted by rating
    const topRatedSchools = await db.select()
      .from(schools)
      .orderBy(desc(schools.rating))
      .limit(limit);

    return NextResponse.json(topRatedSchools, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}