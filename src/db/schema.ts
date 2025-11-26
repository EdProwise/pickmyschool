import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table - supports both students and school admins
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  role: text('role').notNull(), // "student" or "school"
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Will be hashed with bcrypt
  name: text('name').notNull(),
  phone: text('phone'),
  city: text('city'),
  class: text('class'), // For students
  schoolId: integer('school_id'), // For school admins
  savedSchools: text('saved_schools', { mode: 'json' }), // Array of school IDs
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Schools table - COMPREHENSIVE PROFILE
export const schools = sqliteTable('schools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  
  // Basic Info
  name: text('name').notNull(),
  establishmentYear: integer('establishment_year'),
  schoolType: text('school_type'), // 'Private', 'Govt', 'Day School', 'Boarding', 'Both'
  k12Level: text('k12_level'), // 'Foundational', 'Preparatory', 'Middle', 'Secondary'
  board: text('board').notNull(), // 'CBSE', 'ICSE', 'State Board', 'Others', 'Unregistered'
  gender: text('gender'), // 'Co-Ed', 'Boys', 'Girls'
  isInternational: integer('is_international', { mode: 'boolean' }).default(false),
  streamsAvailable: text('streams_available'), // Comma separated
  languages: text('languages'), // Comma separated
  totalStudents: text('total_students'), // Range text
  totalTeachers: integer('total_teachers'),
  logoUrl: text('logo_url'),
  
  // Contact Info
  address: text('address'),
  city: text('city').notNull(),
  state: text('state'),
  country: text('country'),
  website: text('website'),
  contactNumber: text('contact_number'),
  whatsappNumber: text('whatsapp_number'),
  email: text('email'),
  facebookUrl: text('facebook_url'),
  instagramUrl: text('instagram_url'),
  linkedinUrl: text('linkedin_url'),
  youtubeUrl: text('youtube_url'),
  googleMapUrl: text('google_map_url'),
  
  // Academic Facilities
  classroomType: text('classroom_type'), // 'Smart Class', 'Digital Class', 'Traditional'
  hasLibrary: integer('has_library', { mode: 'boolean' }).default(false),
  hasComputerLab: integer('has_computer_lab', { mode: 'boolean' }).default(false),
  computerCount: integer('computer_count'),
  hasPhysicsLab: integer('has_physics_lab', { mode: 'boolean' }).default(false),
  hasChemistryLab: integer('has_chemistry_lab', { mode: 'boolean' }).default(false),
  hasBiologyLab: integer('has_biology_lab', { mode: 'boolean' }).default(false),
  hasMathsLab: integer('has_maths_lab', { mode: 'boolean' }).default(false),
  hasLanguageLab: integer('has_language_lab', { mode: 'boolean' }).default(false),
  hasRoboticsLab: integer('has_robotics_lab', { mode: 'boolean' }).default(false),
  hasStemLab: integer('has_stem_lab', { mode: 'boolean' }).default(false),
  hasAuditorium: integer('has_auditorium', { mode: 'boolean' }).default(false),
  
  // Sports & Fitness
  hasPlayground: integer('has_playground', { mode: 'boolean' }).default(false),
  sportsFacilities: text('sports_facilities'), // Comma separated
  hasSwimmingPool: integer('has_swimming_pool', { mode: 'boolean' }).default(false),
  hasFitnessCentre: integer('has_fitness_centre', { mode: 'boolean' }).default(false),
  hasYoga: integer('has_yoga', { mode: 'boolean' }).default(false),
  hasMartialArts: integer('has_martial_arts', { mode: 'boolean' }).default(false),
  hasMusicDance: integer('has_music_dance', { mode: 'boolean' }).default(false),
  hasHorseRiding: integer('has_horse_riding', { mode: 'boolean' }).default(false),
  
  // Technology & Digital
  hasSmartBoard: integer('has_smart_board', { mode: 'boolean' }).default(false),
  hasWifi: integer('has_wifi', { mode: 'boolean' }).default(false),
  hasCctv: integer('has_cctv', { mode: 'boolean' }).default(false),
  hasElearning: integer('has_elearning', { mode: 'boolean' }).default(false),
  hasAcClassrooms: integer('has_ac_classrooms', { mode: 'boolean' }).default(false),
  hasAiTools: integer('has_ai_tools', { mode: 'boolean' }).default(false),
  
  // Transport
  hasTransport: integer('has_transport', { mode: 'boolean' }).default(false),
  hasGpsBuses: integer('has_gps_buses', { mode: 'boolean' }).default(false),
  hasCctvBuses: integer('has_cctv_buses', { mode: 'boolean' }).default(false),
  hasBusCaretaker: integer('has_bus_caretaker', { mode: 'boolean' }).default(false),
  
  // Health & Safety
  hasMedicalRoom: integer('has_medical_room', { mode: 'boolean' }).default(false),
  hasDoctorNurse: integer('has_doctor_nurse', { mode: 'boolean' }).default(false),
  hasFireSafety: integer('has_fire_safety', { mode: 'boolean' }).default(false),
  hasCleanWater: integer('has_clean_water', { mode: 'boolean' }).default(false),
  hasSecurityGuards: integer('has_security_guards', { mode: 'boolean' }).default(false),
  hasAirPurifier: integer('has_air_purifier', { mode: 'boolean' }).default(false),
  
  // Boarding
  hasHostel: integer('has_hostel', { mode: 'boolean' }).default(false),
  hasMess: integer('has_mess', { mode: 'boolean' }).default(false),
  hasHostelStudyRoom: integer('has_hostel_study_room', { mode: 'boolean' }).default(false),
  hasAcHostel: integer('has_ac_hostel', { mode: 'boolean' }).default(false),
  
  // Others
  hasCafeteria: integer('has_cafeteria', { mode: 'boolean' }).default(false),
  galleryImages: text('gallery_images', { mode: 'json' }), // Array of image URLs
  virtualTourUrl: text('virtual_tour_url'),
  prospectusUrl: text('prospectus_url'),
  awards: text('awards', { mode: 'json' }), // Array of awards
  newsletterUrl: text('newsletter_url'),
  feesStructure: text('fees_structure', { mode: 'json' }), // Object with fee details
  
  // Legacy fields for compatibility
  logo: text('logo'),
  bannerImage: text('banner_image'),
  pincode: text('pincode'),
  medium: text('medium'),
  classesOffered: text('classes_offered'),
  studentTeacherRatio: text('student_teacher_ratio'),
  feesMin: integer('fees_min'),
  feesMax: integer('fees_max'),
  facilities: text('facilities', { mode: 'json' }),
  description: text('description'),
  gallery: text('gallery', { mode: 'json' }),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  profileViews: integer('profile_views').default(0),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  latitude: real('latitude'),
  longitude: real('longitude'),
  
  // Timestamps
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Enquiries table - for lead management
export const enquiries = sqliteTable('enquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').notNull().references(() => users.id),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  studentName: text('student_name').notNull(),
  studentEmail: text('student_email').notNull(),
  studentPhone: text('student_phone').notNull(),
  studentClass: text('student_class').notNull(),
  message: text('message'),
  status: text('status').notNull().default('New'), // New/In Progress/Converted/Closed
  notes: text('notes'),
  followUpDate: text('follow_up_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Chat table - for AI chat history
export const chats = sqliteTable('chats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').notNull(), // student/school
  messages: text('messages', { mode: 'json' }), // Array of message objects
  lastMessageAt: text('last_message_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add super_admin table
export const superAdmin = sqliteTable('super_admin', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add site_settings table
export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  spotlightSchoolId: integer('spotlight_school_id').references(() => schools.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});