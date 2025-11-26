'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookMarked, MessageSquare, ClipboardList, User, Heart, TrendingUp, Search, Sparkles, ArrowRight, Clock, CheckCircle2, Target, Zap } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse">
            <div className="h-8 bg-white/50 rounded-xl w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/50 rounded-xl backdrop-blur-sm" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const inProgressCount = enquiries.filter(e => e.status === 'In Progress').length;
  const conversionRate = enquiries.length > 0 
    ? Math.round((enquiries.filter(e => e.status === 'Converted').length / enquiries.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Welcome Header with Glassmorphic Card */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl" />
          <Card className="relative border-0 bg-white/70 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome back, {user.name}!
                      </h1>
                      <p className="text-lg text-muted-foreground mt-1">
                        Your school search journey continues here
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push('/schools')}
                >
                  <Search className="mr-2" size={18} />
                  Explore Schools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Stats Grid - Bento Box Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Saved Schools Card */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <BookMarked size={28} />
                </div>
                <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <p className="text-white/80 text-sm mb-2 font-medium">Saved Schools</p>
              <p className="text-5xl font-bold mb-1">{savedSchools.length}</p>
              <p className="text-white/70 text-xs">Ready to compare</p>
            </CardContent>
          </Card>

          {/* Total Enquiries Card */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ClipboardList size={28} />
                </div>
                <Target className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <p className="text-white/80 text-sm mb-2 font-medium">Total Enquiries</p>
              <p className="text-5xl font-bold mb-1">{enquiries.length}</p>
              <p className="text-white/70 text-xs">Applications sent</p>
            </CardContent>
          </Card>

          {/* In Progress Card */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Clock size={28} />
                </div>
                <Zap className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <p className="text-white/80 text-sm mb-2 font-medium">In Progress</p>
              <p className="text-5xl font-bold mb-1">{inProgressCount}</p>
              <p className="text-white/70 text-xs">Active applications</p>
            </CardContent>
          </Card>

          {/* Conversion Rate Card */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <TrendingUp className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <p className="text-white/80 text-sm mb-2 font-medium">Success Rate</p>
              <p className="text-5xl font-bold mb-1">{conversionRate}%</p>
              <p className="text-white/70 text-xs">Conversion ratio</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs with Modern Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 shadow-lg border-0">
            <TabsList className="w-full bg-transparent grid grid-cols-4 gap-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="saved"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                Saved Schools
              </TabsTrigger>
              <TabsTrigger 
                value="enquiries"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                My Enquiries
              </TabsTrigger>
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                My Profile
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Enquiries */}
              <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <ClipboardList className="text-white" size={20} />
                      </div>
                      Recent Enquiries
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab('enquiries')}
                      className="hover:bg-cyan-50"
                    >
                      View All
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enquiries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="opacity-50" size={36} />
                      </div>
                      <p className="font-semibold mb-2">No enquiries yet</p>
                      <p className="text-sm mb-4">Start exploring schools and send your first enquiry</p>
                      <Button
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                        onClick={() => router.push('/schools')}
                      >
                        <Search className="mr-2" size={16} />
                        Browse Schools
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {enquiries.slice(0, 3).map((enquiry) => (
                        <div 
                          key={enquiry.id} 
                          className="p-4 border border-gray-100 rounded-xl bg-white/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">School ID: {enquiry.schoolId}</p>
                              <p className="text-sm text-muted-foreground">
                                For: {enquiry.studentName} - {enquiry.studentClass}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(enquiry.status)} text-white`}>
                              {enquiry.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Schools */}
              <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Sparkles className="text-white" size={20} />
                      </div>
                      Recommended for You
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push('/schools')}
                      className="hover:bg-purple-50"
                    >
                      View All
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendedSchools.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="opacity-50" size={36} />
                      </div>
                      <p className="font-semibold">No recommendations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendedSchools.map((school) => (
                        <div
                          key={school.id}
                          className="p-4 border border-gray-100 rounded-xl bg-white/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                          onClick={() => router.push(`/schools/${school.id}`)}
                        >
                          <div className="flex items-start gap-3">
                            {school.logo && (
                              <img
                                src={school.logo}
                                alt={school.name}
                                className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold mb-1 group-hover:text-cyan-600 transition-colors">{school.name}</p>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                <span>{school.city}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-400" />
                                <span>{school.board}</span>
                              </p>
                              {school.feesMin && school.feesMax && (
                                <p className="text-sm font-semibold text-cyan-600">
                                  ₹{(school.feesMin / 1000).toFixed(0)}K - ₹{(school.feesMax / 1000).toFixed(0)}K/year
                                </p>
                              )}
                            </div>
                            <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600" size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Saved Schools Tab */}
          <TabsContent value="saved">
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Heart className="text-white" size={20} />
                  </div>
                  Saved Schools
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedSchools.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center mx-auto mb-6">
                      <Heart className="opacity-50" size={48} />
                    </div>
                    <p className="text-xl font-semibold mb-2">No saved schools yet</p>
                    <p className="mb-6">Start saving schools to compare them later</p>
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      onClick={() => router.push('/schools')}
                    >
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
          </TabsContent>

          {/* Enquiries Tab */}
          <TabsContent value="enquiries">
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <ClipboardList className="text-white" size={20} />
                  </div>
                  My Enquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enquiries.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                      <ClipboardList className="opacity-50" size={48} />
                    </div>
                    <p className="text-xl font-semibold mb-2">No enquiries yet</p>
                    <p className="mb-6">Submit enquiries to schools you're interested in</p>
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      onClick={() => router.push('/schools')}
                    >
                      Browse Schools
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                      <Card key={enquiry.id} className="border-0 bg-white/50 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-semibold text-lg">School ID: {enquiry.schoolId}</h3>
                                <Badge className={`${getStatusColor(enquiry.status)} text-white`}>
                                  {enquiry.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-2 bg-gray-50 rounded-lg p-4">
                                <p className="flex items-center gap-2">
                                  <User size={14} />
                                  <strong>Student:</strong> {enquiry.studentName}
                                </p>
                                <p><strong>Class:</strong> {enquiry.studentClass}</p>
                                <p><strong>Contact:</strong> {enquiry.studentEmail} • {enquiry.studentPhone}</p>
                                <p className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <strong>Submitted:</strong> {new Date(enquiry.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              className="mt-4 md:mt-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                              size="sm"
                              onClick={() => router.push(`/schools/${enquiry.schoolId}`)}
                            >
                              View School
                              <ArrowRight className="ml-2" size={16} />
                            </Button>
                          </div>
                          {enquiry.message && (
                            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                              <p className="text-sm font-semibold mb-2 text-blue-900">Your Message:</p>
                              <p className="text-sm text-blue-800">{enquiry.message}</p>
                            </div>
                          )}
                          {enquiry.notes && (
                            <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                              <p className="text-sm font-semibold mb-2 text-green-900 flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                School Response:
                              </p>
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
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        className="mt-2 h-11 bg-white/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        disabled
                        className="mt-2 h-11 bg-gray-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="mt-2 h-11 bg-white/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                      <Input
                        id="city"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="mt-2 h-11 bg-white/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="class" className="text-sm font-semibold">Class/Grade</Label>
                      <Input
                        id="class"
                        value={profileForm.class}
                        onChange={(e) => setProfileForm({ ...profileForm, class: e.target.value })}
                        placeholder="e.g., 6th Grade"
                        className="mt-2 h-11 bg-white/50"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg"
                    >
                      Update Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="border-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      
      <AIChat />
    </div>
  );
}