import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { SiteSettings } from '@/lib/models';
import { getSchool } from '@/lib/schoolsHelper';

export async function GET() {
  try {
    await connectToDatabase();
    
    const settings = await SiteSettings.findOne().lean();

    if (!settings || !settings.spotlightSchoolId) {
      return NextResponse.json({ school: null }, { status: 200 });
    }

    const schoolId = settings.spotlightSchoolId;
    const school = await getSchool(schoolId);

    if (!school) {
      return NextResponse.json({ school: null }, { status: 200 });
    }

    return NextResponse.json({ school }, { status: 200 });
  } catch (error) {
    console.error('Spotlight school error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spotlight school' },
      { status: 500 }
    );
  }
}
