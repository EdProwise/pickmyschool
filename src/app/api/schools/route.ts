import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schools, users } from '@/db/schema';
import { eq, like, gte, lte, and, or, desc, asc, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; role: string; schoolId?: number };
    
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get single school by ID
    const id = searchParams.get('id');
    if (id) {
      const schoolId = parseInt(id);
      if (isNaN(schoolId)) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const school = await db.select()
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);

      if (school.length === 0) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      // Increment profile views
      await db.update(schools)
        .set({ profileViews: sql`${schools.profileViews} + 1` })
        .where(eq(schools.id, schoolId));

      // Fetch updated school with incremented views
      const updatedSchool = await db.select()
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);

      return NextResponse.json(updatedSchool[0], { status: 200 });
    }

    // List schools with filters
    const city = searchParams.get('city');
    const board = searchParams.get('board');
    const feesMinParam = searchParams.get('feesMin');
    const feesMaxParam = searchParams.get('feesMax');
    const schoolType = searchParams.get('schoolType');
    const facilitiesParam = searchParams.get('facilities');
    const featuredParam = searchParams.get('featured');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sortField = searchParams.get('sort') ?? 'rating';
    const sortOrder = searchParams.get('order') ?? 'desc';

    // Build where conditions
    const conditions = [];

    if (city) {
      conditions.push(like(schools.city, `%${city}%`));
    }

    if (board) {
      const validBoards = ['CBSE', 'ICSE', 'IB', 'State Board'];
      if (validBoards.includes(board)) {
        conditions.push(eq(schools.board, board));
      }
    }

    if (feesMinParam) {
      const feesMin = parseInt(feesMinParam);
      if (!isNaN(feesMin)) {
        conditions.push(gte(schools.feesMin, feesMin));
      }
    }

    if (feesMaxParam) {
      const feesMax = parseInt(feesMaxParam);
      if (!isNaN(feesMax)) {
        conditions.push(lte(schools.feesMax, feesMax));
      }
    }

    if (schoolType) {
      const validTypes = ['Day School', 'Boarding', 'Both'];
      if (validTypes.includes(schoolType)) {
        conditions.push(eq(schools.schoolType, schoolType));
      }
    }

    if (featuredParam === 'true') {
      conditions.push(eq(schools.featured, true));
    }

    if (search) {
      conditions.push(
        or(
          like(schools.name, `%${search}%`),
          like(schools.city, `%${search}%`),
          like(schools.description, `%${search}%`)
        )
      );
    }

    // Build query
    let query = db.select().from(schools);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      'name': schools.name,
      'rating': schools.rating,
      'feesMin': schools.feesMin,
      'feesMax': schools.feesMax,
      'establishmentYear': schools.establishmentYear
    }[sortField] ?? schools.rating;

    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Filter by facilities if provided (in-memory filtering for JSON array)
    let filteredResults = results;
    if (facilitiesParam) {
      const requestedFacilities = facilitiesParam.split(',').map(f => f.trim().toLowerCase());
      filteredResults = results.filter(school => {
        if (!school.facilities || !Array.isArray(school.facilities)) {
          return false;
        }
        const schoolFacilities = (school.facilities as string[]).map(f => f.toLowerCase());
        return requestedFacilities.every(rf => 
          schoolFacilities.some(sf => sf.includes(rf))
        );
      });
    }

    return NextResponse.json(filteredResults, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    if (decoded.role !== 'school') {
      return NextResponse.json({ 
        error: 'Only school admins can create schools',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ 
        error: "School name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!body.city || typeof body.city !== 'string') {
      return NextResponse.json({ 
        error: "City is required",
        code: "MISSING_CITY" 
      }, { status: 400 });
    }

    if (!body.board || typeof body.board !== 'string') {
      return NextResponse.json({ 
        error: "Board is required",
        code: "MISSING_BOARD" 
      }, { status: 400 });
    }

    // Validate board value
    const validBoards = ['CBSE', 'ICSE', 'IB', 'State Board'];
    if (!validBoards.includes(body.board)) {
      return NextResponse.json({ 
        error: "Board must be one of: CBSE, ICSE, IB, State Board",
        code: "INVALID_BOARD" 
      }, { status: 400 });
    }

    // Validate fees range
    if (body.feesMin !== undefined && body.feesMax !== undefined) {
      const feesMin = parseInt(body.feesMin);
      const feesMax = parseInt(body.feesMax);
      if (!isNaN(feesMin) && !isNaN(feesMax) && feesMin >= feesMax) {
        return NextResponse.json({ 
          error: "feesMin must be less than feesMax",
          code: "INVALID_FEES_RANGE" 
        }, { status: 400 });
      }
    }

    // Prepare insert data with sanitization and defaults
    const insertData: any = {
      name: body.name.trim(),
      city: body.city.trim(),
      board: body.board,
      logo: body.logo || null,
      bannerImage: body.bannerImage || null,
      address: body.address ? body.address.trim() : null,
      state: body.state ? body.state.trim() : null,
      pincode: body.pincode ? body.pincode.trim() : null,
      medium: body.medium ? body.medium.trim() : null,
      classesOffered: body.classesOffered ? body.classesOffered.trim() : null,
      establishmentYear: body.establishmentYear ? parseInt(body.establishmentYear) : null,
      studentTeacherRatio: body.studentTeacherRatio ? body.studentTeacherRatio.trim() : null,
      schoolType: body.schoolType || null,
      feesMin: body.feesMin ? parseInt(body.feesMin) : null,
      feesMax: body.feesMax ? parseInt(body.feesMax) : null,
      facilities: body.facilities || null,
      description: body.description ? body.description.trim() : null,
      gallery: body.gallery || null,
      contactEmail: body.contactEmail ? body.contactEmail.trim().toLowerCase() : null,
      contactPhone: body.contactPhone ? body.contactPhone.trim() : null,
      rating: body.rating !== undefined ? parseFloat(body.rating) : 0,
      reviewCount: body.reviewCount !== undefined ? parseInt(body.reviewCount) : 0,
      profileViews: body.profileViews !== undefined ? parseInt(body.profileViews) : 0,
      featured: body.featured !== undefined ? body.featured : false,
      latitude: body.latitude !== undefined ? parseFloat(body.latitude) : null,
      longitude: body.longitude !== undefined ? parseFloat(body.longitude) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newSchool = await db.insert(schools)
      .values(insertData)
      .returning();

    // Update user's schoolId
    await db.update(users)
      .set({ schoolId: newSchool[0].id })
      .where(eq(users.id, decoded.userId));

    return NextResponse.json({
      school: newSchool[0],
      message: "School created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    if (decoded.role !== 'school') {
      return NextResponse.json({ 
        error: 'Only school admins can update schools',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const schoolId = parseInt(id);

    // Check if school exists and user owns it
    const existingSchool = await db.select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (existingSchool.length === 0) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Verify ownership
    if (decoded.schoolId !== schoolId) {
      return NextResponse.json({ 
        error: 'You are not authorized to update this school',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();

    // Validate board if provided
    if (body.board) {
      const validBoards = ['CBSE', 'ICSE', 'IB', 'State Board'];
      if (!validBoards.includes(body.board)) {
        return NextResponse.json({ 
          error: "Board must be one of: CBSE, ICSE, IB, State Board",
          code: "INVALID_BOARD" 
        }, { status: 400 });
      }
    }

    // Validate fees range if both provided
    if (body.feesMin !== undefined && body.feesMax !== undefined) {
      const feesMin = parseInt(body.feesMin);
      const feesMax = parseInt(body.feesMax);
      if (!isNaN(feesMin) && !isNaN(feesMax) && feesMin >= feesMax) {
        return NextResponse.json({ 
          error: "feesMin must be less than feesMax",
          code: "INVALID_FEES_RANGE" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Add fields to update if provided
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage;
    if (body.address !== undefined) updateData.address = body.address.trim();
    if (body.city !== undefined) updateData.city = body.city.trim();
    if (body.state !== undefined) updateData.state = body.state.trim();
    if (body.pincode !== undefined) updateData.pincode = body.pincode.trim();
    if (body.board !== undefined) updateData.board = body.board;
    if (body.medium !== undefined) updateData.medium = body.medium.trim();
    if (body.classesOffered !== undefined) updateData.classesOffered = body.classesOffered.trim();
    if (body.establishmentYear !== undefined) updateData.establishmentYear = parseInt(body.establishmentYear);
    if (body.studentTeacherRatio !== undefined) updateData.studentTeacherRatio = body.studentTeacherRatio.trim();
    if (body.schoolType !== undefined) updateData.schoolType = body.schoolType;
    if (body.feesMin !== undefined) updateData.feesMin = parseInt(body.feesMin);
    if (body.feesMax !== undefined) updateData.feesMax = parseInt(body.feesMax);
    if (body.facilities !== undefined) updateData.facilities = body.facilities;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.gallery !== undefined) updateData.gallery = body.gallery;
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail.trim().toLowerCase();
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone.trim();
    if (body.rating !== undefined) updateData.rating = parseFloat(body.rating);
    if (body.reviewCount !== undefined) updateData.reviewCount = parseInt(body.reviewCount);
    if (body.profileViews !== undefined) updateData.profileViews = parseInt(body.profileViews);
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.latitude !== undefined) updateData.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) updateData.longitude = parseFloat(body.longitude);

    const updated = await db.update(schools)
      .set(updateData)
      .where(eq(schools.id, schoolId))
      .returning();

    return NextResponse.json({
      school: updated[0],
      message: "School updated successfully"
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}