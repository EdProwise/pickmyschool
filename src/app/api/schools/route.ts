import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School, User } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { getSchool, getAllSchools, createSchool, updateSchool } from '@/lib/schoolsHelper';

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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
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
    
    const id = searchParams.get('id');
    if (id) {
      const schoolId = parseInt(id);
      if (isNaN(schoolId)) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const school = await getSchool(schoolId);

      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      await connectToDatabase();
      School.findOneAndUpdate(
        { id: schoolId },
        { $inc: { profileViews: 1 } }
      ).catch(err => console.error('Failed to increment profile views:', err));

      return NextResponse.json(school, { status: 200 });
    }

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

      const results = await Promise.all(schoolIds.map(id => getSchool(id)));
      const sortedResults = results.filter(Boolean);

      return NextResponse.json(sortedResults, { status: 200 });
    }

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
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusKm = searchParams.get('radiusKm');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50;
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const sort = searchParams.get('sort') || 'rating';
    const order = searchParams.get('order') || 'desc';

    const hasInMemoryFilters = feesMinParam || feesMaxParam || schoolType || minRating || gender || language || stream || k12Level || isInternational || facilitiesParam || (lat && lng && radiusKm) || sort === 'distance' || sort === 'rating' || sort === 'feesMin' || sort === 'feesMax' || sort === 'profileViews';
    
    const results = await getAllSchools({
      city: city ? (city.includes(',') ? city.split(',').map(c => c.trim()) : city) : undefined,
      board: (board && board !== 'all') ? board : undefined,
      featured: featuredParam === 'true' ? true : undefined,
      isPublic: true,
      searchQuery: search || undefined,
      limit: hasInMemoryFilters ? 1000 : limit,
      offset: hasInMemoryFilters ? 0 : offset
    });

    let filteredResults = results;
    
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      if (!isNaN(userLat) && !isNaN(userLng)) {
        filteredResults = filteredResults.map(school => {
          if (school.latitude && school.longitude) {
            return {
              ...school,
              distance: haversineKm(userLat, userLng, school.latitude, school.longitude)
            };
          }
          return school;
        });

        if (radiusKm) {
          const maxRadius = parseFloat(radiusKm);
          if (!isNaN(maxRadius) && maxRadius > 0) {
            filteredResults = filteredResults.filter(s => (s as any).distance !== undefined && (s as any).distance <= maxRadius);
          }
        }
      }
    }

    if (feesMinParam) {
      const feesMin = parseInt(feesMinParam);
      if (!isNaN(feesMin)) {
        filteredResults = filteredResults.filter(s => (s.feesMin || 0) >= feesMin);
      }
    }

    if (feesMaxParam) {
      const feesMax = parseInt(feesMaxParam);
      if (!isNaN(feesMax)) {
        filteredResults = filteredResults.filter(s => (s.feesMax || 0) <= feesMax);
      }
    }

    if (schoolType && schoolType !== 'all') {
      filteredResults = filteredResults.filter(s => s.schoolType === schoolType);
    }

    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        filteredResults = filteredResults.filter(s => (s.rating || 0) >= rating);
      }
    }

    if (gender && gender !== 'all') {
      filteredResults = filteredResults.filter(s => s.gender === gender);
    }

    if (language && language !== 'all') {
      filteredResults = filteredResults.filter(s => 
        s.languages && s.languages.toLowerCase().includes(language.toLowerCase())
      );
    }

    if (stream && stream !== 'all') {
      filteredResults = filteredResults.filter(s => 
        s.streamsAvailable && s.streamsAvailable.toLowerCase().includes(stream.toLowerCase())
      );
    }

    if (k12Level && k12Level !== 'all') {
      filteredResults = filteredResults.filter(s => 
        s.k12Level && s.k12Level.toLowerCase().includes(k12Level.toLowerCase())
      );
    }

    if (isInternational === 'true') {
      filteredResults = filteredResults.filter(s => s.isInternational === true);
    }

    if (facilitiesParam) {
      const requestedFacilities = facilitiesParam.split(',').map(f => f.trim().toLowerCase());
      filteredResults = filteredResults.filter(school => {
        const arrayFacilities = Array.isArray(school.facilities) 
          ? (school.facilities as string[]).map(f => f.toLowerCase()) 
          : [];

        return requestedFacilities.every(rf => {
          if (arrayFacilities.some(sf => sf.includes(rf))) return true;
          if (rf === 'library' && school.hasLibrary) return true;
          if (rf === 'computer lab' && school.hasComputerLab) return true;
          if (rf === 'science lab' && (school.hasPhysicsLab || school.hasChemistryLab || school.hasBiologyLab)) return true;
          if (rf === 'sports complex' && (school.sportsFacilities || school.hasPlayground)) return true;
          if (rf === 'swimming pool' && school.hasSwimmingPool) return true;
          if (rf === 'transport' && school.hasTransport) return true;
          if (rf === 'hostel' && school.hasHostel) return true;
          if (rf === 'playground' && school.hasPlayground) return true;
          if (rf === 'auditorium' && school.hasAuditorium) return true;
          if (rf === 'smart classrooms' && school.hasSmartBoard) return true;
          if (rf === 'cafeteria' && school.hasCafeteria) return true;
          return false;
        });
      });
    }

    filteredResults.sort((a, b) => {
      let valA: any, valB: any;

      switch (sort) {
        case 'rating':
          valA = a.rating || 0;
          valB = b.rating || 0;
          break;
        case 'feesMin':
          valA = a.feesMin || 0;
          valB = b.feesMin || 0;
          break;
        case 'feesMax':
          valA = a.feesMax || 0;
          valB = b.feesMax || 0;
          break;
        case 'name':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          break;
        case 'establishmentYear':
          valA = a.establishmentYear || 9999;
          valB = b.establishmentYear || 9999;
          break;
        case 'profileViews':
          valA = a.profileViews || 0;
          valB = b.profileViews || 0;
          break;
        case 'distance':
          valA = (a as any).distance ?? Infinity;
          valB = (b as any).distance ?? Infinity;
          break;
        default:
          valA = a.rating || 0;
          valB = b.rating || 0;
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    if (hasInMemoryFilters) {
      filteredResults = filteredResults.slice(offset, offset + limit);
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

    const validBoards = ['CBSE', 'ICSE', 'IB', 'State Board'];
    if (!validBoards.includes(body.board)) {
      return NextResponse.json({ 
        error: "Board must be one of: CBSE, ICSE, IB, State Board",
        code: "INVALID_BOARD" 
      }, { status: 400 });
    }

    const newSchool = await createSchool({
      userId: decoded.userId,
      ...body
    });

    await connectToDatabase();
    await User.findByIdAndUpdate(decoded.userId, { schoolId: newSchool.id });

    return NextResponse.json({
      school: newSchool,
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

    const existingSchool = await getSchool(schoolId);

    if (!existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    if (decoded.schoolId !== schoolId) {
      return NextResponse.json({ 
        error: 'You are not authorized to update this school',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const body = await request.json();

    if (body.board) {
      const validBoards = ['CBSE', 'ICSE', 'IB', 'State Board'];
      if (!validBoards.includes(body.board)) {
        return NextResponse.json({ 
          error: "Board must be one of: CBSE, ICSE, IB, State Board",
          code: "INVALID_BOARD" 
        }, { status: 400 });
      }
    }

    const updated = await updateSchool(schoolId, body);

    return NextResponse.json({
      school: updated,
      message: "School updated successfully"
    }, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
