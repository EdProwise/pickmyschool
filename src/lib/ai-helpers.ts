import { getAllSchools } from '@/db/schoolsHelper';

export interface SchoolSearchCriteria {
  city?: string;
  board?: string;
  feesMin?: number;
  feesMax?: number;
  schoolType?: string;
  facilities?: string[];
  grade?: string;
  medium?: string;
}

export interface SearchedSchool {
  id: number;
  name: string;
  board: string;
  city: string;
  feesMin: number | null;
  feesMax: number | null;
  rating: number;
  facilities?: string[];
  schoolType?: string;
  medium?: string;
  logo?: string;
}

/**
 * Search schools based on AI-extracted criteria
 */
export async function searchSchools(criteria: SchoolSearchCriteria): Promise<SearchedSchool[]> {
  try {
    // Get schools using helper function with filters
    let schools = await getAllSchools({
      city: criteria.city,
      board: criteria.board,
      limit: 20,
      offset: 0,
    });

    // Apply additional filters
    if (criteria.schoolType) {
      schools = schools.filter(s => 
        s.schoolType?.toLowerCase() === criteria.schoolType?.toLowerCase()
      );
    }

    if (criteria.feesMax !== undefined) {
      schools = schools.filter(s => 
        s.feesMin !== null && s.feesMin !== undefined && s.feesMin <= criteria.feesMax!
      );
    }

    if (criteria.feesMin !== undefined) {
      schools = schools.filter(s => 
        s.feesMax !== null && s.feesMax !== undefined && s.feesMax >= criteria.feesMin!
      );
    }

    if (criteria.medium) {
      schools = schools.filter(s =>
        s.medium?.toLowerCase().includes(criteria.medium!.toLowerCase()) ||
        s.languages?.toLowerCase().includes(criteria.medium!.toLowerCase())
      );
    }

    // Filter by facilities
    if (criteria.facilities && criteria.facilities.length > 0) {
      schools = schools.filter(school => {
        // Check facilities array
        if (school.facilities && Array.isArray(school.facilities)) {
          return criteria.facilities!.some(facility =>
            school.facilities.some((f: string) =>
              f && facility && (f.toLowerCase().includes(facility.toLowerCase()) ||
              facility.toLowerCase().includes(f.toLowerCase()))
            )
          );
        }
        
        // Check boolean facility flags
        const facilityChecks: Record<string, boolean> = {
          'library': school.hasLibrary === true,
          'computer lab': school.hasComputerLab === true,
          'sports': school.hasPlayground === true || school.sportsFacilities !== null,
          'swimming pool': school.hasSwimmingPool === true,
          'hostel': school.hasHostel === true,
          'transport': school.hasTransport === true,
          'cafeteria': school.hasCafeteria === true,
          'auditorium': school.hasAuditorium === true,
        };

        return criteria.facilities!.some(facility => 
          facilityChecks[facility.toLowerCase()] === true
        );
      });
    }

    // Sort by rating
    schools.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Map to SearchedSchool format
    return schools.slice(0, 10).map(school => ({
      id: school.id,
      name: school.name,
      board: school.board,
      city: school.city,
      feesMin: school.feesMin,
      feesMax: school.feesMax,
      rating: school.rating || 0,
      facilities: school.facilities,
      schoolType: school.schoolType,
      medium: school.medium || school.languages,
      logo: school.logo || school.logoUrl,
    }));
  } catch (error) {
    console.error('Search schools error:', error);
    return [];
  }
}

/**
 * Get school details by ID for comparison
 */
export async function getSchoolDetails(schoolId: number) {
  const { getSchool } = await import('@/db/schoolsHelper');
  return await getSchool(schoolId);
}

/**
 * Compare two or more schools
 */
export async function compareSchools(schoolIds: number[]) {
  const schools = await Promise.all(
    schoolIds.map(id => getSchoolDetails(id))
  );
  
  return schools.filter(Boolean);
}

/**
 * Get cities with school counts
 */
export async function getCitiesWithSchools() {
  const { getAllSchools } = await import('@/db/schoolsHelper');
  const schools = await getAllSchools({ limit: 1000 });
  
  const cityMap = new Map<string, number>();
  schools.forEach(school => {
    if (school.city) {
      cityMap.set(school.city, (cityMap.get(school.city) || 0) + 1);
    }
  });
  
  return Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}
