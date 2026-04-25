import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export interface SiteSettings {
  geminiApiKey: string;
  gmailUser: string;
  gmailAppPassword: string;
  googleMapsApiKey: string;
}

let cached: SiteSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cached && now - cacheTime < CACHE_TTL) {
    return cached;
  }

  await connectToDatabase();
  const col = mongoose.connection.db!.collection('sitesettings');
  const doc = await col.findOne({});

  // Auto-seed from env vars if DB fields are missing (one-time migration)
  const seedUpdate: Record<string, string> = {};
  if (!doc?.geminiApiKey && process.env.GEMINI_API_KEY) {
    seedUpdate.geminiApiKey = process.env.GEMINI_API_KEY;
  }
  if (!doc?.gmailUser && process.env.GMAIL_USER) {
    seedUpdate.gmailUser = process.env.GMAIL_USER;
  }
  if (!doc?.gmailAppPassword && process.env.GMAIL_APP_PASSWORD) {
    seedUpdate.gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  }
  if (!doc?.googleMapsApiKey && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    seedUpdate.googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }

  if (Object.keys(seedUpdate).length > 0) {
    await col.updateOne({}, { $set: seedUpdate }, { upsert: true });
    console.log('[site-settings] Auto-seeded from env:', Object.keys(seedUpdate));
  }

  const fresh = doc
    ? { ...doc, ...seedUpdate }
    : seedUpdate;

  cached = {
    geminiApiKey: (fresh.geminiApiKey as string) || '',
    gmailUser: (fresh.gmailUser as string) || '',
    gmailAppPassword: (fresh.gmailAppPassword as string) || '',
    googleMapsApiKey: (fresh.googleMapsApiKey as string) || '',
  };
  cacheTime = now;

  return cached;
}

// Call this after settings are updated to force a fresh fetch next time
export function invalidateSettingsCache() {
  cached = null;
  cacheTime = 0;
}
