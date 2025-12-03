import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const featuredTestimonials = await db.select()
      .from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(asc(testimonials.displayOrder), desc(testimonials.createdAt))
      .limit(6);

    return NextResponse.json(featuredTestimonials, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}