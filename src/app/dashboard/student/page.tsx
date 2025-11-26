'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookMarked, 
  MessageSquare, 
  ClipboardList, 
  User, 
  Heart, 
  TrendingUp, 
  Search,
  Bell,
  Settings,
  LogOut,
  Home,
  School,
  FileText,
  Star,
  Calendar,
  Target,
  BarChart3,
  ChevronRight,
  Plus
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getMe, getMyEnquiries, getSchools, type User, type Enquiry, type School } from '@/lib/api';
import { toast } from 'sonner';
import { AIChat } from '@/components/AIChat';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [savedSchools, setSavedSchools] = useState<School[]>([]);
  const [recommendedSchools, setRecommendedSchools] = useState<School[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeNav, setActiveNav] = useState('dashboard');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    class: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access dashboard');
      router.push('/login');
      return;
    }

    try {
      const { user: userData } = await getMe(token);
      
      if (userData.role !== 'student') {
        toast.error('Access denied. Students only.');
        router.push('/');
        return;
      }

      setUser(userData);
      setProfileForm({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        city: userData.city || '',
        class: userData.class || '',
      });

      // Load enquiries
      const enquiriesData = await getMyEnquiries(token);
      setEnquiries(enquiriesData);

      // Load saved schools
      if (userData.savedSchools && userData.savedSchools.length > 0) {
        const schoolsData = await getSchools({ limit: 100 });
        const saved = schoolsData.filter(s => userData.savedSchools.includes(s.id));
        setSavedSchools(saved);
      }

      // Load recommended schools (based on user's city and preferences)
      const recommended = await getSchools({
        city: userData.city || undefined,
        limit: 4,
      });
      setRecommendedSchools(recommended);
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load dashboard data');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Profile update feature coming soon!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Converted':
        return 'bg-green-500';
      case 'Closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'saved', label: 'Saved Schools', icon: Heart },
    { id: 'enquiries', label: 'My Enquiries', icon: ClipboardList },
    { id: 'recommended', label: 'Recommended', icon: Star },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
        <div className="flex">
          <div className="w-64 h-screen bg-gradient-to-b from-cyan-600 to-blue-700 animate-pulse" />
          <div className="flex-1 p-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-gradient-to-b from-cyan-600 to-blue-700 text-white shadow-2xl fixed left-0 top-0 z-50">
          {/* Logo */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <School className="text-white" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg">PickMySchool</h2>
                <p className="text-xs text-cyan-100">Student Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-400 text-white shadow-lg scale-105'
                      : 'text-cyan-50 hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-6 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-cyan-50 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {activeNav === 'dashboard' && 'Dashboard Overview'}
                {activeNav === 'saved' && 'Saved Schools'}
                {activeNav === 'enquiries' && 'My Enquiries'}
                {activeNav === 'recommended' && 'Recommended Schools'}
                {activeNav === 'profile' && 'My Profile'}
                {activeNav === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-600">Welcome back, {user.name}! 👋</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow">
                <Bell size={20} className="text-gray-700" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard View */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Saved Schools */}
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <BookMarked className="text-white" size={24} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{savedSchools.length}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Saved Schools</p>
                    <p className="text-3xl font-bold text-gray-900">{savedSchools.length}</p>
                  </div>
                </div>

                {/* Total Enquiries */}
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                        <ClipboardList className="text-white" size={24} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">{enquiries.length}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Enquiries</p>
                    <p className="text-3xl font-bold text-gray-900">{enquiries.length}</p>
                  </div>
                </div>

                {/* In Progress */}
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">
                          {enquiries.filter(e => e.status === 'In Progress').length}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {enquiries.filter(e => e.status === 'In Progress').length}
                    </p>
                  </div>
                </div>

                {/* Chat History */}
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full -mr-16 -mt-16" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="text-white" size={24} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                        <span className="text-cyan-600 font-bold text-sm">0</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Chat History</p>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Enquiries */}
                <Card className="shadow-lg border-0 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <FileText className="text-white" size={20} />
                        </div>
                        <CardTitle>Recent Enquiries</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActiveNav('enquiries')}
                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                      >
                        View All <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {enquiries.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <ClipboardList className="opacity-30" size={32} />
                        </div>
                        <p className="font-medium mb-2">No enquiries yet</p>
                        <p className="text-sm mb-4">Start exploring schools</p>
                        <Button
                          onClick={() => router.push('/schools')}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                          <Search className="mr-2" size={16} />
                          Browse Schools
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enquiries.slice(0, 3).map((enquiry) => (
                          <div key={enquiry.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-1">School ID: {enquiry.schoolId}</p>
                                <p className="text-sm text-gray-600">
                                  {enquiry.studentName} • {enquiry.studentClass}
                                </p>
                              </div>
                              <Badge className={`${getStatusColor(enquiry.status)} text-white border-0`}>
                                {enquiry.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(enquiry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recommended Schools */}
                <Card className="shadow-lg border-0 rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Star className="text-white" size={20} />
                        </div>
                        <CardTitle>Recommended for You</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push('/schools')}
                        className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                      >
                        View All <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recommendedSchools.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="opacity-30" size={32} />
                        </div>
                        <p className="font-medium">No recommendations yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recommendedSchools.map((school) => (
                          <div
                            key={school.id}
                            className="p-4 bg-gradient-to-r from-purple-50 to-pink-50/50 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => router.push(`/schools/${school.id}`)}
                          >
                            <div className="flex items-start gap-3">
                              {school.logo && (
                                <img
                                  src={school.logo}
                                  alt={school.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors">
                                  {school.name}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  {school.city} • {school.board}
                                </p>
                                {school.feesMin && school.feesMax && (
                                  <p className="text-sm font-semibold text-cyan-600">
                                    ₹{(school.feesMin / 1000).toFixed(0)}K - ₹{(school.feesMax / 1000).toFixed(0)}K/year
                                  </p>
                                )}
                              </div>
                              <ChevronRight size={20} className="text-gray-400 group-hover:text-cyan-600 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Find Your Perfect School</h3>
                      <p className="text-cyan-100 mb-4">Browse thousands of schools and find the best match for your needs</p>
                      <Button 
                        onClick={() => router.push('/schools')}
                        className="bg-white text-cyan-600 hover:bg-gray-100"
                      >
                        <Search className="mr-2" size={18} />
                        Browse Schools
                      </Button>
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <School size={64} className="text-white/80" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Saved Schools View */}
          {activeNav === 'saved' && (
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Saved Schools</CardTitle>
                  <Button 
                    onClick={() => router.push('/schools')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Plus className="mr-2" size={18} />
                    Add More
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {savedSchools.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <Heart className="opacity-30" size={48} />
                    </div>
                    <p className="text-xl font-semibold mb-2">No saved schools yet</p>
                    <p className="mb-6 text-gray-600">Start saving schools to compare them later</p>
                    <Button 
                      onClick={() => router.push('/schools')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      <Search className="mr-2" size={18} />
                      Browse Schools
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedSchools.map((school) => (
                      <SchoolCard key={school.id} school={school} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enquiries View */}
          {activeNav === 'enquiries' && (
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">My Enquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {enquiries.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <ClipboardList className="opacity-30" size={48} />
                    </div>
                    <p className="text-xl font-semibold mb-2">No enquiries yet</p>
                    <p className="mb-6 text-gray-600">Submit enquiries to schools you're interested in</p>
                    <Button 
                      onClick={() => router.push('/schools')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      <Search className="mr-2" size={18} />
                      Browse Schools
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                      <Card key={enquiry.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-bold text-lg">School ID: {enquiry.schoolId}</h3>
                                <Badge className={`${getStatusColor(enquiry.status)} text-white border-0`}>
                                  {enquiry.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex items-center gap-2">
                                  <User size={14} />
                                  <span><strong>Student:</strong> {enquiry.studentName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BookMarked size={14} />
                                  <span><strong>Class:</strong> {enquiry.studentClass}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} />
                                  <span><strong>Submitted:</strong> {new Date(enquiry.createdAt).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/schools/${enquiry.schoolId}`)}
                              className="mt-4 md:mt-0"
                            >
                              View School
                            </Button>
                          </div>
                          {enquiry.message && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                              <p className="text-sm font-semibold mb-1 text-blue-900">Your Message:</p>
                              <p className="text-sm text-blue-800">{enquiry.message}</p>
                            </div>
                          )}
                          {enquiry.notes && (
                            <div className="mt-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                              <p className="text-sm font-semibold mb-1 text-green-900">School Response:</p>
                              <p className="text-sm text-green-800">{enquiry.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recommended View */}
          {activeNav === 'recommended' && (
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Recommended Schools</CardTitle>
                <p className="text-gray-600">Based on your preferences and search history</p>
              </CardHeader>
              <CardContent>
                {recommendedSchools.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <Star className="opacity-30" size={48} />
                    </div>
                    <p className="text-xl font-semibold mb-2">No recommendations yet</p>
                    <p className="mb-6 text-gray-600">Browse schools to get personalized recommendations</p>
                    <Button 
                      onClick={() => router.push('/schools')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      <Search className="mr-2" size={18} />
                      Browse Schools
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedSchools.map((school) => (
                      <SchoolCard key={school.id} school={school} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profile View */}
          {activeNav === 'profile' && (
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <p className="text-gray-600">Manage your personal information</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <button 
                        type="button"
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-cyan-600 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        disabled
                        className="mt-2 h-11 bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-gray-700 font-medium">City</Label>
                      <Input
                        id="city"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="class" className="text-gray-700 font-medium">Class/Grade</Label>
                      <Input
                        id="class"
                        value={profileForm.class}
                        onChange={(e) => setProfileForm({ ...profileForm, class: e.target.value })}
                        placeholder="e.g., 6th Grade"
                        className="mt-2 h-11"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      Update Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveNav('dashboard')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Settings View */}
          {activeNav === 'settings' && (
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Settings</CardTitle>
                <p className="text-gray-600">Manage your account preferences</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <Settings className="opacity-30" size={48} />
                  </div>
                  <p className="text-xl font-semibold mb-2">Settings Coming Soon</p>
                  <p className="text-gray-600">Account settings and preferences will be available here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <AIChat />
    </div>
  );
}