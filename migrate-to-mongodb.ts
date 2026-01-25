import { createClient } from '@libsql/client';
import mongoose from 'mongoose';
import {
  User, School, Enquiry, EnquiryFormSettings, Chat,
  SuperAdmin, SiteSettings, Testimonial, Review, Result,
  StudentAchievement, Alumni, News, Notification, ContactSubmission,
  EmailVerificationToken, PasswordResetToken
} from './src/lib/models';

const TURSO_URL = process.env.TURSO_CONNECTION_URL!;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;
const MONGODB_URI = process.env.MONGODB_URI!;

async function migrate() {
  console.log('Starting migration from Turso to MongoDB...\n');

  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB\n');

  try {
    console.log('Migrating Users...');
    const usersResult = await turso.execute('SELECT * FROM users');
    for (const row of usersResult.rows) {
      const userData: any = {
        role: row.role,
        email: row.email,
        password: row.password,
        name: row.name,
        phone: row.phone,
        city: row.city,
        class: row.class,
        schoolId: row.school_id,
        savedSchools: row.saved_schools ? JSON.parse(row.saved_schools as string) : [],
        emailVerified: Boolean(row.email_verified),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      await User.findOneAndUpdate({ email: row.email }, userData, { upsert: true });
    }
    console.log(`  Migrated ${usersResult.rows.length} users\n`);

    console.log('Migrating Schools...');
    const schools1Result = await turso.execute('SELECT * FROM schools1');
    const schools2Result = await turso.execute('SELECT * FROM schools2');
    const schools3Result = await turso.execute('SELECT * FROM schools3');
    const schools4Result = await turso.execute('SELECT * FROM schools4');

    const schools2Map = new Map(schools2Result.rows.map(r => [r.id, r]));
    const schools3Map = new Map(schools3Result.rows.map(r => [r.id, r]));
    const schools4Map = new Map(schools4Result.rows.map(r => [r.id, r]));

    for (const s1 of schools1Result.rows) {
      const s2 = schools2Map.get(s1.id) || {};
      const s3 = schools3Map.get(s1.id) || {};
      const s4 = schools4Map.get(s1.id) || {};

      const schoolData: any = {
        id: s1.id,
        name: s1.name,
        board: s1.board,
        city: s1.city,
        state: s1.state,
        country: s1.country,
        address: s1.address,
        website: s1.website,
        contactNumber: s1.contact_number,
        whatsappNumber: s1.whatsapp_number,
        email: s1.email,
        establishmentYear: s1.establishment_year,
        schoolType: s1.school_type,
        k12Level: s1.k12_level,
        gender: s1.gender,
        isInternational: Boolean(s1.is_international),
        streamsAvailable: s1.streams_available,
        languages: s1.languages,
        totalStudents: s1.total_students,
        totalTeachers: s1.total_teachers,
        logoUrl: s1.logo_url,
        aboutSchool: s1.about_school,
        bannerImageUrl: s1.banner_image_url,
        facebookUrl: s1.facebook_url,
        instagramUrl: s1.instagram_url,
        linkedinUrl: s1.linkedin_url,
        youtubeUrl: s1.youtube_url,
        googleMapUrl: s1.google_map_url,
        pincode: s1.pincode,
        medium: s1.medium,
        classesOffered: s1.classes_offered,
        contactEmail: s1.contact_email,
        contactPhone: s1.contact_phone,
        classroomType: (s2 as any).classroom_type,
        hasLibrary: Boolean((s2 as any).has_library),
        hasComputerLab: Boolean((s2 as any).has_computer_lab),
        computerCount: (s2 as any).computer_count,
        hasPhysicsLab: Boolean((s2 as any).has_physics_lab),
        hasChemistryLab: Boolean((s2 as any).has_chemistry_lab),
        hasBiologyLab: Boolean((s2 as any).has_biology_lab),
        hasMathsLab: Boolean((s2 as any).has_maths_lab),
        hasLanguageLab: Boolean((s2 as any).has_language_lab),
        hasRoboticsLab: Boolean((s2 as any).has_robotics_lab),
        hasStemLab: Boolean((s2 as any).has_stem_lab),
        hasAuditorium: Boolean((s2 as any).has_auditorium),
        hasPlayground: Boolean((s2 as any).has_playground),
        sportsFacilities: (s2 as any).sports_facilities,
        hasSwimmingPool: Boolean((s2 as any).has_swimming_pool),
        hasFitnessCentre: Boolean((s2 as any).has_fitness_centre),
        hasYoga: Boolean((s2 as any).has_yoga),
        hasMartialArts: Boolean((s2 as any).has_martial_arts),
        hasMusicDance: Boolean((s2 as any).has_music_dance),
        hasHorseRiding: Boolean((s2 as any).has_horse_riding),
        hasSmartBoard: Boolean((s3 as any).has_smart_board),
        hasWifi: Boolean((s3 as any).has_wifi),
        hasCctv: Boolean((s3 as any).has_cctv),
        hasElearning: Boolean((s3 as any).has_elearning),
        hasAcClassrooms: Boolean((s3 as any).has_ac_classrooms),
        hasAiTools: Boolean((s3 as any).has_ai_tools),
        hasTransport: Boolean((s3 as any).has_transport),
        hasGpsBuses: Boolean((s3 as any).has_gps_buses),
        hasCctvBuses: Boolean((s3 as any).has_cctv_buses),
        hasBusCaretaker: Boolean((s3 as any).has_bus_caretaker),
        hasMedicalRoom: Boolean((s3 as any).has_medical_room),
        hasDoctorNurse: Boolean((s3 as any).has_doctor_nurse),
        hasFireSafety: Boolean((s3 as any).has_fire_safety),
        hasCleanWater: Boolean((s3 as any).has_clean_water),
        hasSecurityGuards: Boolean((s3 as any).has_security_guards),
        hasAirPurifier: Boolean((s3 as any).has_air_purifier),
        hasHostel: Boolean((s3 as any).has_hostel),
        hasMess: Boolean((s3 as any).has_mess),
        hasHostelStudyRoom: Boolean((s3 as any).has_hostel_study_room),
        hasAcHostel: Boolean((s3 as any).has_ac_hostel),
        hasCafeteria: Boolean((s3 as any).has_cafeteria),
        galleryImages: (s4 as any).gallery_images ? JSON.parse((s4 as any).gallery_images as string) : [],
        virtualTourUrl: (s4 as any).virtual_tour_url,
        virtualTourVideos: (s4 as any).virtual_tour_videos ? JSON.parse((s4 as any).virtual_tour_videos as string) : [],
        prospectusUrl: (s4 as any).prospectus_url,
        awards: (s4 as any).awards ? JSON.parse((s4 as any).awards as string) : [],
        newsletterUrl: (s4 as any).newsletter_url,
        feesStructure: (s4 as any).fees_structure ? JSON.parse((s4 as any).fees_structure as string) : null,
        facilityImages: (s4 as any).facility_images ? JSON.parse((s4 as any).facility_images as string) : null,
        logo: (s4 as any).logo,
        bannerImage: (s4 as any).banner_image,
        studentTeacherRatio: (s4 as any).student_teacher_ratio,
        feesMin: (s4 as any).fees_min,
        feesMax: (s4 as any).fees_max,
        facilities: (s4 as any).facilities ? JSON.parse((s4 as any).facilities as string) : [],
        description: (s4 as any).description,
        gallery: (s4 as any).gallery ? JSON.parse((s4 as any).gallery as string) : [],
        rating: (s4 as any).rating || 0,
        reviewCount: (s4 as any).review_count || 0,
        profileViews: (s4 as any).profile_views || 0,
        featured: Boolean((s4 as any).featured),
        isPublic: (s4 as any).is_public !== 0,
        latitude: (s4 as any).latitude,
        longitude: (s4 as any).longitude,
        createdAt: s1.created_at || new Date().toISOString(),
        updatedAt: s1.updated_at || new Date().toISOString(),
      };

      await School.findOneAndUpdate({ id: s1.id }, schoolData, { upsert: true });
    }
    console.log(`  Migrated ${schools1Result.rows.length} schools\n`);

    console.log('Migrating Testimonials...');
    const testimonialsResult = await turso.execute('SELECT * FROM testimonials');
    for (const row of testimonialsResult.rows) {
      const data: any = {
        parentName: row.parent_name,
        location: row.location,
        rating: row.rating,
        testimonialText: row.testimonial_text,
        avatarUrl: row.avatar_url,
        featured: Boolean(row.featured),
        displayOrder: row.display_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      await Testimonial.create(data);
    }
    console.log(`  Migrated ${testimonialsResult.rows.length} testimonials\n`);

    console.log('Migrating SuperAdmin...');
    const superAdminResult = await turso.execute('SELECT * FROM super_admin');
    for (const row of superAdminResult.rows) {
      const data: any = {
        email: row.email,
        password: row.password,
        name: row.name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      await SuperAdmin.findOneAndUpdate({ email: row.email }, data, { upsert: true });
    }
    console.log(`  Migrated ${superAdminResult.rows.length} super admins\n`);

    console.log('Migrating SiteSettings...');
    const siteSettingsResult = await turso.execute('SELECT * FROM site_settings');
    for (const row of siteSettingsResult.rows) {
      const data: any = {
        spotlightSchoolId: row.spotlight_school_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      await SiteSettings.create(data);
    }
    console.log(`  Migrated ${siteSettingsResult.rows.length} site settings\n`);

    console.log('Migrating Enquiries...');
    try {
      const enquiriesResult = await turso.execute('SELECT * FROM enquiries');
      for (const row of enquiriesResult.rows) {
        const data: any = {
          schoolId: row.school_id,
          studentName: row.student_name,
          studentEmail: row.student_email,
          studentPhone: row.student_phone,
          studentClass: row.student_class,
          message: row.message,
          status: row.status,
          notes: row.notes,
          followUpDate: row.follow_up_date,
          studentAddress: row.student_address,
          studentState: row.student_state,
          studentAge: row.student_age,
          studentGender: row.student_gender,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
        await Enquiry.create(data);
      }
      console.log(`  Migrated ${enquiriesResult.rows.length} enquiries\n`);
    } catch (e) {
      console.log('  Enquiries table may not exist, skipping...\n');
    }

    console.log('Migrating Contact Submissions...');
    try {
      const contactResult = await turso.execute('SELECT * FROM contact_submissions');
      for (const row of contactResult.rows) {
        const data: any = {
          schoolName: row.school_name,
          contactPerson: row.contact_person,
          email: row.email,
          phone: row.phone,
          city: row.city,
          message: row.message,
          subject: row.subject,
          interestedClass: row.interested_class,
          status: row.status,
          notes: row.notes,
          assignedTo: row.assigned_to,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
        await ContactSubmission.create(data);
      }
      console.log(`  Migrated ${contactResult.rows.length} contact submissions\n`);
    } catch (e) {
      console.log('  Contact submissions table may not exist, skipping...\n');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

migrate().catch(console.error);
