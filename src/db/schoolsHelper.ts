import connectToDatabase from '@/lib/mongodb';
import { School, Review } from '@/lib/models';

/**
 * Update school stats (rating and reviewCount) in schools collection based on reviews collection
 */
export async function updateSchoolStats(schoolId: number) {
  await connectToDatabase();
  
  const stats = await Review.aggregate([
    { $match: { schoolId, approvalStatus: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const averageRating = stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(2)) : 0;
  const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

  await School.findOneAndUpdate(
    { id: schoolId },
    {
      rating: averageRating,
      reviewCount: totalReviews,
    }
  );
  
  return { averageRating, totalReviews };
}

/**
 * Helper function to get a single school
 */
export async function getSchool(id: number) {
  await connectToDatabase();
  const school = await School.findOne({ id }).lean();
  return school ? { ...school, id: school.id } : null;
}

/**
 * Get all schools with filters
 */
export async function getAllSchools(filters?: {
  city?: string | string[];
  board?: string;
  featured?: boolean;
  isPublic?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}) {
  await connectToDatabase();
  
  const query: any = {};
  
  if (filters?.city) {
    if (Array.isArray(filters.city)) {
      if (filters.city.length > 0) {
        query.city = { $in: filters.city };
      }
    } else {
      query.city = filters.city;
    }
  }
  
  if (filters?.board) {
    query.board = filters.board;
  }
  
  if (filters?.featured !== undefined) {
    query.featured = filters.featured;
  }
  
  if (filters?.isPublic !== undefined) {
    query.isPublic = filters.isPublic;
  }
  
  if (filters?.searchQuery) {
    query.$or = [
      { name: { $regex: filters.searchQuery, $options: 'i' } },
      { city: { $regex: filters.searchQuery, $options: 'i' } },
      { address: { $regex: filters.searchQuery, $options: 'i' } }
    ];
  }
  
  let mongooseQuery = School.find(query);
  
  if (filters?.offset) {
    mongooseQuery = mongooseQuery.skip(filters.offset);
  }
  
  if (filters?.limit) {
    mongooseQuery = mongooseQuery.limit(filters.limit);
  }
  
  const schools = await mongooseQuery.lean();
  return schools.map(s => ({ ...s, id: s.id }));
}

/**
 * Create a new school entry
 */
export async function createSchool(data: any) {
  await connectToDatabase();
  
  // Find highest current ID to increment
  const lastSchool = await School.findOne().sort({ id: -1 });
  const nextId = (lastSchool?.id || 0) + 1;
  
  const school = await School.create({
    ...data,
    id: nextId,
  });
  
  return { ...school.toObject(), id: school.id };
}

/**
 * Update school data
 */
export async function updateSchool(id: number, data: any) {
  await connectToDatabase();
  const updated = await School.findOneAndUpdate(
    { id },
    { $set: data },
    { new: true }
  ).lean();
  
  return updated ? { ...updated, id: updated.id } : null;
}

/**
 * Delete school
 */
export async function deleteSchool(id: number) {
  await connectToDatabase();
  await School.findOneAndDelete({ id });
}

/**
 * Get school count
 */
export async function getSchoolCount(filters?: {
  city?: string;
  board?: string;
  searchQuery?: string;
}) {
  await connectToDatabase();
  const query: any = {};
  
  if (filters?.city) {
    query.city = filters.city;
  }
  
  if (filters?.board) {
    query.board = filters.board;
  }
  
  if (filters?.searchQuery) {
    query.$or = [
      { name: { $regex: filters.searchQuery, $options: 'i' } },
      { city: { $regex: filters.searchQuery, $options: 'i' } },
      { address: { $regex: filters.searchQuery, $options: 'i' } }
    ];
  }
  
  return await School.countDocuments(query);
}

/**
 * Get schools with pagination (alias for getAllSchools)
 */
export async function getSchools(filters?: {
  city?: string;
  board?: string;
  featured?: boolean;
  isPublic?: boolean;
  search?: string;
}, options?: {
  limit?: number;
  offset?: number;
}) {
  return getAllSchools({
    ...filters,
    searchQuery: filters?.search,
    limit: options?.limit,
    offset: options?.offset,
  });
}
