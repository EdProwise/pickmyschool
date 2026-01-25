import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { School } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    
    const rawData = await School.find({}, {
      languages: 1,
      schoolType: 1,
      board: 1,
      gender: 1,
      k12Level: 1,
      streamsAvailable: 1
    }).lean();

    const languagesMap: Record<string, number> = {};
    const schoolTypesMap: Record<string, number> = {};
    const boardsMap: Record<string, number> = {};
    const gendersMap: Record<string, number> = {};
    const k12LevelsMap: Record<string, number> = {};
    const streamsMap: Record<string, number> = {};

    rawData.forEach(row => {
      if (row.languages) {
        row.languages.split(',').forEach((lang: string) => {
          const trimmed = lang.trim();
          if (trimmed) {
            languagesMap[trimmed] = (languagesMap[trimmed] || 0) + 1;
          }
        });
      }
      
      if (row.schoolType) {
        const trimmed = row.schoolType.trim();
        if (trimmed) {
          schoolTypesMap[trimmed] = (schoolTypesMap[trimmed] || 0) + 1;
        }
      }
      
      if (row.board) {
        const trimmed = row.board.trim();
        if (trimmed) {
          boardsMap[trimmed] = (boardsMap[trimmed] || 0) + 1;
        }
      }
      
      if (row.gender) {
        const trimmed = row.gender.trim();
        if (trimmed) {
          gendersMap[trimmed] = (gendersMap[trimmed] || 0) + 1;
        }
      }
      
      if (row.k12Level) {
        row.k12Level.split(',').forEach((level: string) => {
          const trimmed = level.trim();
          if (trimmed) {
            k12LevelsMap[trimmed] = (k12LevelsMap[trimmed] || 0) + 1;
          }
        });
      }
      
      if (row.streamsAvailable) {
        row.streamsAvailable.split(',').forEach((stream: string) => {
          const trimmed = stream.trim();
          if (trimmed) {
            streamsMap[trimmed] = (streamsMap[trimmed] || 0) + 1;
          }
        });
      }
    });

    const formatMap = (map: Record<string, number>) => 
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      languages: formatMap(languagesMap),
      schoolTypes: formatMap(schoolTypesMap),
      boards: formatMap(boardsMap),
      genders: formatMap(gendersMap),
      k12Levels: formatMap(k12LevelsMap),
      streams: formatMap(streamsMap),
    });
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 });
  }
}
