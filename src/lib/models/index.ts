import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  role: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  city?: string;
  class?: string;
  schoolId?: mongoose.Types.ObjectId;
  savedSchools?: number[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  city: String,
  class: String,
  schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
  savedSchools: [Number],
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

export interface ISchool extends Document {
  _id: mongoose.Types.ObjectId;
  id: number;
  userId?: mongoose.Types.ObjectId;
  name: string;
  establishmentYear?: number;
  schoolType?: string;
  k12Level?: string;
  board: string;
  gender?: string;
  isInternational: boolean;
  streamsAvailable?: string;
  languages?: string;
  totalStudents?: string;
  totalTeachers?: number;
  logoUrl?: string;
  aboutSchool?: string;
  bannerImageUrl?: string;
  address?: string;
  city: string;
  state?: string;
  country?: string;
  website?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  googleMapUrl?: string;
  pincode?: string;
  medium?: string;
  classesOffered?: string;
  contactEmail?: string;
  contactPhone?: string;
  classroomType?: string;
  hasLibrary: boolean;
  hasComputerLab: boolean;
  computerCount?: number;
  hasPhysicsLab: boolean;
  hasChemistryLab: boolean;
  hasBiologyLab: boolean;
  hasMathsLab: boolean;
  hasLanguageLab: boolean;
  hasRoboticsLab: boolean;
  hasStemLab: boolean;
  hasAuditorium: boolean;
  hasPlayground: boolean;
  sportsFacilities?: string;
  hasSwimmingPool: boolean;
  hasFitnessCentre: boolean;
  hasYoga: boolean;
  hasMartialArts: boolean;
  hasMusicDance: boolean;
  hasHorseRiding: boolean;
  hasSmartBoard: boolean;
  hasWifi: boolean;
  hasCctv: boolean;
  hasElearning: boolean;
  hasAcClassrooms: boolean;
  hasAiTools: boolean;
  hasTransport: boolean;
  hasGpsBuses: boolean;
  hasCctvBuses: boolean;
  hasBusCaretaker: boolean;
  hasMedicalRoom: boolean;
  hasDoctorNurse: boolean;
  hasFireSafety: boolean;
  hasCleanWater: boolean;
  hasSecurityGuards: boolean;
  hasAirPurifier: boolean;
  hasHostel: boolean;
  hasMess: boolean;
  hasHostelStudyRoom: boolean;
  hasAcHostel: boolean;
  hasCafeteria: boolean;
  galleryImages?: string[];
  virtualTourUrl?: string;
  virtualTourVideos?: string[];
  prospectusUrl?: string;
  awards?: any[];
  newsletterUrl?: string;
  feesStructure?: any;
  facilityImages?: any;
  logo?: string;
  bannerImage?: string;
  studentTeacherRatio?: string;
  feesMin?: number;
  feesMax?: number;
  facilities?: string[];
  description?: string;
  gallery?: string[];
  rating: number;
  reviewCount: number;
  profileViews: number;
  featured: boolean;
  isPublic: boolean;
  latitude?: number;
  longitude?: number;
  whatsappWebhookUrl?: string;
  whatsappApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>({
  id: { type: Number, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  establishmentYear: Number,
  schoolType: String,
  k12Level: String,
  board: { type: String, required: true },
  gender: String,
  isInternational: { type: Boolean, default: false },
  streamsAvailable: String,
  languages: String,
  totalStudents: String,
  totalTeachers: Number,
  logoUrl: String,
  aboutSchool: String,
  bannerImageUrl: String,
  address: String,
  city: { type: String, required: true },
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
  hasLibrary: { type: Boolean, default: false },
  hasComputerLab: { type: Boolean, default: false },
  computerCount: Number,
  hasPhysicsLab: { type: Boolean, default: false },
  hasChemistryLab: { type: Boolean, default: false },
  hasBiologyLab: { type: Boolean, default: false },
  hasMathsLab: { type: Boolean, default: false },
  hasLanguageLab: { type: Boolean, default: false },
  hasRoboticsLab: { type: Boolean, default: false },
  hasStemLab: { type: Boolean, default: false },
  hasAuditorium: { type: Boolean, default: false },
  hasPlayground: { type: Boolean, default: false },
  sportsFacilities: String,
  hasSwimmingPool: { type: Boolean, default: false },
  hasFitnessCentre: { type: Boolean, default: false },
  hasYoga: { type: Boolean, default: false },
  hasMartialArts: { type: Boolean, default: false },
  hasMusicDance: { type: Boolean, default: false },
  hasHorseRiding: { type: Boolean, default: false },
  hasSmartBoard: { type: Boolean, default: false },
  hasWifi: { type: Boolean, default: false },
  hasCctv: { type: Boolean, default: false },
  hasElearning: { type: Boolean, default: false },
  hasAcClassrooms: { type: Boolean, default: false },
  hasAiTools: { type: Boolean, default: false },
  hasTransport: { type: Boolean, default: false },
  hasGpsBuses: { type: Boolean, default: false },
  hasCctvBuses: { type: Boolean, default: false },
  hasBusCaretaker: { type: Boolean, default: false },
  hasMedicalRoom: { type: Boolean, default: false },
  hasDoctorNurse: { type: Boolean, default: false },
  hasFireSafety: { type: Boolean, default: false },
  hasCleanWater: { type: Boolean, default: false },
  hasSecurityGuards: { type: Boolean, default: false },
  hasAirPurifier: { type: Boolean, default: false },
  hasHostel: { type: Boolean, default: false },
  hasMess: { type: Boolean, default: false },
  hasHostelStudyRoom: { type: Boolean, default: false },
  hasAcHostel: { type: Boolean, default: false },
  hasCafeteria: { type: Boolean, default: false },
  galleryImages: [String],
  virtualTourUrl: String,
  virtualTourVideos: [String],
  prospectusUrl: String,
  awards: [Schema.Types.Mixed],
  newsletterUrl: String,
  feesStructure: Schema.Types.Mixed,
  facilityImages: Schema.Types.Mixed,
  logo: String,
  bannerImage: String,
  studentTeacherRatio: String,
  feesMin: Number,
  feesMax: Number,
  facilities: [String],
  description: String,
  gallery: [String],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  latitude: Number,
  longitude: Number,
  whatsappWebhookUrl: String,
  whatsappApiKey: String,
}, { timestamps: true });

SchoolSchema.index({ city: 1 });
SchoolSchema.index({ board: 1 });
SchoolSchema.index({ featured: 1 });
SchoolSchema.index({ name: 'text', city: 'text' });

export interface IEnquiry extends Document {
  _id: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  schoolId: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentClass: string;
  message?: string;
  status: string;
  notes?: string;
  followUpDate?: string;
  studentAddress?: string;
  studentState?: string;
  studentAge?: string;
  studentGender?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  schoolId: { type: Number, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, required: true },
  studentClass: { type: String, required: true },
  message: String,
  status: { type: String, default: 'New' },
  notes: String,
  followUpDate: String,
  studentAddress: String,
  studentState: String,
  studentAge: String,
  studentGender: String,
}, { timestamps: true });

export interface IEnquiryFormSettings extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: number;
  title: string;
  description?: string;
  fields?: any[];
  successMessage: string;
  buttonText: string;
  themeColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnquiryFormSettingsSchema = new Schema<IEnquiryFormSettings>({
  schoolId: { type: Number, required: true, unique: true },
  title: { type: String, default: 'Admission Enquiry' },
  description: String,
  fields: [Schema.Types.Mixed],
  successMessage: { type: String, default: 'Thank you for your enquiry! We will get back to you soon.' },
  buttonText: { type: String, default: 'Submit Enquiry' },
  themeColor: { type: String, default: '#04d3d3' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  odId: number;
  userId: mongoose.Types.ObjectId;
  role: string;
  messages?: any[];
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  odId: { type: Number, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  messages: [Schema.Types.Mixed],
  lastMessageAt: Date,
}, { timestamps: true });

export interface ISuperAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

export interface ISiteSettings extends Document {
  _id: mongoose.Types.ObjectId;
  spotlightSchoolId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  spotlightSchoolId: Number,
}, { timestamps: true });

export interface ITestimonial extends Document {
  _id: mongoose.Types.ObjectId;
  parentName: string;
  location: string;
  rating: number;
  testimonialText: string;
  avatarUrl?: string;
  featured: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  parentName: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  testimonialText: { type: String, required: true },
  avatarUrl: String,
  featured: { type: Boolean, default: false },
  displayOrder: Number,
}, { timestamps: true });

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  odId: number;
  userId: mongoose.Types.ObjectId;
  schoolId: number;
  rating: number;
  reviewText: string;
  photos?: string[];
  approvalStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  odId: { type: Number, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: Number, required: true },
  rating: { type: Number, required: true },
  reviewText: { type: String, required: true },
  photos: [String],
  approvalStatus: { type: String, default: 'pending' },
}, { timestamps: true });

export interface IResult extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: number;
  year: number;
  examType: string;
  classLevel?: string;
  passPercentage?: number;
  totalStudents?: number;
  distinction?: number;
  firstClass?: number;
  toppers?: any[];
  achievements?: string;
  certificateImages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema = new Schema<IResult>({
  schoolId: { type: Number, required: true },
  year: { type: Number, required: true },
  examType: { type: String, required: true },
  classLevel: String,
  passPercentage: Number,
  totalStudents: Number,
  distinction: Number,
  firstClass: Number,
  toppers: [Schema.Types.Mixed],
  achievements: String,
  certificateImages: [String],
}, { timestamps: true });

export interface IStudentAchievement extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: number;
  year: number;
  studentName: string;
  marks?: string;
  classLevel: string;
  section?: string;
  achievement: string;
  images?: string[];
  featured: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentAchievementSchema = new Schema<IStudentAchievement>({
  schoolId: { type: Number, required: true },
  year: { type: Number, required: true },
  studentName: { type: String, required: true },
  marks: String,
  classLevel: { type: String, required: true },
  section: String,
  achievement: { type: String, required: true },
  images: [String],
  featured: { type: Boolean, default: false },
  displayOrder: Number,
}, { timestamps: true });

export interface IAlumni extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: number;
  name: string;
  batchYear: number;
  classLevel?: string;
  section?: string;
  currentPosition?: string;
  company?: string;
  achievements?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  quote?: string;
  featured: boolean;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlumniSchema = new Schema<IAlumni>({
  schoolId: { type: Number, required: true },
  name: { type: String, required: true },
  batchYear: { type: Number, required: true },
  classLevel: String,
  section: String,
  currentPosition: String,
  company: String,
  achievements: String,
  photoUrl: String,
  linkedinUrl: String,
  quote: String,
  featured: { type: Boolean, default: false },
  displayOrder: Number,
}, { timestamps: true });

export interface INews extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: number;
  title: string;
  content: string;
  category: string;
  publishDate: string;
  link?: string;
  images?: string[];
  pdf?: string;
  video?: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>({
  schoolId: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  publishDate: { type: String, required: true },
  link: String,
  images: [String],
  pdf: String,
  video: String,
  isPublished: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipientId: number;
  recipientType: string;
  title: string;
  message: string;
  type: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Number, required: true },
  recipientType: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  relatedId: Number,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export interface IContactSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  schoolName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  message?: string;
  subject?: string;
  interestedClass?: string;
  status: string;
  notes?: string;
  assignedTo?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>({
  schoolName: String,
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  message: String,
  subject: String,
  interestedClass: String,
  status: { type: String, default: 'new' },
  notes: String,
  assignedTo: Number,
}, { timestamps: true });

export interface IEmailVerificationToken extends Document {
  _id: mongoose.Types.ObjectId;
  odId: number;
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>({
  odId: { type: Number, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export interface IPasswordResetToken extends Document {
  _id: mongoose.Types.ObjectId;
  odId: number;
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  odId: { type: Number, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return mongoose.models[name] || mongoose.model<T>(name, schema);
}

export const User = getModel<IUser>('User', UserSchema);
export const School = getModel<ISchool>('School', SchoolSchema);
export const Enquiry = getModel<IEnquiry>('Enquiry', EnquirySchema);
export const EnquiryFormSettings = getModel<IEnquiryFormSettings>('EnquiryFormSettings', EnquiryFormSettingsSchema);
export const Chat = getModel<IChat>('Chat', ChatSchema);
export const SuperAdmin = getModel<ISuperAdmin>('SuperAdmin', SuperAdminSchema);
export const SiteSettings = getModel<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export const Testimonial = getModel<ITestimonial>('Testimonial', TestimonialSchema);
export const Review = getModel<IReview>('Review', ReviewSchema);
export const Result = getModel<IResult>('Result', ResultSchema);
export const StudentAchievement = getModel<IStudentAchievement>('StudentAchievement', StudentAchievementSchema);
export const Alumni = getModel<IAlumni>('Alumni', AlumniSchema);
export const News = getModel<INews>('News', NewsSchema);
export const Notification = getModel<INotification>('Notification', NotificationSchema);
export const ContactSubmission = getModel<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
export const EmailVerificationToken = getModel<IEmailVerificationToken>('EmailVerificationToken', EmailVerificationTokenSchema);
export const PasswordResetToken = getModel<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
