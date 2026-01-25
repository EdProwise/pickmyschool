# 🚀 Final Migration Instructions - Copy All Schools Data

## ✅ Status: Code Complete, Data Migration Pending

All API routes have been updated to use the new split table architecture. Now we need to copy the data from the old `schools` table to the new tables.

---

## 📋 Option 1: Turso Dashboard (Recommended)

1. **Go to Turso Dashboard**: https://turso.tech/
2. **Select your database**: `db-52387199-7ec6-4b63-a2fa-893e007f2f3d-orchids`
3. **Open SQL Console**
4. **Run each statement ONE AT A TIME** (wait for each to complete):

### Statement 1: Copy to schools1 (Basic Info)
```sql
INSERT INTO schools1 (id, userId, name, establishmentYear, schoolType, k12Level, board, gender, isInternational, streamsAvailable, languages, totalStudents, totalTeachers, logoUrl, aboutSchool, bannerImageUrl, rating, reviewCount, profileViews, featured, createdAt, updatedAt)
SELECT id, userId, name, establishmentYear, schoolType, k12Level, board, gender, isInternational, streamsAvailable, languages, totalStudents, totalTeachers, logoUrl, aboutSchool, bannerImageUrl, rating, reviewCount, profileViews, featured, createdAt, updatedAt
FROM schools;
```

### Statement 2: Copy to schools2 (Contact Info)
```sql
INSERT INTO schools2 (id, address, city, state, country, pincode, website, contactNumber, whatsappNumber, email, facebookUrl, instagramUrl, linkedinUrl, youtubeUrl, googleMapUrl, createdAt, updatedAt)
SELECT id, address, city, state, country, pincode, website, contactNumber, whatsappNumber, email, facebookUrl, instagramUrl, linkedinUrl, youtubeUrl, googleMapUrl, createdAt, updatedAt
FROM schools;
```

### Statement 3: Copy to schools3 (Facilities)
```sql
INSERT INTO schools3 (id, classroomType, hasLibrary, hasComputerLab, computerCount, hasPhysicsLab, hasChemistryLab, hasBiologyLab, hasMathsLab, hasLanguageLab, hasRoboticsLab, hasStemLab, hasAuditorium, hasPlayground, sportsFacilities, hasSwimmingPool, hasFitnessCentre, hasYoga, hasMartialArts, hasMusicDance, hasHorseRiding, hasSmartBoard, hasWifi, hasCctv, hasElearning, hasAcClassrooms, hasAiTools, hasTransport, hasGpsBuses, hasCctvBuses, hasBusCaretaker, hasMedicalRoom, hasDoctorNurse, hasFireSafety, hasCleanWater, hasSecurityGuards, hasAirPurifier, hasHostel, hasMess, hasHostelStudyRoom, hasAcHostel, hasCafeteria, createdAt, updatedAt)
SELECT id, classroomType, hasLibrary, hasComputerLab, computerCount, hasPhysicsLab, hasChemistryLab, hasBiologyLab, hasMathsLab, hasLanguageLab, hasRoboticsLab, hasStemLab, hasAuditorium, hasPlayground, sportsFacilities, hasSwimmingPool, hasFitnessCentre, hasYoga, hasMartialArts, hasMusicDance, hasHorseRiding, hasSmartBoard, hasWifi, hasCctv, hasElearning, hasAcClassrooms, hasAiTools, hasTransport, hasGpsBuses, hasCctvBuses, hasBusCaretaker, hasMedicalRoom, hasDoctorNurse, hasFireSafety, hasCleanWater, hasSecurityGuards, hasAirPurifier, hasHostel, hasMess, hasHostelStudyRoom, hasAcHostel, hasCafeteria, createdAt, updatedAt
FROM schools;
```

### Statement 4: Copy to schools4 (Media & Documents)
```sql
INSERT INTO schools4 (id, galleryImages, virtualTourUrl, virtualTourVideos, prospectusUrl, awards, newsletterUrl, feesMin, feesMax, feesStructure, facilityImages, facilities, logo, bannerImage, medium, classesOffered, studentTeacherRatio, description, gallery, contactEmail, contactPhone, isPublic, createdAt, updatedAt)
SELECT id, galleryImages, virtualTourUrl, virtualTourVideos, prospectusUrl, awards, newsletterUrl, feesMin, feesMax, feesStructure, facilityImages, facilities, logo, bannerImage, medium, classesOffered, studentTeacherRatio, description, gallery, contactEmail, contactPhone, isPublic, createdAt, updatedAt
FROM schools;
```

### Statement 5: Verify Migration
```sql
SELECT 
  (SELECT COUNT(*) FROM schools) as original_count,
  (SELECT COUNT(*) FROM schools1) as schools1_count,
  (SELECT COUNT(*) FROM schools2) as schools2_count,
  (SELECT COUNT(*) FROM schools3) as schools3_count,
  (SELECT COUNT(*) FROM schools4) as schools4_count;
```

**✅ Expected Result**: All counts should match!

---

## 📋 Option 2: Turso CLI (Alternative)

If you have Turso CLI installed:

```bash
# Login
turso auth login

# Execute migrations one by one
turso db shell db-52387199-7ec6-4b63-a2fa-893e007f2f3d-orchids < migration-split-schools.sql
```

---

## 🧪 After Migration: Test the Application

1. **Reload the app**: http://localhost:3000/schools/27
2. **Check for errors** in browser console
3. **Verify data appears** correctly
4. **Test school dashboard** at http://localhost:3000/dashboard/school
5. **Test admin panel** at http://localhost:3000/admin/dashboard

---

## ✅ What's Already Done

- ✅ Created new split tables (`schools1`, `schools2`, `schools3`, `schools4`)
- ✅ Created helper functions (`getSchool`, `getSchools`, `updateSchool`, `deleteSchool`)
- ✅ Updated ALL API routes:
  - `/api/schools/route.ts`
  - `/api/schools/[id]/route.ts`
  - `/api/schools/profile/route.ts`
  - `/api/admin/schools/route.ts`
  - `/api/schools/visibility/route.ts`
  - `/api/schools/featured/route.ts`
  - `/api/schools/spotlight/route.ts`

---

## 🔍 Troubleshooting

**If you see "School not found" errors:**
- The migration hasn't been run yet
- Run the 4 INSERT statements above via Turso dashboard

**If data appears empty:**
- Check that all 4 tables have the same row count as original `schools` table
- Run the verification query above

**Connection pool errors:**
- This is why we use the dashboard - it bypasses app connection pools
- Don't run all statements at once, do them one by one

---

## 🗑️ Optional: Clean Up Old Table (DO THIS LAST)

**⚠️ ONLY after verifying everything works:**

```sql
-- Backup first (just in case)
-- Then drop old table
DROP TABLE schools;
```

**Note:** Keep the old table for a few days as backup before dropping it.

---

## 📞 Need Help?

If migration fails or you see errors:
1. Check browser console for API errors
2. Check terminal/server logs for database errors
3. Verify table counts match using the verification query
4. Keep the old `schools` table until confirmed working

---

## 🎉 Success Criteria

- ✅ All 4 INSERT statements complete without errors
- ✅ Verification query shows matching counts
- ✅ School page loads: http://localhost:3000/schools/27
- ✅ No errors in browser console
- ✅ Dashboard works: http://localhost:3000/dashboard/school
