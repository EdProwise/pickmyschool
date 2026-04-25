import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { generateSlug, ensureUniqueSlug } from '@/lib/schoolsHelper';

function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { role: string };
    if (decoded.role !== 'super_admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  // Find all schools without a slug
  const schools = await School.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] })
    .select('id name slug')
    .lean();

  if (schools.length === 0) {
    return NextResponse.json({ message: 'All schools already have slugs.', migrated: 0 });
  }

  const results: { id: number; name: string; slug: string }[] = [];
  const errors: { id: number; name: string; error: string }[] = [];

  for (const school of schools) {
    try {
      const baseSlug = generateSlug(school.name || `school-${school.id}`);
      const slug = await ensureUniqueSlug(baseSlug, school.id);
      await School.findOneAndUpdate({ id: school.id }, { $set: { slug } });
      results.push({ id: school.id, name: school.name, slug });
    } catch (err) {
      errors.push({ id: school.id, name: school.name, error: String(err) });
    }
  }

  return NextResponse.json({
    message: `Migration complete. ${results.length} schools updated, ${errors.length} failed.`,
    migrated: results.length,
    failed: errors.length,
    results,
    errors,
  });
}
