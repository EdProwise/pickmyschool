'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  X, Plus, Search, MapPin, DollarSign, Users, Award, 
  CheckCircle2, Building2, Calendar, BookOpen, Star, 
  Phone, Mail, GraduationCap, Shield, Sparkles, TrendingUp,
  Clock, Globe, Heart
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSchools, type School } from '@/lib/api';
import { toast } from 'sonner';

export default function CompareSchoolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Load schools from URL params on mount
  useEffect(() => {
    const schoolIds = searchParams.get('schools')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) || [];
    if (schoolIds.length > 0) {
      loadSchoolsByIds(schoolIds);
    }
  }, []);

  const loadSchoolsByIds = async (ids: number[]) => {
    try {
      // Use optimized bulk fetch endpoint
      const validIds = ids.slice(0, 4).filter(id => !isNaN(id));
      
      if (validIds.length === 0) {
        setSelectedSchools([]);
        return;
      }

      const response = await fetch(`/api/schools?ids=${validIds.join(',')}`);
      
      if (response.ok) {
        const schools = await response.json();
        setSelectedSchools(schools);
      } else {
        console.error('Failed to load schools:', response.statusText);
        toast.error('Failed to load schools');
        setSelectedSchools([]);
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
      toast.error('Failed to load schools');
      setSelectedSchools([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await getSchools({ search: searchQuery, limit: 20 });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search schools');
    } finally {
      setIsSearching(false);
    }
  };

  const addSchool = (school: School) => {
    if (selectedSchools.length >= 4) {
      toast.error('You can compare up to 4 schools only');
      return;
    }
    if (selectedSchools.find(s => s.id === school.id)) {
      toast.error('This school is already added');
      return;
    }
    const newSchools = [...selectedSchools, school];
    setSelectedSchools(newSchools);
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Update URL
    const ids = newSchools.map(s => s.id).join(',');
    router.push(`/compare?schools=${ids}`);
    toast.success(`${school.name} added to comparison`);
  };

  const removeSchool = (schoolId: number) => {
    const newSchools = selectedSchools.filter(s => s.id !== schoolId);
    setSelectedSchools(newSchools);
    
    // Update URL
    if (newSchools.length > 0) {
      const ids = newSchools.map(s => s.id).join(',');
      router.push(`/compare?schools=${ids}`);
    } else {
      router.push('/compare');
    }
    toast.success('School removed from comparison');
  };

  const renderComparisonRow = (
    label: string,
    icon: React.ReactNode,
    getValue: (school: School) => React.ReactNode,
    highlight: boolean = false
  ) => {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(selectedSchools.length + 1, 5)} gap-4 p-6 ${highlight ? 'bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50' : 'bg-white'} border-b border-gray-200 last:border-b-0`}>
        <div className="flex items-center gap-3 md:sticky md:left-0 bg-white md:bg-transparent">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
            {icon}
          </div>
          <span className="font-bold text-foreground text-lg">{label}</span>
        </div>
        {selectedSchools.map((school) => (
          <div key={school.id} className="flex items-center justify-center text-center">
            {getValue(school)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200 rounded-full text-sm font-bold text-cyan-700">
                ⚖️ Smart Comparison Tool
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Compare Schools
              <br />
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Side by Side
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Make an informed decision by comparing up to 4 schools across all key parameters
            </p>
          </div>

          {/* Add Schools Section */}
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Selected Schools ({selectedSchools.length}/4)
                </h2>
                <Button
                  onClick={() => setShowSearchModal(true)}
                  disabled={selectedSchools.length >= 4}
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="mr-2" size={20} />
                  Add School
                </Button>
              </div>

              {/* Selected Schools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {selectedSchools.map((school, index) => (
                  <Card key={school.id} className="relative group hover:shadow-xl transition-all duration-300 border-2 border-cyan-200/50">
                    <CardContent className="p-6">
                      {/* Remove Button */}
                      <button
                        onClick={() => removeSchool(school.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
                      >
                        <X size={16} />
                      </button>

                      {/* School Logo */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mb-4 mx-auto">
                        {school.logo ? (
                          <img src={school.logo} alt={school.name} className="w-14 h-14 object-contain" />
                        ) : (
                          <GraduationCap className="text-cyan-600" size={32} />
                        )}
                      </div>

                      {/* School Name */}
                      <h3 className="font-bold text-foreground text-center mb-2 line-clamp-2 h-12">
                        {school.name}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin size={14} />
                        <span>{school.city}</span>
                      </div>

                      {/* Board Badge */}
                      <Badge className="w-full justify-center bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-300">
                        {school.board}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}

                {/* Empty Slots */}
                {[...Array(4 - selectedSchools.length)].map((_, index) => (
                  <Card 
                    key={`empty-${index}`}
                    className="border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-300 cursor-pointer"
                    onClick={() => setShowSearchModal(true)}
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <Plus className="text-gray-400" size={32} />
                      </div>
                      <p className="text-gray-400 font-semibold text-center">
                        Add School {selectedSchools.length + index + 1}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      {selectedSchools.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-8 text-white text-center">
                <h2 className="text-3xl font-bold mb-2">Detailed Comparison</h2>
                <p className="text-white/90">Compare all aspects to make the best decision for your child</p>
              </div>

              <div className="overflow-x-auto">
                {/* School Headers with Images */}
                <div className={`grid grid-cols-1 md:grid-cols-${Math.min(selectedSchools.length + 1, 5)} gap-4 p-6 bg-gradient-to-br from-gray-50 to-white border-b-4 border-cyan-500`}>
                  <div className="hidden md:block" /> {/* Empty cell for label column */}
                  {selectedSchools.map((school) => (
                    <div key={school.id} className="text-center">
                      <div className="relative group mb-4">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto shadow-xl ring-4 ring-cyan-200/50 group-hover:ring-cyan-400 transition-all duration-300">
                          {school.logo ? (
                            <img src={school.logo} alt={school.name} className="w-20 h-20 object-contain" />
                          ) : (
                            <GraduationCap className="text-cyan-600" size={48} />
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-foreground mb-2 px-2">{school.name}</h3>
                      <Button
                        onClick={() => router.push(`/schools/${school.id}`)}
                        variant="outline"
                        size="sm"
                        className="border-cyan-400 text-cyan-600 hover:bg-cyan-50"
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Basic Information */}
                {renderComparisonRow(
                  'Location',
                  <MapPin size={20} />,
                  (school) => (
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">{school.city}</p>
                      {school.state && <p className="text-muted-foreground">{school.state}</p>}
                    </div>
                  ),
                  true
                )}

                {renderComparisonRow(
                  'Board',
                  <BookOpen size={20} />,
                  (school) => (
                    <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-300 px-4 py-1">
                      {school.board}
                    </Badge>
                  )
                )}

                {renderComparisonRow(
                  'School Type',
                  <Building2 size={20} />,
                  (school) => (
                    <span className="text-sm font-semibold text-foreground">
                      {school.schoolType || 'Not specified'}
                    </span>
                  ),
                  true
                )}

                {renderComparisonRow(
                  'Annual Fees',
                  <DollarSign size={20} />,
                  (school) => (
                    <div className="text-sm">
                      {school.feesMin && school.feesMax ? (
                        <>
                          <p className="font-bold text-green-600">₹{school.feesMin.toLocaleString('en-IN')}</p>
                          <p className="text-muted-foreground">to</p>
                          <p className="font-bold text-green-600">₹{school.feesMax.toLocaleString('en-IN')}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Contact school</span>
                      )}
                    </div>
                  )
                )}

                {renderComparisonRow(
                  'Rating',
                  <Star size={20} />,
                  (school) => (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="fill-yellow-400 text-yellow-400" size={20} />
                        <span className="text-xl font-bold text-foreground">{school.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({school.reviewCount} reviews)</span>
                    </div>
                  ),
                  true
                )}

                {renderComparisonRow(
                  'Established',
                  <Calendar size={20} />,
                  (school) => (
                    <span className="text-sm font-semibold text-foreground">
                      {school.establishmentYear || 'Not specified'}
                    </span>
                  )
                )}

                {renderComparisonRow(
                  'Classes Offered',
                  <GraduationCap size={20} />,
                  (school) => (
                    <span className="text-sm font-medium text-foreground">
                      {school.classesOffered || 'Not specified'}
                    </span>
                  ),
                  true
                )}

                {renderComparisonRow(
                  'Medium',
                  <Globe size={20} />,
                  (school) => (
                    <span className="text-sm font-semibold text-foreground">
                      {school.medium || 'Not specified'}
                    </span>
                  )
                )}

                {renderComparisonRow(
                  'Student-Teacher Ratio',
                  <Users size={20} />,
                  (school) => (
                    <span className="text-sm font-semibold text-cyan-600">
                      {school.studentTeacherRatio || 'Not specified'}
                    </span>
                  ),
                  true
                )}

                {/* Facilities */}
                <div className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border-b border-gray-200">
                  <div className={`grid grid-cols-1 md:grid-cols-${Math.min(selectedSchools.length + 1, 5)} gap-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={20} />
                      </div>
                      <span className="font-bold text-foreground text-lg">Facilities</span>
                    </div>
                    {selectedSchools.map((school) => (
                      <div key={school.id} className="space-y-2">
                        {school.facilities && Array.isArray(school.facilities) && school.facilities.length > 0 ? (
                          school.facilities.slice(0, 8).map((facility, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="text-green-500 flex-shrink-0" size={16} />
                              <span className="text-foreground">{facility}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No facilities listed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {renderComparisonRow(
                  'Contact Phone',
                  <Phone size={20} />,
                  (school) => (
                    <span className="text-sm font-medium text-cyan-600">
                      {school.contactPhone || 'Not available'}
                    </span>
                  )
                )}

                {renderComparisonRow(
                  'Contact Email',
                  <Mail size={20} />,
                  (school) => (
                    <span className="text-sm font-medium text-cyan-600 break-all">
                      {school.contactEmail || 'Not available'}
                    </span>
                  ),
                  true
                )}

                {renderComparisonRow(
                  'Profile Views',
                  <TrendingUp size={20} />,
                  (school) => (
                    <span className="text-sm font-semibold text-purple-600">
                      {school.profileViews.toLocaleString('en-IN')} views
                    </span>
                  )
                )}

                {/* Action Buttons */}
                <div className={`grid grid-cols-1 md:grid-cols-${Math.min(selectedSchools.length + 1, 5)} gap-4 p-6 bg-gradient-to-br from-gray-50 to-white`}>
                  <div className="hidden md:block" />
                  {selectedSchools.map((school) => (
                    <div key={school.id} className="space-y-3">
                      <Button
                        onClick={() => router.push(`/schools/${school.id}`)}
                        className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        View Full Details
                      </Button>
                      <Button
                        onClick={() => removeSchool(school.id)}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Empty State */}
      {selectedSchools.length === 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl p-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                <Building2 className="text-cyan-600" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                No Schools Selected Yet
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start comparing schools by adding them to your comparison list. You can add up to 4 schools.
              </p>
              <Button
                onClick={() => setShowSearchModal(true)}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 px-8"
              >
                <Plus className="mr-2" size={24} />
                Add Your First School
              </Button>
            </Card>
          </div>
        </section>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Add School to Compare</h3>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Search by school name, city, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 h-12 bg-white text-foreground border-0"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-white text-cyan-600 hover:bg-gray-100 font-semibold px-6"
                >
                  <Search className="mr-2" size={20} />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            <CardContent className="p-6 max-h-[calc(80vh-200px)] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((school) => (
                    <Card
                      key={school.id}
                      className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        selectedSchools.find(s => s.id === school.id) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:border-cyan-400'
                      }`}
                      onClick={() => !selectedSchools.find(s => s.id === school.id) && addSchool(school)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                            {school.logo ? (
                              <img src={school.logo} alt={school.name} className="w-14 h-14 object-contain" />
                            ) : (
                              <GraduationCap className="text-cyan-600" size={32} />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground mb-1">{school.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {school.city}
                              </span>
                              <Badge className="bg-blue-100 text-blue-700">{school.board}</Badge>
                              <span className="flex items-center gap-1">
                                <Star className="fill-yellow-400 text-yellow-400" size={14} />
                                {school.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          {selectedSchools.find(s => s.id === school.id) ? (
                            <Badge className="bg-green-100 text-green-700">Added</Badge>
                          ) : (
                            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                              <Plus size={16} className="mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-12">
                  <Search className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-muted-foreground">No schools found. Try a different search term.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-muted-foreground">Search for schools to add to your comparison</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}