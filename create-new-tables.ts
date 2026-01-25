import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

console.log('Creating new split tables...\n');

// Create schools1 table
console.log('1. Creating schools1...');
await client.execute(`
  CREATE TABLE IF NOT EXISTS schools1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    establishment_year INTEGER,
    school_type TEXT,
    k12_level TEXT,
    board TEXT NOT NULL,
    gender TEXT,
    is_international INTEGER DEFAULT 0,
    streams_available TEXT,
    languages TEXT,
    total_students TEXT,
    total_teachers INTEGER,
    logo_url TEXT,
    about_school TEXT,
    banner_image_url TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT,
    website TEXT,
    contact_number TEXT,
    whatsapp_number TEXT,
    email TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    google_map_url TEXT,
    pincode TEXT,
    medium TEXT,
    classes_offered TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
console.log('✓ schools1 created');

// Create schools2 table
console.log('2. Creating schools2...');
await client.execute(`
  CREATE TABLE IF NOT EXISTS schools2 (
    id INTEGER PRIMARY KEY,
    classroom_type TEXT,
    has_library INTEGER DEFAULT 0,
    has_computer_lab INTEGER DEFAULT 0,
    computer_count INTEGER,
    has_physics_lab INTEGER DEFAULT 0,
    has_chemistry_lab INTEGER DEFAULT 0,
    has_biology_lab INTEGER DEFAULT 0,
    has_maths_lab INTEGER DEFAULT 0,
    has_language_lab INTEGER DEFAULT 0,
    has_robotics_lab INTEGER DEFAULT 0,
    has_stem_lab INTEGER DEFAULT 0,
    has_auditorium INTEGER DEFAULT 0,
    has_playground INTEGER DEFAULT 0,
    sports_facilities TEXT,
    has_swimming_pool INTEGER DEFAULT 0,
    has_fitness_centre INTEGER DEFAULT 0,
    has_yoga INTEGER DEFAULT 0,
    has_martial_arts INTEGER DEFAULT 0,
    has_music_dance INTEGER DEFAULT 0,
    has_horse_riding INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
console.log('✓ schools2 created');

// Create schools3 table
console.log('3. Creating schools3...');
await client.execute(`
  CREATE TABLE IF NOT EXISTS schools3 (
    id INTEGER PRIMARY KEY,
    has_smart_board INTEGER DEFAULT 0,
    has_wifi INTEGER DEFAULT 0,
    has_cctv INTEGER DEFAULT 0,
    has_elearning INTEGER DEFAULT 0,
    has_ac_classrooms INTEGER DEFAULT 0,
    has_ai_tools INTEGER DEFAULT 0,
    has_transport INTEGER DEFAULT 0,
    has_gps_buses INTEGER DEFAULT 0,
    has_cctv_buses INTEGER DEFAULT 0,
    has_bus_caretaker INTEGER DEFAULT 0,
    has_medical_room INTEGER DEFAULT 0,
    has_doctor_nurse INTEGER DEFAULT 0,
    has_fire_safety INTEGER DEFAULT 0,
    has_clean_water INTEGER DEFAULT 0,
    has_security_guards INTEGER DEFAULT 0,
    has_air_purifier INTEGER DEFAULT 0,
    has_hostel INTEGER DEFAULT 0,
    has_mess INTEGER DEFAULT 0,
    has_hostel_study_room INTEGER DEFAULT 0,
    has_ac_hostel INTEGER DEFAULT 0,
    has_cafeteria INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
console.log('✓ schools3 created');

// Create schools4 table
console.log('4. Creating schools4...');
await client.execute(`
  CREATE TABLE IF NOT EXISTS schools4 (
    id INTEGER PRIMARY KEY,
    gallery_images TEXT,
    virtual_tour_url TEXT,
    virtual_tour_videos TEXT,
    prospectus_url TEXT,
    awards TEXT,
    newsletter_url TEXT,
    fees_structure TEXT,
    facility_images TEXT,
    logo TEXT,
    banner_image TEXT,
    student_teacher_ratio TEXT,
    fees_min INTEGER,
    fees_max INTEGER,
    facilities TEXT,
    description TEXT,
    gallery TEXT,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    latitude REAL,
    longitude REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
console.log('✓ schools4 created');

console.log('\n✅ All tables created!');
process.exit(0);
