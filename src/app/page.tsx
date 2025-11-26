'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, GraduationCap, Users, Award, TrendingUp, ChevronRight, MapPin, BookOpen, Shield, Star, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import { AIChat } from '@/components/AIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { getFeaturedSchools, type School } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [featuredSchools, setFeaturedSchools] = useState<School[]>([]);
  const [spotlightSchool, setSpotlightSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [searchBoard, setSearchBoard] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [searchType, setSearchType] = useState('');

  useEffect(() => {
    const loadFeaturedSchools = async () => {
      try {
        const schools = await getFeaturedSchools(8);
        setFeaturedSchools(schools);
      } catch (error) {
        console.error('Failed to load featured schools:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadSpotlightSchool = async () => {
      try {
        const response = await fetch('/api/schools/spotlight');
        if (response.ok) {
          const data = await response.json();
          setSpotlightSchool(data.school);
        }
      } catch (error) {
        console.error('Failed to load spotlight school:', error);
      }
    };

    loadFeaturedSchools();
    loadSpotlightSchool();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchBoard) params.append('board', searchBoard);
    if (searchType) params.append('schoolType', searchType);
    if (searchBudget) {
      const budget = parseInt(searchBudget);
      params.append('feesMax', budget.toString());
    }
    router.push(`/schools?${params.toString()}`);
  };

  const topCities = [
    { name: 'Delhi', count: '250+ Schools', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800' },
    { name: 'Mumbai', count: '200+ Schools', image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800' },
    { name: 'Bangalore', count: '180+ Schools', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800' },
    { name: 'Pune', count: '150+ Schools', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800' },
    { name: 'Chennai', count: '140+ Schools', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800' },
    { name: 'Hyderabad', count: '120+ Schools', image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,
      text: 'PickMySchool made finding the perfect school for my daughter so easy! The detailed information and comparison features are excellent.',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      rating: 5,
      text: 'Great platform with comprehensive school listings. The AI chat feature helped me narrow down my choices quickly.',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      name: 'Anjali Patel',
      location: 'Bangalore',
      rating: 5,
      text: 'Very helpful in comparing different schools. The enquiry process is straightforward and schools respond quickly.',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Separated and cleaner */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Find the Perfect School for<br />
              Your Child's{' '}
              <span style={{ color: '#04d3d3' }}>Bright Future</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-0 max-w-3xl mx-auto">
              Discover, compare, and connect with the best schools in your city. Making informed decisions easier.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section - Separated with better spacing */}
      <section className="relative -mt-8 pb-20 px-4">
        <div className="container mx-auto">
          <Card className="max-w-6xl mx-auto shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">City/Area</label>
                  <Input
                    placeholder="e.g., Delhi"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="h-11"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">Board</label>
                  <Select value={searchBoard} onValueChange={setSearchBoard}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                      <SelectItem value="IB">IB</SelectItem>
                      <SelectItem value="State Board">State Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">Class</label>
                  <Select value={searchClass} onValueChange={setSearchClass}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nursery">Nursery</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="1-5">Class 1-5</SelectItem>
                      <SelectItem value="6-8">Class 6-8</SelectItem>
                      <SelectItem value="9-10">Class 9-10</SelectItem>
                      <SelectItem value="11-12">Class 11-12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">Budget</label>
                  <Select value={searchBudget} onValueChange={setSearchBudget}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Max Budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50000">Under ₹50,000</SelectItem>
                      <SelectItem value="100000">Under ₹1,00,000</SelectItem>
                      <SelectItem value="150000">Under ₹1,50,000</SelectItem>
                      <SelectItem value="200000">Under ₹2,00,000</SelectItem>
                      <SelectItem value="999999">Above ₹2,00,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">Type</label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="School Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day School">Day School</SelectItem>
                      <SelectItem value="Boarding">Boarding</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full h-14 text-lg font-semibold"
                style={{ backgroundColor: '#04d3d3', color: 'white' }}
              >
                <Search className="mr-2" size={22} />
                Search Schools
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How PickMySchool Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Finding the right school has never been easier. Follow these simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#04d3d3' }}>
                <Search className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Search</h3>
              <p className="text-muted-foreground">
                Search schools by location, board, budget, and facilities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Compare</h3>
              <p className="text-muted-foreground">
                Compare schools based on fees, facilities, ratings, and reviews
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Connect</h3>
              <p className="text-muted-foreground">
                Submit enquiries and connect directly with schools
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500 mx-auto mb-4 flex items-center justify-center">
                <Award className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Enroll</h3>
              <p className="text-muted-foreground">
                Get guidance through the admission process
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schools Section - 75% / 25% Split */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Schools
              </h2>
              <p className="text-lg text-muted-foreground">
                Top-rated schools recommended for you
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/schools')}
              className="hidden md:flex"
            >
              View All
              <ChevronRight className="ml-2" size={16} />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 75% Section - 3 Featured Schools */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {featuredSchools.slice(0, 3).map((school) => (
                  <SchoolCard key={school.id} school={school} />
                ))}
              </div>

              {/* 25% Section - Spotlight School */}
              {spotlightSchool && (
                <div className="lg:col-span-1">
                  <Card className="h-full bg-gradient-to-br from-purple-50 via-white to-cyan-50 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-bl-full" />
                    
                    {/* Spotlight Badge */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      SPOTLIGHT
                    </div>

                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        {spotlightSchool.bannerImage || spotlightSchool.logo ? (
                          <img
                            src={spotlightSchool.bannerImage || spotlightSchool.logo || ''}
                            alt={spotlightSchool.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <GraduationCap className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {spotlightSchool.name}
                        </h3>

                        <div className="space-y-2 mb-4 flex-1">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                            <span className="line-clamp-1">{spotlightSchool.city}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <GraduationCap className="w-4 h-4 mr-2 text-cyan-500 flex-shrink-0" />
                            <span>{spotlightSchool.board}</span>
                          </div>

                          <div className="flex items-center text-sm">
                            <div className="flex items-center bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-1 rounded">
                              <Star className="w-3 h-3 mr-1 fill-white" />
                              <span className="font-semibold">{spotlightSchool.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({spotlightSchool.reviewCount} reviews)
                            </span>
                          </div>

                          {spotlightSchool.feesMin && spotlightSchool.feesMax && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1">Annual Fees</p>
                              <p className="text-sm font-bold" style={{ color: '#04d3d3' }}>
                                ₹{spotlightSchool.feesMin.toLocaleString()} - ₹{spotlightSchool.feesMax.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => router.push(`/schools/${spotlightSchool.id}`)}
                          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold shadow-lg"
                        >
                          View Details
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Button
              variant="outline"
              onClick={() => router.push('/schools')}
            >
              View All Schools
              <ChevronRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Top Cities Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Schools by City
            </h2>
            <p className="text-lg text-muted-foreground">
              Find the best schools in top cities across India
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topCities.map((city) => (
              <Card
                key={city.name}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/schools?city=${city.name}`)}
              >
                <div className="relative h-32">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                    <MapPin size={24} className="mb-2" />
                    <h3 className="font-bold text-lg">{city.name}</h3>
                    <p className="text-sm">{city.count}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose PickMySchool?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#04d3d3' }}>
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Comprehensive Database</h3>
                <p className="text-muted-foreground">
                  Access detailed information about thousands of schools across India
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Information</h3>
                <p className="text-muted-foreground">
                  All school information is verified and regularly updated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
                <p className="text-muted-foreground">
                  AI-powered suggestions based on your preferences and requirements
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Parents Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear from parents who found their perfect school match
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 fill-yellow-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">&quot;{testimonial.text}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4" style={{ backgroundColor: '#04d3d3' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find the Perfect School?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of parents who have found their child's ideal school through PickMySchool
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100"
              style={{ color: '#04d3d3' }}
              onClick={() => router.push('/schools')}
            >
              Start Searching
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10"
              onClick={() => router.push('/for-schools')}
            >
              List Your School
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      <AIChat />
    </div>
  );
}