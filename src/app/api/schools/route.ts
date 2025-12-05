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

// Haversine distance in KM between two lat/lng pairs
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

      // For single school, select all columns
      const school = await db.select()
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);

      if (school.length === 0) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      // Increment profile views asynchronously (don't wait for it)
      db.update(schools)
        .set({ profileViews: (school[0].profileViews || 0) + 1 })
        .where(eq(schools.id, schoolId))
        .catch(err => console.error('Failed to increment profile views:', err));

      // Return school data immediately
      return NextResponse.json(school[0], { status: 200 });
    }

    // Get multiple schools by IDs (for comparison feature)
    const ids = searchParams.get('ids');
    if (ids) {
      const schoolIds = ids.split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      
      if (schoolIds.length === 0) {
        return NextResponse.json({ 
          error: "Valid IDs are required",
          code: "INVALID_IDS" 
        }, { status: 400 });
      }

      if (schoolIds.length > 10) {
        return NextResponse.json({ 
          error: "Maximum 10 schools can be fetched at once",
          code: "TOO_MANY_IDS" 
        }, { status: 400 });
      }

      // Fetch all schools in one query using OR conditions (all columns for comparison)
      const orConditions = schoolIds.map(id => eq(schools.id, id));
      const results = await db.select()
        .from(schools)
        .where(or(...orConditions));

      // Sort results to match the order of requested IDs
      const sortedResults = schoolIds.map(id => 
        results.find(school => school.id === id)
      ).filter(Boolean); // Remove any null/undefined entries

      return NextResponse.json(sortedResults, { status: 200 });
    }

    // List schools with filters - SELECT ONLY ESSENTIAL COLUMNS to prevent memory issues
    const city = searchParams.get('city');
    const board = searchParams.get('board');
    const feesMinParam = searchParams.get('feesMin');
    const feesMaxParam = searchParams.get('feesMax');
    const schoolType = searchParams.get('schoolType');
    const facilitiesParam = searchParams.get('facilities');
    const featuredParam = searchParams.get('featured');
    const search = searchParams.get('search');
    const minRating = searchParams.get('minRating');
    const gender = searchParams.get('gender');
    const language = searchParams.get('language');
    const stream = searchParams.get('stream');
    const k12Level = searchParams.get('k12Level');
    const isInternational = searchParams.get('isInternational');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sortField = searchParams.get('sort') ?? 'rating';
    const sortOrder = searchParams.get('order') ?? 'desc';

    // Distance params
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radiusKm') ?? searchParams.get('radius');
    const latNum = latParam ? parseFloat(latParam) : null;
    const lngNum = lngParam ? parseFloat(lngParam) : null;
    const radiusKm = radiusParam ? parseFloat(radiusParam) : null;

    // Build where conditions
    const conditions = [] as any[];

    if (city) {
      conditions.push(like(schools.city, `%${city}%`));
    }

    if (board && board !== 'all') {
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

    if (schoolType && schoolType !== 'all') {
      const validTypes = ['Day School', 'Boarding', 'Both'];
      if (validTypes.includes(schoolType)) {
        conditions.push(eq(schools.schoolType, schoolType));
      }
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(gte(schools.rating, rating));
      }
    }

    if (gender && gender !== 'all') {
      const validGenders = ['Boys', 'Girls', 'Co-ed'];
      if (validGenders.includes(gender)) {
        conditions.push(eq(schools.gender, gender));
      }
    }

    if (language) {
      conditions.push(like(schools.languages, `%${language}%`));
    }

    if (stream) {
      conditions.push(like(schools.streamsAvailable, `%${stream}%`));
    }

    if (k12Level && k12Level !== 'all') {
      conditions.push(eq(schools.k12Level, k12Level));
    }

    if (isInternational === 'true') {
      conditions.push(eq(schools.isInternational, true));
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

    // Build query - SELECT ONLY ESSENTIAL COLUMNS FOR LISTING
    let query = db.select({
      id: schools.id,
      name: schools.name,
      logo: schools.logo,
      bannerImage: schools.bannerImage,
      address: schools.address,
      city: schools.city,
      state: schools.state,
      pincode: schools.pincode,
      board: schools.board,
      medium: schools.medium,
      classesOffered: schools.classesOffered,
      establishmentYear: schools.establishmentYear,
      studentTeacherRatio: schools.studentTeacherRatio,
      schoolType: schools.schoolType,
      feesMin: schools.feesMin,
      feesMax: schools.feesMax,
      facilities: schools.facilities,
      description: schools.description,
      contactEmail: schools.contactEmail,
      contactPhone: schools.contactPhone,
      rating: schools.rating,
      reviewCount: schools.reviewCount,
      profileViews: schools.profileViews,
      featured: schools.featured,
      latitude: schools.latitude,
      longitude: schools.longitude,
      createdAt: schools.createdAt,
      updatedAt: schools.updatedAt,
      // Add null placeholders for gallery to maintain type compatibility
      gallery: sql<string[] | null>`NULL`.as('gallery')
    }).from(schools);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting (SQL-level for native columns)
    const sortColumn = {
      'name': schools.name,
      'rating': schools.rating,
      'feesMin': schools.feesMin,
      'feesMax': schools.feesMax,
      'establishmentYear': schools.establishmentYear
    }[sortField] ?? schools.rating;

    if (sortField !== 'distance') {
      if (sortOrder === 'asc') {
        query = query.orderBy(asc(sortColumn));
      } else {
        query = query.orderBy(desc(sortColumn));
      }
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

    // Distance filtering (in-memory)
    let finalResults = filteredResults;
    const hasDistanceParams = latNum !== null && !isNaN(latNum!) && lngNum !== null && !isNaN(lngNum!) && radiusKm !== null && !isNaN(radiusKm!);
    if (hasDistanceParams) {
      const within = filteredResults
        .filter((s: any) => s.latitude !== null && s.longitude !== null && s.latitude !== undefined && s.longitude !== undefined)
        .map((s: any) => ({
          school: s,
          distance: haversineKm(latNum as number, lngNum as number, s.latitude as number, s.longitude as number)
        }))
        .filter(item => item.distance <= (radiusKm as number));

      // Sort by distance if requested
      if (sortField === 'distance') {
        within.sort((a, b) => a.distance - b.distance);
      }

      finalResults = within.map(item => item.school);
    }

    return NextResponse.json(finalResults, { status: 200 });

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