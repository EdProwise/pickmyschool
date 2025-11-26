import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { siteSettings, schools } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get site settings to find spotlight school ID
    const settings = await db.select()
      .from(siteSettings)
      .limit(1);

    // Check if settings exist
    if (settings.length === 0 || !settings[0].spotlightSchoolId) {
      return NextResponse.json(
        { 
          error: 'No spotlight school configured',
          code: 'NO_SPOTLIGHT_SCHOOL'
        },
        { status: 404 }
      );
    }

    const spotlightSchoolId = settings[0].spotlightSchoolId;

    // Get the spotlight school details
    const school = await db.select()
      .from(schools)
      .where(eq(schools.id, spotlightSchoolId))
      .limit(1);

    // Check if school exists
    if (school.length === 0) {
      return NextResponse.json(
        { 
          error: 'Spotlight school not found',
          code: 'NO_SPOTLIGHT_SCHOOL'
        },
        { status: 404 }
      );
    }

    // Return the school object
    return NextResponse.json({ school: school[0] }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}