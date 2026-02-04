'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Star, IndianRupee, Phone, Mail, Calendar, Users, 
  CheckCircle2, Heart, Share2, Bookmark, MessageCircle, ArrowLeft,
  Globe, Facebook, Instagram, Linkedin, Youtube, Download, Trophy,
  Video, FileText, Wifi, Shield, Bus, Laptop, BookOpen, GraduationCap,
  ChevronLeft, ChevronRight, X, Building2, GitCompare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getSchools } from '@/lib/api';

interface School {
  id: number;
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
  city?: string;
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
  feesStructure?: any;
  facilityImages?: Record<string, string[]>;
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

function calculateFeesRange(feesStructure: any): { min: number | null; max: number | null } {
  if (!feesStructure || typeof feesStructure !== 'object') {
    return { min: null, max: null };
  }
  const allFees: number[] = [];
  Object.keys(feesStructure).forEach(key => {
    const value = feesStructure[key];
    if (typeof value === 'number' && value > 0) {
      allFees.push(value);
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(streamFee => {
        if (typeof streamFee === 'number' && streamFee > 0) {
          allFees.push(streamFee);
        }
      });
    }
  });
  if (allFees.length === 0) {
    return { min: null, max: null };
  }
  return {
    min: Math.min(...allFees),
    max: Math.max(...allFees)
  };
}

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = parseInt(params.id as string);

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [similarSchools, setSimilarSchools] = useState<School[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // Saved schools state
  const [savedSchools, setSavedSchools] = useState<number[]>([]);
  const [savingSchool, setSavingSchool] = useState(false);

  // Reviews state with pagination
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsMetadata, setReviewsMetadata] = useState<any>(null);
  const REVIEWS_PER_PAGE = 10;

  // Results state
  const [results, setResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Student Achievements state
  const [studentAchievements, setStudentAchievements] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  // Alumni state
  const [alumni, setAlumni] = useState<any[]>([]);
  const [alumniLoading, setAlumniLoading] = useState(false);

  // News state
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Image preview state
  const [imagePreview, setImagePreview] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentPhoneCode: '+91',
    studentClass: '',
    message: '',
  });

  const phoneCountryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
  ];

  // Load saved schools on mount
  const loadSavedSchools = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('/api/auth/saved-schools', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedSchools(data.savedSchools || []);
      }
    } catch (error) {
      console.error('Failed to load saved schools:', error);
    }
  };

  useEffect(() => {
    loadSchool();
    loadSavedSchools();
  }, [schoolId]);

  useEffect(() => {
    const fetchSimilarSchools = async () => {
      if (!school?.city) return;
      setSimilarLoading(true);
      try {
        const schools = await getSchools({
          city: school.city,
          limit: 5,
        });
        // Filter out the current school
        setSimilarSchools(schools.filter((s) => s.id !== school.id).slice(0, 4));
      } catch (error) {
        console.error('Failed to load similar schools:', error);
      } finally {
        setSimilarLoading(false);
      }
    };

    if (school) {
      fetchSimilarSchools();
    }
  }, [school?.id, school?.city]);

  const handleSaveSchool = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save schools');
      router.push('/login');
      return;
    }
    setSavingSchool(true);
    const isCurrentlySaved = savedSchools.includes(schoolId);
    try {
      const response = await fetch('/api/auth/saved-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          action: isCurrentlySaved ? 'remove' : 'add',
        }),
      });
      if (!response.ok) throw new Error('Failed to save school');
      const data = await response.json();
      setSavedSchools(data.savedSchools);
      toast.success(isCurrentlySaved ? 'School removed from favorites' : 'School saved to favorites!');
    } catch (error) {
      toast.error('Failed to save school. Please try again.');
    } finally {
      setSavingSchool(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: school?.name || 'School',
      text: `Check out ${school?.name} on PickMySchool`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

    const handleCompare = () => {
      const existingIds = localStorage.getItem('compare_schools')?.split(',').filter(Boolean) || [];
      if (!existingIds.includes(schoolId.toString())) {
        if (existingIds.length >= 4) {
          toast.error('You can compare up to 4 schools. Please remove some from the compare page.');
          return;
        }
        const newIds = [...existingIds, schoolId.toString()];
        localStorage.setItem('compare_schools', newIds.join(','));
        toast.success(`${school?.name} added to comparison!`);
      } else {
        toast.info(`${school?.name} is already in comparison.`);
      }
    };

  const isSchoolSaved = savedSchools.includes(schoolId);

  // Load reviews and stats when Reviews tab is active or page changes
  useEffect(() => {
    if (activeTab === 'reviews' && school) {
      loadReviews(reviewsPage);
      if (!reviewStats) {
        loadReviewStats();
      }
    }
  }, [activeTab, school, reviewsPage]);

  // Load Results when Results tab is active
  useEffect(() => {
    if (activeTab === 'results' && school) {
      loadResults();
      loadStudentAchievements();
    }
  }, [activeTab, school]);

  // Load Student Achievements when Achievements tab is active
  useEffect(() => {
    if (activeTab === 'achievements' && school) {
      loadStudentAchievements();
    }
  }, [activeTab, school]);

  // Load Alumni when Alumni tab is active
  useEffect(() => {
    if (activeTab === 'alumni' && school) {
      loadAlumni();
    }
  }, [activeTab, school]);

  // Load News when News tab is active
  useEffect(() => {
    if (activeTab === 'news' && school) {
      loadNews();
    }
  }, [activeTab, school]);

  const loadSchool = async () => {
    try {
      const response = await fetch(`/api/schools?id=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch school');
      const data = await response.json();
      console.log('School data loaded on public page:', data);
      console.log('Facility images on public page:', data.facilityImages);
      
      // Normalize facilityImages to ensure it's an object of string arrays
      let normalizedFacilityImages: Record<string, string[]> | undefined = undefined;
      if (data.facilityImages !== null && data.facilityImages !== undefined) {
        try {
          const raw = typeof data.facilityImages === 'string' ? JSON.parse(data.facilityImages) : data.facilityImages;
          if (raw && typeof raw === 'object') {
            const out: Record<string, string[]> = {};
            Object.entries(raw as Record<string, any>).forEach(([k, v]) => {
              if (Array.isArray(v)) {
                // If array of strings or objects with url
                const urls = v
                  .map((item) => {
                    if (typeof item === 'string') return item;
                    if (item && typeof item === 'object' && typeof item.url === 'string') return item.url;
                    return null;
                  })
                  .filter(Boolean) as string[];
                if (urls.length > 0) out[k] = urls;
              }
            });
            normalizedFacilityImages = out;
          }
        } catch (e) {
          console.warn('Failed to parse facilityImages JSON');
        }
      }

      // Normalize virtualTourVideos to a string[] and keep backward compatibility with virtualTourUrl
      let normalizedVirtualTourVideos: string[] | undefined = undefined;
      try {
        const rawV = data.virtualTourVideos;
        if (Array.isArray(rawV)) {
          normalizedVirtualTourVideos = rawV.filter((u) => typeof u === 'string' && u.trim() !== '');
        } else if (typeof rawV === 'string') {
          const parsed = JSON.parse(rawV);
          if (Array.isArray(parsed)) {
            normalizedVirtualTourVideos = parsed.filter((u) => typeof u === 'string' && u.trim() !== '');
          }
        }
      } catch (e) {
        console.warn('Failed to parse virtualTourVideos JSON');
      }
      if (
        (!normalizedVirtualTourVideos || normalizedVirtualTourVideos.length === 0) &&
        typeof data.virtualTourUrl === 'string' &&
        data.virtualTourUrl.trim() !== ''
      ) {
        normalizedVirtualTourVideos = [data.virtualTourUrl.trim()];
      }

      // Ensure Orbit School (ID 27) shows the requested YouTube link even if DB update fails
      if (data.id === 27) {
        const orbitLink = 'https://youtu.be/3a5DXs9LtdY?si=W6bH0AYoH8-gNZvE';
        const vids = normalizedVirtualTourVideos || [];
        if (!vids.includes(orbitLink)) {
          normalizedVirtualTourVideos = [...vids, orbitLink];
        }
      }

      setSchool({
        ...data,
        ...(normalizedFacilityImages ? { facilityImages: normalizedFacilityImages } : {}),
        ...(normalizedVirtualTourVideos ? { virtualTourVideos: normalizedVirtualTourVideos } : {}),
      });
    } catch (error) {
      console.error('Failed to load school:', error);
      toast.error('Failed to load school details');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (page: number = 1) => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}/reviews?page=${page}&limit=${REVIEWS_PER_PAGE}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setReviewsMetadata(data.metadata || null);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadReviewStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}/reviews/stats`);
      if (response.ok) {
        const data = await response.json();
        setReviewStats(data);
      }
    } catch (error) {
      console.error('Failed to load review stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadResults = async () => {
    setResultsLoading(true);
    try {
      const response = await fetch(`/api/schools/results?schoolId=${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setResultsLoading(false);
    }
  };

  const loadStudentAchievements = async () => {
    setAchievementsLoading(true);
    try {
      const response = await fetch(`/api/schools/student-achievements?schoolId=${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentAchievements(data);
      }
    } catch (error) {
      console.error('Failed to load student achievements:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  const loadAlumni = async () => {
    setAlumniLoading(true);
    try {
      const response = await fetch(`/api/schools/alumni?schoolId=${schoolId}`);
      if (response.ok) {
        const data = await response.json();
        setAlumni(data);
      }
    } catch (error) {
      console.error('Failed to load alumni:', error);
    } finally {
      setAlumniLoading(false);
    }
  };

  const loadNews = async () => {
    setNewsLoading(true);
    try {
      const response = await fetch(`/api/schools/news?schoolId=${schoolId}&isPublished=true`);
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setReviewsPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enquiryForm.studentPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    const token = localStorage.getItem('token');

    setSubmittingEnquiry(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add token if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const fullPhoneNumber = `${enquiryForm.studentPhoneCode}${enquiryForm.studentPhone}`;

      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          schoolId,
          studentName: enquiryForm.studentName,
          studentEmail: enquiryForm.studentEmail,
          studentPhone: fullPhoneNumber,
          studentClass: enquiryForm.studentClass,
          message: enquiryForm.message,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit enquiry');

      toast.success('Enquiry submitted successfully! The school will contact you soon.');
      setEnquiryForm({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        studentPhoneCode: '+91',
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
    if (school.hasAcClassrooms) facilities.push('AT Classrooms');
    if (school.hasAiTools) facilities.push('AI Learning Tools');

    // Transport
    if (school.hasTransport) facilities.push('School Buses');
    if (school.hasGpsBuses) facilities.push('GPS-enabled Buses');
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
    if (school.hasAcHostel) facilities.push('A Hostel');

    // Others
    if (school.hasCafeteria) facilities.push('Cafeteria');

    // Add legacy facilities if present
    if (school.facilities && Array.isArray(school.facilities)) {
      facilities.push(...school.facilities.filter((f): f is string => typeof f === 'string' && f !== null && f !== undefined));
    }

    return [...new Set(facilities)]; // Remove duplicates
  };

  const openImagePreview = (images: string[], startIndex: number) => {
    setImagePreview({
      isOpen: true,
      images,
      currentIndex: startIndex,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      isOpen: false,
      images: [],
      currentIndex: 0,
    });
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    setImagePreview(prev => {
      const newIndex = direction === 'prev' 
        ? (prev.currentIndex - 1 + prev.images.length) % prev.images.length
        : (prev.currentIndex + 1) % prev.images.length;
      return { ...prev, currentIndex: newIndex };
    });
  };

  // Normalize common video links to embed player URLs
  const toEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      // YouTube - already embed
      if (host.includes('youtube.com') && u.pathname.startsWith('/embed/')) return url;
      // youtu.be short link
      if (host.includes('youtu.be')) {
        const id = u.pathname.split('/').filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      // youtube.com/watch or /live
      if (host.includes('youtube.com')) {
        if (u.pathname.startsWith('/watch')) {
          const id = u.searchParams.get('v');
          return id ? `https://www.youtube.com/embed/${id}` : url;
        }
        if (u.pathname.startsWith('/live/')) {
          const id = u.pathname.split('/').filter(Boolean)[1];
          return id ? `https://www.youtube.com/embed/${id}` : url;
        }
      }
      // Vimeo normal link
      if (host.includes('vimeo.com') && !host.includes('player.vimeo.com')) {
        const parts = u.pathname.split('/').filter(Boolean);
        const id = parts[0];
        return id ? `https://player.vimeo.com/video/${id}` : url;
      }
      return url;
    } catch {
      return url;
    }
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

  // Use review stats for average rating if available
  const displayRating = reviewStats?.averageRating || school.rating;
  const displayReviewCount = reviewStats?.totalReviews || school.reviewCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Image Preview Modal */}
      {imagePreview.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeImagePreview}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={closeImagePreview}
          >
            <X size={32} />
          </button>

          {imagePreview.images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white hover:text-gray-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
              >
                <ChevronLeft size={48} />
              </button>
              <button
                className="absolute right-4 text-white hover:text-gray-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
              >
                <ChevronRight size={48} />
              </button>
            </>
          )}

          <div className="max-w-7xl max-h-[90vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagePreview.images[imagePreview.currentIndex]}
              alt={`Preview ${imagePreview.currentIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {imagePreview.images.length > 1 && (
              <div className="text-white text-center mt-4">
                {imagePreview.currentIndex + 1} / {imagePreview.images.length}
              </div>
            )}
          </div>
        </div>
      )}

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
              {/* Premium Header Card with Gradient Border */}
              <Card className="mb-6 border-0 shadow-2xl overflow-hidden">
                {/* Top Gradient Bar */}
                <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                
                <CardContent className="p-4 sm:p-8 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
                  {/* Back Button - Styled */}
                  <Button
                    variant="ghost"
                    className="mb-4 sm:mb-6 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-300 rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-semibold group text-sm sm:text-base"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={18} />
                    Back to Search
                  </Button>

                  {/* Logo, Title and Location Section - Premium Layout */}
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 sm:gap-6 mb-6">
                    {displayLogo && (
                      <div className="relative flex-shrink-0">
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-3xl blur opacity-20"></div>
                        <img
                          src={displayLogo}
                          alt={`${school.name} logo`}
                          className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain rounded-3xl border-4 border-white bg-white shadow-2xl p-2 sm:p-3 hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="mb-4">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
                          {school.name}
                        </h1>
                        <div className="flex items-start justify-center md:justify-start gap-2 sm:gap-3 text-gray-700">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0 mt-0.5">
                            <MapPin size={16} className="text-white sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-sm sm:text-lg font-medium leading-relaxed">
                            {school.address && `${school.address}, `}
                            {school.city}
                            {school.state && `, ${school.state}`}
                            {school.pincode && ` - ${school.pincode}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges - Premium Styled */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6">
                    <Badge className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      {school.board}
                    </Badge>
                    {school.schoolType && (
                      <Badge className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base font-bold bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        {school.schoolType}
                      </Badge>
                    )}
                    {(school.medium || school.languages) && (
                      <Badge className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        {school.languages || school.medium}
                      </Badge>
                    )}
                    {school.gender && (
                      <Badge className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base font-bold bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        {school.gender}
                      </Badge>
                    )}
                    {school.featured && (
                      <Badge className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all animate-pulse">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats - Premium Cards with Gradients */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
                    {/* Rating Card */}
                    <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-3 sm:p-5 rounded-2xl border-2 border-yellow-200/60 hover:border-yellow-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
                          <Star className="text-white fill-white sm:w-7 sm:h-7" size={20} />
                        </div>
                        <div className="font-black text-xl sm:text-3xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
                          {displayRating.toFixed(1)}
                        </div>
                        <div className="text-[10px] sm:text-sm font-bold text-gray-600">
                          {displayReviewCount} Review{displayReviewCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    {/* Establishment Year Card */}
                    {school.establishmentYear && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-3 sm:p-5 rounded-2xl border-2 border-cyan-200/60 hover:border-cyan-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10 text-center">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
                            <Calendar className="text-white sm:w-7 sm:h-7" size={20} />
                          </div>
                          <div className="font-black text-xl sm:text-3xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
                            {school.establishmentYear}
                          </div>
                          <div className="text-[10px] sm:text-sm font-bold text-gray-600">Est. Year</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Students/Ratio Card */}
                    {(school.studentTeacherRatio || school.totalStudents) && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 p-3 sm:p-5 rounded-2xl border-2 border-purple-200/60 hover:border-purple-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10 text-center">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
                            <Users className="text-white sm:w-7 sm:h-7" size={20} />
                          </div>
                          <div className="font-black text-xl sm:text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                            {school.studentTeacherRatio || school.totalStudents}
                          </div>
                          <div className="text-[10px] sm:text-sm font-bold text-gray-600">
                            {school.studentTeacherRatio ? 'Ratio' : 'Students'}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Fees Card */}
                    <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-3 sm:p-5 rounded-2xl border-2 border-emerald-200/60 hover:border-emerald-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform">
                          <IndianRupee className="text-white sm:w-7 sm:h-7" size={20} />
                        </div>
                        <div className="font-black text-sm sm:text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                          {(() => {
                            const feesRange = calculateFeesRange(school.feesStructure);
                            if (feesRange.min && feesRange.max) {
                              return `₹${(feesRange.min / 1000).toFixed(0)}K - ₹${(feesRange.max / 1000).toFixed(0)}K`;
                            } else if (school.feesMin && school.feesMax) {
                              return `₹${(school.feesMin / 1000).toFixed(0)}K - ₹${(school.feesMax / 1000).toFixed(0)}K`;
                            } else if (feesRange.min || school.feesMin) {
                              const minFee = feesRange.min || school.feesMin;
                              return `₹${(minFee! / 1000).toFixed(0)}K+`;
                            }
                            return 'N/A';
                          })()}
                        </div>
                        <div className="text-[10px] sm:text-sm font-bold text-gray-600">Fees</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Premium Styled */} 
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 sm:gap-4">
                    <Button
                      size="lg"
                      className="col-span-2 md:col-auto bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-600 hover:via-teal-600 hover:to-blue-600 text-white font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base rounded-2xl border-0"
                      onClick={() => setActiveTab('enquire')}
                    >
                      <MessageCircle className="mr-2 sm:mr-3" size={20} />
                      Enquire Now
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={handleSaveSchool}
                      disabled={savingSchool}
                      className={`font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base rounded-2xl border-2 ${
                        isSchoolSaved 
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 text-pink-700' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Bookmark className={`mr-2 sm:mr-3 ${isSchoolSaved ? 'fill-pink-500' : ''}`} size={20} />
                      {isSchoolSaved ? 'Saved' : 'Save'}
                    </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={handleShare}
                        className="font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base rounded-2xl border-2 bg-white border-gray-200"
                      >
                        <Share2 className="mr-2 sm:mr-3" size={20} />
                        Share
                      </Button>
                  </div>
                </CardContent>
              </Card>

                {/* Tabs - Premium Design */}
                <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview">
                  <div className="mb-8 relative">
                    {/* Mobile: Button Grid Selection */}
                    <div className="md:hidden">
                      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'overview', label: 'Overview' },
                              { value: 'facilities', label: 'Facilities' },
                              { value: 'gallery', label: 'Gallery & Documents' },
                              { value: 'virtualtour', label: 'Virtual Tour' },
                              { value: 'fees', label: 'Fees' },
                              { value: 'results', label: 'School Result' },
                              { value: 'achievements', label: 'Student Result' },
                              { value: 'alumni', label: 'Alumni' },
                              { value: 'news', label: 'News' },
                              { value: 'reviews', label: 'Reviews' },
                              { value: 'location', label: 'Location' },
                              { value: 'enquire', label: 'Enquire' },
                            ].map((tab) => (
                              <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                  activeTab === tab.value
                                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Desktop: TabsList */}
                    <div className="hidden md:block">
                      {/* Decorative background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-3xl blur-xl"></div>
                      
                      <TabsList className="relative w-full flex-wrap h-auto p-3 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 rounded-3xl border-2 border-gray-200/60 shadow-xl gap-2">
                        <TabsTrigger 
                          value="overview" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger 
                          value="facilities" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Facilities
                        </TabsTrigger>
                        <TabsTrigger 
                          value="gallery" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Gallery & Documents
                        </TabsTrigger>
                        <TabsTrigger 
                          value="virtualtour" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Virtual Tour
                        </TabsTrigger>
                        <TabsTrigger 
                          value="fees" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Fees
                        </TabsTrigger>
                        <TabsTrigger 
                          value="results" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          School Result
                        </TabsTrigger>
                        <TabsTrigger 
                          value="achievements" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Student Result
                        </TabsTrigger>
                        <TabsTrigger 
                          value="alumni" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Alumni
                        </TabsTrigger>
                        <TabsTrigger 
                          value="news" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          News
                        </TabsTrigger>
                        <TabsTrigger 
                          value="reviews" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Reviews
                        </TabsTrigger>
                        <TabsTrigger 
                          value="location" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Location
                        </TabsTrigger>
                        <TabsTrigger 
                          value="enquire" 
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-300 rounded-2xl px-6 py-3 font-bold hover:bg-gray-100"
                        >
                          Enquire
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  {/* Overview Tab */}
                  <TabsContent value="overview">
                    <div className="space-y-6">
                      {/* About Section - Hero Style */}
                      <Card className="overflow-hidden border-0 shadow-2xl">
                        <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 p-8 relative">
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <GraduationCap className="text-white" size={28} />
                              </div>
                              <h2 className="text-3xl font-bold text-white drop-shadow-lg">About the School</h2>
                            </div>
                            <p className="text-white/95 leading-relaxed text-lg font-medium drop-shadow whitespace-pre-line">
                              {school.aboutSchool || school.description || 'Welcome to ' + school.name + '. We are committed to providing quality education and holistic development for our students.'}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Quick Stats Grid - Premium Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Board Card */}
                        <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="text-white" size={28} />
                              </div>
                              <Badge className="bg-indigo-100 text-indigo-700 border-0">Essential</Badge>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Board of Education</h3>
                            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {school.board}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Language Card */}
                        {(school.medium || school.languages) && (
                          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <Globe className="text-white" size={28} />
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-0">Info</Badge>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-600 mb-2">Medium of Instruction</h3>
                              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {school.languages || school.medium}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Classes Offered Card */}
                        {(school.classesOffered || school.k12Level) && (
                          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <GraduationCap className="text-white" size={28} />
                                </div>
                                <Badge className="bg-orange-100 text-orange-700 border-0">Classes</Badge>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-600 mb-2">Classes Offered</h3>
                              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                {school.classesOffered || school.k12Level}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* School Type Card */}
                        {school.schoolType && (
                          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <Building2 className="text-white" size={28} />
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 border-0">Type</Badge>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-600 mb-2">School Type</h3>
                              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {school.schoolType}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Gender Card */}
                        {school.gender && (
                          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <Users className="text-white" size={28} />
                                </div>
                                <Badge className="bg-pink-100 text-pink-700 border-0">Gender</Badge>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-600 mb-2">Gender Type</h3>
                              <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                {school.gender}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Establishment Year Card */}
                        {school.establishmentYear && (
                          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <Calendar className="text-white" size={28} />
                                </div>
                                <Badge className="bg-violet-100 text-violet-700 border-0">Legacy</Badge>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-600 mb-2">Established</h3>
                              <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                {school.establishmentYear}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Additional Info - Modern Layout */}
                      <Card className="border-0 shadow-xl">
                        <CardContent className="p-8">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <CheckCircle2 className="text-white" size={22} />
                            </div>
                            Additional Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {school.streamsAvailable && (
                              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <BookOpen className="text-white" size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-600 mb-1">Streams Available</p>
                                  <p className="text-lg font-bold text-gray-900">{school.streamsAvailable}</p>
                                </div>
                              </div>
                            )}
                            {school.totalStudents && (
                              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <Users className="text-white" size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Students</p>
                                  <p className="text-lg font-bold text-gray-900">{school.totalStudents}</p>
                                </div>
                              </div>
                            )}
                            {school.totalTeachers && (
                              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <Users className="text-white" size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-600 mb-1">Total Teachers</p>
                                  <p className="text-lg font-bold text-gray-900">{school.totalTeachers}</p>
                                </div>
                              </div>
                            )}
                            {school.studentTeacherRatio && (
                              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <Users className="text-white" size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-600 mb-1">Student-Teacher Ratio</p>
                                  <p className="text-lg font-bold text-gray-900">{school.studentTeacherRatio}</p>
                                </div>
                              </div>
                            )}
                            
                          </div>
                        </CardContent>
                      </Card>

                      {/* Awards Section - Premium Design */}
                      {school.awards && school.awards.length > 0 && (
                        <Card className="border-0 shadow-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 p-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <Trophy className="text-white" size={28} />
                              </div>
                              Awards & Achievements
                            </h3>
                          </div>
                          <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-4">
                              {school.awards.map((award, index) => {
                                const parsedAward = parseAward(award);
                                return (
                                  <div 
                                    key={index} 
                                    className="group p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                  >
                                    {parsedAward.text && (
                                      <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                          <Trophy className="text-white" size={24} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-lg font-bold text-gray-900 mb-1">{parsedAward.text}</p>
                                          <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                                        </div>
                                      </div>
                                    )}
                                    {parsedAward.image && (
                                      <div className="mt-4">
                                        <img 
                                          src={parsedAward.image} 
                                          alt="Award certificate" 
                                          className="max-w-md rounded-xl border-4 border-amber-300 shadow-2xl hover:scale-105 transition-transform duration-300" 
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                {/* Facilities Tab */}
                <TabsContent value="facilities">
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <Building2 className="text-white" size={32} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Facilities & Infrastructure</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">World-class amenities for holistic education</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {facilitiesList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                          {facilitiesList.map((facility, index) => {
                            // Assign colors based on category
                            const getColorScheme = (fac: string) => {
                              const lower = fac.toLowerCase();
                              if (lower.includes('lab') || lower.includes('computer') || lower.includes('robotics') || lower.includes('stem')) {
                                return 'from-purple-500 to-indigo-600 bg-purple-50 border-purple-200 text-purple-700';
                              } else if (lower.includes('sport') || lower.includes('pool') || lower.includes('fitness') || lower.includes('yoga') || lower.includes('playground')) {
                                return 'from-orange-500 to-red-600 bg-orange-50 border-orange-200 text-orange-700';
                              } else if (lower.includes('smart') || lower.includes('wifi') || lower.includes('ai') || lower.includes('e-learning')) {
                                return 'from-blue-500 to-cyan-600 bg-blue-50 border-blue-200 text-blue-700';
                              } else if (lower.includes('library') || lower.includes('auditorium')) {
                                return 'from-emerald-500 to-teal-600 bg-emerald-50 border-emerald-200 text-emerald-700';
                              } else if (lower.includes('bus') || lower.includes('transport') || lower.includes('gps')) {
                                return 'from-amber-500 to-yellow-600 bg-amber-50 border-amber-200 text-amber-700';
                              } else if (lower.includes('medical') || lower.includes('doctor') || lower.includes('nurse') || lower.includes('safety') || lower.includes('security') || lower.includes('cctv')) {
                                return 'from-red-500 to-rose-600 bg-red-50 border-red-200 text-red-700';
                              } else if (lower.includes('hostel') || lower.includes('mess') || lower.includes('cafeteria')) {
                                return 'from-pink-500 to-fuchsia-600 bg-pink-50 border-pink-200 text-pink-700';
                              }
                              return 'from-cyan-500 to-blue-600 bg-cyan-50 border-cyan-200 text-cyan-700';
                            };
                            
                            const colorScheme = getColorScheme(facility);
                            const [gradientColor, bgColor, borderColor, textColor] = colorScheme.split(' ');

                            return (
                              <div
                                key={index}
                                className={`group relative overflow-hidden rounded-2xl border-2 ${borderColor} ${bgColor} p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <CheckCircle2 className="text-white" size={22} />
                                  </div>
                                  <span className={`font-semibold ${textColor} text-base`}>{facility}</span>
                                </div>
                                <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br ${gradientColor} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-muted-foreground">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                            <Building2 className="opacity-50" size={48} />
                          </div>
                          <p className="text-xl font-semibold mb-2">No facilities information available</p>
                          <p>Contact the school for more details about their infrastructure.</p>
                        </div>
                      )}

                      {/* Sports Facilities Detail - Enhanced */}
                      {school.sportsFacilities && (
                        <div className="mt-8">
                          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-8 border-2 border-emerald-200/60 shadow-lg relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute -right-8 -top-8 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl"></div>
                            <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                                  <Trophy className="text-white" size={32} />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-1">
                                    Sports Facilities
                                  </h3>
                                  <p className="text-emerald-600 font-medium">Promoting physical fitness and sportsmanship</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-3">
                                {school.sportsFacilities.split(',').map((sport, idx) => (
                                  <div
                                    key={idx}
                                    className="group inline-flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 text-emerald-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                  >
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-inner group-hover:scale-125 transition-transform"></div>
                                    <span className="text-sm">{sport.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Facility Images (from dashboard) - Enhanced */}
                      {school.facilityImages && Object.keys(school.facilityImages || {}).length > 0 && (
                        <div className="mt-10">
                          <div className="mb-6 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <FileText className="text-white" size={24} />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">Facility Photos</h3>
                              <p className="text-gray-600 font-medium">Explore our infrastructure through images</p>
                            </div>
                          </div>
                          
                          <div className="space-y-8">
                            {Object.entries(school.facilityImages || {}).map(([facilityName, images]) => (
                              Array.isArray(images) && images.length > 0 ? (
                                <div key={facilityName} className="group">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                                      <Building2 className="text-white" size={20} />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800">{facilityName}</h4>
                                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
                                    <Badge className="bg-purple-100 text-purple-700 border-0 font-semibold px-3">
                                      {images.length} {images.length === 1 ? 'Photo' : 'Photos'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((img: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="group/img relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                        onClick={() => openImagePreview(images as string[], idx)}
                                      >
                                        <img
                                          src={img}
                                          alt={`${facilityName} ${idx + 1}`}
                                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                          <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                            <ChevronRight className="text-purple-600" size={20} />
                                          </div>
                                        </div>
                                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                          {idx + 1}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Gallery & Documents Tab */}
                <TabsContent value="gallery">
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-purple-500 via-pink-600 to-rose-700 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <FileText className="text-white" size={36} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Gallery & Documents</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">Visual journey and essential resources</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {/* Gallery Images - Enhanced Premium Design */}
                      <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <FileText className="text-white" size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">Photo Gallery</h3>
                            <p className="text-gray-600 font-medium">Glimpses of our vibrant campus life</p>
                          </div>
                          {displayGallery.length > 0 && (
                            <Badge className="bg-purple-100 text-purple-700 border-0 font-bold px-4 py-2 text-base">
                              {displayGallery.length} {displayGallery.length === 1 ? 'Photo' : 'Photos'}
                            </Badge>
                          )}
                        </div>

                        {displayGallery.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayGallery.map((image, index) => (
                              <div
                                key={index}
                                className="group relative aspect-video rounded-3xl overflow-hidden border-3 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                onClick={() => openImagePreview(displayGallery, index)}
                              >
                                <img
                                  src={image}
                                  alt={`${school.name} - Image ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center justify-between">
                                      <Badge className="bg-white/90 text-purple-700 border-0 font-bold">
                                        Photo {index + 1}
                                      </Badge>
                                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                        <ChevronRight className="text-purple-600" size={20} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* Number badge */}
                                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-xl">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 px-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200/60">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                              <FileText className="opacity-60 text-purple-500" size={40} />
                            </div>
                            <p className="text-lg font-semibold text-gray-700">No gallery images available yet</p>
                            <p className="text-gray-500">Check back soon for campus photos</p>
                          </div>
                        )}
                      </div>

                      {/* Documents Section - Premium Enhanced */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent h-px top-0"></div>
                        <div className="flex items-center gap-3 mb-6 pt-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Download className="text-white" size={24} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">Documents & Resources</h3>
                            <p className="text-gray-600 font-medium">Essential information at your fingertips</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {school.prospectusUrl && (
                            <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-3xl border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all duration-300">
                              {/* Decorative elements */}
                              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400/10 rounded-full blur-2xl"></div>
                              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl"></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="text-white" size={28} />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">School Prospectus</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      Comprehensive guide to our curriculum, facilities, and admission process
                                    </p>
                                  </div>
                                </div>
                                
                                <a
                                  href={school.prospectusUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full justify-center"
                                >
                                  <Download size={20} />
                                  Download Prospectus
                                </a>
                              </div>
                            </div>
                          )}

                          {school.newsletterUrl && (
                            <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50 p-6 rounded-3xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-2xl transition-all duration-300">
                              {/* Decorative elements */}
                              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl"></div>
                              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
                              
                              <div className="relative z-10">
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="text-white" size={28} />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Newsletter / Magazine</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      Latest updates, events, and achievements from our school community
                                    </p>
                                  </div>
                                </div>
                                
                                <a
                                  href={school.newsletterUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full justify-center"
                                >
                                  <Download size={20} />
                                  Download Newsletter
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {!school.prospectusUrl && !school.newsletterUrl && (
                          <div className="text-center py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200/60">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                              <Download className="opacity-60 text-blue-500" size={40} />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">No documents available yet</p>
                            <p className="text-gray-500">Check back soon for prospectus and newsletters</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Virtual Tour Tab */}
                <TabsContent value="virtualtour">
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-700 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <Video className="text-white" size={36} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Virtual Campus Tour</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">Experience our campus from anywhere in the world</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {school.virtualTourVideos && school.virtualTourVideos.length > 0 ? (
                        <>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <Video className="text-white" size={24} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900">Campus Videos</h3>
                              <p className="text-gray-600 font-medium">Take a virtual walk through our facilities</p>
                            </div>
                            <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg text-base px-4 py-2 font-bold">
                              {school.virtualTourVideos.length} Video{school.virtualTourVideos.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {school.virtualTourVideos.map((v, idx) => (
                              <div key={idx} className="group relative rounded-3xl overflow-hidden border-2 border-violet-200 hover:border-violet-400 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <div className="aspect-video bg-black relative">
                                  {/(youtube\.com|youtu\.be|vimeo\.com)/i.test(v) ? (
                                    <iframe
                                      src={toEmbedUrl(v)}
                                      className="w-full h-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <video src={v} className="w-full h-full" controls />
                                  )}
                                </div>
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2">
                                  <Video size={18} />
                                  Tour {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : school.virtualTourUrl ? (
                        <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-12 rounded-3xl border-2 border-violet-200 shadow-xl">
                          <div className="absolute -top-10 -right-10 w-48 h-48 bg-violet-400/20 rounded-full blur-3xl"></div>
                          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
                          
                          <div className="relative z-10 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                              <Video className="text-white" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Virtual Tour Available</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">Click the button below to explore our campus virtually</p>
                            <a 
                              href={school.virtualTourUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                              <Video size={24} />
                              Start Virtual Tour
                              <ChevronRight size={24} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                            <Video className="opacity-60 text-violet-500" size={48} />
                          </div>
                          <p className="text-xl font-semibold text-gray-900 mb-2">Virtual Tour not available yet</p>
                          <p className="text-gray-600 mb-6">Check back later or contact the school for more information</p>
                          <Button 
                            onClick={() => setActiveTab('enquire')}
                            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg"
                          >
                            <MessageCircle className="mr-2" size={18} />
                            Request Tour
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fees Tab */}
                <TabsContent value="fees">
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <IndianRupee className="text-white" size={36} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Fee Structure</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">Transparent and competitive pricing for quality education</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {/* Detailed Fees Structure */}
                      {school.feesStructure && Object.keys(school.feesStructure).length > 0 ? (
                        <div className="space-y-8">
                          {/* KG Section Fees */}
                          {school.feesStructure?.kg && (
                            <div className="relative">
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                                  <Users className="text-white" size={24} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">KG / Kindergarten</h3>
                                  <p className="text-sm text-gray-600 font-medium">Early childhood education</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-6 rounded-2xl border-2 border-pink-200 hover:border-pink-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-400/10 rounded-full -mr-8 -mt-8"></div>
                                  <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-bold text-pink-700 uppercase tracking-wider">KG</span>
                                      <Badge className="bg-pink-500 text-white border-0 shadow-md">Annual</Badge>
                                    </div>
                                      <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                          ₹{school.feesStructure.kg.toLocaleString()}
                                        </span>
                                      <span className="text-sm font-semibold text-gray-600">/year</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Class 1-10 Fees */}
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some(i => school.feesStructure?.[`class${i}`]) && (
                            <div className="relative">
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                                  <BookOpen className="text-white" size={24} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">Class 1 to 10</h3>
                                  <p className="text-sm text-gray-600 font-medium">Primary and Secondary education</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(classNum => {
                                  const fee = school.feesStructure?.[`class${classNum}`];
                                  if (!fee) return null;
                                  return (
                                    <div 
                                      key={classNum} 
                                      className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-400/10 rounded-full"></div>
                                      <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Class {classNum}</span>
                                        </div>
                                          <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
                                            ₹{fee.toLocaleString()}
                                          </div>
                                        <span className="text-xs font-semibold text-gray-600">/year</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Class 11 & 12 Stream-wise */}
                          {(school.feesStructure?.class11 || school.feesStructure?.class12) && (
                            <div className="relative">
                              <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                                  <GraduationCap className="text-white" size={24} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">Class 11 & 12 (Stream-wise)</h3>
                                  <p className="text-sm text-gray-600 font-medium">Higher Secondary education by specialization</p>
                                </div>
                              </div>
                              <div className="space-y-6">
                                {school.feesStructure?.class11 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">11</span>
                                      </div>
                                      <span className="font-bold text-gray-700">Class 11</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {school.feesStructure.class11.commerce && (
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-12 -mt-12"></div>
                                          <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md px-3 py-1">Commerce</Badge>
                                            </div>
                                              <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                  ₹{school.feesStructure.class11.commerce.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-600">/year</span>
                                              </div>
                                          </div>
                                        </div>
                                      )}
                                      {school.feesStructure.class11.arts && (
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full -mr-12 -mt-12"></div>
                                          <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                              <Badge className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-0 shadow-md px-3 py-1">Arts</Badge>
                                            </div>
                                              <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                                  ₹{school.feesStructure.class11.arts.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-600">/year</span>
                                              </div>
                                          </div>
                                        </div>
                                      )}
                                      {school.feesStructure.class11.science && (
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full -mr-12 -mt-12"></div>
                                          <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md px-3 py-1">Science</Badge>
                                            </div>
                                              <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                  ₹{school.feesStructure.class11.science.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-600">/year</span>
                                              </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {school.feesStructure?.class12 && (
                                  <div>
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">12</span>
                                      </div>
                                      <span className="font-bold text-gray-700">Class 12</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {school.feesStructure.class12.commerce && (
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-12 -mt-12"></div>
                                          <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md px-3 py-1">Commerce</Badge>
                                            </div>
                                              <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                  ₹{school.feesStructure.class12.commerce.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-600">/year</span>
                                              </div>
                                          </div>
                                        </div>
                                      )}
                                      {school.feesStructure.class12.arts && (
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full -mr-12 -mt-12"></div>
                                          <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                              <Badge className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-0 shadow-md px-3 py-1">Arts</Badge>
                                            </div>
                                              <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                                  ₹{school.feesStructure.class12.arts.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-600">/year</span>
                                              </div>
                                          </div>
                                        </div>
                                      )}
                                      {school.feesStructure.class12.science && (
                                        <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full -mr-12 -mt-12"></div>
                                          <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md px-3 py-1">Science</Badge>
                                            </div>
                                              <div className="flex items-baseline gap-2">
                                                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                  ₹{school.feesStructure.class12.science.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-600">/year</span>
                                              </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Important Note */}
                          <div className="relative mt-8">
                            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 shadow-md">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <span className="text-white font-bold text-lg">ℹ</span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-amber-900 mb-2">Important Information</h4>
                                  <p className="text-amber-800 text-sm leading-relaxed">
                                    Fees may vary based on additional services, payment plans, and special programs. 
                                    Please contact the school directly for the most accurate and detailed fee structure, 
                                    including information about scholarships, discounts, and payment installment options.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : school.feesMin && school.feesMax ? (
                        <div>
                          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-10 rounded-3xl border-2 border-emerald-200 shadow-2xl mb-6">
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
                            
                            <div className="relative z-10 text-center">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                                <IndianRupee className="text-white" size={32} />
                              </div>
                              <div className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3">
                                Annual Fees Range
                              </div>
                                <div className="flex items-baseline justify-center gap-3 mb-3">
                                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    ₹{school.feesMin.toLocaleString()}
                                  </span>
                                  <span className="text-3xl font-bold text-gray-400">-</span>
                                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                    ₹{school.feesMax.toLocaleString()}
                                  </span>
                                </div>
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg text-base px-4 py-2">
                                Per Year
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 p-6 rounded-2xl border-2 border-blue-200">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-white font-bold text-lg">ℹ</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-blue-900 mb-2">Fee Variation Notice</h4>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                  Fees may vary based on class level, additional services, and specialized programs. 
                                  Please contact the school for a detailed class-wise fee structure and information about 
                                  available payment plans and scholarship opportunities.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                            <IndianRupee className="opacity-50" size={48} />
                          </div>
                          <p className="text-xl font-semibold text-gray-900 mb-2">Fee information not available</p>
                          <p className="text-gray-600 mb-6">Please contact the school directly for detailed fee structure information.</p>
                          <Button 
                            onClick={() => setActiveTab('enquire')}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                          >
                            <MessageCircle className="mr-2" size={18} />
                            Contact School
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results">
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-violet-700 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <Trophy className="text-white" size={36} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">School Results & Performance</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">Academic excellence and achievements</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {resultsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
                          <p className="text-lg font-medium text-gray-600">Loading results...</p>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                            <Trophy className="opacity-60 text-blue-500" size={48} />
                          </div>
                          <p className="text-xl font-semibold text-gray-900 mb-2">No results available yet</p>
                          <p className="text-gray-600">Check back later or contact the school for more information.</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {results.map((result, index) => {
                            // Safely parse toppers array
                            let toppersList = [];
                            try {
                              if (result.toppers) {
                                toppersList = typeof result.toppers === 'string' 
                                  ? JSON.parse(result.toppers) 
                                  : result.toppers;
                              }
                            } catch (e) {
                              console.warn('Failed to parse toppers:', e);
                            }

                            return (
                              <div key={index} className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-8 rounded-3xl border-2 border-blue-200 hover:border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-300">
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                  {/* Header Section */}
                                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                          <GraduationCap className="text-white" size={24} />
                                        </div>
                                        <div>
                                          <h3 className="text-2xl font-black text-gray-900">{result.examType}</h3>
                                          {result.classLevel && (
                                            <p className="text-sm font-semibold text-blue-600">Class {result.classLevel}</p>
                                          )}
                                        </div>
                                      </div>
                                      {result.passPercentage !== null && (
                                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                          <CheckCircle2 className="text-white" size={24} />
                                          <div>
                                            <div className="text-3xl font-black text-white">{result.passPercentage}%</div>
                                            <div className="text-xs font-semibold text-white/90">Pass Rate</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-center px-6 py-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl border-2 border-violet-300 shadow-md">
                                      <div className="text-sm font-bold text-violet-700 uppercase tracking-wider mb-1">Academic Year</div>
                                      <div className="text-3xl font-black text-violet-900">{result.year}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    {result.totalStudents !== null && (
                                      <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <Users className="text-white" size={20} />
                                          </div>
                                          <div className="text-xs font-bold text-blue-700 uppercase">Total Students</div>
                                        </div>
                                        <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{result.totalStudents}</div>
                                      </div>
                                    )}
                                    {result.distinction !== null && (
                                      <div className="group bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border-2 border-amber-200 hover:border-amber-400 shadow-md hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                            <Star className="text-white fill-white" size={20} />
                                          </div>
                                          <div className="text-xs font-bold text-amber-700 uppercase">Distinction</div>
                                        </div>
                                        <div className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{result.distinction}</div>
                                      </div>
                                    )}
                                    {result.firstClass !== null && (
                                      <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200 hover:border-green-400 shadow-md hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                            <Trophy className="text-white" size={20} />
                                          </div>
                                          <div className="text-xs font-bold text-green-700 uppercase">First Class</div>
                                        </div>
                                        <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{result.firstClass}</div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Achievements */}
                                  {result.achievements && (
                                    <div className="mb-6">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                                          <Trophy className="text-white" size={20} />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">Key Achievements</h4>
                                      </div>
                                      <div className="p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200 shadow-md">
                                        <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line font-medium">{result.achievements}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Top Performers */}
                                  {toppersList.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-md">
                                          <Star className="text-white fill-white" size={20} />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">Top Performers</h4>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {toppersList.map((topper: any, i: number) => (
                                          <div key={i} className="group relative overflow-hidden p-5 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl border-2 border-yellow-200 hover:border-yellow-400 shadow-md hover:shadow-xl transition-all duration-300">
                                            <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                              <span className="text-white font-black text-lg">#{i + 1}</span>
                                            </div>
                                            <div className="pr-12">
                                              <div className="font-bold text-lg text-gray-900 mb-2">{topper.name}</div>
                                              {topper.subject && (
                                                <div className="text-sm font-medium text-gray-600 mb-3">{topper.subject}</div>
                                              )}
                                              {topper.percentage && (
                                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md px-4 py-1.5 text-base font-bold">
                                                  {topper.percentage}%
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Student Achievements Tab */}
                <TabsContent value="achievements">
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <Star className="text-white fill-white" size={36} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Student Results & Achievements</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">Celebrating individual excellence and success stories</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {achievementsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-6" />
                          <p className="text-lg font-medium text-gray-600">Loading achievements...</p>
                        </div>
                      ) : studentAchievements.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                            <Trophy className="opacity-60 text-amber-500" size={48} />
                          </div>
                          <p className="text-xl font-semibold text-gray-900 mb-2">No student achievements available yet</p>
                          <p className="text-gray-600">Check back later for student achievements and accomplishments.</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <Trophy className="text-white" size={24} />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900">Our Star Performers</h3>
                                <p className="text-gray-600 font-medium">Showcasing excellence and dedication</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg text-lg px-5 py-2 font-bold">
                              {studentAchievements.length} Achievement{studentAchievements.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {studentAchievements.map((achievement, idx) => {
                              let achImages: string[] = [];
                              try {
                                if (achievement.images) {
                                  achImages = typeof achievement.images === 'string'
                                    ? JSON.parse(achievement.images)
                                    : achievement.images;
                                }
                              } catch (e) {
                                console.warn('Failed to parse achievement images:', e);
                              }

                              return (
                                <div key={achievement.id || idx} className="group relative overflow-hidden rounded-3xl border-2 border-amber-200 hover:border-amber-400 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40">
                                  {/* Decorative corner badge */}
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-bl-3xl flex items-center justify-center shadow-lg z-10">
                                    <Trophy className="text-white" size={20} />
                                  </div>

                                  {achImages.length > 0 && (
                                    <div 
                                      className="relative h-40 overflow-hidden cursor-pointer"
                                      onClick={() => openImagePreview(achImages, 0)}
                                    >
                                      <img
                                        src={achImages[0]}
                                        alt={achievement.studentName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      />
                                      {achImages.length > 1 && (
                                        <div className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                          +{achImages.length - 1} more
                                        </div>
                                      )}
                                      {/* Overlay gradient */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                  )}

                                  <div className="p-4 relative">
                                    {/* Student name with star */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Star className="text-white fill-white" size={14} />
                                      </div>
                                      <h3 className="font-black text-base text-gray-900 truncate flex-1">{achievement.studentName}</h3>
                                    </div>
                                    
                                    {/* Class info */}
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                                        <GraduationCap size={12} />
                                        <span>Class {achievement.classLevel}</span>
                                        {achievement.section && (
                                          <>
                                            <span>-</span>
                                            <span>{achievement.section}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Achievement text */}
                                    <p className="text-xs text-gray-700 leading-relaxed mb-3 line-clamp-3 font-medium">
                                      {achievement.achievement}
                                    </p>
                                    
                                    {/* Footer with year and marks */}
                                    <div className="flex items-center justify-between pt-3 border-t border-amber-200/60">
                                      <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 text-amber-700 font-bold text-xs px-2.5 py-1">
                                        {achievement.year}
                                      </Badge>
                                      {achievement.marks && (
                                        <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-md">
                                          <CheckCircle2 size={14} />
                                          <span>{achievement.marks}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Decorative shine effect */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Alumni Tab */}
                <TabsContent value="alumni">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Alumni Network</h2>
                      
                      {alumniLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading alumni data...</p>
                        </div>
                      ) : alumni.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                            <Users className="opacity-50" size={48} />
                          </div>
                          <p className="text-xl font-semibold mb-2">No alumni information available</p>
                          <p>Check back later or contact the school for more information.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {alumni.map((alumniData, index) => (
                            <Card key={index} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/40">
                              <CardContent className="p-0">
                                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-2"></div>
                                
                                <div className="p-6">
                                  <div className="flex items-start gap-4">
                                    {alumniData.photoUrl && (
                                      <div className="flex-shrink-0">
                                        <div className="relative">
                                          <img
                                            src={alumniData.photoUrl}
                                            alt={alumniData.name}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-gradient-to-r from-indigo-400 to-purple-400 shadow-lg"
                                          />
                                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                                            <CheckCircle2 size={16} className="text-white" />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between mb-4">
                                        <div>
                                          <h3 className="text-2xl font-black text-gray-900 mb-2">{alumniData.name}</h3>
                                          {alumniData.currentPosition && (
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                              <Badge variant="outline" className="bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300 text-indigo-700 px-3 py-1.5 font-semibold shadow-sm">
                                                {alumniData.currentPosition}
                                              </Badge>
                                              {alumniData.company && (
                                                <span className="text-sm font-medium text-gray-700">at <span className="font-bold text-indigo-600">{alumniData.company}</span></span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right bg-gradient-to-br from-purple-100 to-pink-100 px-5 py-3 rounded-2xl border-2 border-purple-300 shadow-md">
                                          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Batch</div>
                                          <div className="text-2xl font-black text-purple-900">{alumniData.batchYear}</div>
                                          {alumniData.classLevel && (
                                            <div className="text-xs text-purple-600 font-medium mt-1">
                                              Class {alumniData.classLevel}{alumniData.section ? `-${alumniData.section}` : ''}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {alumniData.achievements && (
                                        <div className="mb-4">
                                          <div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                              <Trophy className="text-white" size={14} />
                                            </div>
                                            Achievements
                                          </div>
                                          <div className="p-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-md">
                                            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">
                                              {alumniData.achievements}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {alumniData.quote && (
                                        <div className="mt-4 relative">
                                          <div className="absolute -left-2 -top-2 text-6xl text-cyan-300 opacity-30 font-serif">"</div>
                                          <div className="p-5 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl border-l-4 border-cyan-500 shadow-lg relative">
                                            <p className="text-sm italic text-gray-700 leading-relaxed">"{alumniData.quote}"</p>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {alumniData.linkedinUrl && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                          <a
                                            href={alumniData.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                                          >
                                            <Linkedin size={18} />
                                            View LinkedIn Profile
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* News Tab */}
                <TabsContent value="news">
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <Calendar className="text-white" size={36} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Latest News & Updates</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">Stay informed with our latest announcements and events</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {newsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-6" />
                          <p className="text-lg font-medium text-gray-600">Loading latest news...</p>
                        </div>
                      ) : news.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                            <Calendar className="opacity-60 text-cyan-500" size={48} />
                          </div>
                          <p className="text-xl font-semibold text-gray-900 mb-2">No news available yet</p>
                          <p className="text-gray-600">Check back later for updates and announcements</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                              <Calendar className="text-white" size={24} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900">Recent Updates</h3>
                              <p className="text-gray-600 font-medium">All the latest from our school community</p>
                            </div>
                            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg text-lg px-5 py-2 font-bold">
                              {news.length} Update{news.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <div className="space-y-6">
                            {news.map((article, index) => {
                              const parsedImages = article.images 
                                ? (typeof article.images === 'string' ? JSON.parse(article.images) : article.images) 
                                : [];
                              const publishDate = article.publishDate 
                                ? new Date(article.publishDate).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  }) 
                                : null;

                              return (
                                <div key={article.id || index} className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 rounded-3xl border-2 border-gray-200 hover:border-cyan-300 shadow-xl hover:shadow-2xl transition-all duration-300">
                                  {/* Decorative gradient bar */}
                                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
                                  
                                  <div className="flex flex-col lg:flex-row">
                                    {(parsedImages.length > 0 || article.video) && (
                                      <div className="lg:w-2/5 relative">
                                        {article.video ? (
                                          <div className="aspect-video bg-black relative">
                                            {/(youtube\.com|youtu\.be|vimeo\.com)/i.test(article.video) ? (
                                              <iframe
                                                src={toEmbedUrl(article.video)}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                              />
                                            ) : (
                                              <video src={article.video} className="w-full h-full object-cover" controls />
                                            )}
                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1.5 rounded-xl font-bold shadow-lg flex items-center gap-2">
                                              <Video size={16} />
                                              Video
                                            </div>
                                          </div>
                                        ) : parsedImages.length > 0 ? (
                                          <div 
                                            className="aspect-video cursor-pointer overflow-hidden relative group/img"
                                            onClick={() => openImagePreview(parsedImages, 0)}
                                          >
                                            <img
                                              src={parsedImages[0]}
                                              alt={article.title}
                                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                            />
                                            {parsedImages.length > 1 && (
                                              <div className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                                                +{parsedImages.length - 1} more
                                              </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                                          </div>
                                        ) : null}
                                      </div>
                                    )}

                                    <div className={`flex-1 p-8 ${(parsedImages.length > 0 || article.video) ? 'lg:w-3/5' : 'w-full'}`}>
                                      {/* Header with category and date */}
                                      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                        <Badge 
                                          className="px-5 py-2 text-sm font-bold shadow-lg text-white border-0"
                                          style={{ 
                                            background: article.category === 'Event' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                                                       article.category === 'Achievement' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                                                       article.category === 'Announcement' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 
                                                       article.category === 'Sports' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                                                       article.category === 'Academic' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 
                                                       'linear-gradient(135deg, #06b6d4, #0891b2)'
                                          }}
                                        >
                                          {article.category}
                                        </Badge>
                                        {publishDate && (
                                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                                            <Calendar size={16} className="text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-700">{publishDate}</span>
                                          </div>
                                        )}
                                        {article.featured && (
                                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-lg px-4 py-2 font-bold">
                                            <Star size={16} className="mr-1 fill-current" />
                                            Featured
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Title */}
                                      <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-cyan-600 transition-colors">
                                        {article.title}
                                      </h3>

                                      {/* Content */}
                                      <p className="text-gray-700 mb-6 leading-relaxed line-clamp-3 whitespace-pre-line font-medium">
                                        {article.content}
                                      </p>

                                      {/* Action buttons */}
                                      <div className="flex flex-wrap items-center gap-3">
                                        {article.link && (
                                          <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                          >
                                            <Globe size={18} />
                                            Read More
                                          </a>
                                        )}

                                        {article.pdf && (
                                          <a
                                            href={article.pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold text-sm hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                          >
                                            <Download size={18} />
                                            Download PDF
                                          </a>
                                        )}

                                        {parsedImages.length > 1 && (
                                          <button
                                            onClick={() => openImagePreview(parsedImages, 0)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold text-sm hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                          >
                                            <FileText size={18} />
                                            View {parsedImages.length} Photos
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Decorative corner element */}
                                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab - Enhanced with Pagination */}
                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
                      
                      {statsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading statistics...</p>
                        </div>
                      ) : reviewStats ? (
                        <div className="mb-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                              <CardContent className="p-6 text-center">
                                <div className="text-6xl font-bold text-yellow-600 mb-2">
                                  {reviewStats.averageRating.toFixed(1)}
                                </div>
                                <div className="flex justify-center mb-3">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-6 h-6 ${
                                        i < Math.floor(reviewStats.averageRating)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : i < reviewStats.averageRating
                                          ? 'fill-yellow-400/50 text-yellow-400'
                                          : 'fill-gray-200 text-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div className="text-muted-foreground font-semibold">
                                  Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                              <CardContent className="p-6">
                                <h3 className="font-semibold mb-4 text-center">Rating Distribution</h3>
                                <div className="space-y-2">
                                  {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = reviewStats.ratingDistribution[rating] || 0;
                                    const percentage = reviewStats.totalReviews > 0
                                      ? (count / reviewStats.totalReviews) * 100
                                      : 0;
                                    return (
                                      <div key={rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-16">
                                          <span className="text-sm font-medium">{rating}</span>
                                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-12 w-full text-right">
                                          {count}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ) : null}

                      <Separator className="my-6" />

                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Student Reviews</h3>
                        {reviewsMetadata && reviewsMetadata.total > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Showing {((reviewsMetadata.page - 1) * reviewsMetadata.limit) + 1} - {Math.min(reviewsMetadata.page * reviewsMetadata.limit, reviewsMetadata.total)}
                            of {reviewsMetadata.total}
                          </p>
                        )}
                      </div>
                      

                      {reviewsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="text-muted-foreground">Loading reviews...</p>
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                            <Star className="opacity-50" size={48} />
                          </div>
                          <p className="text-xl font-semibold mb-2">No reviews yet</p>
                          <p>Be the first to review this school!</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-6">
                            {reviews.map((review) => (
                              <Card key={review.id} className="border-0 bg-white shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        {review.studentName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-lg">{review.studentName}</h4>
                                        <div className="flex items-center gap-2">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              size={18}
                                              className={
                                                i < review.rating
                                                  ? 'fill-yellow-400 text-yellow-400'
                                                  : 'fill-gray-200 text-gray-200'
                                              }
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>

                                  <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
                                    {review.reviewText}
                                  </p>

                                  {review.photos && review.photos.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                                      {review.photos.map((photo: string, index: number) => (
                                        <div
                                          key={index}
                                          className="aspect-video rounded-lg overflow-hidden border-2 border-gray-100 hover:border-cyan-300 transition-colors cursor-pointer"
                                          onClick={() => openImagePreview(review.photos, index)}
                                        >
                                          <img
                                            src={photo}
                                            alt={`Review photo ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                    <span className="text-sm text-muted-foreground">
                                      Verified Review
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {reviewsMetadata && reviewsMetadata.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(reviewsPage - 1)}
                                disabled={reviewsPage === 1}
                              >
                                <ChevronLeft size={18} />
                                Previous
                              </Button>
                              
                              <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, reviewsMetadata.totalPages) }, (_, i) => {
                                  let pageNum;
                                  if (reviewsMetadata.totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (reviewsPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (reviewsPage >= reviewsMetadata.totalPages - 2) {
                                    pageNum = reviewsMetadata.totalPages - 4 + i;
                                  } else {
                                    pageNum = reviewsPage - 2 + i;
                                  }
                                  
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={reviewsPage === pageNum ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePageChange(pageNum)}
                                      className={reviewsPage === pageNum ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(reviewsPage + 1)}
                                disabled={reviewsPage === reviewsMetadata.totalPages}
                              >
                                Next
                                <ChevronRight size={18} />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
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
                              src={school.googleMapUrl.replace('key=AIzaSyBFw0Qbyq9zTFTd-tuzjaj0qsMROiZ2P', `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)}
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
                  <Card className="border-0 shadow-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 p-8 relative">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                          <MessageCircle className="text-white" size={36} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Get in Touch</h2>
                          <p className="text-white/90 text-lg font-medium drop-shadow">We're here to help with your admission queries</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      {/* Introduction Section */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6 rounded-3xl border-2 border-teal-200 shadow-md mb-8">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Mail className="text-white" size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Begin Your Journey?</h3>
                            <p className="text-gray-700 leading-relaxed">
                              Fill out the form below and our admission team will reach out to you within 24 hours. 
                              We're excited to learn more about your child and answer all your questions!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleEnquirySubmit} className="space-y-6">
                        {/* Student Name */}
                        <div className="relative">
                          <Label htmlFor="studentName" className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                              <Users className="text-white" size={14} />
                            </div>
                            Student Name *
                          </Label>
                          <Input
                            id="studentName"
                            required
                            className="h-12 text-base border-2 border-gray-200 hover:border-teal-300 focus:border-teal-500 rounded-xl transition-colors shadow-sm"
                            placeholder="Enter student's full name"
                            value={enquiryForm.studentName}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentName: e.target.value })
                            }
                          />
                        </div>

                        {/* Email */}
                        <div className="relative">
                          <Label htmlFor="studentEmail" className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <Mail className="text-white" size={14} />
                            </div>
                            Email Address *
                          </Label>
                          <Input
                            id="studentEmail"
                            type="email"
                            required
                            className="h-12 text-base border-2 border-gray-200 hover:border-cyan-300 focus:border-cyan-500 rounded-xl transition-colors shadow-sm"
                            placeholder="your.email@example.com"
                            value={enquiryForm.studentEmail}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentEmail: e.target.value })
                            }
                          />
                        </div>

                        {/* Phone */}
                        <div className="relative">
                          <Label htmlFor="studentPhone" className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <Phone className="text-white" size={14} />
                            </div>
                            Phone Number *
                          </Label>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={enquiryForm.studentPhoneCode} 
                              onValueChange={(value) => setEnquiryForm({ ...enquiryForm, studentPhoneCode: value })}
                            >
                              <SelectTrigger className="w-[120px] h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-xl flex items-center">
                                <SelectValue>
                                  {phoneCountryCodes.find(c => c.code === enquiryForm.studentPhoneCode)?.flag} {enquiryForm.studentPhoneCode}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {phoneCountryCodes.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <span className="flex items-center gap-2">
                                      <span>{country.flag}</span>
                                      <span>{country.code}</span>
                                      <span className="text-muted-foreground text-xs">({country.country})</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              id="studentPhone"
                              type="tel"
                              required
                              maxLength={10}
                              className="flex-1 h-12 text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-xl transition-colors shadow-sm"
                              placeholder="9876543210"
                              value={enquiryForm.studentPhone}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setEnquiryForm({ ...enquiryForm, studentPhone: value });
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Enter 10-digit mobile number</p>
                        </div>

                        {/* Class */}
                        <div className="relative">
                          <Label htmlFor="studentClass" className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
                              <GraduationCap className="text-white" size={14} />
                            </div>
                            Class/Grade *
                          </Label>
                          <Input
                            id="studentClass"
                            required
                            className="h-12 text-base border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 rounded-xl transition-colors shadow-sm"
                            placeholder="e.g., 6th Grade, KG, Class 10"
                            value={enquiryForm.studentClass}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, studentClass: e.target.value })
                            }
                          />
                        </div>

                        {/* Message */}
                        <div className="relative">
                          <Label htmlFor="message" className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                              <MessageCircle className="text-white" size={14} />
                            </div>
                            Your Message (Optional)
                          </Label>
                          <Textarea
                            id="message"
                            rows={5}
                            className="text-base border-2 border-gray-200 hover:border-green-300 focus:border-green-500 rounded-xl transition-colors shadow-sm resize-none"
                            placeholder="Tell us about any specific requirements, questions about curriculum, facilities, fees, or anything else you'd like to know..."
                            value={enquiryForm.message}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, message: e.target.value })
                            }
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="relative pt-4">
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submittingEnquiry}
                          >
                            {submittingEnquiry ? (
                              <div className="flex items-center gap-3">
                                <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                                <span>Submitting Your Enquiry...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <MessageCircle size={24} />
                                <span>Submit Enquiry</span>
                                <ChevronRight size={24} />
                              </div>
                            )}
                          </Button>
                        </div>

                        {/* Privacy Note */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="flex items-start gap-3">
                            <Shield className="text-gray-500 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-gray-600 leading-relaxed">
                              <span className="font-semibold text-gray-900">Your privacy matters:</span> We'll only use your information to respond to your enquiry. 
                              We never share your details with third parties.
                            </p>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Contact & Quick Actions */}
            <div className="lg:w-96">
              <Card className="sticky top-24 overflow-hidden border-0 shadow-xl">
                {/* Premium Header Gradient */}
                <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
                
                <CardContent className="p-6">
                  {/* Contact Information Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Phone className="text-white" size={20} />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                        Contact Information
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {(school.contactPhone || school.contactNumber) && (
                        <a
                          href={`tel:${school.contactPhone || school.contactNumber}`}
                          className="group flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-200/60 hover:border-emerald-400 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Phone size={22} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Phone</div>
                            <div className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                              {school.contactPhone || school.contactNumber}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <ChevronRight size={18} className="text-emerald-600" />
                          </div>
                        </a>
                      )}

                      {school.whatsappNumber && (
                        <a
                          href={`https://wa.me/${school.whatsappNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 rounded-2xl border border-green-200/60 hover:border-green-400 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <MessageCircle size={22} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">WhatsApp</div>
                            <div className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                              {school.whatsappNumber}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <ChevronRight size={18} className="text-green-600" />
                          </div>
                        </a>
                      )}

                      {(school.contactEmail || school.email) && (
                        <a
                          href={`mailto:${school.contactEmail || school.email}`}
                          className="group flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-2xl border border-blue-200/60 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Mail size={22} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Email</div>
                            <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                              {school.contactEmail || school.email}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                            <ChevronRight size={18} className="text-blue-600" />
                          </div>
                        </a>
                      )}

                      {school.website && (
                        <a
                          href={school.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 rounded-2xl border border-purple-200/60 hover:border-purple-400 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Globe size={22} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Website</div>
                            <div className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                              Visit Website
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <ChevronRight size={18} className="text-purple-600" />
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Follow Us Section */}
                  {(school.facebookUrl || school.instagramUrl || school.linkedinUrl || school.youtubeUrl) && (
                    <>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-4 text-sm font-medium text-gray-400">Connect With Us</span>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl border border-gray-200/60">
                        <h4 className="text-center font-bold text-gray-700 mb-4 flex items-center justify-center gap-2">
                          <Heart size={16} className="text-pink-500" />
                          Follow Us
                          <Heart size={16} className="text-pink-500" />
                        </h4>
                        <div className="flex justify-center gap-3">
                          {school.facebookUrl && (
                            <a
                              href={school.facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                            >
                              <Facebook size={24} className="text-white" />
                              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-30 blur transition-opacity" />
                            </a>
                          )}
                          {school.instagramUrl && (
                            <a
                              href={school.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                            >
                              <Instagram size={24} className="text-white" />
                              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-pink-400 via-red-400 to-yellow-400 opacity-0 group-hover:opacity-30 blur transition-opacity" />
                            </a>
                          )}
                          {school.linkedinUrl && (
                            <a
                              href={school.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                            >
                              <Linkedin size={24} className="text-white" />
                              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 opacity-0 group-hover:opacity-30 blur transition-opacity" />
                            </a>
                          )}
                          {school.youtubeUrl && (
                            <a
                              href={school.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                            >
                              <Youtube size={24} className="text-white" />
                              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 opacity-0 group-hover:opacity-30 blur transition-opacity" />
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator className="my-6" />

                  {/* Profile Views */}
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

        {/* Similar Schools Section */}
        {similarSchools.length > 0 && (
          <section className="py-16 bg-white border-t">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Similar Schools</h2>
                  <p className="text-gray-600">Explore other schools in {school.city}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/schools?city=${school.city}`)}
                  className="hidden md:flex items-center gap-2 border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 rounded-xl font-bold"
                >
                  View All in {school.city}
                  <ChevronRight size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarSchools.map((similarSchool) => (
                  <SchoolCard key={similarSchool.id} school={similarSchool as any} />
                ))}
              </div>

              <div className="mt-8 text-center md:hidden">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/schools?city=${school.city}`)}
                  className="w-full border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 rounded-xl font-bold"
                >
                  View All in {school.city}
                </Button>
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    );
  }
