-- Migration script to split schools table into schools1, schools2, schools3, schools4
-- This must be run AFTER creating the new tables via drizzle-kit

-- 1. Copy data to schools1 (Basic Info & Contact)
INSERT INTO schools1 (
  id, userId, name, establishmentYear, schoolType, k12Level, board, gender, 
  isInternational, streamsAvailable, languages, totalStudents, totalTeachers,
  logoUrl, aboutSchool, bannerImageUrl, address, city, state, country, website,
  contactNumber, whatsappNumber, email, facebookUrl, instagramUrl, linkedinUrl,
  youtubeUrl, googleMapUrl, pincode, medium, classesOffered, contactEmail, contactPhone,
  createdAt, updatedAt
)
SELECT 
  id, userId, name, establishmentYear, schoolType, k12Level, board, gender,
  isInternational, streamsAvailable, languages, totalStudents, totalTeachers,
  logoUrl, aboutSchool, bannerImageUrl, address, city, state, country, website,
  contactNumber, whatsappNumber, email, facebookUrl, instagramUrl, linkedinUrl,
  youtubeUrl, googleMapUrl, pincode, medium, classesOffered, contactEmail, contactPhone,
  createdAt, updatedAt
FROM schools;

-- 2. Copy data to schools2 (Academic & Sports Facilities)
INSERT INTO schools2 (
  id, classroomType, hasLibrary, hasComputerLab, computerCount, hasPhysicsLab,
  hasChemistryLab, hasBiologyLab, hasMathsLab, hasLanguageLab, hasRoboticsLab,
  hasStemLab, hasAuditorium, hasPlayground, sportsFacilities, hasSwimmingPool,
  hasFitnessCentre, hasYoga, hasMartialArts, hasMusicDance, hasHorseRiding,
  createdAt, updatedAt
)
SELECT 
  id, classroomType, hasLibrary, hasComputerLab, computerCount, hasPhysicsLab,
  hasChemistryLab, hasBiologyLab, hasMathsLab, hasLanguageLab, hasRoboticsLab,
  hasStemLab, hasAuditorium, hasPlayground, sportsFacilities, hasSwimmingPool,
  hasFitnessCentre, hasYoga, hasMartialArts, hasMusicDance, hasHorseRiding,
  createdAt, updatedAt
FROM schools;

-- 3. Copy data to schools3 (Technology, Transport & Safety)
INSERT INTO schools3 (
  id, hasSmartBoard, hasWifi, hasCctv, hasElearning, hasAcClassrooms, hasAiTools,
  hasTransport, hasGpsBuses, hasCctvBuses, hasBusCaretaker, hasMedicalRoom,
  hasDoctorNurse, hasFireSafety, hasCleanWater, hasSecurityGuards, hasAirPurifier,
  hasHostel, hasMess, hasHostelStudyRoom, hasAcHostel, hasCafeteria,
  createdAt, updatedAt
)
SELECT 
  id, hasSmartBoard, hasWifi, hasCctv, hasElearning, hasAcClassrooms, hasAiTools,
  hasTransport, hasGpsBuses, hasCctvBuses, hasBusCaretaker, hasMedicalRoom,
  hasDoctorNurse, hasFireSafety, hasCleanWater, hasSecurityGuards, hasAirPurifier,
  hasHostel, hasMess, hasHostelStudyRoom, hasAcHostel, hasCafeteria,
  createdAt, updatedAt
FROM schools;

-- 4. Copy data to schools4 (Media, Ratings & Legacy)
INSERT INTO schools4 (
  id, galleryImages, virtualTourUrl, virtualTourVideos, prospectusUrl, awards,
  newsletterUrl, feesStructure, facilityImages, logo, bannerImage, studentTeacherRatio,
  feesMin, feesMax, facilities, description, gallery, rating, reviewCount,
  profileViews, featured, isPublic, latitude, longitude, createdAt, updatedAt
)
SELECT 
  id, galleryImages, virtualTourUrl, virtualTourVideos, prospectusUrl, awards,
  newsletterUrl, feesStructure, facilityImages, logo, bannerImage, studentTeacherRatio,
  feesMin, feesMax, facilities, description, gallery, rating, reviewCount,
  profileViews, featured, isPublic, latitude, longitude, createdAt, updatedAt
FROM schools;

-- Verify the migration
SELECT 
  (SELECT COUNT(*) FROM schools) as original_count,
  (SELECT COUNT(*) FROM schools1) as schools1_count,
  (SELECT COUNT(*) FROM schools2) as schools2_count,
  (SELECT COUNT(*) FROM schools3) as schools3_count,
  (SELECT COUNT(*) FROM schools4) as schools4_count;

-- After verification, you can drop the old schools table:
-- DROP TABLE schools;
