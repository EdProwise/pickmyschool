'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookMarked, MessageSquare, ClipboardList, User, Heart, TrendingUp, Search } from 'lucide-react';
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
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your school search and enquiries from one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Saved Schools</p>
                  <p className="text-3xl font-bold">{savedSchools.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookMarked className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Enquiries</p>
                  <p className="text-3xl font-bold">{enquiries.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <ClipboardList className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-3xl font-bold">
                    {enquiries.filter(e => e.status === 'In Progress').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="text-yellow-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Chat History</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#04d3d320' }}>
                  <MessageSquare style={{ color: '#04d3d3' }} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="saved">Saved Schools</TabsTrigger>
            <TabsTrigger value="enquiries">My Enquiries</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Enquiries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Enquiries</span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('enquiries')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enquiries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="mx-auto mb-3 opacity-50" size={48} />
                      <p>No enquiries yet</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push('/schools')}
                      >
                        <Search className="mr-2" size={16} />
                        Browse Schools
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enquiries.slice(0, 3).map((enquiry) => (
                        <div key={enquiry.id} className="p-4 border rounded-lg">
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
                          <p className="text-sm text-muted-foreground">
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Schools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recommended for You</span>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/schools')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendedSchools.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="mx-auto mb-3 opacity-50" size={48} />
                      <p>No recommendations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendedSchools.map((school) => (
                        <div
                          key={school.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/schools/${school.id}`)}
                        >
                          <div className="flex items-start gap-3">
                            {school.logo && (
                              <img
                                src={school.logo}
                                alt={school.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold mb-1">{school.name}</p>
                              <p className="text-sm text-muted-foreground mb-2">
                                {school.city} • {school.board}
                              </p>
                              {school.feesMin && school.feesMax && (
                                <p className="text-sm font-medium" style={{ color: '#04d3d3' }}>
                                  ₹{(school.feesMin / 1000).toFixed(0)}K - ₹{(school.feesMax / 1000).toFixed(0)}K/year
                                </p>
                              )}
                            </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Saved Schools</CardTitle>
              </CardHeader>
              <CardContent>
                {savedSchools.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="mx-auto mb-4 opacity-50" size={64} />
                    <p className="text-lg mb-2">No saved schools yet</p>
                    <p className="mb-4">Start saving schools to compare them later</p>
                    <Button onClick={() => router.push('/schools')}>
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
            <Card>
              <CardHeader>
                <CardTitle>My Enquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {enquiries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="mx-auto mb-4 opacity-50" size={64} />
                    <p className="text-lg mb-2">No enquiries yet</p>
                    <p className="mb-4">Submit enquiries to schools you're interested in</p>
                    <Button onClick={() => router.push('/schools')}>
                      Browse Schools
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                      <Card key={enquiry.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">School ID: {enquiry.schoolId}</h3>
                                <Badge className={`${getStatusColor(enquiry.status)} text-white`}>
                                  {enquiry.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p><strong>Student:</strong> {enquiry.studentName}</p>
                                <p><strong>Class:</strong> {enquiry.studentClass}</p>
                                <p><strong>Contact:</strong> {enquiry.studentEmail} • {enquiry.studentPhone}</p>
                                <p><strong>Submitted:</strong> {new Date(enquiry.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/schools/${enquiry.schoolId}`)}
                            >
                              View School
                            </Button>
                          </div>
                          {enquiry.message && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Your Message:</p>
                              <p className="text-sm text-muted-foreground">{enquiry.message}</p>
                            </div>
                          )}
                          {enquiry.notes && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium mb-1">School Response:</p>
                              <p className="text-sm text-muted-foreground">{enquiry.notes}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="class">Class/Grade</Label>
                      <Input
                        id="class"
                        value={profileForm.class}
                        onChange={(e) => setProfileForm({ ...profileForm, class: e.target.value })}
                        placeholder="e.g., 6th Grade"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      style={{ backgroundColor: '#04d3d3', color: 'white' }}
                    >
                      Update Profile
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/')}
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