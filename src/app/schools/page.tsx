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
  }, [city, board, schoolType, feesMin, feesMax, search, sortBy, sortOrder, selectedFacilities]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort: sortBy,
        order: sortOrder,
        limit: 50,
      };

      if (city) params.city = city;
      if (board) params.board = board;
      if (schoolType) params.schoolType = schoolType;
      if (feesMin) params.feesMin = parseInt(feesMin);
      if (feesMax) params.feesMax = parseInt(feesMax);
      if (search) params.search = search;
      if (selectedFacilities.length > 0) params.facilities = selectedFacilities.join(',');

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
    </div>
  );
}
