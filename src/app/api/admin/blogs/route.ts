import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/lib/models';
import jwt from 'jsonwebtoken';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.substring(7), process.env.JWT_SECRET || 'your-secret-key') as { role: string };
    if (decoded.role !== 'super_admin') return null;
    return decoded;
  } catch { return null; }
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectToDatabase();
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const q = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') ?? '50');
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const query: any = {};
  if (status && status !== 'all') query.status = status;
  if (q) query.$or = [{ title: { $regex: q, $options: 'i' } }, { category: { $regex: q, $options: 'i' } }];

  const [blogs, total] = await Promise.all([
    Blog.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
    Blog.countDocuments(query),
  ]);

  return NextResponse.json({ blogs, total });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectToDatabase();

  const body = await request.json();
  const { title, excerpt, content, coverImage, author, authorAvatar, category, tags, status, featured,
    metaTitle, metaDescription, metaKeywords, customSlug } = body;

  if (!title || !excerpt || !content) {
    return NextResponse.json({ error: 'title, excerpt and content are required' }, { status: 400 });
  }

  let slug = customSlug ? generateSlug(customSlug) : generateSlug(title);
  // Ensure uniqueness
  const existing = await Blog.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now()}`;

  const blog = await Blog.create({
    title,
    slug,
    excerpt,
    content,
    coverImage,
    author: author || 'PickMySchool Team',
    authorAvatar,
    category: category || 'General',
    tags: Array.isArray(tags) ? tags : [],
    status: status || 'draft',
    featured: Boolean(featured),
    metaTitle: metaTitle || title,
    metaDescription: metaDescription || excerpt,
    metaKeywords: Array.isArray(metaKeywords) ? metaKeywords : [],
    readTime: estimateReadTime(content),
    views: 0,
    publishedAt: status === 'published' ? new Date() : undefined,
  });

  return NextResponse.json(blog, { status: 201 });
}
