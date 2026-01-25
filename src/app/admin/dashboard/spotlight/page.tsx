'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, Building2, MapPin, GraduationCap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { School } from '@/lib/api';

export default function SpotlightPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [spotlightSchool, setSpotlightSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const [filterOptions, setFilterOptions] = useState<{
    cities: { name: string; count: number }[];
    boards: { name: string; count: number }[];
  }>({ cities: [], boards: [] });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadData();
    loadFilters();
  }, []);

  const loadFilters = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/spotlight/filters', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const loadData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      setLoading(true);

      const [spotlightRes, schoolsRes] = await Promise.all([
        fetch('/api/admin/settings/spotlight', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/schools?limit=1000', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (spotlightRes.ok) {
        const spotlightData = await spotlightRes.json();
        if (spotlightData.settings?.school) {
          setSpotlightSchool(spotlightData.settings.school);
        }
      }

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

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !filterCity || filterCity === ' ' || school.city === filterCity;
    const matchesBoard = !filterBoard || filterBoard === ' ' || school.board === filterBoard;
    return matchesSearch && matchesCity && matchesBoard;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading spotlight...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Spotlight School</h1>
        <p className="text-slate-600">Manage the featured school displayed on the homepage</p>
      </div>

      {/* Current Spotlight */}
      {spotlightSchool && (
        <Card className="mb-8 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-emerald-100 border-b border-slate-200">
            <CardTitle className="text-slate-800 flex items-center gap-3">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
              Current Featured School
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-48 h-48 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-md">
                {spotlightSchool.bannerImage ? (
                  <img
                    src={spotlightSchool.bannerImage}
                    alt={spotlightSchool.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{spotlightSchool.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>
                      {spotlightSchool.city}, {spotlightSchool.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    <span>
                      {spotlightSchool.board} • {spotlightSchool.schoolType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>
                      {spotlightSchool.rating} / 5 ({spotlightSchool.reviewCount} reviews)
                    </span>
                  </div>
                  {spotlightSchool.feesMin && spotlightSchool.feesMax && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>
                        ₹{spotlightSchool.feesMin.toLocaleString()} - ₹
                        {spotlightSchool.feesMax.toLocaleString()}/year
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* School Selection */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-800">Select Spotlight School</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <SelectItem value=" ">All Cities</SelectItem>
                  {filterOptions.cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name} ({city.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Board</label>
              <Select value={filterBoard} onValueChange={setFilterBoard}>
                <SelectTrigger>
                  <SelectValue placeholder="All Boards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All Boards</SelectItem>
                  {filterOptions.boards.map((board) => (
                    <SelectItem key={board.name} value={board.name}>
                      {board.name} ({board.count})
                    </SelectItem>
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
                className={`cursor-pointer transition-all duration-200 ${
                  spotlightSchool?.id === school.id
                    ? 'ring-2 ring-emerald-500 border-emerald-400 shadow-lg'
                    : 'hover:border-emerald-300 hover:shadow-md'
                }`}
                onClick={() => handleSetSpotlight(school.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {school.logo || school.bannerImage ? (
                        <img
                          src={school.logo || school.bannerImage || ''}
                          alt={school.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 text-sm mb-1 truncate">
                        {school.name}
                      </h4>
                      <p className="text-xs text-slate-600 mb-2">{school.city}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-slate-700">{school.rating}</span>
                      </div>
                    </div>
                    {spotlightSchool?.id === school.id && (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      </div>
                    )}
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
        </CardContent>
      </Card>
    </div>
  );
}
