# Manual Data Migration Instructions

## Status
✅ Schema changes applied - `schools1`, `schools2`, `schools3`, `schools4` tables exist  
✅ All API routes updated to use helper functions  
⏳ Data needs to be copied from `schools` to split tables

## Quick Test: Copy One School Record

Since automated SQL migration is failing, here's a manual approach:

### Option 1: Use Turso Dashboard (Easiest)
1. Go to https://turso.tech/
2. Select your database: `db-52387199-7ec6-4b63-a2fa-893e007f2f3d`
3. Run these queries in the SQL console:

```sql
-- Copy school ID 27 (Orbit) to test
INSERT INTO schools1 SELECT id, userId, name, establishmentYear, schoolType, k12Level, board, gender, isInternational, streamsAvailable, languages, totalStudents, totalTeachers, logoUrl, aboutSchool, bannerImageUrl, address, city, state, country, website, contactNumber, whatsappNumber, email, facebookUrl, instagramUrl, linkedinUrl, youtubeUrl, googleMapUrl, pincode, medium, classesOffered, contactEmail, contactPhone, createdAt, updatedAt FROM schools WHERE id = 27;

INSERT INTO schools2 SELECT id, classroomType, hasLibrary, hasComputerLab, computerCount, hasPhysicsLab, hasChemistryLab, hasBiologyLab, hasMathsLab, hasLanguageLab, hasRoboticsLab, hasStemLab, hasAuditorium, hasPlayground, sportsFacilities, hasSwimmingPool, hasFitnessCentre, hasYoga, hasMartialArts, hasMusicDance, hasHorseRiding, createdAt, updatedAt FROM schools WHERE id = 27;

INSERT INTO schools3 SELECT id, hasSmartBoard, hasWifi, hasCctv, hasElearning, hasAcClassrooms, hasAiTools, hasTransport, hasGpsBuses, hasCctvBuses, hasBusCaretaker, hasMedicalRoom, hasDoctorNurse, hasFireSafety, hasCleanWater, hasSecurityGuards, hasAirPurifier, hasHostel, hasMess, hasHostelStudyRoom, hasAcHostel, hasCafeteria, createdAt, updatedAt FROM schools WHERE id = 27;

INSERT INTO schools4 SELECT id, galleryImages, virtualTourUrl, virtualTourVideos, prospectusUrl, awards, newsletterUrl, feesStructure, facilityImages, logo, bannerImage, studentTeacherRatio, feesMin, feesMax, facilities, description, gallery, rating, reviewCount, profileViews, featured, isPublic, latitude, longitude, createdAt, updatedAt FROM schools WHERE id = 27;
```

### Option 2: Copy All Schools
Run the full `migration-split-schools.sql` file in the Turso dashboard SQL console.

### Verification
After copying, visit: http://localhost:3000/schools/27

It should now load successfully!

## Notes
- Old `schools` table is still intact (backup)
- New split tables will be populated with data
- All API routes use helper functions that merge data from split tables
- Can drop old `schools` table after verifying everything works
