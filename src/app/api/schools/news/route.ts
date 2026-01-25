import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { News, User } from '@/lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const query: any = {
      schoolId: parseInt(schoolId),
      isPublished: true
    };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    let schoolNews = await News.find(query)
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(limit ? parseInt(limit) : 100)
      .lean();

    return NextResponse.json(schoolNews.map(n => ({ ...n, id: n._id })), { status: 200 });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'school' || !user.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      content,
      category,
      publishDate,
      link,
      images,
      pdf,
      video,
      isPublished,
      featured
    } = body;

    if (!title || !content || !category || !publishDate) {
      return NextResponse.json({ error: 'Title, content, category, and publish date are required' }, { status: 400 });
    }
    
    const newNews = await News.create({
      schoolId: user.schoolId,
      title,
      content,
      category,
      publishDate,
      link: link || null,
      images: images || [],
      pdf: pdf || null,
      video: video || null,
      isPublished: isPublished !== undefined ? isPublished : true,
      featured: featured || false,
    });

    return NextResponse.json({ ...newNews.toObject(), id: newNews._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'school' || !user.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { id: _id, ...payload } = body;

    const existingNews = await News.findById(id);
    
    if (!existingNews || existingNews.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'News not found or unauthorized' }, { status: 404 });
    }

    const updatedNews = await News.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );

    return NextResponse.json({ ...updatedNews!.toObject(), id: updatedNews!._id }, { status: 200 });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'school' || !user.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    const existingNews = await News.findById(id);
    
    if (!existingNews || existingNews.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'News not found or unauthorized' }, { status: 404 });
    }

    await News.findByIdAndDelete(id);

    return NextResponse.json({ message: 'News deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
