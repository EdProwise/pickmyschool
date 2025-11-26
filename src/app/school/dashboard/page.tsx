'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, TrendingUp, Clock, Eye, Mail, Phone, Calendar,
  Filter, Search, Edit, MoreVertical, Plus, Building2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

export default function SchoolDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
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
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            School CRM Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your leads, enquiries, and school profile
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">New Enquiries</p>
                  <p className="text-3xl font-bold">{stats.newEnquiries}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#04d3d320' }}>
                  <Mail style={{ color: '#04d3d3' }} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Converted</p>
                  <p className="text-3xl font-bold">{stats.converted}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads & Enquiries</TabsTrigger>
            <TabsTrigger value="profile">School Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Enquiries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Enquiries</span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('leads')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enquiries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="mx-auto mb-3 opacity-50" size={48} />
                      <p>No enquiries yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enquiries.slice(0, 5).map((enquiry) => (
                        <div key={enquiry.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{enquiry.studentName}</p>
                              <p className="text-sm text-muted-foreground">
                                {enquiry.studentClass} • {enquiry.studentPhone}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(enquiry.status)} text-white`}>
                              {enquiry.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(enquiry.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('leads')}
                  >
                    <Mail className="mr-2" size={18} />
                    View All Enquiries
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('profile')}
                  >
                    <Edit className="mr-2" size={18} />
                    Update School Profile
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    style={{ backgroundColor: '#04d3d310', borderColor: '#04d3d3' }}
                    onClick={() => router.push(`/schools/${user.schoolId}`)}
                  >
                    <Eye className="mr-2" size={18} />
                    View Public Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads & Enquiries Tab */}
          <TabsContent value="leads">
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
              <Card className="mt-6">
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
          </TabsContent>

          {/* School Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>School Profile Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="mx-auto mb-4 opacity-50" size={64} />
                  <p className="text-lg mb-2">Profile Editor Coming Soon</p>
                  <p className="mb-4">Update your school details, photos, fees, and facilities</p>
                  {user.schoolId && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/schools/${user.schoolId}`)}
                    >
                      <Eye className="mr-2" size={16} />
                      View Current Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enquiry Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Enquiry Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium">Total Enquiries</span>
                      <span className="text-2xl font-bold">{stats.totalLeads}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <span className="font-medium">Conversion Rate</span>
                      <span className="text-2xl font-bold">
                        {stats.totalLeads > 0 
                          ? ((stats.converted / stats.totalLeads) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Response Rate</span>
                      <span className="text-2xl font-bold">
                        {stats.totalLeads > 0 
                          ? (((stats.inProgress + stats.converted + stats.newEnquiries) / stats.totalLeads) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'New', count: stats.newEnquiries, color: 'bg-blue-500' },
                      { label: 'In Progress', count: stats.inProgress, color: 'bg-yellow-500' },
                      { label: 'Converted', count: stats.converted, color: 'bg-green-500' },
                      { label: 'Closed', count: stats.totalLeads - stats.newEnquiries - stats.inProgress - stats.converted, color: 'bg-gray-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.count} ({stats.totalLeads > 0 ? ((item.count / stats.totalLeads) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all`}
                            style={{
                              width: `${stats.totalLeads > 0 ? (item.count / stats.totalLeads) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      
      <AIChat />
    </div>
  );
}