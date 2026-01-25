import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    
    const result = await School.aggregate([
      { $match: { city: { $ne: null, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const cityStats = result.map(row => ({
      name: row._id,
      count: row.count
    }));

    return NextResponse.json(cityStats, { status: 200 });
  } catch (error) {
    console.error('Error fetching city stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
