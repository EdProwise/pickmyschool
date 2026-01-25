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
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Schools Table 1 - Basic Info & Contact
export const schools1 = sqliteTable('schools1', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  
  // Basic Info
  name: text('name').notNull(),
  establishmentYear: integer('establishment_year'),
  schoolType: text('school_type'),
  k12Level: text('k12_level'),
  board: text('board').notNull(),
  gender: text('gender'),
  isInternational: integer('is_international', { mode: 'boolean' }).default(false),
  streamsAvailable: text('streams_available'),
  languages: text('languages'),
  totalStudents: text('total_students'),
  totalTeachers: integer('total_teachers'),
  logoUrl: text('logo_url'),
  aboutSchool: text('about_school'),
  bannerImageUrl: text('banner_image_url'),
  
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
  
  // Legacy compatibility
  pincode: text('pincode'),
  medium: text('medium'),
  classesOffered: text('classes_offered'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  
  // Timestamps
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Schools Table 2 - Academic & Sports Facilities
export const schools2 = sqliteTable('schools2', {
  id: integer('id').primaryKey(),
  
  // Academic Facilities
  classroomType: text('classroom_type'),
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
  sportsFacilities: text('sports_facilities'),
  hasSwimmingPool: integer('has_swimming_pool', { mode: 'boolean' }).default(false),
  hasFitnessCentre: integer('has_fitness_centre', { mode: 'boolean' }).default(false),
  hasYoga: integer('has_yoga', { mode: 'boolean' }).default(false),
  hasMartialArts: integer('has_martial_arts', { mode: 'boolean' }).default(false),
  hasMusicDance: integer('has_music_dance', { mode: 'boolean' }).default(false),
  hasHorseRiding: integer('has_horse_riding', { mode: 'boolean' }).default(false),
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Schools Table 3 - Technology, Transport & Safety
export const schools3 = sqliteTable('schools3', {
  id: integer('id').primaryKey(),
  
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
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Schools Table 4 - Media, Ratings & Legacy
export const schools4 = sqliteTable('schools4', {
  id: integer('id').primaryKey(),
  
  galleryImages: text('gallery_images', { mode: 'json' }),
  virtualTourUrl: text('virtual_tour_url'),
  virtualTourVideos: text('virtual_tour_videos', { mode: 'json' }),
  prospectusUrl: text('prospectus_url'),
  awards: text('awards', { mode: 'json' }),
  newsletterUrl: text('newsletter_url'),
  feesStructure: text('fees_structure', { mode: 'json' }),
  facilityImages: text('facility_images', { mode: 'json' }),
  
  // Legacy fields for compatibility
  logo: text('logo'),
  bannerImage: text('banner_image'),
  studentTeacherRatio: text('student_teacher_ratio'),
  feesMin: integer('fees_min'),
  feesMax: integer('fees_max'),
  facilities: text('facilities', { mode: 'json' }),
  description: text('description'),
  gallery: text('gallery', { mode: 'json' }),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  profileViews: integer('profile_views').default(0),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  latitude: real('latitude'),
  longitude: real('longitude'),
  
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Enquiries table - for lead management
export const enquiries = sqliteTable('enquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').references(() => users.id), // Made optional for public forms
  schoolId: integer('school_id').notNull().references(() => schools1.id),
  studentName: text('student_name').notNull(),
  studentEmail: text('student_email').notNull(),
  studentPhone: text('student_phone').notNull(),
  studentClass: text('student_class').notNull(),
  message: text('message'),
  status: text('status').notNull().default('New'), // New/In Progress/Converted/Lost
  notes: text('notes'),
  followUpDate: text('follow_up_date'),
  studentAddress: text('student_address'),
  studentState: text('student_state'),
  studentAge: text('student_age'),
  studentGender: text('student_gender'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Enquiry Form Settings table
export const enquiryFormSettings = sqliteTable('enquiry_form_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolId: integer('school_id').notNull().unique().references(() => schools1.id),
  title: text('title').notNull().default('Admission Enquiry'),
  description: text('description'),
  fields: text('fields', { mode: 'json' }), // Array of field configs: {id, label, type, required, enabled}
  successMessage: text('success_message').default('Thank you for your enquiry! We will get back to you soon.'),
  buttonText: text('button_text').default('Submit Enquiry'),
  themeColor: text('theme_color').default('#04d3d3'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
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
  spotlightSchoolId: integer('spotlight_school_id').references(() => schools1.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add testimonials table at the end
export const testimonials = sqliteTable('testimonials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  parentName: text('parent_name').notNull(),
  location: text('location').notNull(),
  rating: integer('rating').notNull(),
  testimonialText: text('testimonial_text').notNull(),
  avatarUrl: text('avatar_url'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  displayOrder: integer('display_order'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add reviews table at the end
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  schoolId: integer('school_id').notNull().references(() => schools1.id),
  rating: integer('rating').notNull(),
  reviewText: text('review_text').notNull(),
  photos: text('photos', { mode: 'json' }),
  approvalStatus: text('approval_status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Results table - for school exam results and achievements
export const results = sqliteTable('results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolId: integer('school_id').notNull().references(() => schools1.id),
  year: integer('year').notNull(),
  examType: text('exam_type').notNull(), // e.g., "Class 10 Board", "Class 12 Board", "Internal"
  classLevel: text('class_level'), // e.g., "10", "12"
  passPercentage: real('pass_percentage'),
  totalStudents: integer('total_students'),
  distinction: integer('distinction'), // Students with distinction
  firstClass: integer('first_class'),
  toppers: text('toppers', { mode: 'json' }), // Array of topper objects {name, percentage, subject}
  achievements: text('achievements'), // Text description
  certificateImages: text('certificate_images', { mode: 'json' }), // Array of image URLs
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Student Achievements table - for individual student achievements
export const studentAchievements = sqliteTable('student_achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolId: integer('school_id').notNull().references(() => schools1.id),
  year: integer('year').notNull(),
  studentName: text('student_name').notNull(),
  marks: text('marks'), // Can be percentage or actual marks
  classLevel: text('class_level').notNull(), // e.g., "10", "12"
  section: text('section'), // e.g., "A", "B"
  achievement: text('achievement').notNull(), // Description of achievement
  images: text('images', { mode: 'json' }), // Array of image URLs
  featured: integer('featured', { mode: 'boolean' }).default(false),
  displayOrder: integer('display_order'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Alumni table - for notable alumni
export const alumni = sqliteTable('alumni', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolId: integer('school_id').notNull().references(() => schools1.id),
  name: text('name').notNull(),
  batchYear: integer('batch_year').notNull(),
  classLevel: text('class_level'), // e.g., "10", "12", "Pre-K"
  section: text('section'), // e.g., "A", "B", "C"
  currentPosition: text('current_position'), // e.g., "CEO", "Software Engineer"
  company: text('company'), // Current company
  achievements: text('achievements'), // Notable achievements
  photoUrl: text('photo_url'),
  linkedinUrl: text('linkedin_url'),
  quote: text('quote'), // Alumni testimonial/quote
  featured: integer('featured', { mode: 'boolean' }).default(false),
  displayOrder: integer('display_order'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// News table - for school news and updates
export const news = sqliteTable('news', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolId: integer('school_id').notNull().references(() => schools1.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(), // e.g., "Event", "Achievement", "Announcement", "Academic"
  publishDate: text('publish_date').notNull(),
  link: text('link'), // External news link
  images: text('images', { mode: 'json' }), // Array of image URLs
  pdf: text('pdf'), // PDF file URL
  video: text('video'), // Video file URL
  isPublished: integer('is_published', { mode: 'boolean' }).default(true),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Notifications table - for user notifications
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipientId: integer('recipient_id').notNull(), // User ID or Super Admin ID
  recipientType: text('recipient_type').notNull(), // 'school', 'student', 'super_admin'
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'enquiry', 'enquiry_update', 'signup', 'review'
  relatedId: integer('related_id'), // ID of related entity (enquiry ID, review ID, etc.)
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Contact Submissions table - for "Get in Touch" form submissions
export const contactSubmissions = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolName: text('school_name'),
  contactPerson: text('contact_person').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  city: text('city').notNull(),
  message: text('message'),
  subject: text('subject'),
  interestedClass: text('interested_class'),
  status: text('status').notNull().default('new'), // 'new', 'in_progress', 'contacted', 'closed'
  notes: text('notes'),
  assignedTo: integer('assigned_to'), // Super Admin ID
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Email Verification Tokens table
export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// Password Reset Tokens table
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});
