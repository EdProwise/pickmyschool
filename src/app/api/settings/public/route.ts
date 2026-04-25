import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/site-settings';

// Public endpoint – returns only the Google Maps API key (no auth required)
export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({
      googleMapsApiKey: settings.googleMapsApiKey,
    });
  } catch (error) {
    console.error('GET public settings error:', error);
    return NextResponse.json({ googleMapsApiKey: '' }, { status: 200 });
  }
}
