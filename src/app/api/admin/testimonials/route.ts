import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  adminId: number;
  role: string;
}

function verifyAdminToken(request: NextRequest): { valid: boolean; adminId?: number; role?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.role !== 'super_admin') {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true, adminId: decoded.adminId, role: decoded.role };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    
    if (!authResult.valid) {
      if (authResult.error === 'Insufficient permissions') {
        return NextResponse.json({ 
          error: 'Access denied. Super admin role required.',
          code: 'FORBIDDEN' 
        }, { status: 403 });
      }
      return NextResponse.json({ 
        error: authResult.error || 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { parentName, location, rating, testimonialText, avatarUrl, featured, displayOrder } = body;

    if (!parentName || !parentName.trim()) {
      return NextResponse.json({ 
        error: 'Parent name is required',
        code: 'MISSING_PARENT_NAME' 
      }, { status: 400 });
    }

    if (!location || !location.trim()) {
      return NextResponse.json({ 
        error: 'Location is required',
        code: 'MISSING_LOCATION' 
      }, { status: 400 });
    }

    if (!rating) {
      return NextResponse.json({ 
        error: 'Rating is required',
        code: 'MISSING_RATING' 
      }, { status: 400 });
    }

    if (!testimonialText || !testimonialText.trim()) {
      return NextResponse.json({ 
        error: 'Testimonial text is required',
        code: 'MISSING_TESTIMONIAL_TEXT' 
      }, { status: 400 });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 1 and 5',
        code: 'INVALID_RATING' 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newTestimonial = await db.insert(testimonials)
      .values({
        parentName: parentName.trim(),
        location: location.trim(),
        rating: ratingNum,
        testimonialText: testimonialText.trim(),
        avatarUrl: avatarUrl?.trim() || null,
        featured: featured ?? false,
        displayOrder: displayOrder ? parseInt(displayOrder) : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newTestimonial[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAdminToken(request);
    
    if (!authResult.valid) {
      if (authResult.error === 'Insufficient permissions') {
        return NextResponse.json({ 
          error: 'Access denied. Super admin role required.',
          code: 'FORBIDDEN' 
        }, { status: 403 });
      }
      return NextResponse.json({ 
        error: authResult.error || 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const featuredFilter = searchParams.get('featured');

    let query = db.select().from(testimonials);

    if (featuredFilter !== null) {
      const isFeatured = featuredFilter === 'true' || featuredFilter === '1';
      query = query.where(eq(testimonials.featured, isFeatured));
    }

    const results = await query
      .orderBy(asc(testimonials.displayOrder), desc(testimonials.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}