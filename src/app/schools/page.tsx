'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getSchools, type School } from '@/lib/api';
import { AIChat } from '@/components/AIChat';
import { Slider } from '@/components/ui/slider';

export default function SchoolsPage() {
  const searchParams = useSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [board, setBoard] = useState(searchParams.get('board') || '');
  const [schoolType, setSchoolType] = useState(searchParams.get('schoolType') || '');
  const [feesMin, setFeesMin] = useState('');
  const [feesMax, setFeesMax] = useState(searchParams.get('feesMax') || '');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  
  // New filter states
  const [minRating, setMinRating] = useState<number[]>([0]);
  const [gender, setGender] = useState('');
  const [language, setLanguage] = useState('');
  const [stream, setStream] = useState('');
  const [k12Level, setK12Level] = useState('');
  const [isInternational, setIsInternational] = useState<boolean | null>(null);

  const facilities = [
    'Library',
    'Sports Complex',
    'Science Lab',
    'Computer Lab',
    'Swimming Pool',
    'Transport',
    'Hostel',
    'Playground',
    'Auditorium',
    'Smart Classrooms',
    'Cafeteria',
  ];

  useEffect(() => {
    loadSchools();
  }, [city, board, schoolType, feesMin, feesMax, search, sortBy, sortOrder, selectedFacilities, minRating, gender, language, stream, k12Level, isInternational]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort: sortBy,
        order: sortOrder,
        limit: 50,
      };

      if (city) params.city = city;
      if (board && board !== 'all') params.board = board;
      if (schoolType && schoolType !== 'all') params.schoolType = schoolType;
      if (feesMin) params.feesMin = parseInt(feesMin);
      if (feesMax) params.feesMax = parseInt(feesMax);
      if (search) params.search = search;
      if (selectedFacilities.length > 0) params.facilities = selectedFacilities.join(',');
      if (minRating[0] > 0) params.minRating = minRating[0];
      if (gender && gender !== 'all') params.gender = gender;
      if (language) params.language = language;
      if (stream) params.stream = stream;
      if (k12Level && k12Level !== 'all') params.k12Level = k12Level;
      if (isInternational !== null) params.isInternational = isInternational.toString();

      const data = await getSchools(params);
      setSchools(data);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  const clearAllFilters = () => {
    setCity('');
    setBoard('');
    setSchoolType('');
    setFeesMin('');
    setFeesMax('');
    setSearch('');
    setSelectedFacilities([]);
    setMinRating([0]);
    setGender('');
    setLanguage('');
    setStream('');
    setK12Level('');
    setIsInternational(null);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="mb-2">Search</Label>
        <Input
          placeholder="Search schools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* City */}
      <div>
        <Label className="mb-2">City</Label>
        <Input
          placeholder="e.g., Delhi"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {/* Rating Filter */}
      <div>
        <Label className="mb-3">Minimum Rating: {minRating[0]} ★</Label>
        <Slider
          value={minRating}
          onValueChange={setMinRating}
          min={0}
          max={5}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0★</span>
          <span>5★</span>
        </div>
      </div>

      {/* Board */}
      <div>
        <Label className="mb-2">Board</Label>
        <Select value={board} onValueChange={setBoard}>
          <SelectTrigger>
            <SelectValue placeholder="Select Board" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
            <SelectItem value="CBSE">CBSE</SelectItem>
            <SelectItem value="ICSE">ICSE</SelectItem>
            <SelectItem value="IB">IB</SelectItem>
            <SelectItem value="State Board">State Board</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div>
        <Label className="mb-2">Gender</Label>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger>
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Boys">Boys</SelectItem>
            <SelectItem value="Girls">Girls</SelectItem>
            <SelectItem value="Co-ed">Co-ed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* School Type */}
      <div>
        <Label className="mb-2">School Type</Label>
        <Select value={schoolType} onValueChange={setSchoolType}>
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Day School">Day School</SelectItem>
            <SelectItem value="Boarding">Boarding</SelectItem>
            <SelectItem value="Both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* K12 Level */}
      <div>
        <Label className="mb-2">Level</Label>
        <Select value={k12Level} onValueChange={setK12Level}>
          <SelectTrigger>
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Primary">Primary (1-5)</SelectItem>
            <SelectItem value="Middle">Middle (6-8)</SelectItem>
            <SelectItem value="Secondary">Secondary (9-10)</SelectItem>
            <SelectItem value="Senior Secondary">Senior Secondary (11-12)</SelectItem>
            <SelectItem value="K-12">K-12 (All Grades)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Language */}
      <div>
        <Label className="mb-2">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="Sanskrit">Sanskrit</SelectItem>
            <SelectItem value="French">French</SelectItem>
            <SelectItem value="German">German</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stream Available */}
      <div>
        <Label className="mb-2">Stream Available</Label>
        <Select value={stream} onValueChange={setStream}>
          <SelectTrigger>
            <SelectValue placeholder="Select Stream" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Streams</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="Commerce">Commerce</SelectItem>
            <SelectItem value="Arts">Arts/Humanities</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* International School */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="international"
          checked={isInternational === true}
          onCheckedChange={(checked) => setIsInternational(checked ? true : null)}
        />
        <label
          htmlFor="international"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          International Schools Only
        </label>
      </div>

      {/* Fees Range */}
      <div>
        <Label className="mb-2">Fees Range (₹)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={feesMin}
            onChange={(e) => setFeesMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={feesMax}
            onChange={(e) => setFeesMax(e.target.value)}
          />
        </div>
      </div>

      {/* Facilities */}
      <div>
        <Label className="mb-3">Facilities</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {facilities.map((facility) => (
            <div key={facility} className="flex items-center space-x-2">
              <Checkbox
                id={facility}
                checked={selectedFacilities.includes(facility)}
                onCheckedChange={() => handleFacilityToggle(facility)}
              />
              <label
                htmlFor={facility}
                className="text-sm cursor-pointer"
              >
                {facility}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        onClick={clearAllFilters}
        className="w-full"
      >
        <X className="mr-2" size={16} />
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Find Your Perfect School
            </h1>
            <p className="text-lg text-muted-foreground">
              {loading ? 'Loading schools...' : `${schools.length} schools found`}
            </p>
          </div>

          <div className="flex gap-6">
            {/* Desktop Filters */}
            <Card className="hidden lg:block w-80 h-fit sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Filter className="mr-2" size={20} />
                    Filters
                  </h2>
                </div>
                <FilterPanel />
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and Mobile Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="feesMin">Fees (Low to High)</SelectItem>
                      <SelectItem value="feesMax">Fees (High to Low)</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="establishmentYear">Establishment Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="mr-2" size={18} />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Schools Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <CardContent className="p-5">
                        <div className="h-6 bg-gray-200 rounded mb-3" />
                        <div className="h-4 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : schools.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-lg text-muted-foreground mb-4">
                      No schools found matching your criteria.
                    </p>
                    <Button onClick={clearAllFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {schools.map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      <AIChat />
    </div>
  );
}