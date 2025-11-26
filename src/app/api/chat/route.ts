import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chats, schools, users } from '@/db/schema';
import { eq, like, gte, lte, and, desc, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface ParsedCriteria {
  city?: string;
  board?: string;
  schoolType?: string;
  feesMin?: number;
  feesMax?: number;
  facilities?: string[];
}

interface MessageObject {
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestedSchools?: number[];
}

function parseMessage(message: string): ParsedCriteria {
  const criteria: ParsedCriteria = {};
  const messageLower = message.toLowerCase();

  // Parse city
  const cityMatch = messageLower.match(/(delhi|mumbai|bangalore|pune|chennai|hyderabad|kolkata)/i);
  if (cityMatch) {
    criteria.city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1);
  }

  // Parse board
  const boardMatch = messageLower.match(/(cbse|icse|ib|state board)/i);
  if (boardMatch) {
    let board = boardMatch[1].toUpperCase();
    if (board === 'STATE BOARD') {
      board = 'State Board';
    }
    criteria.board = board;
  }

  // Parse school type
  const schoolTypeMatch = messageLower.match(/(day school|boarding)/i);
  if (schoolTypeMatch) {
    if (schoolTypeMatch[1].toLowerCase() === 'boarding') {
      criteria.schoolType = 'Boarding';
    } else if (schoolTypeMatch[1].toLowerCase() === 'day school') {
      criteria.schoolType = 'Day School';
    }
  }

  // Parse fees under/below/less than
  const feesUnderMatch = messageLower.match(/(?:under|below|less than|maximum|max)\s*(?:rs\.?|₹)?\s*(\d+)/i);
  if (feesUnderMatch) {
    criteria.feesMax = parseInt(feesUnderMatch[1]);
  }

  // Parse fees above/more than
  const feesAboveMatch = messageLower.match(/(?:above|more than|minimum|min)\s*(?:rs\.?|₹)?\s*(\d+)/i);
  if (feesAboveMatch) {
    criteria.feesMin = parseInt(feesAboveMatch[1]);
  }

  // Parse facilities
  const facilityKeywords = [
    { pattern: /library/i, name: 'Library' },
    { pattern: /sports/i, name: 'Sports Complex' },
    { pattern: /swimming pool/i, name: 'Swimming Pool' },
    { pattern: /hostel/i, name: 'Hostel' },
    { pattern: /laboratory|lab/i, name: 'Science Labs' },
    { pattern: /computer/i, name: 'Computer Lab' },
    { pattern: /playground/i, name: 'Playground' },
    { pattern: /auditorium/i, name: 'Auditorium' },
    { pattern: /cafeteria|canteen/i, name: 'Cafeteria' },
    { pattern: /transport|bus/i, name: 'Transport' },
  ];

  const detectedFacilities: string[] = [];
  for (const facility of facilityKeywords) {
    if (facility.pattern.test(messageLower)) {
      detectedFacilities.push(facility.name);
    }
  }

  if (detectedFacilities.length > 0) {
    criteria.facilities = detectedFacilities;
  }

  return criteria;
}

function generateAIResponse(criteria: ParsedCriteria, matchedSchools: any[]): string {
  if (matchedSchools.length === 0) {
    let suggestions = "I couldn't find schools matching all your criteria. ";
    const relaxSuggestions: string[] = [];

    if (criteria.feesMax) {
      relaxSuggestions.push(`try increasing your budget above ₹${criteria.feesMax.toLocaleString()}`);
    }
    if (criteria.city) {
      relaxSuggestions.push(`consider nearby cities`);
    }
    if (criteria.facilities && criteria.facilities.length > 0) {
      relaxSuggestions.push(`look for schools with fewer facility requirements`);
    }

    if (relaxSuggestions.length > 0) {
      suggestions += `Here are some suggestions: ${relaxSuggestions.join(', ')}.`;
    }

    return suggestions;
  }

  let response = `I found ${matchedSchools.length} school${matchedSchools.length > 1 ? 's' : ''} matching your criteria`;

  const criteriaDetails: string[] = [];
  if (criteria.board) criteriaDetails.push(criteria.board);
  if (criteria.city) criteriaDetails.push(`in ${criteria.city}`);
  if (criteria.schoolType) criteriaDetails.push(criteria.schoolType);
  if (criteria.feesMax) criteriaDetails.push(`under ₹${criteria.feesMax.toLocaleString()}`);
  if (criteria.feesMin) criteriaDetails.push(`above ₹${criteria.feesMin.toLocaleString()}`);
  if (criteria.facilities && criteria.facilities.length > 0) {
    criteriaDetails.push(`with ${criteria.facilities.join(', ')}`);
  }

  if (criteriaDetails.length > 0) {
    response += ` (${criteriaDetails.join(' ')})`;
  }

  response += ': ';

  const topSchools = matchedSchools.slice(0, 3);
  const schoolNames = topSchools.map(s => s.name).join(', ');
  response += schoolNames;

  if (matchedSchools.length > 3) {
    response += `, and ${matchedSchools.length - 3} more`;
  }

  response += '. Here are the details:';

  return response;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    // 2. Parse request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // 3. Parse user message to extract search criteria
    const criteria = parseMessage(message);

    // 4. Build dynamic query to schools table
    const conditions: any[] = [];

    if (criteria.city) {
      conditions.push(eq(schools.city, criteria.city));
    }

    if (criteria.board) {
      conditions.push(eq(schools.board, criteria.board));
    }

    if (criteria.schoolType) {
      conditions.push(eq(schools.schoolType, criteria.schoolType));
    }

    if (criteria.feesMax !== undefined) {
      conditions.push(lte(schools.feesMin, criteria.feesMax));
    }

    if (criteria.feesMin !== undefined) {
      conditions.push(gte(schools.feesMax, criteria.feesMin));
    }

    // 5. Execute query with filters
    let query = db.select().from(schools);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    let matchedSchools = await query.orderBy(desc(schools.rating)).limit(10);

    // Filter by facilities in memory (since facilities is JSON array)
    if (criteria.facilities && criteria.facilities.length > 0) {
      matchedSchools = matchedSchools.filter(school => {
        if (!school.facilities || !Array.isArray(school.facilities)) {
          return false;
        }
        return criteria.facilities!.every(facility =>
          school.facilities.some((f: string) =>
            f.toLowerCase().includes(facility.toLowerCase()) ||
            facility.toLowerCase().includes(f.toLowerCase())
          )
        );
      });
    }

    // 6. Generate AI response
    const aiResponseText = generateAIResponse(criteria, matchedSchools);

    // 7. Create message objects
    const now = new Date().toISOString();
    const userMessage: MessageObject = {
      sender: 'user',
      content: message,
      timestamp: now,
      suggestedSchools: [],
    };

    const aiMessage: MessageObject = {
      sender: 'ai',
      content: aiResponseText,
      timestamp: now,
      suggestedSchools: matchedSchools.map(s => s.id),
    };

    // 8. Update or create chat record
    const existingChat = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .limit(1);

    let chatId: number;

    if (existingChat.length > 0) {
      // Update existing chat
      const currentMessages = existingChat[0].messages as MessageObject[] || [];
      const updatedMessages = [...currentMessages, userMessage, aiMessage];

      await db
        .update(chats)
        .set({
          messages: updatedMessages,
          lastMessageAt: now,
          updatedAt: now,
        })
        .where(eq(chats.id, existingChat[0].id));

      chatId = existingChat[0].id;
    } else {
      // Create new chat
      const newChat = await db
        .insert(chats)
        .values({
          userId,
          role: userRole,
          messages: [userMessage, aiMessage],
          lastMessageAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      chatId = newChat[0].id;
    }

    // 9. Return response
    return NextResponse.json(
      {
        response: aiResponseText,
        schools: matchedSchools,
        chatId,
        message: 'Message saved to chat history',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}