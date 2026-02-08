import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SchoolFilter {
  board?: string[];
  city?: string[];
  feesMin?: number;
  feesMax?: number;
  schoolType?: string[];
  medium?: string[];
  facilities?: string[];
  k12Level?: string[];
  schoolName?: string;
}

export async function generateAIResponse(systemPrompt: string, userMessage: string): Promise<string> {
  const modelName = 'gemini-2.5-flash-lite';

  try {
    console.log(`Attempting Gemini response with model: ${modelName}`);
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`
    });
    
    if (response && response.text) {
      console.log(`Success with model: ${modelName}`);
      return response.text;
    }
    throw new Error('No response text from Gemini');
<<<<<<< HEAD
    } catch (error: any) {
      console.error(`Gemini model ${modelName} failed:`, error.message || error);
      
      if (error.message?.includes('leaked') || (error.status === 403 && error.message?.includes('API key'))) {
        throw new Error('The AI service is currently unavailable due to an API configuration issue (Leaked Key). Please contact support.');
      }
      
      throw error;
    }
=======
  } catch (error: any) {
    console.error(`Gemini model ${modelName} failed:`, error.message || error);
    throw error;
  }
>>>>>>> 57f4c9ba3fdfa8f3203905d4450beb49ed79846d
}

export function extractFiltersFromQuery(query: string): SchoolFilter {
  const filters: SchoolFilter = {};
  const lowerQuery = query.toLowerCase();

  const quotedMatch = query.match(/"([^"]+)"|'([^']+)'/);
  if (quotedMatch) {
    filters.schoolName = quotedMatch[1] || quotedMatch[2];
  } else {
    const schoolKeywords = ['school', 'academy', 'international', 'convent', 'public', 'vidyalaya'];
    const words = query.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (schoolKeywords.includes(words[i].toLowerCase()) && i > 0) {
        filters.schoolName = words.slice(Math.max(0, i-2), i+1).join(' ');
        break;
      }
    }
  }

  const boards = ['cbse', 'icse', 'ib', 'igcse', 'state'];
  filters.board = boards.filter(b => lowerQuery.includes(b));

  if (lowerQuery.includes('day school') || lowerQuery.includes('day-school')) {
    filters.schoolType = ['Day School'];
  } else if (lowerQuery.includes('boarding') || lowerQuery.includes('residential')) {
    filters.schoolType = ['Boarding'];
  }

  const mediums = ['english', 'hindi', 'gujarati'];
  filters.medium = mediums.filter(m => lowerQuery.includes(m));

  const facilityKeywords: Record<string, string[]> = {
    'sports': ['sports', 'playground', 'swimming', 'fitness', 'football', 'cricket', 'basketball'],
    'transport': ['transport', 'bus', 'van'],
    'hostel': ['hostel', 'boarding', 'residential'],
    'library': ['library', 'books'],
    'computer lab': ['computer', 'lab', 'it lab'],
    'wifi': ['wifi', 'wi-fi', 'internet'],
    'smart board': ['smart board', 'digital classroom'],
    'ac': ['ac', 'air condition'],
    'cctv': ['cctv', 'camera', 'security'],
    'medical': ['medical', 'infirmary', 'doctor', 'nurse'],
    'cafeteria': ['cafeteria', 'canteen', 'mess', 'food']
  };

  const detectedFacilities: string[] = [];
  Object.entries(facilityKeywords).forEach(([facility, keywords]) => {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      detectedFacilities.push(facility);
    }
  });
  if (detectedFacilities.length > 0) {
    filters.facilities = detectedFacilities;
  }

  const feesMatch = lowerQuery.match(/(?:under|below|less than|₹|rs\.?)\s*(\d+(?:,\d+)*(?:k|lakh)?)/i);
  if (feesMatch) {
    let amount = feesMatch[1].replace(/,/g, '');
    if (amount.endsWith('k')) {
      filters.feesMax = parseInt(amount.slice(0, -1)) * 1000;
    } else if (amount.includes('lakh')) {
      filters.feesMax = parseInt(amount.replace('lakh', '')) * 100000;
    } else {
      filters.feesMax = parseInt(amount);
    }
  }

  const classMatch = lowerQuery.match(/class\s+(\d+|[ivx]+)/i);
  if (classMatch) {
    filters.k12Level = [classMatch[0]];
  }

  return filters;
}

export function buildSystemPrompt(schoolsData: any[]): string {
  const formattedSchools = schoolsData.map(school => {
    const facilities = [
      school.hasLibrary && 'Library',
      school.hasComputerLab && 'Comp Lab',
      school.hasPhysicsLab && 'Phys Lab',
      school.hasChemistryLab && 'Chem Lab',
      school.hasBiologyLab && 'Bio Lab',
      school.hasMathsLab && 'Math Lab',
      school.hasAuditorium && 'Auditorium',
      school.hasPlayground && 'Playground',
      school.hasSwimmingPool && 'Pool',
      school.hasMusicDance && 'Music/Dance',
      school.hasSmartBoard && 'Smart Bd',
      school.hasWifi && 'Wifi',
      school.hasCctv && 'CCTV',
      school.hasAcClassrooms && 'AC',
      school.hasTransport && 'Transport',
      school.hasMedicalRoom && 'Medical',
      school.hasHostel && 'Hostel',
      school.hasCafeteria && 'Cafeteria',
      school.sportsFacilities
    ].filter(Boolean).join(', ');

    let feesInfo = `₹${school.feesMin?.toLocaleString() || '?'} - ₹${school.feesMax?.toLocaleString() || '?'}`;
    if (school.feesStructure) {
      try {
        const struct = typeof school.feesStructure === 'string' ? JSON.parse(school.feesStructure) : school.feesStructure;
        if (Array.isArray(struct)) {
          feesInfo += ' | ' + struct.map((f: any) => `${f.label || f.name}: ₹${f.amount?.toLocaleString()}`).join(', ');
        } else if (typeof struct === 'object') {
          feesInfo += ' | ' + Object.entries(struct).map(([k, v]) => `${k}: ₹${(v as number)?.toLocaleString()}`).join(', ');
        }
      } catch (e) {}
    }

    const resultsInfo = school.examResults?.length > 0 
      ? school.examResults.map((r: any) => `${r.year} ${r.examType}: ${r.passPercentage}% Pass`).join('; ')
      : '';

    const achievementsInfo = school.studentAchievements?.length > 0
      ? school.studentAchievements.slice(0, 3).map((a: any) => `${a.studentName}: ${a.achievement}`).join('; ')
      : '';

    return `
ID:${school.id} | ${school.name}
${school.schoolType}, ${school.board}, ${school.medium}, ${school.gender}
Est:${school.establishmentYear} | Classes:${school.k12Level} | Streams:${school.streamsAvailable}
Views:${school.profileViews || 0} | Rating:${school.rating}/5
Contact: ${school.city}, ${school.state} | Ph:${school.contactNumber || '?'} | WA:${school.whatsappNumber || '?'} | Email:${school.email || '?'}
Map: ${school.googleMapUrl || '?'}
Fees: ${feesInfo}
Res: ${resultsInfo || 'N/A'}
Ach: ${achievementsInfo || 'N/A'}
Fac: ${facilities}
Media: Imgs(${school.logoUrl ? 1 : 0} + ${school.bannerImageUrl ? 1 : 0} + others), Vids(${school.virtualTourVideos ? 'Yes' : 'No'})
About: ${school.aboutSchool?.substring(0, 200) || 'N/A'}${school.aboutSchool?.length > 200 ? '...' : ''}
    `.trim();
  }).join('\n\n');

  return `You are PickMySchool AI Counselor. Help parents find schools using this data:

${formattedSchools}

Rules:
1. Be concise, warm, professional.
2. Use ONLY provided data.
3. Provide Fees, Results, and Contact (Phone/Map) when asked.
4. Mention more media is available on profile.
5. Bold names and key stats.
6. Use bullets for features.`;
}
