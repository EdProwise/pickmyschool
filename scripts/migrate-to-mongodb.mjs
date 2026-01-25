import { createClient } from '@libsql/client';
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const TURSO_URL = process.env.TURSO_CONNECTION_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('Missing Turso credentials');
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error('Missing MongoDB URI');
  process.exit(1);
}

const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

const UserSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  role: String,
  email: { type: String, unique: true },
  password: String,
  name: String,
  phone: String,
  city: String,
  class: String,
  schoolId: Number,
  savedSchools: [Number],
  emailVerified: Boolean,
}, { timestamps: true });

const SchoolSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  userId: Number,
  name: String,
  establishmentYear: Number,
  schoolType: String,
  k12Level: String,
  board: String,
  gender: String,
  isInternational: Boolean,
  streamsAvailable: String,
  languages: String,
  totalStudents: String,
  totalTeachers: Number,
  logoUrl: String,
  aboutSchool: String,
  bannerImageUrl: String,
  address: String,
  city: String,
  state: String,
  country: String,
  website: String,
  contactNumber: String,
  whatsappNumber: String,
  email: String,
  facebookUrl: String,
  instagramUrl: String,
  linkedinUrl: String,
  youtubeUrl: String,
  googleMapUrl: String,
  pincode: String,
  medium: String,
  classesOffered: String,
  contactEmail: String,
  contactPhone: String,
  classroomType: String,
  hasLibrary: Boolean,
  hasComputerLab: Boolean,
  computerCount: Number,
  hasPhysicsLab: Boolean,
  hasChemistryLab: Boolean,
  hasBiologyLab: Boolean,
  hasMathsLab: Boolean,
  hasLanguageLab: Boolean,
  hasRoboticsLab: Boolean,
  hasStemLab: Boolean,
  hasAuditorium: Boolean,
  hasPlayground: Boolean,
  sportsFacilities: String,
  hasSwimmingPool: Boolean,
  hasFitnessCentre: Boolean,
  hasYoga: Boolean,
  hasMartialArts: Boolean,
  hasMusicDance: Boolean,
  hasHorseRiding: Boolean,
  hasSmartBoard: Boolean,
  hasWifi: Boolean,
  hasCctv: Boolean,
  hasElearning: Boolean,
  hasAcClassrooms: Boolean,
  hasAiTools: Boolean,
  hasTransport: Boolean,
  hasGpsBuses: Boolean,
  hasCctvBuses: Boolean,
  hasBusCaretaker: Boolean,
  hasMedicalRoom: Boolean,
  hasDoctorNurse: Boolean,
  hasFireSafety: Boolean,
  hasCleanWater: Boolean,
  hasSecurityGuards: Boolean,
  hasAirPurifier: Boolean,
  hasHostel: Boolean,
  hasMess: Boolean,
  hasHostelStudyRoom: Boolean,
  hasAcHostel: Boolean,
  hasCafeteria: Boolean,
  galleryImages: [String],
  virtualTourUrl: String,
  virtualTourVideos: [String],
  prospectusUrl: String,
  awards: [mongoose.Schema.Types.Mixed],
  newsletterUrl: String,
  feesStructure: mongoose.Schema.Types.Mixed,
  facilityImages: mongoose.Schema.Types.Mixed,
  logo: String,
  bannerImage: String,
  studentTeacherRatio: String,
  feesMin: Number,
  feesMax: Number,
  facilities: [String],
  description: String,
  gallery: [String],
  rating: Number,
  reviewCount: Number,
  profileViews: Number,
  featured: Boolean,
  isPublic: Boolean,
  latitude: Number,
  longitude: Number,
}, { timestamps: true });

const EnquirySchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  studentId: Number,
  schoolId: Number,
  studentName: String,
  studentEmail: String,
  studentPhone: String,
  studentClass: String,
  message: String,
  status: String,
  notes: String,
  followUpDate: String,
  studentAddress: String,
  studentState: String,
  studentAge: String,
  studentGender: String,
}, { timestamps: true });

const EnquiryFormSettingsSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  schoolId: Number,
  title: String,
  description: String,
  fields: [mongoose.Schema.Types.Mixed],
  successMessage: String,
  buttonText: String,
  themeColor: String,
  isActive: Boolean,
}, { timestamps: true });

const ChatSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  userId: Number,
  role: String,
  messages: [mongoose.Schema.Types.Mixed],
  lastMessageAt: Date,
}, { timestamps: true });

const SuperAdminSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  email: { type: String, unique: true },
  password: String,
  name: String,
}, { timestamps: true });

const SiteSettingsSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  spotlightSchoolId: Number,
}, { timestamps: true });

const TestimonialSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  parentName: String,
  location: String,
  rating: Number,
  testimonialText: String,
  avatarUrl: String,
  featured: Boolean,
  displayOrder: Number,
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  userId: Number,
  schoolId: Number,
  rating: Number,
  reviewText: String,
  photos: [String],
  approvalStatus: String,
}, { timestamps: true });

const ResultSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  schoolId: Number,
  year: Number,
  examType: String,
  classLevel: String,
  passPercentage: Number,
  totalStudents: Number,
  distinction: Number,
  firstClass: Number,
  toppers: [mongoose.Schema.Types.Mixed],
  achievements: String,
  certificateImages: [String],
}, { timestamps: true });

const StudentAchievementSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  schoolId: Number,
  year: Number,
  studentName: String,
  marks: String,
  classLevel: String,
  section: String,
  achievement: String,
  images: [String],
  featured: Boolean,
  displayOrder: Number,
}, { timestamps: true });

const AlumniSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  schoolId: Number,
  name: String,
  batchYear: Number,
  classLevel: String,
  section: String,
  currentPosition: String,
  company: String,
  achievements: String,
  photoUrl: String,
  linkedinUrl: String,
  quote: String,
  featured: Boolean,
  displayOrder: Number,
}, { timestamps: true });

const NewsSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  schoolId: Number,
  title: String,
  content: String,
  category: String,
  publishDate: String,
  link: String,
  images: [String],
  pdf: String,
  video: String,
  isPublished: Boolean,
  featured: Boolean,
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  recipientId: Number,
  recipientType: String,
  title: String,
  message: String,
  type: String,
  relatedId: Number,
  isRead: Boolean,
}, { timestamps: true });

const ContactSubmissionSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  schoolName: String,
  contactPerson: String,
  email: String,
  phone: String,
  city: String,
  message: String,
  subject: String,
  interestedClass: String,
  status: String,
  notes: String,
  assignedTo: Number,
}, { timestamps: true });

const EmailVerificationTokenSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  userId: Number,
  token: { type: String, unique: true },
  expiresAt: Date,
}, { timestamps: true });

const PasswordResetTokenSchema = new mongoose.Schema({
  odId: { type: Number, unique: true },
  userId: Number,
  token: { type: String, unique: true },
  expiresAt: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
const EnquiryFormSettings = mongoose.models.EnquiryFormSettings || mongoose.model('EnquiryFormSettings', EnquiryFormSettingsSchema);
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);
const StudentAchievement = mongoose.models.StudentAchievement || mongoose.model('StudentAchievement', StudentAchievementSchema);
const Alumni = mongoose.models.Alumni || mongoose.model('Alumni', AlumniSchema);
const News = mongoose.models.News || mongoose.model('News', NewsSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', ContactSubmissionSchema);
const EmailVerificationToken = mongoose.models.EmailVerificationToken || mongoose.model('EmailVerificationToken', EmailVerificationTokenSchema);
const PasswordResetToken = mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

function parseJSON(val) {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

async function migrateUsers() {
  console.log('Migrating users...');
  const result = await turso.execute('SELECT * FROM users');
  for (const row of result.rows) {
    try {
      await User.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          role: row.role,
          email: row.email,
          password: row.password,
          name: row.name,
          phone: row.phone,
          city: row.city,
          class: row.class,
          schoolId: row.school_id,
          savedSchools: parseJSON(row.saved_schools) || [],
          emailVerified: Boolean(row.email_verified),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating user ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} users`);
}

async function migrateSchools() {
  console.log('Migrating schools...');
  
  const result1 = await turso.execute('SELECT * FROM schools1');
  const result2 = await turso.execute('SELECT * FROM schools2');
  const result3 = await turso.execute('SELECT * FROM schools3');
  const result4 = await turso.execute('SELECT * FROM schools4');
  
  const schools2Map = new Map(result2.rows.map(r => [r.id, r]));
  const schools3Map = new Map(result3.rows.map(r => [r.id, r]));
  const schools4Map = new Map(result4.rows.map(r => [r.id, r]));
  
  for (const s1 of result1.rows) {
    const s2 = schools2Map.get(s1.id) || {};
    const s3 = schools3Map.get(s1.id) || {};
    const s4 = schools4Map.get(s1.id) || {};
    
    try {
      await School.findOneAndUpdate(
        { id: s1.id },
        {
          id: s1.id,
          userId: s1.user_id,
          name: s1.name,
          establishmentYear: s1.establishment_year,
          schoolType: s1.school_type,
          k12Level: s1.k12_level,
          board: s1.board,
          gender: s1.gender,
          isInternational: Boolean(s1.is_international),
          streamsAvailable: s1.streams_available,
          languages: s1.languages,
          totalStudents: s1.total_students,
          totalTeachers: s1.total_teachers,
          logoUrl: s1.logo_url,
          aboutSchool: s1.about_school,
          bannerImageUrl: s1.banner_image_url,
          address: s1.address,
          city: s1.city,
          state: s1.state,
          country: s1.country,
          website: s1.website,
          contactNumber: s1.contact_number,
          whatsappNumber: s1.whatsapp_number,
          email: s1.email,
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
          classroomType: s2.classroom_type,
          hasLibrary: Boolean(s2.has_library),
          hasComputerLab: Boolean(s2.has_computer_lab),
          computerCount: s2.computer_count,
          hasPhysicsLab: Boolean(s2.has_physics_lab),
          hasChemistryLab: Boolean(s2.has_chemistry_lab),
          hasBiologyLab: Boolean(s2.has_biology_lab),
          hasMathsLab: Boolean(s2.has_maths_lab),
          hasLanguageLab: Boolean(s2.has_language_lab),
          hasRoboticsLab: Boolean(s2.has_robotics_lab),
          hasStemLab: Boolean(s2.has_stem_lab),
          hasAuditorium: Boolean(s2.has_auditorium),
          hasPlayground: Boolean(s2.has_playground),
          sportsFacilities: s2.sports_facilities,
          hasSwimmingPool: Boolean(s2.has_swimming_pool),
          hasFitnessCentre: Boolean(s2.has_fitness_centre),
          hasYoga: Boolean(s2.has_yoga),
          hasMartialArts: Boolean(s2.has_martial_arts),
          hasMusicDance: Boolean(s2.has_music_dance),
          hasHorseRiding: Boolean(s2.has_horse_riding),
          hasSmartBoard: Boolean(s3.has_smart_board),
          hasWifi: Boolean(s3.has_wifi),
          hasCctv: Boolean(s3.has_cctv),
          hasElearning: Boolean(s3.has_elearning),
          hasAcClassrooms: Boolean(s3.has_ac_classrooms),
          hasAiTools: Boolean(s3.has_ai_tools),
          hasTransport: Boolean(s3.has_transport),
          hasGpsBuses: Boolean(s3.has_gps_buses),
          hasCctvBuses: Boolean(s3.has_cctv_buses),
          hasBusCaretaker: Boolean(s3.has_bus_caretaker),
          hasMedicalRoom: Boolean(s3.has_medical_room),
          hasDoctorNurse: Boolean(s3.has_doctor_nurse),
          hasFireSafety: Boolean(s3.has_fire_safety),
          hasCleanWater: Boolean(s3.has_clean_water),
          hasSecurityGuards: Boolean(s3.has_security_guards),
          hasAirPurifier: Boolean(s3.has_air_purifier),
          hasHostel: Boolean(s3.has_hostel),
          hasMess: Boolean(s3.has_mess),
          hasHostelStudyRoom: Boolean(s3.has_hostel_study_room),
          hasAcHostel: Boolean(s3.has_ac_hostel),
          hasCafeteria: Boolean(s3.has_cafeteria),
          galleryImages: parseJSON(s4.gallery_images) || [],
          virtualTourUrl: s4.virtual_tour_url,
          virtualTourVideos: parseJSON(s4.virtual_tour_videos) || [],
          prospectusUrl: s4.prospectus_url,
          awards: parseJSON(s4.awards) || [],
          newsletterUrl: s4.newsletter_url,
          feesStructure: parseJSON(s4.fees_structure),
          facilityImages: parseJSON(s4.facility_images),
          logo: s4.logo,
          bannerImage: s4.banner_image,
          studentTeacherRatio: s4.student_teacher_ratio,
          feesMin: s4.fees_min,
          feesMax: s4.fees_max,
          facilities: parseJSON(s4.facilities) || [],
          description: s4.description,
          gallery: parseJSON(s4.gallery) || [],
          rating: s4.rating || 0,
          reviewCount: s4.review_count || 0,
          profileViews: s4.profile_views || 0,
          featured: Boolean(s4.featured),
          isPublic: s4.is_public !== 0,
          latitude: s4.latitude,
          longitude: s4.longitude,
          createdAt: s1.created_at ? new Date(s1.created_at) : new Date(),
          updatedAt: s1.updated_at ? new Date(s1.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating school ${s1.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result1.rows.length} schools`);
}

async function migrateEnquiries() {
  console.log('Migrating enquiries...');
  const result = await turso.execute('SELECT * FROM enquiries');
  for (const row of result.rows) {
    try {
      await Enquiry.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          studentId: row.student_id,
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
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating enquiry ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} enquiries`);
}

async function migrateEnquiryFormSettings() {
  console.log('Migrating enquiry form settings...');
  const result = await turso.execute('SELECT * FROM enquiry_form_settings');
  for (const row of result.rows) {
    try {
      await EnquiryFormSettings.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          schoolId: row.school_id,
          title: row.title,
          description: row.description,
          fields: parseJSON(row.fields) || [],
          successMessage: row.success_message,
          buttonText: row.button_text,
          themeColor: row.theme_color,
          isActive: Boolean(row.is_active),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating enquiry form settings ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} enquiry form settings`);
}

async function migrateChats() {
  console.log('Migrating chats...');
  const result = await turso.execute('SELECT * FROM chats');
  for (const row of result.rows) {
    try {
      await Chat.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          userId: row.user_id,
          role: row.role,
          messages: parseJSON(row.messages) || [],
          lastMessageAt: row.last_message_at ? new Date(row.last_message_at) : null,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating chat ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} chats`);
}

async function migrateSuperAdmin() {
  console.log('Migrating super admins...');
  const result = await turso.execute('SELECT * FROM super_admin');
  for (const row of result.rows) {
    try {
      await SuperAdmin.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          email: row.email,
          password: row.password,
          name: row.name,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating super admin ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} super admins`);
}

async function migrateSiteSettings() {
  console.log('Migrating site settings...');
  const result = await turso.execute('SELECT * FROM site_settings');
  for (const row of result.rows) {
    try {
      await SiteSettings.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          spotlightSchoolId: row.spotlight_school_id,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating site settings ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} site settings`);
}

async function migrateTestimonials() {
  console.log('Migrating testimonials...');
  const result = await turso.execute('SELECT * FROM testimonials');
  for (const row of result.rows) {
    try {
      await Testimonial.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          parentName: row.parent_name,
          location: row.location,
          rating: row.rating,
          testimonialText: row.testimonial_text,
          avatarUrl: row.avatar_url,
          featured: Boolean(row.featured),
          displayOrder: row.display_order,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating testimonial ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} testimonials`);
}

async function migrateReviews() {
  console.log('Migrating reviews...');
  const result = await turso.execute('SELECT * FROM reviews');
  for (const row of result.rows) {
    try {
      await Review.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          userId: row.user_id,
          schoolId: row.school_id,
          rating: row.rating,
          reviewText: row.review_text,
          photos: parseJSON(row.photos) || [],
          approvalStatus: row.approval_status,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating review ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} reviews`);
}

async function migrateResults() {
  console.log('Migrating results...');
  const result = await turso.execute('SELECT * FROM results');
  for (const row of result.rows) {
    try {
      await Result.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          schoolId: row.school_id,
          year: row.year,
          examType: row.exam_type,
          classLevel: row.class_level,
          passPercentage: row.pass_percentage,
          totalStudents: row.total_students,
          distinction: row.distinction,
          firstClass: row.first_class,
          toppers: parseJSON(row.toppers) || [],
          achievements: row.achievements,
          certificateImages: parseJSON(row.certificate_images) || [],
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating result ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} results`);
}

async function migrateStudentAchievements() {
  console.log('Migrating student achievements...');
  const result = await turso.execute('SELECT * FROM student_achievements');
  for (const row of result.rows) {
    try {
      await StudentAchievement.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          schoolId: row.school_id,
          year: row.year,
          studentName: row.student_name,
          marks: row.marks,
          classLevel: row.class_level,
          section: row.section,
          achievement: row.achievement,
          images: parseJSON(row.images) || [],
          featured: Boolean(row.featured),
          displayOrder: row.display_order,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating student achievement ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} student achievements`);
}

async function migrateAlumni() {
  console.log('Migrating alumni...');
  const result = await turso.execute('SELECT * FROM alumni');
  for (const row of result.rows) {
    try {
      await Alumni.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          schoolId: row.school_id,
          name: row.name,
          batchYear: row.batch_year,
          classLevel: row.class_level,
          section: row.section,
          currentPosition: row.current_position,
          company: row.company,
          achievements: row.achievements,
          photoUrl: row.photo_url,
          linkedinUrl: row.linkedin_url,
          quote: row.quote,
          featured: Boolean(row.featured),
          displayOrder: row.display_order,
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating alumni ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} alumni`);
}

async function migrateNews() {
  console.log('Migrating news...');
  const result = await turso.execute('SELECT * FROM news');
  for (const row of result.rows) {
    try {
      await News.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          schoolId: row.school_id,
          title: row.title,
          content: row.content,
          category: row.category,
          publishDate: row.publish_date,
          link: row.link,
          images: parseJSON(row.images) || [],
          pdf: row.pdf,
          video: row.video,
          isPublished: Boolean(row.is_published),
          featured: Boolean(row.featured),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating news ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} news`);
}

async function migrateNotifications() {
  console.log('Migrating notifications...');
  const result = await turso.execute('SELECT * FROM notifications');
  for (const row of result.rows) {
    try {
      await Notification.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          recipientId: row.recipient_id,
          recipientType: row.recipient_type,
          title: row.title,
          message: row.message,
          type: row.type,
          relatedId: row.related_id,
          isRead: Boolean(row.is_read),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating notification ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} notifications`);
}

async function migrateContactSubmissions() {
  console.log('Migrating contact submissions...');
  const result = await turso.execute('SELECT * FROM contact_submissions');
  for (const row of result.rows) {
    try {
      await ContactSubmission.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
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
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating contact submission ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} contact submissions`);
}

async function migrateEmailVerificationTokens() {
  console.log('Migrating email verification tokens...');
  const result = await turso.execute('SELECT * FROM email_verification_tokens');
  for (const row of result.rows) {
    try {
      await EmailVerificationToken.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          userId: row.user_id,
          token: row.token,
          expiresAt: row.expires_at ? new Date(row.expires_at) : new Date(),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating email verification token ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} email verification tokens`);
}

async function migratePasswordResetTokens() {
  console.log('Migrating password reset tokens...');
  const result = await turso.execute('SELECT * FROM password_reset_tokens');
  for (const row of result.rows) {
    try {
      await PasswordResetToken.findOneAndUpdate(
        { odId: row.id },
        {
          odId: row.id,
          userId: row.user_id,
          token: row.token,
          expiresAt: row.expires_at ? new Date(row.expires_at) : new Date(),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Error migrating password reset token ${row.id}:`, err.message);
    }
  }
  console.log(`Migrated ${result.rows.length} password reset tokens`);
}

async function main() {
  console.log('Starting migration from Turso to MongoDB...');
  console.log('MongoDB URI:', MONGODB_URI.substring(0, 30) + '...');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
  
  await migrateUsers();
  await migrateSchools();
  await migrateEnquiries();
  await migrateEnquiryFormSettings();
  await migrateChats();
  await migrateSuperAdmin();
  await migrateSiteSettings();
  await migrateTestimonials();
  await migrateReviews();
  await migrateResults();
  await migrateStudentAchievements();
  await migrateAlumni();
  await migrateNews();
  await migrateNotifications();
  await migrateContactSubmissions();
  await migrateEmailVerificationTokens();
  await migratePasswordResetTokens();
  
  console.log('\nMigration complete!');
  
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
