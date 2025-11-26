'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, TrendingUp, Clock, Eye, Mail, Phone, Calendar,
  Filter, Search, Edit, MoreVertical, Plus, Building2,
  LayoutDashboard, MessageSquare, Info, Contact2, Building,
  Image, DollarSign, Trophy, GraduationCap, Newspaper,
  Star, BarChart3, Bell, User as UserIcon, Sparkles, Target,
  CheckCircle2, XCircle, AlertCircle, ArrowUpRight, Menu, X,
  Save, Upload, Link, MapPin, Globe, Facebook, Instagram, Linkedin,
  Youtube, School, BookOpen, Laptop, Wifi, Video, Shield, Bus,
  Heart, Home, Coffee, Award, Camera, FileText, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getMe, type User, type Enquiry } from '@/lib/api';
import { toast } from 'sonner';
import { AIChat } from '@/components/AIChat';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'enquiry', label: 'Enquiry', icon: MessageSquare },
  { id: 'basic-info', label: 'Basic Info', icon: Info },
  { id: 'contact', label: 'Contact Information', icon: Contact2 },
  { id: 'facilities', label: 'Facilities & Infrastructure', icon: Building },
  { id: 'gallery', label: 'Gallery & Documents', icon: Image },
  { id: 'fees', label: 'Fees Structure', icon: DollarSign },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'alumini', label: 'Alumini', icon: Users },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'review', label: 'Review', icon: Star },
  { id: 'campaign', label: 'Campaign', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
];

// School Profile type
interface SchoolProfile {
  // Basic Info
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
  
  // Academic Facilities
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
  
  // Sports & Fitness
  hasPlayground?: boolean;
  sportsFacilities?: string;
  hasSwimmingPool?: boolean;
  hasFitnessCentre?: boolean;
  hasYoga?: boolean;
  hasMartialArts?: boolean;
  hasMusicDance?: boolean;
  hasHorseRiding?: boolean;
  
  // Technology & Digital
  hasSmartBoard?: boolean;
  hasWifi?: boolean;
  hasCctv?: boolean;
  hasElearning?: boolean;
  hasAcClassrooms?: boolean;
  hasAiTools?: boolean;
  
  // Transport
  hasTransport?: boolean;
  hasGpsBuses?: boolean;
  hasCctvBuses?: boolean;
  hasBusCaretaker?: boolean;
  
  // Health & Safety
  hasMedicalRoom?: boolean;
  hasDoctorNurse?: boolean;
  hasFireSafety?: boolean;
  hasCleanWater?: boolean;
  hasSecurityGuards?: boolean;
  hasAirPurifier?: boolean;
  
  // Boarding
  hasHostel?: boolean;
  hasMess?: boolean;
  hasHostelStudyRoom?: boolean;
  hasAcHostel?: boolean;
  
  // Others
  hasCafeteria?: boolean;
  galleryImages?: string[];
  virtualTourUrl?: string;
  prospectusUrl?: string;
  awards?: string[];
  newsletterUrl?: string;
  feesStructure?: any;
}

export default function SchoolDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // School profile state
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Selected enquiry for editing
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('');

  useEffect(() => {
    loadSchoolData();
  }, []);

  useEffect(() => {
    // Load profile when switching to profile-related sections
    if (['basic-info', 'contact', 'facilities', 'gallery', 'fees'].includes(activeSection) && !profile) {
      loadSchoolProfile();
    }
  }, [activeSection]);

  const loadSchoolData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access dashboard');
      router.push('/login');
      return;
    }

    try {
      const { user: userData } = await getMe(token);
      
      if (userData.role !== 'school') {
        toast.error('Access denied. Schools only.');
        router.push('/');
        return;
      }

      setUser(userData);

      // Load school enquiries
      const response = await fetch('/api/schools/enquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEnquiries(data);
      }
    } catch (error) {
      console.error('Failed to load school data:', error);
      toast.error('Failed to load dashboard data');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setProfileLoading(true);
    try {
      const response = await fetch('/api/schools/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        // Profile doesn't exist yet, initialize with default values
        setProfile({
          name: '',
          board: '',
          city: '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async (data: Partial<SchoolProfile>) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch('/api/schools/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEnquiry = async (enquiryId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/enquiries/${enquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: enquiryStatus,
          notes: enquiryNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update enquiry');

      toast.success('Enquiry updated successfully');
      setSelectedEnquiry(null);
      loadSchoolData();
    } catch (error) {
      toast.error('Failed to update enquiry');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'In Progress':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'Converted':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'Closed':
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesStatus = filterStatus === 'all' || enquiry.status === filterStatus;
    const matchesSearch = 
      enquiry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.studentPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalLeads: enquiries.length,
    newEnquiries: enquiries.filter(e => e.status === 'New').length,
    inProgress: enquiries.filter(e => e.status === 'In Progress').length,
    converted: enquiries.filter(e => e.status === 'Converted').length,
    contacted: Math.floor(enquiries.length * 0.85),
    applications: Math.floor(enquiries.length * 0.47),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-80 bg-gradient-to-b from-cyan-600 to-blue-700 p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-white/20 rounded-xl mb-8" />
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/50 rounded-xl w-1/4 mb-6" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white/50 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-300/20 to-blue-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-300/10 to-pink-300/10 rounded-full blur-3xl -z-10" />

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 
        bg-gradient-to-b from-cyan-500 via-cyan-600 to-blue-700 
        p-6 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-full" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <h2 className="text-white text-2xl font-bold">PickMySchool</h2>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group ${
                  isActive
                    ? 'bg-white text-cyan-600 shadow-lg scale-105 font-semibold'
                    : 'text-white/90 hover:bg-white/10 hover:translate-x-1'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-cyan-600' : 'text-white/80 group-hover:text-white'} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
              <Building2 className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user.name}</p>
              <p className="text-white/70 text-xs">School Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-4 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="hidden lg:block w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div className="min-w-0 ml-12 lg:ml-0">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent truncate">
                  Welcome, {user.name}!
                </h1>
                <p className="text-sm text-muted-foreground">Manage your institution</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Rating */}
              <div className="hidden md:flex items-center gap-1 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}
                  />
                ))}
              </div>
              
              {/* Notifications */}
              <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors group">
                <Bell size={20} className="text-gray-600 group-hover:text-cyan-600 transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              
              {/* User Profile */}
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
                <UserIcon size={20} className="text-gray-600 group-hover:text-cyan-600 transition-colors" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid - Modern Bento Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Total Enquiries */}
                <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Users className="text-white" size={24} />
                      </div>
                      <Target className="text-cyan-600 opacity-20 group-hover:opacity-40 transition-opacity" size={32} />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Total Enquiries</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
                      {stats.totalLeads}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={12} className="text-green-600" />
                      <span className="text-green-600 font-semibold">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                {/* Admission Confirmed */}
                <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="text-white" size={24} />
                      </div>
                      <Trophy className="text-green-600 opacity-20 group-hover:opacity-40 transition-opacity" size={32} />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Admission Confirmed</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                      {stats.converted}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp size={12} className="text-green-600" />
                      <span className="text-green-600 font-semibold">+8%</span> conversion rate
                    </p>
                  </CardContent>
                </Card>

                {/* In Progress */}
                <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Clock className="text-white" size={24} />
                      </div>
                      <AlertCircle className="text-yellow-600 opacity-20 group-hover:opacity-40 transition-opacity" size={32} />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">In Progress</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
                      {stats.inProgress}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending follow-ups</p>
                  </CardContent>
                </Card>

                {/* New Enquiries */}
                <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="text-white" size={24} />
                      </div>
                      <ArrowUpRight className="text-purple-600 opacity-20 group-hover:opacity-40 transition-opacity" size={32} />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">New Enquiries</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                      {stats.newEnquiries}
                    </p>
                    <p className="text-xs text-muted-foreground">Awaiting response</p>
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Funnel */}
              <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <BarChart3 className="text-white" size={20} />
                    </div>
                    Admission Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {/* Enquiries */}
                    <div className="group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-semibold text-gray-700">Enquiries</span>
                        <span className="text-2xl font-bold text-cyan-600">{stats.totalLeads}</span>
                      </div>
                      <div className="relative h-16 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      </div>
                    </div>

                    {/* Contacted */}
                    <div className="group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-semibold text-gray-700">Contacted</span>
                        <span className="text-2xl font-bold text-cyan-600">{stats.contacted}</span>
                      </div>
                      <div className="relative h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl overflow-hidden shadow-lg" style={{ width: '85%' }}>
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      </div>
                    </div>

                    {/* Applications */}
                    <div className="group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-semibold text-gray-700">Applications</span>
                        <span className="text-2xl font-bold text-blue-600">{stats.applications}</span>
                      </div>
                      <div className="relative h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl overflow-hidden shadow-lg" style={{ width: '65%' }}>
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      </div>
                    </div>

                    {/* Confirmed */}
                    <div className="group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-semibold text-gray-700">Confirmed Admissions</span>
                        <span className="text-2xl font-bold text-green-600">{stats.converted}</span>
                      </div>
                      <div className="relative h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl overflow-hidden shadow-lg" style={{ width: '45%' }}>
                        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'enquiry' && (
            <div className="space-y-6">
              <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <MessageSquare className="text-white" size={20} />
                      </div>
                      Leads & Enquiries
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          placeholder="Search by name, email, phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/50 border-gray-200 focus:border-cyan-400"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40 bg-white/50">
                          <Filter size={16} className="mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Converted">Converted</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredEnquiries.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                        <Users className="opacity-50" size={48} />
                      </div>
                      <p className="text-xl font-semibold mb-2">No enquiries found</p>
                      <p>Enquiries from parents will appear here</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 hover:bg-transparent">
                            <TableHead className="font-semibold">Student Name</TableHead>
                            <TableHead className="font-semibold">Contact</TableHead>
                            <TableHead className="font-semibold">Class</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEnquiries.map((enquiry) => (
                            <TableRow key={enquiry.id} className="border-gray-100 hover:bg-cyan-50/50 transition-colors">
                              <TableCell className="font-semibold">
                                {enquiry.studentName}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Mail size={12} className="text-cyan-600" />
                                    <span className="text-muted-foreground">{enquiry.studentEmail}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone size={12} className="text-cyan-600" />
                                    <span className="text-muted-foreground">{enquiry.studentPhone}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50">
                                  {enquiry.studentClass}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(enquiry.status)} text-white border-0 shadow-sm`}>
                                  {enquiry.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(enquiry.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="hover:bg-cyan-50">
                                      <MoreVertical size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedEnquiry(enquiry);
                                        setEnquiryStatus(enquiry.status);
                                        setEnquiryNotes(enquiry.notes || '');
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="mr-2" size={14} />
                                      Update Status
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Enquiry Card */}
              {selectedEnquiry && (
                <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Edit className="text-white" size={20} />
                      </div>
                      Update Enquiry - {selectedEnquiry.studentName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
                      <Select value={enquiryStatus} onValueChange={setEnquiryStatus}>
                        <SelectTrigger className="bg-white/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Converted">Converted</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-semibold">Notes / Response</Label>
                      <Textarea
                        id="notes"
                        value={enquiryNotes}
                        onChange={(e) => setEnquiryNotes(e.target.value)}
                        rows={4}
                        placeholder="Add notes or response for the parent..."
                        className="bg-white/50 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleUpdateEnquiry(selectedEnquiry.id)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
                      >
                        <CheckCircle2 className="mr-2" size={18} />
                        Update Enquiry
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedEnquiry(null)}
                        className="border-2"
                      >
                        <XCircle className="mr-2" size={18} />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* NEW: Basic Info Section */}
          {activeSection === 'basic-info' && (
            <BasicInfoSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {/* NEW: Contact Information Section */}
          {activeSection === 'contact' && (
            <ContactInfoSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {/* NEW: Facilities Section */}
          {activeSection === 'facilities' && (
            <FacilitiesSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {/* NEW: Gallery Section */}
          {activeSection === 'gallery' && (
            <GallerySection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {/* NEW: Fees Section */}
          {activeSection === 'fees' && (
            <FeesSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {/* Other sections - Coming Soon */}
          {!['dashboard', 'enquiry', 'basic-info', 'contact', 'facilities', 'gallery', 'fees'].includes(activeSection) && (
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
              <CardContent className="p-16">
                <div className="text-center text-muted-foreground">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="opacity-50" size={48} />
                  </div>
                  <p className="text-2xl mb-3 font-bold capitalize bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {activeSection.replace('-', ' ')}
                  </p>
                  <p className="text-lg">This section is coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">We're working hard to bring you this feature</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <AIChat />
    </div>
  );
}

// NEW COMPONENT: Basic Info Section
function BasicInfoSection({ profile, profileLoading, saving, onSave }: any) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Info className="text-white" size={20} />
          </div>
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name of School <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter school name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="establishmentYear">Establishment Year</Label>
              <Input
                id="establishmentYear"
                type="number"
                value={formData.establishmentYear || ''}
                onChange={(e) => setFormData({ ...formData, establishmentYear: parseInt(e.target.value) })}
                placeholder="e.g., 1990"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolType">School Type</Label>
              <Select
                value={formData.schoolType || ''}
                onValueChange={(value) => setFormData({ ...formData, schoolType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Govt">Govt.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="k12Level">K-12 School</Label>
              <Select
                value={formData.k12Level || ''}
                onValueChange={(value) => setFormData({ ...formData, k12Level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Foundational">Foundational (Till Class 2)</SelectItem>
                  <SelectItem value="Preparatory">Preparatory (Class 3 to 5)</SelectItem>
                  <SelectItem value="Middle">Middle (Class 6 to 8)</SelectItem>
                  <SelectItem value="Secondary">Secondary (Class 9 to 12)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="board">Board <span className="text-red-500">*</span></Label>
              <Select
                value={formData.board || ''}
                onValueChange={(value) => setFormData({ ...formData, board: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBSE">CBSE</SelectItem>
                  <SelectItem value="ICSE">ICSE</SelectItem>
                  <SelectItem value="State Board">State Board</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                  <SelectItem value="Unregistered">Unregistered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Co-Ed">Co-Ed</SelectItem>
                  <SelectItem value="Boys">Boys</SelectItem>
                  <SelectItem value="Girls">Girls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isInternational" className="flex items-center gap-2">
                Affiliated to International
              </Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.isInternational || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isInternational: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.isInternational ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streamsAvailable">Stream Available</Label>
              <Input
                id="streamsAvailable"
                value={formData.streamsAvailable || ''}
                onChange={(e) => setFormData({ ...formData, streamsAvailable: e.target.value })}
                placeholder="e.g., Science, Arts, Commerce"
              />
              <p className="text-xs text-muted-foreground">Separate multiple streams with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Language</Label>
              <Input
                id="languages"
                value={formData.languages || ''}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                placeholder="e.g., English, Hindi, Regional Language"
              />
              <p className="text-xs text-muted-foreground">Separate multiple languages with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalStudents">No. of Students</Label>
              <Select
                value={formData.totalStudents || ''}
                onValueChange={(value) => setFormData({ ...formData, totalStudents: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upto 100">Upto 100</SelectItem>
                  <SelectItem value="200-400">200-400</SelectItem>
                  <SelectItem value="400-600">400-600</SelectItem>
                  <SelectItem value="600-800">600-800</SelectItem>
                  <SelectItem value="800-1000">800-1000</SelectItem>
                  <SelectItem value="1000-1500">1000-1500</SelectItem>
                  <SelectItem value="1500-2000">1500-2000</SelectItem>
                  <SelectItem value="More than 2000">More than 2000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalTeachers">No. of Teachers</Label>
              <Input
                id="totalTeachers"
                type="number"
                value={formData.totalTeachers || ''}
                onChange={(e) => setFormData({ ...formData, totalTeachers: parseInt(e.target.value) })}
                placeholder="Enter number of teachers"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo of School (URL)</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Basic Info
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// NEW COMPONENT: Contact Info Section
function ContactInfoSection({ profile, profileLoading, saving, onSave }: any) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Contact2 className="text-white" size={20} />
          </div>
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address of School</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Enter state"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Enter country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="contactNumber"
                  value={formData.contactNumber || ''}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="+91 1234567890"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Whatsapp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+91 1234567890"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@school.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="instagramUrl"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">Youtube</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="youtubeUrl"
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="googleMapUrl">Google Map</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="googleMapUrl"
                  value={formData.googleMapUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Contact Info
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// NEW COMPONENT: Facilities Section
function FacilitiesSection({ profile, profileLoading, saving, onSave }: any) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Building className="text-white" size={20} />
          </div>
          Facilities & Infrastructure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="classroomType">Classroom Type</Label>
              <Input
                id="classroomType"
                value={formData.classroomType || ''}
                onChange={(e) => setFormData({ ...formData, classroomType: e.target.value })}
                placeholder="e.g., Modern, Traditional, Smart"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasLibrary">Has Library</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasLibrary || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasLibrary: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasLibrary ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasComputerLab">Has Computer Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasComputerLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasComputerLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasComputerLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="computerCount">No. of Computers</Label>
              <Input
                id="computerCount"
                type="number"
                value={formData.computerCount || ''}
                onChange={(e) => setFormData({ ...formData, computerCount: parseInt(e.target.value) })}
                placeholder="Enter number of computers"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasPhysicsLab">Has Physics Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasPhysicsLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasPhysicsLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasPhysicsLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasChemistryLab">Has Chemistry Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasChemistryLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasChemistryLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasChemistryLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasBiologyLab">Has Biology Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasBiologyLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasBiologyLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasBiologyLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasMathsLab">Has Maths Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasMathsLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasMathsLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasMathsLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasLanguageLab">Has Language Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasLanguageLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasLanguageLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasLanguageLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasRoboticsLab">Has Robotics Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasRoboticsLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasRoboticsLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasRoboticsLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasStemLab">Has STEM Lab</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasStemLab || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasStemLab: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasStemLab ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasAuditorium">Has Auditorium</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasAuditorium || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasAuditorium: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasAuditorium ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasPlayground">Has Playground</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasPlayground || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasPlayground: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasPlayground ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sportsFacilities">Sports Facilities</Label>
              <Input
                id="sportsFacilities"
                value={formData.sportsFacilities || ''}
                onChange={(e) => setFormData({ ...formData, sportsFacilities: e.target.value })}
                placeholder="e.g., Football, Cricket, Badminton"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasSwimmingPool">Has Swimming Pool</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasSwimmingPool || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasSwimmingPool: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasSwimmingPool ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasFitnessCentre">Has Fitness Centre</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasFitnessCentre || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasFitnessCentre: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasFitnessCentre ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasYoga">Has Yoga</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasYoga || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasYoga: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasYoga ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasMartialArts">Has Martial Arts</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasMartialArts || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasMartialArts: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasMartialArts ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasMusicDance">Has Music & Dance</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasMusicDance || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasMusicDance: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasMusicDance ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasHorseRiding">Has Horse Riding</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasHorseRiding || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasHorseRiding: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasHorseRiding ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Facilities
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// NEW COMPONENT: Gallery Section
function GallerySection({ profile, profileLoading, saving, onSave }: any) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Image className="text-white" size={20} />
          </div>
          Gallery & Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="galleryImages">Gallery Images (URLs)</Label>
              <Textarea
                id="galleryImages"
                value={formData.galleryImages?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, galleryImages: e.target.value.split(',').map(img => img.trim()) })}
                placeholder="Enter URLs separated by commas"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">e.g., https://example.com/image1.jpg, https://example.com/image2.jpg</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="virtualTourUrl"
                  value={formData.virtualTourUrl || ''}
                  onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                  placeholder="https://example.com/virtual-tour"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prospectusUrl">Prospectus URL</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="prospectusUrl"
                  value={formData.prospectusUrl || ''}
                  onChange={(e) => setFormData({ ...formData, prospectusUrl: e.target.value })}
                  placeholder="https://example.com/prospectus.pdf"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="awards">Awards</Label>
              <Textarea
                id="awards"
                value={formData.awards?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, awards: e.target.value.split(',').map(award => award.trim()) })}
                placeholder="Enter award names separated by commas"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">e.g., National Science Award, State Excellence Award</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newsletterUrl">Newsletter URL</Label>
              <div className="relative">
                <Download className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="newsletterUrl"
                  value={formData.newsletterUrl || ''}
                  onChange={(e) => setFormData({ ...formData, newsletterUrl: e.target.value })}
                  placeholder="https://example.com/newsletter"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Gallery
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// NEW COMPONENT: Fees Section
function FeesSection({ profile, profileLoading, saving, onSave }: any) {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (profileLoading) {
    return (
      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
            <DollarSign className="text-white" size={20} />
          </div>
          Fees Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hasSmartBoard">Has Smart Board</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasSmartBoard || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasSmartBoard: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasSmartBoard ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasWifi">Has Wi-Fi</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasWifi || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasWifi: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasWifi ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasCctv">Has CCTV</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasCctv || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasCctv: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasCctv ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasElearning">Has E-Learning</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasElearning || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasElearning: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasElearning ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasAcClassrooms">Has AC Classrooms</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasAcClassrooms || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasAcClassrooms: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasAcClassrooms ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasAiTools">Has AI Tools</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasAiTools || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasAiTools: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasAiTools ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasTransport">Has Transport</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasTransport || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasTransport: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasTransport ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasGpsBuses">GPS Buses</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasGpsBuses || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasGpsBuses: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasGpsBuses ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasCctvBuses">CCTV Buses</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasCctvBuses || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasCctvBuses: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasCctvBuses ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasBusCaretaker">Bus Caretaker</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasBusCaretaker || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasBusCaretaker: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasBusCaretaker ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasMedicalRoom">Has Medical Room</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasMedicalRoom || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasMedicalRoom: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasMedicalRoom ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasDoctorNurse">Has Doctor/Nurse</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasDoctorNurse || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasDoctorNurse: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasDoctorNurse ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasFireSafety">Fire Safety</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasFireSafety || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasFireSafety: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasFireSafety ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasCleanWater">Clean Water</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasCleanWater || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasCleanWater: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasCleanWater ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasSecurityGuards">Security Guards</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasSecurityGuards || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasSecurityGuards: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasSecurityGuards ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasAirPurifier">Air Purifier</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasAirPurifier || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasAirPurifier: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasAirPurifier ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasHostel">Has Hostel</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasHostel || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasHostel: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasHostel ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasMess">Has Mess</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasMess || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasMess: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasMess ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasHostelStudyRoom">Hostel Study Room</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasHostelStudyRoom || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasHostelStudyRoom: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasHostelStudyRoom ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasAcHostel">AC Hostel</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasAcHostel || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasAcHostel: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasAcHostel ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasCafeteria">Has Cafeteria</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.hasCafeteria || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasCafeteria: checked })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.hasCafeteria ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Save Fees Structure
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}