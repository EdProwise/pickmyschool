'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Star, IndianRupee, Phone, Mail, Calendar, Users, 
  CheckCircle2, Heart, Share2, Bookmark, MessageCircle, ArrowLeft,
  Globe, Facebook, Instagram, Linkedin, Youtube, Download, Trophy,
  Video, FileText, Wifi, Shield, Bus, Laptop, BookOpen, GraduationCap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AIChat } from '@/components/AIChat';

// Extended School interface with all comprehensive fields
interface School {
  id: number;
  name: string;
  
  // Basic Info
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
  
  // Contact Info
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
  
  // Comprehensive Facilities
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
  
  // Media & Documents
  galleryImages?: string[];
  virtualTourUrl?: string;
  prospectusUrl?: string;
  awards?: string[];
  newsletterUrl?: string;
  feesStructure?: any;
  facilityImages?: Record<string, string[]>;
  
  // Legacy fields
  logo?: string;
  bannerImage?: string;
  pincode?: string;
  medium?: string;
  classesOffered?: string;
  studentTeacherRatio?: string;
  feesMin?: number;
  feesMax?: number;
  facilities?: string[];
  description?: string;
  gallery?: string[];
  contactEmail?: string;
  contactPhone?: string;
  rating: number;
  reviewCount: number;
  profileViews: number;
  featured: boolean;
}

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = parseInt(params.id as string);
  
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentClass: '',
    message: '',
  });

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  const loadSchool = async () => {
    try {
      const response = await fetch(`/api/schools?id=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch school');
      const data = await response.json();
      setSchool(data);
    } catch (error) {
      console.error('Failed to load school:', error);
      toast.error('Failed to load school details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to submit an enquiry');
      router.push('/login');
      return;
    }

    setSubmittingEnquiry(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          schoolId,
          ...enquiryForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit enquiry');
      
      toast.success('Enquiry submitted successfully! The school will contact you soon.');
      setEnquiryForm({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        studentClass: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // Helper function to parse awards (can be string or JSON)
  const parseAward = (award: string) => {
    try {
      const parsed = JSON.parse(award);
      if (typeof parsed === 'object' && (parsed.text || parsed.image)) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, treat as plain text
    }
    return { text: award, image: '' };
  };

  // Build comprehensive facilities list
  const buildFacilitiesList = () => {
    if (!school) return [];
    
    const facilities = [];
    
    // Academic
    if (school.hasLibrary) facilities.push('Library');
    if (school.hasComputerLab) facilities.push('Computer Lab');
    if (school.hasPhysicsLab) facilities.push('Physics Lab');
    if (school.hasChemistryLab) facilities.push('Chemistry Lab');
    if (school.hasBiologyLab) facilities.push('Biology Lab');
    if (school.hasMathsLab) facilities.push('Maths Lab');
    if (school.hasLanguageLab) facilities.push('Language Lab');
    if (school.hasRoboticsLab) facilities.push('Robotics Lab');
    if (school.hasStemLab) facilities.push('STEM/Innovation Lab');
    if (school.hasAuditorium) facilities.push('Auditorium');
    
    // Sports
    if (school.hasPlayground) facilities.push('Playground');
    if (school.hasSwimmingPool) facilities.push('Swimming Pool');
    if (school.hasFitnessCentre) facilities.push('Fitness Centre');
    if (school.hasYoga) facilities.push('Yoga');
    if (school.hasMartialArts) facilities.push('Martial Arts');
    if (school.hasMusicDance) facilities.push('Music & Dance');
    if (school.hasHorseRiding) facilities.push('Horse Riding/Archery');
    
    // Technology
    if (school.hasSmartBoard) facilities.push('Smart Board');
    if (school.hasWifi) facilities.push('WiFi Campus');
    if (school.hasCctv) facilities.push('CCTV Surveillance');
    if (school.hasElearning) facilities.push('E-Learning Platform');
    if (school.hasAcClassrooms) facilities.push('AC Classrooms');
    if (school.hasAiTools) facilities.push('AI Learning Tools');
    
    // Transport
    if (school.hasTransport) facilities.push('School Bus');
    if (school.hasGpsBuses) facilities.push('GPS Enabled Buses');
    if (school.hasCctvBuses) facilities.push('CCTV in Buses');
    if (school.hasBusCaretaker) facilities.push('Bus Caretaker');
    
    // Health & Safety
    if (school.hasMedicalRoom) facilities.push('Medical Room');
    if (school.hasDoctorNurse) facilities.push('On-Campus Doctor/Nurse');
    if (school.hasFireSafety) facilities.push('Fire Safety');
    if (school.hasCleanWater) facilities.push('Clean Drinking Water');
    if (school.hasSecurityGuards) facilities.push('Security Guards');
    if (school.hasAirPurifier) facilities.push('Air Purifier');
    
    // Boarding
    if (school.hasHostel) facilities.push('Hostel');
    if (school.hasMess) facilities.push('Mess/Cafeteria');
    if (school.hasHostelStudyRoom) facilities.push('Hostel Study Room');
    if (school.hasAcHostel) facilities.push('AC Hostel');
    
    // Others
    if (school.hasCafeteria) facilities.push('Cafeteria');
    
    // Add legacy facilities if present
    if (school.facilities && Array.isArray(school.facilities)) {
      facilities.push(...school.facilities);
    }
    
    return [...new Set(facilities)]; // Remove duplicates
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-6" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">School not found</h1>
          <Button onClick={() => router.push('/schools')}>
            Back to Schools
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const facilitiesList = buildFacilitiesList();
  const displayLogo = school.logoUrl || school.logo;
  const displayBanner = school.bannerImageUrl || school.bannerImage;
  const displayGallery = school.galleryImages || school.gallery || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20">
        {/* Hero Banner */}
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-blue-500 to-indigo-600">
          {displayBanner ? (
            <img
              src={displayBanner}
              alt={school.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
              <p className="text-white text-xl font-semibold">Banner Image</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Main Info */}
            <div className="flex-1">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="mr-2" size={18} />
                    Back
                  </Button>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {school.name}
                      </h1>
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin size={18} className="mr-1" />
                        <span>
                          {school.address && `${school.address}, `}
                          {school.city}
                          {school.state && `, ${school.state}`}
                          {school.pincode && ` - ${school.pincode}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-base">
                      {school.board}
                    </Badge>
                    {school.schoolType && (
                      <Badge variant="outline" className="text-base">
                        {school.schoolType}
                      </Badge>
                    )}
                    {(school.medium || school.languages) && (
                      <Badge variant="outline" className="text-base">
                        {school.languages || school.medium}
                      </Badge>
                    )}
                    {school.gender && (
                      <Badge variant="outline" className="text-base">
                        {school.gender}
                      </Badge>
                    )}
                    {school.isInternational && (
                      <Badge variant="outline" className="text-base">
                        International
                      </Badge>
                    )}
                    {school.featured && (
                      <Badge style={{ backgroundColor: '#04d3d3', color: 'white' }}>
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Star className="mx-auto mb-1 text-yellow-400" size={24} />
                      <div className="font-bold text-lg">{school.rating}</div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                    
                    {school.establishmentYear && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="mx-auto mb-1" size={24} style={{ color: '#04d3d3' }} />
                        <div className="font-bold text-lg">{school.establishmentYear}</div>
                        <div className="text-sm text-muted-foreground">Est. Year</div>
                      </div>
                    )}
                    
                    {(school.studentTeacherRatio || school.totalStudents) && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Users className="mx-auto mb-1 text-blue-500" size={24} />
                        <div className="font-bold text-lg">
                          {school.studentTeacherRatio || school.totalStudents}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {school.studentTeacherRatio ? 'Student:Teacher' : 'Students'}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <IndianRupee className="mx-auto mb-1 text-green-500" size={24} />
                      <div className="font-bold text-lg">
                        {school.feesMin && school.feesMax
                          ? `${(school.feesMin / 1000).toFixed(0)}-${(school.feesMax / 1000).toFixed(0)}K`
                          : school.feesStructure ? 'Available' : 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual Fees</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      style={{ backgroundColor: '#04d3d3', color: 'white' }}
                      onClick={() => setActiveTab('enquire')}
                    >
                      <MessageCircle className="mr-2" size={18} />
                      Enquire Now
                    </Button>
                    <Button size="lg" variant="outline">
                      <Bookmark className="mr-2" size={18} />
                      Save School
                    </Button>
                    <Button size="lg" variant="outline">
                      <Share2 className="mr-2" size={18} />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full flex-wrap h-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="facilities">Facilities</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="fees">Fees</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="enquire">Enquire</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">About the School</h2>
                      <p className="text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">
                        {school.aboutSchool || school.description || 'Welcome to ' + school.name + '. We are committed to providing quality education and holistic development for our students.'}
                      </p>

                      <Separator className="my-6" />

                      <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold">Board:</span>{' '}
                          <span className="text-muted-foreground">{school.board}</span>
                        </div>
                        {(school.medium || school.languages) && (
                          <div>
                            <span className="font-semibold">Language:</span>{' '}
                            <span className="text-muted-foreground">{school.languages || school.medium}</span>
                          </div>
                        )}
                        {(school.classesOffered || school.k12Level) && (
                          <div>
                            <span className="font-semibold">Classes Offered:</span>{' '}
                            <span className="text-muted-foreground">{school.classesOffered || school.k12Level}</span>
                          </div>
                        )}
                        {school.schoolType && (
                          <div>
                            <span className="font-semibold">School Type:</span>{' '}
                            <span className="text-muted-foreground">{school.schoolType}</span>
                          </div>
                        )}
                        {school.gender && (
                          <div>
                            <span className="font-semibold">Gender:</span>{' '}
                            <span className="text-muted-foreground">{school.gender}</span>
                          </div>
                        )}
                        {school.establishmentYear && (
                          <div>
                            <span className="font-semibold">Establishment Year:</span>{' '}
                            <span className="text-muted-foreground">{school.establishmentYear}</span>
                          </div>
                        )}
                        {school.streamsAvailable && (
                          <div>
                            <span className="font-semibold">Streams Available:</span>{' '}
                            <span className="text-muted-foreground">{school.streamsAvailable}</span>
                          </div>
                        )}
                        {school.totalStudents && (
                          <div>
                            <span className="font-semibold">Total Students:</span>{' '}
                            <span className="text-muted-foreground">{school.totalStudents}</span>
                          </div>
                        )}
                        {school.totalTeachers && (
                          <div>
                            <span className="font-semibold">Total Teachers:</span>{' '}
                            <span className="text-muted-foreground">{school.totalTeachers}</span>
                          </div>
                        )}
                        {school.studentTeacherRatio && (
                          <div>
                            <span className="font-semibold">Student-Teacher Ratio:</span>{' '}
                            <span className="text-muted-foreground">{school.studentTeacherRatio}</span>
                          </div>
                        )}
                        {school.classroomType && (
                          <div>
                            <span className="font-semibold">Classroom Type:</span>{' '}
                            <span className="text-muted-foreground">{school.classroomType}</span>
                          </div>
                        )}
                      </div>

                      {/* Awards Section */}
                      {school.awards && school.awards.length > 0 && (
                        <>
                          <Separator className="my-6" />
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-600" size={24} />
                            Awards & Achievements
                          </h3>
                          <div className="space-y-4">
                            {school.awards.map((award, index) => {
                              const parsedAward = parseAward(award);
                              return (
                                <div key={index} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                  {parsedAward.text && (
                                    <p className="font-semibold mb-2 flex items-center gap-2">
                                      <Trophy className="text-yellow-600" size={18} />
                                      {parsedAward.text}
                                    </p>
                                  )}
                                  {parsedAward.image && (
                                    <div className="mt-3">
                                      <img src={parsedAward.image} alt="Award certificate" className="max-w-md rounded-lg border-2 border-yellow-300" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Facilities Tab */}
                <TabsContent value="facilities">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Facilities & Infrastructure</h2>
                      {facilitiesList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {facilitiesList.map((facility, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                            >
                              <CheckCircle2 size={20} style={{ color: '#04d3d3' }} />
                              <span>{facility}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No facilities information available.</p>
                      )}

                      {/* Sports Facilities Detail */}
                      {school.sportsFacilities && (
                        <>
                          <Separator className="my-6" />
                          <h3 className="text-xl font-semibold mb-3">Sports Facilities</h3>
                          <p className="text-muted-foreground">{school.sportsFacilities}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery Tab */}
                <TabsContent value="gallery">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">School Gallery</h2>
                      
                      {/* Virtual Tour */}
                      {school.virtualTourUrl && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Video className="text-purple-600" size={20} />
                            Virtual Tour
                          </h3>
                          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                            <a 
                              href={school.virtualTourUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                            >
                              <Video size={24} />
                              View Virtual Tour
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Gallery Images */}
                      {displayGallery.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {displayGallery.map((image, index) => (
                            <div
                              key={index}
                              className="aspect-video rounded-lg overflow-hidden"
                            >
                              <img
                                src={image}
                                alt={`${school.name} - Image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No gallery images available.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fees Tab */}
                <TabsContent value="fees">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Fee Structure</h2>
                      
                      {/* Detailed Fees Structure */}
                      {school.feesStructure && Object.keys(school.feesStructure).length > 0 ? (
                        <div className="space-y-6">
                          {/* Class 1-10 Fees */}
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some(i => school.feesStructure?.[`class${i}`]) && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <BookOpen className="text-cyan-600" size={20} />
                                Class 1 to 10
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(classNum => {
                                  const fee = school.feesStructure?.[`class${classNum}`];
                                  if (!fee) return null;
                                  return (
                                    <div key={classNum} className="p-3 bg-gray-50 rounded-lg">
                                      <div className="text-sm text-muted-foreground">Class {classNum}</div>
                                      <div className="font-bold text-lg">₹{fee.toLocaleString()}/year</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Class 11 & 12 Stream-wise */}
                          {(school.feesStructure?.class11 || school.feesStructure?.class12) && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <GraduationCap className="text-orange-600" size={20} />
                                Class 11 & 12 (Stream-wise)
                              </h3>
                              <div className="space-y-4">
                                {school.feesStructure?.class11 && (
                                  <div>
                                    <div className="font-semibold mb-2">Class 11</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {school.feesStructure.class11.commerce && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                          <div className="text-sm text-blue-700">Commerce</div>
                                          <div className="font-bold">₹{school.feesStructure.class11.commerce.toLocaleString()}/year</div>
                                        </div>
                                      )}
                                      {school.feesStructure.class11.arts && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                          <div className="text-sm text-purple-700">Arts</div>
                                          <div className="font-bold">₹{school.feesStructure.class11.arts.toLocaleString()}/year</div>
                                        </div>
                                      )}
                                      {school.feesStructure.class11.science && (
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                          <div className="text-sm text-green-700">Science</div>
                                          <div className="font-bold">₹{school.feesStructure.class11.science.toLocaleString()}/year</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {school.feesStructure?.class12 && (
                                  <div>
                                    <div className="font-semibold mb-2">Class 12</div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {school.feesStructure.class12.commerce && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                          <div className="text-sm text-blue-700">Commerce</div>
                                          <div className="font-bold">₹{school.feesStructure.class12.commerce.toLocaleString()}/year</div>
                                        </div>
                                      )}
                                      {school.feesStructure.class12.arts && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                          <div className="text-sm text-purple-700">Arts</div>
                                          <div className="font-bold">₹{school.feesStructure.class12.arts.toLocaleString()}/year</div>
                                        </div>
                                      )}
                                      {school.feesStructure.class12.science && (
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                          <div className="text-sm text-green-700">Science</div>
                                          <div className="font-bold">₹{school.feesStructure.class12.science.toLocaleString()}/year</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <p className="text-muted-foreground text-sm mt-6">
                            * Fees may vary based on additional services and payment plans. Please contact the school for detailed information.
                          </p>
                        </div>
                      ) : school.feesMin && school.feesMax ? (
                        <div>
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg mb-4">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-2">
                                Annual Fees Range
                              </div>
                              <div className="text-3xl font-bold" style={{ color: '#04d3d3' }}>
                                ₹{school.feesMin.toLocaleString()} - ₹{school.feesMax.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground mt-2">
                                per year
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            * Fees may vary based on class and additional services. Please contact the
                            school for detailed fee structure and payment plans.
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Fee information not available. Please contact the school directly.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>
                      <div className="text-center py-12">
                        <div className="mb-4">
                          <div className="text-5xl font-bold mb-2">{school.rating}</div>
                          <div className="flex justify-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-6 h-6 ${
                                  i < Math.floor(school.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-muted-foreground">
                            Based on {school.reviewCount} reviews
                          </div>
                        </div>
                        <Separator className="my-6" />
                        <p className="text-muted-foreground">
                          Detailed reviews coming soon. Be the first to review this school!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Documents & Resources</h2>
                      <div className="space-y-4">
                        {school.prospectusUrl && (
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                                  <FileText className="text-white" size={24} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">School Prospectus</h3>
                                  <p className="text-sm text-muted-foreground">Download our detailed prospectus</p>
                                </div>
                              </div>
                              <a
                                href={school.prospectusUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
                              >
                                <Download size={20} />
                                Download
                              </a>
                            </div>
                          </div>
                        )}

                        {school.newsletterUrl && (
                          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-indigo-500 flex items-center justify-center">
                                  <FileText className="text-white" size={24} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">Newsletter / Magazine</h3>
                                  <p className="text-sm text-muted-foreground">Read our latest newsletter</p>
                                </div>
                              </div>
                              <a
                                href={school.newsletterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                              >
                                <Download size={20} />
                                Download
                              </a>
                            </div>
                          </div>
                        )}

                        {!school.prospectusUrl && !school.newsletterUrl && (
                          <p className="text-muted-foreground text-center py-8">
                            No documents available at the moment.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="location">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Location</h2>
                      <div className="mb-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="mt-1" size={20} style={{ color: '#04d3d3' }} />
                          <div>
                            {school.address && <p>{school.address}</p>}
                            <p>
                              {school.city}
                              {school.state && `, ${school.state}`}
                              {school.pincode && ` - ${school.pincode}`}
                              {school.country && `, ${school.country}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {school.googleMapUrl ? (
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <iframe
                            src={school.googleMapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">Map view not available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Enquire Tab */}
                <TabsContent value="enquire">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Enquire Now</h2>
                      <p className="text-muted-foreground mb-6">
                        Fill out the form below and the school will get back to you shortly.
                      </p>

                      <form onSubmit={handleEnquirySubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="studentName">Student Name *</Label>
                          <Input
                            id="studentName"
                            required
                            value={enquiryForm.studentName}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentName: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="studentEmail">Email *</Label>
                          <Input
                            id="studentEmail"
                            type="email"
                            required
                            value={enquiryForm.studentEmail}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentEmail: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="studentPhone">Phone Number *</Label>
                          <Input
                            id="studentPhone"
                            type="tel"
                            required
                            value={enquiryForm.studentPhone}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentPhone: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="studentClass">Class/Grade *</Label>
                          <Input
                            id="studentClass"
                            required
                            placeholder="e.g., 6th Grade"
                            value={enquiryForm.studentClass}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentClass: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            rows={4}
                            placeholder="Any specific questions or requirements..."
                            value={enquiryForm.message}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, message: e.target.value })
                            }
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          style={{ backgroundColor: '#04d3d3', color: 'white' }}
                          disabled={submittingEnquiry}
                        >
                          {submittingEnquiry ? 'Submitting...' : 'Submit Enquiry'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Contact & Quick Actions */}
            <div className="lg:w-96">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  
                  {(school.contactPhone || school.contactNumber) && (
                    <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Phone size={20} style={{ color: '#04d3d3' }} className="mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <a
                          href={`tel:${school.contactPhone || school.contactNumber}`}
                          className="font-medium hover:underline"
                        >
                          {school.contactPhone || school.contactNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {school.whatsappNumber && (
                    <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Phone size={20} style={{ color: '#04d3d3' }} className="mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">WhatsApp</div>
                        <a
                          href={`https://wa.me/${school.whatsappNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          {school.whatsappNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {(school.contactEmail || school.email) && (
                    <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Mail size={20} style={{ color: '#04d3d3' }} className="mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <a
                          href={`mailto:${school.contactEmail || school.email}`}
                          className="font-medium hover:underline break-all"
                        >
                          {school.contactEmail || school.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {school.website && (
                    <div className="flex items-start space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Globe size={20} style={{ color: '#04d3d3' }} className="mt-1" />
                      <div>
                        <div className="text-sm text-muted-foreground">Website</div>
                        <a
                          href={school.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline break-all"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Social Media Links */}
                  {(school.facebookUrl || school.instagramUrl || school.linkedinUrl || school.youtubeUrl) && (
                    <>
                      <Separator className="my-4" />
                      <h4 className="font-semibold mb-3">Follow Us</h4>
                      <div className="flex gap-2">
                        {school.facebookUrl && (
                          <a
                            href={school.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                            <Facebook size={20} className="text-blue-600" />
                          </a>
                        )}
                        {school.instagramUrl && (
                          <a
                            href={school.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
                          >
                            <Instagram size={20} className="text-pink-600" />
                          </a>
                        )}
                        {school.linkedinUrl && (
                          <a
                            href={school.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                            <Linkedin size={20} className="text-blue-700" />
                          </a>
                        )}
                        {school.youtubeUrl && (
                          <a
                            href={school.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <Youtube size={20} className="text-red-600" />
                          </a>
                        )}
                      </div>
                    </>
                  )}

                  <Separator className="my-6" />

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      style={{ backgroundColor: '#04d3d3', color: 'white' }}
                      onClick={() => setActiveTab('enquire')}
                    >
                      <MessageCircle className="mr-2" size={18} />
                      Send Enquiry
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Heart className="mr-2" size={18} />
                      Add to Favorites
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div className="text-center text-sm text-muted-foreground">
                    <p className="mb-2">Profile Views</p>
                    <p className="text-2xl font-bold text-foreground">{school.profileViews}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      <AIChat />
    </div>
  );
}