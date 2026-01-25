import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School, Chat, Result, StudentAchievement } from '@/lib/models';
import { extractFiltersFromQuery, buildSystemPrompt, generateAIResponse } from '@/lib/gemini';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { message, conversationId } = body;

    console.log('Chat API request:', { message, conversationId });

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const userId = getUserIdFromToken(request);

    const filters = extractFiltersFromQuery(message);
    console.log('Extracted filters:', JSON.stringify(filters));

    const query: any = {};

    if (filters.board && filters.board.length > 0) {
      query.board = { $in: filters.board.map(b => new RegExp(b, 'i')) };
    }

    if (filters.city && filters.city.length > 0) {
      query.city = { $in: filters.city.map(c => new RegExp(c, 'i')) };
    }

    if (filters.schoolType && filters.schoolType.length > 0) {
      query.schoolType = { $in: filters.schoolType.map(t => new RegExp(t, 'i')) };
    }

    if (filters.medium && filters.medium.length > 0) {
      query.medium = { $in: filters.medium.map(m => new RegExp(m, 'i')) };
    }

    if (filters.schoolName) {
      query.name = new RegExp(filters.schoolName, 'i');
    }

    let relevantSchools;
    
    if (Object.keys(query).length > 0) {
      relevantSchools = await School.find(query).limit(3).lean();
    } else {
      relevantSchools = await School.find({})
        .sort({ featured: -1, rating: -1 })
        .limit(3)
        .lean();
    }

    console.log(`Found ${relevantSchools.length} relevant schools`);

    const schoolIds = relevantSchools.map(s => s.id);
    let schoolResults: any[] = [];
    let achievements: any[] = [];

    if (schoolIds.length > 0) {
      [schoolResults, achievements] = await Promise.all([
        Result.find({ schoolId: { $in: schoolIds } }).lean(),
        StudentAchievement.find({ schoolId: { $in: schoolIds } }).lean()
      ]);
    }

    const schoolsWithAllData = relevantSchools.map(school => ({
      ...school,
      examResults: schoolResults.filter(r => r.schoolId === school.id),
      studentAchievements: achievements.filter(a => a.schoolId === school.id),
    }));

    const systemPrompt = buildSystemPrompt(schoolsWithAllData);
    const aiResponse = await generateAIResponse(systemPrompt, message);

    const mentionedSchoolIds: number[] = [];
    relevantSchools.forEach(school => {
      if (aiResponse.includes(school.name)) {
        mentionedSchoolIds.push(school.id);
      }
    });

    return NextResponse.json({
      message: aiResponse,
      schools: mentionedSchoolIds.length > 0 
        ? relevantSchools.filter(s => mentionedSchoolIds.includes(s.id)).slice(0, 5)
        : [],
      conversationId: conversationId || `conv_${Date.now()}_${userId || 'anon'}`,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    let history;
    if (conversationId) {
      history = await Chat.find({
        userId: userId,
        conversationId: conversationId
      }).sort({ createdAt: 1 }).lean();
    } else {
      history = await Chat.find({ userId: userId })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();
    }

    return NextResponse.json({ history: history.map(h => ({ ...h, id: h._id })) });
  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
