'use client';

  // HMR touch
  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { 
    Users, TrendingUp, Clock, Eye, Mail, Phone, Calendar,
    Filter, Search, Edit, MoreVertical, Plus, Building2,
    LayoutDashboard, MessageSquare, Info, Contact2, Building,
    Image, DollarSign, Trophy, GraduationCap, Newspaper,
    Star, BarChart3, Bell, User as UserIcon, Sparkles, Target,
    CheckCircle2, XCircle, AlertCircle, ArrowUpRight, Menu, X, LogOut, Settings, ThumbsUp, ThumbsDown, Video, Globe, ClipboardList, FileText, MapPin, UserPlus
  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMe, type User, type Enquiry } from '@/lib/api';
import { toast } from 'sonner';
import {
  BasicInfoSection,
  ContactInfoSection,
  FacilitiesSection,
  GallerySection,
  VirtualTourSection,
  FeesSection
} from './sections';
import { SettingsSection } from './SettingsSection';
import { ResultsSection } from './ResultsSection';
import { AlumniSection } from './AlumniSection';
import { NewsSection } from './NewsSection';
import { AnalyticsSection } from './AnalyticsSection';
import { EnquirySettingsSection } from './EnquirySettingsSection';
import { SchoolPagePreview } from './SchoolPagePreview';
import { WhatsappAPISection } from './WhatsappAPISection';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'enquiry', label: 'Enquiry List', icon: MessageSquare },
  { id: 'whatsapp-api', label: 'Whatsapp API', icon: MessageSquare },
  { id: 'enquiry-settings', label: 'Enquiry Form Settings', icon: ClipboardList },
  { id: 'school-page', label: 'School Page', icon: Globe },
  { id: 'basic-info', label: 'Basic Info', icon: Info },
  { id: 'contact', label: 'Contact Information', icon: Contact2 },
  { id: 'facilities', label: 'Facilities & Infrastructure', icon: Building },
  { id: 'gallery', label: 'Gallery & Documents', icon: Image },
  { id: 'virtualtour', label: 'Virtual Tour', icon: Video },
  { id: 'fees', label: 'Fees Structure', icon: DollarSign },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'alumini', label: 'Alumini', icon: Users },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'review', label: 'Review', icon: Star },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

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
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Selected enquiry for editing
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('');
  
  // Additional data modal state
  const [additionalDataEnquiry, setAdditionalDataEnquiry] = useState<Enquiry | null>(null);
  const [additionalAddress, setAdditionalAddress] = useState('');
  const [additionalState, setAdditionalState] = useState('');
  const [additionalAge, setAdditionalAge] = useState('');
  const [additionalGender, setAdditionalGender] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    loadSchoolData();
  }, []);

  useEffect(() => {
    // Load review stats for header rating display
    if (profile?.id) {
      loadReviewStats();
    }
  }, [profile?.id]);

  useEffect(() => {
    // Load profile when switching to profile-related sections
    if (['dashboard', 'basic-info', 'contact', 'facilities', 'gallery', 'virtualtour', 'fees', 'school-page', 'enquiry-settings', 'review'].includes(activeSection) && !profile) {
      loadSchoolProfile();
    }
  }, [activeSection, profile]);

  // Load reviews when switching to review section
  useEffect(() => {
    if (activeSection === 'review' && profile?.id) {
      loadReviews();
      loadReviewStats();
    }
  }, [activeSection, profile?.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

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
        router.push('/login');
        return;
      }

      setUser(userData);

      // Load school enquiries
      const response = await fetch('/api/schools/enquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns { enquiries: [...], metadata: {...} }
        setEnquiries(data.enquiries || data);
      }
    } catch (error) {
      console.error('Failed to load school data:', error);
      toast.error('Failed to load dashboard data');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
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
        console.log('Profile loaded from API:', data);
        // LOGGING THIS as per request
        console.log('Facility images in loaded profile:', data?.facilityImages);
        setProfile(data);
      } else if (response.status === 404) {
        // Profile doesn't exist yet, initialize with default values
        setProfile({
          name: '',
          board: '',
          city: '',
          facilityImages: {},
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async (data: any) => {
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
      console.log('Profile saved successfully:', updatedProfile);
      // Log updated profile's facility images in console
      console.log('Facility images in saved profile:', updatedProfile?.facilityImages);
      toast.success('Profile updated successfully');
      
      // Reload profile to ensure fresh data
      await loadSchoolProfile();
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

  const handleSaveAdditionalData = async (enquiryId: number) => {
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
          studentAddress: additionalAddress,
          studentState: additionalState,
          studentAge: additionalAge,
          studentGender: additionalGender,
        }),
      });

      if (!response.ok) throw new Error('Failed to save additional data');

      toast.success('Additional data saved successfully');
      setAdditionalDataEnquiry(null);
      loadSchoolData();
    } catch (error) {
      toast.error('Failed to save additional data');
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
      case 'Lost':
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
    lost: enquiries.filter(e => e.status === 'Lost').length,
    contacted: Math.floor(enquiries.length * 0.85),
  };

  // Calculate previous month stats for comparison
  const now = new Date();
  const today = new Date();
  // Fixed: Assign today for consistency
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

  const thisMonthEnquiries = enquiries.filter(e => new Date(e.createdAt) >= thisMonthStart);
  const lastMonthEnquiries = enquiries.filter(e => {
    const date = new Date(e.createdAt);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const thisMonthConverted = thisMonthEnquiries.filter(e => e.status === 'Converted').length;
  const lastMonthConverted = lastMonthEnquiries.filter(e => e.status === 'Converted').length;

  // Calculate growth percentage (avoid division by zero)
  const growthPercentage = lastMonthEnquiries.length > 0
    ? Math.round(((thisMonthEnquiries.length - lastMonthEnquiries.length) / lastMonthEnquiries.length) * 100)
    : 0;

  // Calculate conversion rate
  const conversionRate = stats.totalLeads > 0
    ? Math.round((stats.converted / stats.totalLeads) * 100)
    : 0;

  const loadReviews = async () => {
    const token = localStorage.getItem('token');
    const schoolId = profile?.id;
    if (!token || !schoolId) return;

    setReviewsLoading(true);
    try {
      const response = await fetch(
        `/api/reviews?schoolId=${schoolId}&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadReviewStats = async () => {
    const token = localStorage.getItem('token');
    const schoolId = profile?.id;
    if (!token || !schoolId) return;

    setStatsLoading(true);
    try {
      const response = await fetch(`/api/schools/${schoolId}/reviews/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const handleModerateReview = async (reviewId: number, action: 'approved' | 'rejected') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus: action }),
      });

      if (!response.ok) {
        throw new Error('Failed to moderate review');
      }

      toast.success(`Review ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
      loadReviews();
      loadReviewStats();
    } catch (error) {
      toast.error('Failed to moderate review');
    }
  };

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderEnquirySection = () => (
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
                    <SelectItem value="Lost">Lost</SelectItem>
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
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
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
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={12} className="text-cyan-600" />
                            <span className="text-muted-foreground">{enquiry.studentEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={12} className="text-cyan-600" />
                            <span className="text-muted-foreground">{enquiry.studentPhone}</span>
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEnquiry(enquiry);
                                  setEnquiryStatus(enquiry.status);
                                  setEnquiryNotes('');
                                }}
                                className="cursor-pointer"
                              >
                                <FileText className="mr-2" size={14} />
                                Prepare Notes
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setAdditionalDataEnquiry(enquiry);
                                  setAdditionalAddress((enquiry as any).studentAddress || '');
                                  setAdditionalState((enquiry as any).studentState || '');
                                  setAdditionalAge((enquiry as any).studentAge || '');
                                  setAdditionalGender((enquiry as any).studentGender || '');
                                }}
                                className="cursor-pointer"
                              >
                                <UserPlus className="mr-2" size={14} />
                                Add Additional Data
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

      {/* Edit Enquiry Modal */}
      <Dialog open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Edit className="text-white" size={20} />
              </div>
              Update Enquiry - {selectedEnquiry?.studentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
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
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold">Note History</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200">
                {(() => {
                  if (!selectedEnquiry) return null;
                  let notes = [];
                  try {
                    notes = JSON.parse(selectedEnquiry.notes || '[]');
                    if (!Array.isArray(notes)) {
                      notes = selectedEnquiry.notes ? [{ date: selectedEnquiry.createdAt, text: selectedEnquiry.notes }] : [];
                    }
                  } catch (e) {
                    notes = selectedEnquiry.notes ? [{ date: selectedEnquiry.createdAt, text: selectedEnquiry.notes }] : [];
                  }

                  if (notes.length === 0) {
                    return <p className="text-sm text-muted-foreground text-center py-4">No notes recorded yet</p>;
                  }

                  return notes.map((note: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                          {new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  )).reverse();
                })()}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold">Add New Note</Label>
              <Textarea
                id="notes"
                value={enquiryNotes}
                onChange={(e) => setEnquiryNotes(e.target.value)}
                rows={3}
                placeholder="Type a new note here..."
                className="bg-white/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => selectedEnquiry && handleUpdateEnquiry(selectedEnquiry.id)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg flex-1"
              >
                <CheckCircle2 className="mr-2" size={18} />
                Update Enquiry
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedEnquiry(null)}
                className="border-2 flex-1"
              >
                <XCircle className="mr-2" size={18} />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Data Modal */}
      <Dialog open={!!additionalDataEnquiry} onOpenChange={(open) => !open && setAdditionalDataEnquiry(null)}>
        <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <UserPlus className="text-white" size={20} />
              </div>
              Add Additional Data - {additionalDataEnquiry?.studentName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                  <MapPin size={14} className="text-cyan-600" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={additionalAddress}
                  onChange={(e) => setAdditionalAddress(e.target.value)}
                  rows={6}
                  placeholder="Enter student's address..."
                  className="bg-white/50 resize-none"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                  <Select value={additionalState} onValueChange={setAdditionalState}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                      <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                      <SelectItem value="Assam">Assam</SelectItem>
                      <SelectItem value="Bihar">Bihar</SelectItem>
                      <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                      <SelectItem value="Goa">Goa</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Kerala">Kerala</SelectItem>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Manipur">Manipur</SelectItem>
                      <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                      <SelectItem value="Mizoram">Mizoram</SelectItem>
                      <SelectItem value="Nagaland">Nagaland</SelectItem>
                      <SelectItem value="Odisha">Odisha</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Sikkim">Sikkim</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                      <SelectItem value="Tripura">Tripura</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-semibold">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={additionalAge}
                      onChange={(e) => setAdditionalAge(e.target.value)}
                      placeholder="Age"
                      className="bg-white/50"
                      min="3"
                      max="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold">Gender</Label>
                    <Select value={additionalGender} onValueChange={setAdditionalGender}>
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => additionalDataEnquiry && handleSaveAdditionalData(additionalDataEnquiry.id)}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg flex-1"
              >
                <CheckCircle2 className="mr-2" size={18} />
                Save Additional Data
              </Button>
              <Button
                variant="outline"
                onClick={() => setAdditionalDataEnquiry(null)}
                className="border-2 flex-1"
              >
                <XCircle className="mr-2" size={18} />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    );

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
          <button
            onClick={() => router.push('/')}
            className="relative flex items-center gap-3 w-full hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <h2 className="text-white text-2xl font-bold">PickMySchool</h2>
          </button>
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
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
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
                {[...Array(5)].map((_, i) => {
                  const avgRating = reviewStats?.averageRating || 0;
                  return (
                    <Star
                      key={i}
                      size={18}
                      className={
                        avgRating > 0 && i < Math.floor(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : avgRating > 0 && i < avgRating
                          ? 'fill-yellow-400/50 text-yellow-400'
                          : 'fill-gray-300 text-gray-300'
                      }
                    />
                  );
                })}
                <span className="ml-2 text-sm font-semibold text-gray-700">
                  {reviewStats ? reviewStats.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              
              {/* Notifications */}
              <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors group">
                <Bell size={20} className="text-gray-600 group-hover:text-cyan-600 transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              
              {/* User Profile with Logout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors group">
                    <UserIcon size={20} className="text-gray-600 group-hover:text-cyan-600 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-2xl border-gray-200/60 shadow-2xl rounded-xl p-2">
                  <div className="px-3 py-2 mb-2">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">School Admin</p>
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200">
                    <LogOut className="h-4 w-4 mr-2.5" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* School Profile Summary */}
              {profile && (
                <Card className="border-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50/30 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Building2 className="text-white" size={20} />
                      </div>
                      School Profile Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">No. of Students</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.totalStudents || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">No. of Teachers</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.totalTeachers || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">Board</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.board || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">School Type</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.schoolType || 'Not set'}</p>
                      </div>
                      <div className="p-4 bg-white/70 rounded-xl border border-cyan-100">
                        <p className="text-xs text-muted-foreground mb-1">Est. Year</p>
                        <p className="text-lg font-bold text-cyan-600">{profile.establishmentYear || 'Not set'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

                  {/* Stats Grid - Modern Bento Style */}
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-6">
                    {/* Total Enquiries */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Users className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <Target className="text-cyan-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">Total Enquiries</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.totalLeads}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp size={10} className={growthPercentage >= 0 ? "text-green-600" : "text-red-600"} />
                          <span className={growthPercentage >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{growthPercentage > 0 ? '+' : ''}{growthPercentage}%</span>
                        </p>
                      </CardContent>
                    </Card>

                    {/* Admission Confirmed */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <Trophy className="text-green-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">Confirmed</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.converted}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <span className="text-green-600 font-bold">{conversionRate}%</span> rate
                        </p>
                      </CardContent>
                    </Card>

                    {/* In Progress */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                            <Clock className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <AlertCircle className="text-yellow-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">In Progress</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.inProgress}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground">Pending</p>
                      </CardContent>
                    </Card>

                    {/* Lost Admission */}
                    <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                            <XCircle className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <ThumbsDown className="text-red-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">Lost</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.lost}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground">
                          {stats.totalLeads > 0 ? Math.round((stats.lost / stats.totalLeads) * 100) : 0}% loss
                        </p>
                      </CardContent>
                    </Card>

                    {/* New Enquiries */}
                    <Card className="col-span-2 xl:col-span-1 group relative overflow-hidden border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-start justify-between mb-2 sm:mb-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                            <Sparkles className="text-white sm:w-6 sm:h-6" size={20} />
                          </div>
                          <ArrowUpRight className="text-purple-600 opacity-20 group-hover:opacity-40 transition-opacity hidden sm:block" size={32} />
                        </div>
                        <p className="text-[10px] sm:text-sm font-semibold text-muted-foreground mb-1 sm:mb-2">New Enquiries</p>
                        <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-0.5 sm:mb-1">
                          {stats.newEnquiries}
                        </p>
                        <p className="text-[9px] sm:text-xs text-muted-foreground">Awaiting</p>
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
                    {/* In Progress */}
                    <div className="group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-semibold text-gray-700">In Progress</span>
                        <span className="text-2xl font-bold text-yellow-600">{stats.inProgress}</span>
                      </div>
                      <div className="relative h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl overflow-hidden shadow-lg" style={{ width: '65%' }}>
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
                      {/* Lost Admissions */}
                      <div className="group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-semibold text-gray-700">Lost Admissions</span>
                          <span className="text-2xl font-bold text-red-600">{stats.lost}</span>
                        </div>
                        <div className="relative h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl overflow-hidden shadow-lg" style={{ width: '25%' }}>
                          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                        </div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'enquiry' && renderEnquirySection()}
          
          {activeSection === 'whatsapp-api' && (
            <WhatsappAPISection />
          )}

            {activeSection === 'enquiry-settings' && (
              <EnquirySettingsSection schoolId={profile?.id || null} />
            )}

            {activeSection === 'school-page' && (
              // This is the added section with your comments
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    School Page Preview
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    View your public school page and control its visibility
                  </p>
                </div>
                <SchoolPagePreview schoolId={profile?.id || null} />
              </div>
            )}


          {activeSection === 'basic-info' && (
            <BasicInfoSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'contact' && (
            <ContactInfoSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'facilities' && (
            <FacilitiesSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'gallery' && (
            <GallerySection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'virtualtour' && (
            <VirtualTourSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'fees' && (
            <FeesSection
              profile={profile}
              profileLoading={profileLoading}
              saving={saving}
              onSave={saveProfile}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsSection
              user={user}
              onUserUpdate={handleUserUpdate}
            />
          )}

          {/* Review Section */}
          {activeSection === 'review' && (
            <div className="space-y-6">
                {/* Review Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {statsLoading ? (
                    <div className="col-span-3 text-center py-8">
                      <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading statistics...</p>
                    </div>
                  ) : reviewStats ? (
                    <>
                      <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                              <Star className="text-white" size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                              <p className="text-2xl font-bold">{reviewStats.averageRating.toFixed(1)} / 5.0</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                        <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="text-white" size={24} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                                <p className="text-2xl font-bold">{reviewStats.counts?.approved + (reviewStats.counts?.pending || 0) + (reviewStats.counts?.rejected || 0) || 0}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : null}
                  </div>
                  <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Star className="text-white" size={20} />
                          </div>
                          Review Management
                        </CardTitle>
                      </div>
                    </CardHeader>
                <CardContent>
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
                        <p className="text-xl font-semibold mb-2">No reviews found</p>
                        <p>Reviews will appear here once students submit them</p>
                      </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className="border-0 bg-white shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            {/* Review Header */}
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
                              <div className="flex flex-col items-end gap-2">
                                {getReviewStatusBadge(review.approvalStatus)}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Review Text */}
                            <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
                              {review.reviewText}
                            </p>

                            {/* Review Photos */}
                            {review.photos && review.photos.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {review.photos.map((photo: string, index: number) => (
                                  <div
                                    key={index}
                                    className="aspect-video rounded-lg overflow-hidden border-2 border-gray-100"
                                  >
                                    <img
                                      src={photo}
                                      alt={`Review photo ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Action Buttons */}
                            {review.approvalStatus === 'pending' && (
                              <div className="flex gap-3 pt-4 border-t">
                                <Button
                                  onClick={() => handleModerateReview(review.id, 'approved')}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                                >
                                  <ThumbsUp className="mr-2" size={16} />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleModerateReview(review.id, 'rejected')}
                                  variant="outline"
                                  className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                >
                                  <ThumbsDown className="mr-2" size={16} />
                                  Reject
                                </Button>
                              </div>
                            )}

                            {review.approvalStatus === 'approved' && (
                              <div className="flex items-center gap-2 pt-4 border-t">
                                <CheckCircle2 size={16} className="text-green-600" />
                                <span className="text-sm text-green-600 font-semibold">
                                  This review is visible on your school's public page
                                </span>
                              </div>
                            )}

                            {review.approvalStatus === 'rejected' && (
                              <div className="flex items-center gap-2 pt-4 border-t">
                                <XCircle size={16} className="text-red-600" />
                                <span className="text-sm text-red-600 font-semibold">
                                  This review has been rejected and is not visible publicly
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Section */}
          {activeSection === 'results' && (
            <ResultsSection schoolId={profile?.id || 0} />
          )}

          {/* Alumni Section */}
          {activeSection === 'alumini' && (
            <AlumniSection schoolId={profile?.id || 0} />
          )}

          {/* News Section */}
          {activeSection === 'news' && (
            <NewsSection schoolId={profile?.id || 0} />
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <AnalyticsSection schoolId={profile?.id || 0} />
          )}

          {/* Other sections - Coming Soon */}
          {!['dashboard', 'enquiry', 'whatsapp-api', 'enquiry-settings', 'basic-info', 'contact', 'facilities', 'gallery', 'virtualtour', 'fees', 'settings', 'review', 'results', 'alumini', 'news', 'analytics', 'school-page'].includes(activeSection) && (
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
      </div>
    );
  }
