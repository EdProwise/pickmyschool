import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Testimonial } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  adminId: string;
  role: string;
}

function verifyAdminToken(request: NextRequest): { valid: boolean; adminId?: string; role?: string; error?: string } {
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

    await connectToDatabase();

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

    const newTestimonial = await Testimonial.create({
      parentName: parentName.trim(),
      location: location.trim(),
      rating: ratingNum,
      testimonialText: testimonialText.trim(),
      avatarUrl: avatarUrl?.trim() || null,
      featured: featured ?? false,
      displayOrder: displayOrder ? parseInt(displayOrder) : null,
    });

    return NextResponse.json({ ...newTestimonial.toObject(), id: newTestimonial._id }, { status: 201 });

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

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const featuredFilter = searchParams.get('featured');

    const query: any = {};

    if (featuredFilter !== null) {
      const isFeatured = featuredFilter === 'true' || featuredFilter === '1';
      query.featured = isFeatured;
    }

    const results = await Testimonial.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return NextResponse.json(results.map(r => ({ ...r, id: r._id })), { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
