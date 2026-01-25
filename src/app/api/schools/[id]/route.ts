import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { getSchool, updateSchool, deleteSchool } from '@/lib/schoolsHelper';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      { $inc: { profileViews: 1 }, updatedAt: new Date().toISOString() }
    ).catch(err => console.error('Failed to increment profile views:', err));

    return NextResponse.json(school, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolId = parseInt(id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    const existingSchool = await getSchool(schoolId);
    const isCreating = !existingSchool;

    if (isCreating && (!body.name || !body.city || !body.board)) {
      return NextResponse.json(
        { 
          error: 'Required fields missing: name, city, and board are required for creating a school', 
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      );
    }

    if (body.galleryImages !== undefined && !Array.isArray(body.galleryImages)) {
      return NextResponse.json(
        { error: 'galleryImages must be an array', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (body.awards !== undefined && !Array.isArray(body.awards)) {
      return NextResponse.json(
        { error: 'awards must be an array', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (body.feesStructure !== undefined && typeof body.feesStructure !== 'object') {
      return NextResponse.json(
        { error: 'feesStructure must be an object', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (body.facilities !== undefined && !Array.isArray(body.facilities)) {
      return NextResponse.json(
        { error: 'facilities must be an array', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (body.gallery !== undefined && !Array.isArray(body.gallery)) {
      return NextResponse.json(
        { error: 'gallery must be an array', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (body.facilityImages !== undefined && typeof body.facilityImages !== 'object') {
      return NextResponse.json(
        { error: 'facilityImages must be an object', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (body.virtualTourVideos !== undefined) {
      let vids: string[] = [];
      if (Array.isArray(body.virtualTourVideos)) {
        vids = body.virtualTourVideos.filter((u: any) => typeof u === 'string' && u.trim() !== '').map((u: string) => u.trim());
      } else if (typeof body.virtualTourVideos === 'string') {
        const s = body.virtualTourVideos.trim();
        if (s) vids = [s];
      } else {
        return NextResponse.json(
          { error: 'virtualTourVideos must be a string or an array of strings', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      body.virtualTourVideos = vids;
    }

    const updated = await updateSchool(schoolId, body);

    return NextResponse.json({
      school: updated,
      message: isCreating ? "School created successfully" : "School updated successfully"
    }, { status: isCreating ? 201 : 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    if (decoded.role !== 'school' && decoded.role !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Not authorized to delete schools',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    const schoolId = parseInt(id);
    if (isNaN(schoolId)) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const existingSchool = await getSchool(schoolId);

    if (!existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    if (decoded.role === 'school' && decoded.schoolId !== schoolId) {
      return NextResponse.json({ 
        error: 'You are not authorized to delete this school',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    await deleteSchool(schoolId);

    return NextResponse.json({
      message: "School deleted successfully",
      schoolId: schoolId
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
