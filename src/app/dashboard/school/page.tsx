'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, TrendingUp, Clock, Eye, Mail, Phone, Calendar,
  Filter, Search, Edit, MoreVertical, Plus, Building2,
  LayoutDashboard, MessageSquare, Info, Contact2, Building,
  Image, DollarSign, Trophy, GraduationCap, Newspaper,
  Star, BarChart3, Bell, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function SchoolDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected enquiry for editing
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('');

  useEffect(() => {
    loadSchoolData();
  }, []);

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
      <div className="min-h-screen flex">
        <div className="w-80 bg-gradient-to-b from-purple-600 to-purple-800 p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-white/20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80 bg-gradient-to-b from-purple-600 to-purple-800 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-white text-2xl font-bold">PickMySchool</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-cyan-400 text-gray-900 font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              Welcome ! {user.name || 'School Name'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Rating Stars */}
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={28}
                  className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}
                />
              ))}
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell size={24} className="text-yellow-500" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
            </button>
            
            {/* User Profile */}
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <User size={24} className="text-cyan-500" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Total Enquiries */}
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Total Enquiries</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">{String(stats.totalLeads).padStart(2, '0')}</span>
                        </div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                            <path d="M0 15 L30 0 L30 30 Z" fill="#22D3EE" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Admission Confirmed */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Admission Confirmed</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">{String(stats.converted).padStart(2, '0')}</span>
                        </div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                            <path d="M0 15 L30 0 L30 30 Z" fill="#22D3EE" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Conversion Rate */}
                <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Conversion Rate</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {stats.totalLeads > 0 ? String(Math.round((stats.converted / stats.totalLeads) * 100)).padStart(2, '0') : '00'}
                          </span>
                        </div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                            <path d="M0 15 L30 0 L30 30 Z" fill="#22D3EE" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Follow Up */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Pending Follow Up</h3>
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">{String(stats.newEnquiries).padStart(2, '0')}</span>
                        </div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                            <path d="M0 15 L30 0 L30 30 Z" fill="#22D3EE" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Funnel */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      {/* Funnel visualization */}
                      <div className="space-y-0">
                        {/* Enquiries */}
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-semibold w-40">Enquiries</span>
                          <div className="flex-1 relative">
                            <div
                              className="h-20 bg-gradient-to-r from-cyan-300 to-cyan-400"
                              style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
                            />
                          </div>
                          <span className="text-2xl font-bold w-20 text-right">{stats.totalLeads}</span>
                        </div>

                        {/* Contacted */}
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-semibold w-40">Contacted</span>
                          <div className="flex-1 relative">
                            <div
                              className="h-20 bg-gradient-to-r from-cyan-400 to-cyan-500"
                              style={{ 
                                clipPath: 'polygon(5% 0, 95% 0, 90% 100%, 10% 100%)',
                                width: '85%',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                              }}
                            />
                          </div>
                          <span className="text-2xl font-bold w-20 text-right">{stats.contacted}</span>
                        </div>

                        {/* Applications */}
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-lg font-semibold w-40">Applications</span>
                          <div className="flex-1 relative">
                            <div
                              className="h-20 bg-gradient-to-r from-cyan-500 to-cyan-600"
                              style={{ 
                                clipPath: 'polygon(10% 0, 90% 0, 85% 100%, 15% 100%)',
                                width: '70%',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                              }}
                            />
                          </div>
                          <span className="text-2xl font-bold w-20 text-right">{stats.applications}</span>
                        </div>

                        {/* Confirmed Adm */}
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-semibold w-40">Confirmed Adm</span>
                          <div className="flex-1 relative">
                            <div
                              className="h-20 bg-gradient-to-r from-cyan-600 to-cyan-700"
                              style={{ 
                                clipPath: 'polygon(15% 0, 85% 0, 80% 100%, 20% 100%)',
                                width: '55%',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                              }}
                            />
                          </div>
                          <span className="text-2xl font-bold w-20 text-right">{stats.converted}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'enquiry' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Leads & Enquiries</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                          placeholder="Search by name, email, phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40">
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
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="mx-auto mb-4 opacity-50" size={64} />
                      <p className="text-lg mb-2">No enquiries found</p>
                      <p>Enquiries from parents will appear here</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEnquiries.map((enquiry) => (
                            <TableRow key={enquiry.id}>
                              <TableCell className="font-medium">
                                {enquiry.studentName}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Mail size={12} />
                                    {enquiry.studentEmail}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone size={12} />
                                    {enquiry.studentPhone}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{enquiry.studentClass}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(enquiry.status)} text-white`}>
                                  {enquiry.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(enquiry.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedEnquiry(enquiry);
                                        setEnquiryStatus(enquiry.status);
                                        setEnquiryNotes(enquiry.notes || '');
                                      }}
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

              {/* Edit Enquiry Modal */}
              {selectedEnquiry && (
                <Card>
                  <CardHeader>
                    <CardTitle>Update Enquiry - {selectedEnquiry.studentName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={enquiryStatus} onValueChange={setEnquiryStatus}>
                        <SelectTrigger>
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

                    <div>
                      <Label htmlFor="notes">Notes / Response</Label>
                      <Textarea
                        id="notes"
                        value={enquiryNotes}
                        onChange={(e) => setEnquiryNotes(e.target.value)}
                        rows={4}
                        placeholder="Add notes or response for the parent..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateEnquiry(selectedEnquiry.id)}
                        style={{ backgroundColor: '#04d3d3', color: 'white' }}
                      >
                        Update Enquiry
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedEnquiry(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Other sections - Coming Soon */}
          {!['dashboard', 'enquiry'].includes(activeSection) && (
            <Card>
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <Building2 className="mx-auto mb-4 opacity-50" size={64} />
                  <p className="text-xl mb-2 font-semibold capitalize">{activeSection.replace('-', ' ')}</p>
                  <p>This section is coming soon</p>
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