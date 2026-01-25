import connectToDatabase from '@/lib/mongodb';
import { School, Review, ISchool } from '@/lib/models';
import mongoose from 'mongoose';

export async function updateSchoolStats(schoolId: number) {
  await connectToDatabase();
  
  const approvedReviews = await Review.find({ 
    schoolId, 
    approvalStatus: 'approved' 
  }).select('rating');
  
  const totalReviews = approvedReviews.length;
  let averageRating = 0;
  
  if (totalReviews > 0) {
    const sum = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
    averageRating = parseFloat((sum / totalReviews).toFixed(2));
  }
  
  await School.findOneAndUpdate(
    { id: schoolId },
    { 
      rating: averageRating, 
      reviewCount: totalReviews,
      updatedAt: new Date().toISOString()
    }
  );
  
  return { averageRating, totalReviews };
}

export async function getSchool(id: number) {
  await connectToDatabase();
  
  const school = await School.findOne({ id }).lean();
  
  if (!school) {
    return null;
  }
  
  return {
    ...school,
    id: school.id,
  };
}

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
  
  let schoolsQuery = School.find(query).lean();
  
  if (filters?.limit) {
    schoolsQuery = schoolsQuery.limit(filters.limit);
  }
  
  if (filters?.offset) {
    schoolsQuery = schoolsQuery.skip(filters.offset);
  }
  
  const schools = await schoolsQuery;
  
  return schools.map(school => ({
    ...school,
    id: school.id,
  }));
}

export async function createSchool(data: any) {
  await connectToDatabase();
  
  const lastSchool = await School.findOne().sort({ id: -1 }).select('id').lean();
  const newId = (lastSchool?.id || 0) + 1;
  
  const now = new Date().toISOString();
  
  const school = new School({
    id: newId,
    userId: data.userId,
    name: data.name,
    establishmentYear: data.establishmentYear,
    schoolType: data.schoolType,
    k12Level: data.k12Level,
    board: data.board,
    gender: data.gender,
    isInternational: data.isInternational,
    streamsAvailable: data.streamsAvailable,
    languages: data.languages,
    totalStudents: data.totalStudents,
    totalTeachers: data.totalTeachers,
    logoUrl: data.logoUrl,
    aboutSchool: data.aboutSchool,
    bannerImageUrl: data.bannerImageUrl,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    website: data.website,
    contactNumber: data.contactNumber,
    whatsappNumber: data.whatsappNumber,
    email: data.email,
    facebookUrl: data.facebookUrl,
    instagramUrl: data.instagramUrl,
    linkedinUrl: data.linkedinUrl,
    youtubeUrl: data.youtubeUrl,
    googleMapUrl: data.googleMapUrl,
    pincode: data.pincode,
    medium: data.medium,
    classesOffered: data.classesOffered,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    classroomType: data.classroomType,
    hasLibrary: data.hasLibrary,
    hasComputerLab: data.hasComputerLab,
    computerCount: data.computerCount,
    hasPhysicsLab: data.hasPhysicsLab,
    hasChemistryLab: data.hasChemistryLab,
    hasBiologyLab: data.hasBiologyLab,
    hasMathsLab: data.hasMathsLab,
    hasLanguageLab: data.hasLanguageLab,
    hasRoboticsLab: data.hasRoboticsLab,
    hasStemLab: data.hasStemLab,
    hasAuditorium: data.hasAuditorium,
    hasPlayground: data.hasPlayground,
    sportsFacilities: data.sportsFacilities,
    hasSwimmingPool: data.hasSwimmingPool,
    hasFitnessCentre: data.hasFitnessCentre,
    hasYoga: data.hasYoga,
    hasMartialArts: data.hasMartialArts,
    hasMusicDance: data.hasMusicDance,
    hasHorseRiding: data.hasHorseRiding,
    hasSmartBoard: data.hasSmartBoard,
    hasWifi: data.hasWifi,
    hasCctv: data.hasCctv,
    hasElearning: data.hasElearning,
    hasAcClassrooms: data.hasAcClassrooms,
    hasAiTools: data.hasAiTools,
    hasTransport: data.hasTransport,
    hasGpsBuses: data.hasGpsBuses,
    hasCctvBuses: data.hasCctvBuses,
    hasBusCaretaker: data.hasBusCaretaker,
    hasMedicalRoom: data.hasMedicalRoom,
    hasDoctorNurse: data.hasDoctorNurse,
    hasFireSafety: data.hasFireSafety,
    hasCleanWater: data.hasCleanWater,
    hasSecurityGuards: data.hasSecurityGuards,
    hasAirPurifier: data.hasAirPurifier,
    hasHostel: data.hasHostel,
    hasMess: data.hasMess,
    hasHostelStudyRoom: data.hasHostelStudyRoom,
    hasAcHostel: data.hasAcHostel,
    hasCafeteria: data.hasCafeteria,
    galleryImages: data.galleryImages,
    virtualTourUrl: data.virtualTourUrl,
    virtualTourVideos: data.virtualTourVideos,
    prospectusUrl: data.prospectusUrl,
    awards: data.awards,
    newsletterUrl: data.newsletterUrl,
    feesStructure: data.feesStructure,
    facilityImages: data.facilityImages,
      logo: data.logo,
      bannerImage: data.bannerImage,
      studentTeacherRatio: data.studentTeacherRatio,
      feesMin: data.feesMin,
      feesMax: data.feesMax,
      facilities: data.facilities,
      description: data.description,
      gallery: data.gallery,
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      profileViews: data.profileViews || 0,
      featured: data.featured || false,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      latitude: data.latitude,
      longitude: data.longitude,
      whatsappWebhookUrl: data.whatsappWebhookUrl,
      whatsappApiKey: data.whatsappApiKey,
      createdAt: now,
      updatedAt: now,
    });
  
  await school.save();
  
  return getSchool(newId);
}

export async function updateSchool(id: number, data: any) {
  await connectToDatabase();
  
  const existingSchool = await School.findOne({ id });
  
  if (!existingSchool) {
    data.id = id;
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    const school = new School(data);
    await school.save();
    return getSchool(id);
  }
  
  data.updatedAt = new Date().toISOString();
  
  const updated = await School.findOneAndUpdate(
    { id }, 
    { $set: data },
    { new: true }
  ).lean();
  
  if (!updated) {
    return getSchool(id);
  }
  
  return {
    ...updated,
    id: updated.id,
  };
}

export async function deleteSchool(id: number) {
  await connectToDatabase();
  await School.deleteOne({ id });
}

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
  
  return School.countDocuments(query);
}

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
