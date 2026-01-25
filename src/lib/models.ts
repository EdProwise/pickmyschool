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
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  city: { type: String },
  class: { type: String },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
  savedSchools: [{ type: Number }],
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
  isInternational?: boolean;
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
  hasLibrary?: boolean;
  hasComputerLab?: boolean;
  computerCount?: number;
  hasPhysicsLab?: boolean;
  hasChemistryLab?: boolean;
  hasBiologyLab?: boolean;
  hasMathsLab?: boolean;
  hasLanguageLab?: boolean;
  hasRoboticsLab?: boolean;
  hasStemLab?: boolean;
  hasAuditorium?: boolean;
  hasPlayground?: boolean;
  sportsFacilities?: string;
  hasSwimmingPool?: boolean;
  hasFitnessCentre?: boolean;
  hasYoga?: boolean;
  hasMartialArts?: boolean;
  hasMusicDance?: boolean;
  hasHorseRiding?: boolean;
  hasSmartBoard?: boolean;
  hasWifi?: boolean;
  hasCctv?: boolean;
  hasElearning?: boolean;
  hasAcClassrooms?: boolean;
  hasAiTools?: boolean;
  hasTransport?: boolean;
  hasGpsBuses?: boolean;
  hasCctvBuses?: boolean;
  hasBusCaretaker?: boolean;
  hasMedicalRoom?: boolean;
  hasDoctorNurse?: boolean;
  hasFireSafety?: boolean;
  hasCleanWater?: boolean;
  hasSecurityGuards?: boolean;
  hasAirPurifier?: boolean;
  hasHostel?: boolean;
  hasMess?: boolean;
  hasHostelStudyRoom?: boolean;
  hasAcHostel?: boolean;
  hasCafeteria?: boolean;
  galleryImages?: string[];
  virtualTourUrl?: string;
  virtualTourVideos?: string[];
  prospectusUrl?: string;
  awards?: string[];
  newsletterUrl?: string;
  feesStructure?: Record<string, unknown>;
  facilityImages?: Record<string, string[]>;
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
  createdAt?: Date;
  updatedAt?: Date;
}

const SchoolSchema = new Schema<ISchool>({
  id: { type: Number, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  establishmentYear: { type: Number },
  schoolType: { type: String },
  k12Level: { type: String },
  board: { type: String, required: true },
  gender: { type: String },
  isInternational: { type: Boolean, default: false },
  streamsAvailable: { type: String },
  languages: { type: String },
  totalStudents: { type: String },
  totalTeachers: { type: Number },
  logoUrl: { type: String },
  aboutSchool: { type: String },
  bannerImageUrl: { type: String },
  address: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String },
  website: { type: String },
  contactNumber: { type: String },
  whatsappNumber: { type: String },
  email: { type: String },
  facebookUrl: { type: String },
  instagramUrl: { type: String },
  linkedinUrl: { type: String },
  youtubeUrl: { type: String },
  googleMapUrl: { type: String },
  pincode: { type: String },
  medium: { type: String },
  classesOffered: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  classroomType: { type: String },
  hasLibrary: { type: Boolean, default: false },
  hasComputerLab: { type: Boolean, default: false },
  computerCount: { type: Number },
  hasPhysicsLab: { type: Boolean, default: false },
  hasChemistryLab: { type: Boolean, default: false },
  hasBiologyLab: { type: Boolean, default: false },
  hasMathsLab: { type: Boolean, default: false },
  hasLanguageLab: { type: Boolean, default: false },
  hasRoboticsLab: { type: Boolean, default: false },
  hasStemLab: { type: Boolean, default: false },
  hasAuditorium: { type: Boolean, default: false },
  hasPlayground: { type: Boolean, default: false },
  sportsFacilities: { type: String },
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
  galleryImages: [{ type: String }],
  virtualTourUrl: { type: String },
  virtualTourVideos: [{ type: String }],
  prospectusUrl: { type: String },
  awards: [{ type: String }],
  newsletterUrl: { type: String },
  feesStructure: { type: Schema.Types.Mixed },
  facilityImages: { type: Schema.Types.Mixed },
  logo: { type: String },
  bannerImage: { type: String },
  studentTeacherRatio: { type: String },
  feesMin: { type: Number },
  feesMax: { type: Number },
  facilities: [{ type: String }],
  description: { type: String },
  gallery: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  latitude: { type: Number },
  longitude: { type: Number },
}, { timestamps: true });

SchoolSchema.index({ city: 1 });
SchoolSchema.index({ board: 1 });
SchoolSchema.index({ featured: 1 });
SchoolSchema.index({ rating: -1 });
SchoolSchema.index({ profileViews: -1 });

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
  createdAt?: Date;
  updatedAt?: Date;
}

const EnquirySchema = new Schema<IEnquiry>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  schoolId: { type: Number, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, required: true },
  studentClass: { type: String, required: true },
  message: { type: String },
  status: { type: String, required: true, default: 'New' },
  notes: { type: String },
  followUpDate: { type: String },
  studentAddress: { type: String },
  studentState: { type: String },
  studentAge: { type: String },
    studentGender: { type: String },
  }, { timestamps: true });

export interface IEnquiryFormSettings extends Document {
  _id: mongoose.Types.ObjectId;
  schoolId: number;
  title: string;
  description?: string;
  fields?: unknown[];
  successMessage: string;
  buttonText: string;
  themeColor: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const EnquiryFormSettingsSchema = new Schema<IEnquiryFormSettings>({
  schoolId: { type: Number, required: true, unique: true },
  title: { type: String, required: true, default: 'Admission Enquiry' },
  description: { type: String },
  fields: [{ type: Schema.Types.Mixed }],
  successMessage: { type: String, default: 'Thank you for your enquiry! We will get back to you soon.' },
  buttonText: { type: String, default: 'Submit Enquiry' },
  themeColor: { type: String, default: '#04d3d3' },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: string;
  messages?: unknown[];
  lastMessageAt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  messages: [{ type: Schema.Types.Mixed }],
    lastMessageAt: { type: String },
  }, { timestamps: true });

export interface ISuperAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
    name: { type: String, required: true },
  }, { timestamps: true });

export interface ISiteSettings extends Document {
  _id: mongoose.Types.ObjectId;
  spotlightSchoolId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
    spotlightSchoolId: { type: Number },
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
  createdAt?: Date;
  updatedAt?: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  parentName: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  testimonialText: { type: String, required: true },
  avatarUrl: { type: String },
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number },
}, { timestamps: true });

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  schoolId: number;
  rating: number;
  reviewText: string;
  photos?: string[];
  approvalStatus: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: Number, required: true },
  rating: { type: Number, required: true },
  reviewText: { type: String, required: true },
    photos: [{ type: String }],
    approvalStatus: { type: String, required: true, default: 'pending' },
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
  toppers?: unknown[];
  achievements?: string;
  certificateImages?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ResultSchema = new Schema<IResult>({
  schoolId: { type: Number, required: true },
  year: { type: Number, required: true },
  examType: { type: String, required: true },
  classLevel: { type: String },
  passPercentage: { type: Number },
  totalStudents: { type: Number },
  distinction: { type: Number },
  firstClass: { type: Number },
  toppers: [{ type: Schema.Types.Mixed }],
  achievements: { type: String },
  certificateImages: [{ type: String }],
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
  createdAt?: Date;
  updatedAt?: Date;
}

const StudentAchievementSchema = new Schema<IStudentAchievement>({
  schoolId: { type: Number, required: true },
  year: { type: Number, required: true },
  studentName: { type: String, required: true },
  marks: { type: String },
  classLevel: { type: String, required: true },
  section: { type: String },
  achievement: { type: String, required: true },
  images: [{ type: String }],
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number },
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
  createdAt?: Date;
  updatedAt?: Date;
}

const AlumniSchema = new Schema<IAlumni>({
  schoolId: { type: Number, required: true },
  name: { type: String, required: true },
  batchYear: { type: Number, required: true },
  classLevel: { type: String },
  section: { type: String },
  currentPosition: { type: String },
  company: { type: String },
  achievements: { type: String },
  photoUrl: { type: String },
  linkedinUrl: { type: String },
  quote: { type: String },
  featured: { type: Boolean, default: false },
  displayOrder: { type: Number },
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
  createdAt?: Date;
  updatedAt?: Date;
}

const NewsSchema = new Schema<INews>({
  schoolId: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  publishDate: { type: String, required: true },
  link: { type: String },
  images: [{ type: String }],
  pdf: { type: String },
  video: { type: String },
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
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Number, required: true },
  recipientType: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
    type: { type: String, required: true },
    relatedId: { type: Number },
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
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>({
  schoolName: { type: String },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  message: { type: String },
  subject: { type: String },
  interestedClass: { type: String },
    status: { type: String, required: true, default: 'new' },
    notes: { type: String },
    assignedTo: { type: Number },
  }, { timestamps: true });

export interface IEmailVerificationToken extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: string;
  createdAt: string;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
    expiresAt: { type: String, required: true },
  }, { timestamps: { createdAt: true, updatedAt: false } });

export interface IPasswordResetToken extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: string;
  createdAt: string;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
    expiresAt: { type: String, required: true },
  }, { timestamps: { createdAt: true, updatedAt: false } });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const School: Model<ISchool> = mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);
export const Enquiry: Model<IEnquiry> = mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
export const EnquiryFormSettings: Model<IEnquiryFormSettings> = mongoose.models.EnquiryFormSettings || mongoose.model<IEnquiryFormSettings>('EnquiryFormSettings', EnquiryFormSettingsSchema);
export const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
export const SuperAdmin: Model<ISuperAdmin> = mongoose.models.SuperAdmin || mongoose.model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);
export const SiteSettings: Model<ISiteSettings> = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export const Testimonial: Model<ITestimonial> = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export const Result: Model<IResult> = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
export const StudentAchievement: Model<IStudentAchievement> = mongoose.models.StudentAchievement || mongoose.model<IStudentAchievement>('StudentAchievement', StudentAchievementSchema);
export const Alumni: Model<IAlumni> = mongoose.models.Alumni || mongoose.model<IAlumni>('Alumni', AlumniSchema);
export const News: Model<INews> = mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const ContactSubmission: Model<IContactSubmission> = mongoose.models.ContactSubmission || mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
export const EmailVerificationToken: Model<IEmailVerificationToken> = mongoose.models.EmailVerificationToken || mongoose.model<IEmailVerificationToken>('EmailVerificationToken', EmailVerificationTokenSchema);
export const PasswordResetToken: Model<IPasswordResetToken> = mongoose.models.PasswordResetToken || mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
