'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Building2, MapPin, Star, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import type { School } from '@/lib/api';

export default function SchoolsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterSchoolType, setFilterSchoolType] = useState('all');
  const [availableCities, setAvailableCities] = useState<{ name: string; count: number }[]>([]);
  const [availableStates, setAvailableStates] = useState<{ name: string; count: number }[]>([]);
  const [availableSchoolTypes, setAvailableSchoolTypes] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadSchools();
    loadFilters();
  }, []);

  const loadFilters = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/schools/filters', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCities(data.cities);
        setAvailableStates(data.states);
        setAvailableSchoolTypes(data.schoolTypes);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const loadSchools = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/schools?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSchools(data);
      } else {
        toast.error('Failed to load schools');
      }
    } catch (error) {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (schoolId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/featured`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadSchools(); // Refresh the list
      } else {
        toast.error('Failed to toggle featured status');
      }
    } catch (error) {
      toast.error('Failed to toggle featured status');
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !filterCity || filterCity === 'all' || school.city === filterCity;
    const matchesState = !filterState || filterState === 'all' || school.state === filterState;
    const matchesType =
      !filterSchoolType || filterSchoolType === 'all' || school.schoolType === filterSchoolType;
    return matchesSearch && matchesCity && matchesState && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Schools</h1>
        <p className="text-slate-600">Browse and manage all schools in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Schools</p>
                <p className="text-2xl font-bold text-slate-800">{schools.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Cities</p>
                  <p className="text-2xl font-bold text-slate-800">{availableCities.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">States</p>
                  <p className="text-2xl font-bold text-slate-800">{availableStates.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Filtered Results</p>
                <p className="text-2xl font-bold text-slate-800">{filteredSchools.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <Search className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {availableCities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name} ({city.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {availableStates.map((state) => (
                      <SelectItem key={state.name} value={state.name}>
                        {state.name} ({state.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">School Type</label>
                <Select value={filterSchoolType} onValueChange={setFilterSchoolType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableSchoolTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name}>
                        {type.name} ({type.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2">
        {filteredSchools.map((school) => (
          <Card
            key={school.id}
            className="border-0 shadow-md hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {school.logo || school.bannerImage ? (
                    <img
                      src={school.logo || school.bannerImage || ''}
                      alt={school.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="font-bold text-slate-800 text-lg truncate cursor-pointer hover:text-cyan-600"
                      onClick={() => window.open(`/schools/${school.id}`, '_blank')}
                    >
                      {school.name}
                    </h3>
                    <Button
                      size="sm"
                      variant={school.featured ? 'default' : 'outline'}
                      onClick={(e) => toggleFeatured(school.id, e)}
                      className={`ml-2 flex-shrink-0 h-8 ${
                        school.featured
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0'
                          : ''
                      }`}
                      title={school.featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className={`w-4 h-4 ${school.featured ? 'fill-white' : ''}`} />
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>
                        {school.city}, {school.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>
                        {school.board} • {school.schoolType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>
                        {school.rating} ({school.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No schools match your criteria</p>
        </div>
      )}
    </div>
  );
}