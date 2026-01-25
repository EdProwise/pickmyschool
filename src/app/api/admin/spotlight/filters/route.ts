import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  adminId: string;
  role: string;
  email: string;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Not authorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const cities = await School.aggregate([
      { $match: { city: { $ne: null, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    const boards = await School.aggregate([
      { $match: { board: { $ne: null, $ne: '' } } },
      { $group: { _id: '$board', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    return NextResponse.json({
      cities,
      boards
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching spotlight filters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
