import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

console.log('Starting data migration from schools to schools1, schools2, schools3, schools4...\n');

// Step 1: Migrate to schools1 (Basic Info & Contact)
console.log('1. Migrating to schools1...');
await client.execute(`
  INSERT INTO schools1 (
    id, user_id, name, establishment_year, school_type, k12_level, board, gender, 
    is_international, streams_available, languages, total_students, total_teachers, 
    logo_url, about_school, banner_image_url, address, city, state, country, website, 
    contact_number, whatsapp_number, email, facebook_url, instagram_url, linkedin_url, 
    youtube_url, google_map_url, pincode, medium, classes_offered, contact_email, 
    contact_phone, created_at, updated_at
  )
  SELECT 
    id, user_id, name, establishment_year, school_type, k12_level, board, gender, 
    is_international, streams_available, languages, total_students, total_teachers, 
    logo_url, about_school, banner_image_url, address, city, state, country, website, 
    contact_number, whatsapp_number, email, facebook_url, instagram_url, linkedin_url, 
    youtube_url, google_map_url, pincode, medium, classes_offered, contact_email, 
    contact_phone, created_at, updated_at
  FROM schools
`);
console.log('✓ schools1 migrated');

// Step 2: Migrate to schools2 (Academic & Sports Facilities)
console.log('2. Migrating to schools2...');
await client.execute(`
  INSERT INTO schools2 (
    id, classroom_type, has_library, has_computer_lab, computer_count, has_physics_lab, 
    has_chemistry_lab, has_biology_lab, has_maths_lab, has_language_lab, has_robotics_lab, 
    has_stem_lab, has_auditorium, has_playground, sports_facilities, has_swimming_pool, 
    has_fitness_centre, has_yoga, has_martial_arts, has_music_dance, has_horse_riding, 
    created_at, updated_at
  )
  SELECT 
    id, classroom_type, has_library, has_computer_lab, computer_count, has_physics_lab, 
    has_chemistry_lab, has_biology_lab, has_maths_lab, has_language_lab, has_robotics_lab, 
    has_stem_lab, has_auditorium, has_playground, sports_facilities, has_swimming_pool, 
    has_fitness_centre, has_yoga, has_martial_arts, has_music_dance, has_horse_riding, 
    created_at, updated_at
  FROM schools
`);
console.log('✓ schools2 migrated');

// Step 3: Migrate to schools3 (Technology, Transport & Safety)
console.log('3. Migrating to schools3...');
await client.execute(`
  INSERT INTO schools3 (
    id, has_smart_board, has_wifi, has_cctv, has_elearning, has_ac_classrooms, has_ai_tools, 
    has_transport, has_gps_buses, has_cctv_buses, has_bus_caretaker, has_medical_room, 
    has_doctor_nurse, has_fire_safety, has_clean_water, has_security_guards, has_air_purifier, 
    has_hostel, has_mess, has_hostel_study_room, has_ac_hostel, has_cafeteria, 
    created_at, updated_at
  )
  SELECT 
    id, has_smart_board, has_wifi, has_cctv, has_elearning, has_ac_classrooms, has_ai_tools, 
    has_transport, has_gps_buses, has_cctv_buses, has_bus_caretaker, has_medical_room, 
    has_doctor_nurse, has_fire_safety, has_clean_water, has_security_guards, has_air_purifier, 
    has_hostel, has_mess, has_hostel_study_room, has_ac_hostel, has_cafeteria, 
    created_at, updated_at
  FROM schools
`);
console.log('✓ schools3 migrated');

// Step 4: Migrate to schools4 (Media, Ratings & Legacy)
console.log('4. Migrating to schools4...');
await client.execute(`
  INSERT INTO schools4 (
    id, gallery_images, virtual_tour_url, virtual_tour_videos, prospectus_url, awards, 
    newsletter_url, fees_structure, facility_images, logo, banner_image, student_teacher_ratio, 
    fees_min, fees_max, facilities, description, gallery, rating, review_count, profile_views, 
    featured, is_public, latitude, longitude, created_at, updated_at
  )
  SELECT 
    id, gallery_images, virtual_tour_url, virtual_tour_videos, prospectus_url, awards, 
    newsletter_url, fees_structure, facility_images, logo, banner_image, student_teacher_ratio, 
    fees_min, fees_max, facilities, description, gallery, rating, review_count, profile_views, 
    featured, 1 as is_public, latitude, longitude, created_at, updated_at
  FROM schools
`);
console.log('✓ schools4 migrated');

// Verify migration
console.log('\n5. Verifying migration...');
const verify = await client.execute(`
  SELECT 
    (SELECT COUNT(*) FROM schools) as original_count,
    (SELECT COUNT(*) FROM schools1) as schools1_count,
    (SELECT COUNT(*) FROM schools2) as schools2_count,
    (SELECT COUNT(*) FROM schools3) as schools3_count,
    (SELECT COUNT(*) FROM schools4) as schools4_count
`);
console.log('Counts:', verify.rows[0]);

console.log('\n✅ Migration complete!');
process.exit(0);