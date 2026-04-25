import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectToDatabase();

  const blog = await Blog.findOneAndUpdate(
    { slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();

  if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

  // Fetch related posts (same category, excluding current)
  const related = await Blog.find({ status: 'published', category: blog.category, slug: { $ne: slug } })
    .select('title slug excerpt coverImage category readTime publishedAt')
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  return NextResponse.json({ blog, related });
}
