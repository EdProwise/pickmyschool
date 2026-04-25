import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/lib/models';

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const featured = searchParams.get('featured');
  const q = searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const query: any = { status: 'published' };
  if (category && category !== 'all') query.category = category;
  if (tag) query.tags = tag;
  if (featured === 'true') query.featured = true;
  if (q) query.$or = [
    { title: { $regex: q, $options: 'i' } },
    { excerpt: { $regex: q, $options: 'i' } },
    { tags: { $regex: q, $options: 'i' } },
  ];

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .select('title slug excerpt coverImage author category tags readTime views featured publishedAt createdAt')
      .sort({ featured: -1, publishedAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  // Get all categories with counts
  const categories = await Blog.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return NextResponse.json({ blogs, total, categories, hasMore: offset + blogs.length < total });
}
