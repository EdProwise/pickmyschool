import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const featuredTestimonials = await Testimonial.find({ featured: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(6)
      .lean();

      return NextResponse.json(
        featuredTestimonials.map((testimonial) => ({
          ...testimonial,
          id: testimonial._id,
        })),
        { status: 200 }
      );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
