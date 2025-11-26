'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Star, Search, LogOut, Sparkles, Building2, MapPin, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import type { School } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [spotlightSchool, setSpotlightSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterBoard, setFilterBoard] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch current spotlight school
      const spotlightRes = await fetch('/api/admin/settings/spotlight', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (spotlightRes.ok) {
        const spotlightData = await spotlightRes.json();
        if (spotlightData.settings?.school) {
          setSpotlightSchool(spotlightData.settings.school);
        }
      }

      // Fetch all schools
      const schoolsRes = await fetch('/api/admin/schools?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json();
        setSchools(schoolsData);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetSpotlight = async (schoolId: number) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/settings/spotlight', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schoolId }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to update spotlight school');
        return;
      }

      toast.success('Spotlight school updated successfully!');
      loadData();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !filterCity || school.city === filterCity;
    const matchesBoard = !filterBoard || school.board === filterBoard;
    return matchesSearch && matchesCity && matchesBoard;
  });

  const cities = Array.from(new Set(schools.map(s => s.city))).sort();
  const boards = Array.from(new Set(schools.map(s => s.board))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ backgroundColor: '#04d3d3', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Super Admin Dashboard
                  <Sparkles className="w-5 h-5" style={{ color: '#04d3d3' }} />
                </h1>
                <p className="text-sm text-gray-300">Manage Spotlight Featured School</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="mr-2 w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Current Spotlight School */}
        {spotlightSchool && (
          <Card className="mb-8 backdrop-blur-xl bg-white/10 border-white/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600/50 to-cyan-600/50 border-b border-white/10">
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                Current Spotlight School
              </CardTitle>
              <CardDescription className="text-gray-200">
                This school appears in the 25% featured section on homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {spotlightSchool.bannerImage ? (
                    <img
                      src={spotlightSchool.bannerImage}
                      alt={spotlightSchool.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{spotlightSchool.name}</h3>
                  <div className="space-y-2 text-gray-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span>{spotlightSchool.city}, {spotlightSchool.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <span>{spotlightSchool.board} • {spotlightSchool.schoolType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>{spotlightSchool.rating} / 5 ({spotlightSchool.reviewCount} reviews)</span>
                    </div>
                    {spotlightSchool.feesMin && spotlightSchool.feesMax && (
                      <p className="text-sm">
                        <span className="font-semibold text-cyan-400">Fees:</span> ₹{spotlightSchool.feesMin.toLocaleString()} - ₹{spotlightSchool.feesMax.toLocaleString()}/year
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schools List */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Select Spotlight School</CardTitle>
            <CardDescription className="text-gray-200">
              Choose a school to feature in the homepage spotlight section
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">City</label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Board</label>
                <Select value={filterBoard} onValueChange={setFilterBoard}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue placeholder="All Boards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Boards</SelectItem>
                    {boards.map(board => (
                      <SelectItem key={board} value={board}>{board}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Schools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredSchools.map((school) => (
                <Card
                  key={school.id}
                  className={`backdrop-blur-xl bg-white/5 border-white/20 hover:bg-white/10 transition-all cursor-pointer ${
                    spotlightSchool?.id === school.id ? 'ring-2 ring-cyan-400' : ''
                  }`}
                  onClick={() => handleSetSpotlight(school.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {school.logo || school.bannerImage ? (
                          <img
                            src={school.logo || school.bannerImage || ''}
                            alt={school.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm mb-1 truncate">
                          {school.name}
                        </h4>
                        <p className="text-xs text-gray-300 mb-1">{school.city}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-300">{school.rating}</span>
                        </div>
                      </div>
                      {spotlightSchool?.id === school.id && (
                        <Star className="w-5 h-5 text-cyan-400 fill-cyan-400 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No schools found matching your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
