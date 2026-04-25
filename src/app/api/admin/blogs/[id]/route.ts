import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Blog } from '@/lib/models';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

function verifyAdmin(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(auth.substring(7), process.env.JWT_SECRET || 'your-secret-key') as { role: string };
    if (decoded.role !== 'super_admin') return null;
    return decoded;
  } catch { return null; }
}

function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const blog = await Blog.findById(id).lean();
  if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  return NextResponse.json(blog);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();
  const update: any = { ...body };

  // Auto-update readTime when content changes
  if (body.content) update.readTime = estimateReadTime(body.content);

  // Set publishedAt when publishing for first time
  if (body.status === 'published') {
    const existing = await Blog.findById(id).select('publishedAt status').lean();
    if (existing && !existing.publishedAt) update.publishedAt = new Date();
  }

  delete update._id;

  const blog = await Blog.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  return NextResponse.json(blog);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  await Blog.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Blog deleted' });
}
