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

// Schools table
export const schools = sqliteTable('schools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  logo: text('logo'),
  bannerImage: text('banner_image'),
  address: text('address'),
  city: text('city').notNull(),
  state: text('state'),
  pincode: text('pincode'),
  board: text('board').notNull(), // CBSE/ICSE/IB/State Board
  medium: text('medium'),
  classesOffered: text('classes_offered'),
  establishmentYear: integer('establishment_year'),
  studentTeacherRatio: text('student_teacher_ratio'),
  schoolType: text('school_type'), // Day School/Boarding/Both
  feesMin: integer('fees_min'),
  feesMax: integer('fees_max'),
  facilities: text('facilities', { mode: 'json' }), // Array of strings
  description: text('description'),
  gallery: text('gallery', { mode: 'json' }), // Array of image URLs
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  profileViews: integer('profile_views').default(0),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  latitude: real('latitude'),
  longitude: real('longitude'),
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