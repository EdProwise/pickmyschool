'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, GraduationCap, Users, Award, TrendingUp, ChevronRight, MapPin, BookOpen, Shield, Star } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [searchBoard, setSearchBoard] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [searchBudget, setSearchBudget] = useState('');

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

    loadFeaturedSchools();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchBoard) params.append('board', searchBoard);
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

      {/* Hero Section - Modern Split Layout */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50/40 pt-24 pb-24 px-4 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10 max-w-7xl">
          {/* Heading Section - Centered and Premium */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-block">
              <span className="inline-block px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full text-sm font-semibold text-cyan-700 mb-4">
                🎓 India's Premier School Discovery Platform
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Find Your Child's
              <br />
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect School
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover, compare, and connect with over 20,000 schools across India. 
              <br className="hidden md:block" />
              Your journey to the ideal education starts here.
            </p>
          </div>

          {/* Premium Search Card - Centered */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col gap-6">
                  {/* Search Filters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Location Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location
                      </label>
                      <Select value={searchCity} onValueChange={setSearchCity}>
                        <SelectTrigger className="h-14 px-4 text-base font-medium border-2 border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50/50 transition-all bg-white focus:ring-2 focus:ring-cyan-500/20">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Delhi">Delhi</SelectItem>
                          <SelectItem value="Mumbai">Mumbai</SelectItem>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Pune">Pune</SelectItem>
                          <SelectItem value="Chennai">Chennai</SelectItem>
                          <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                          <SelectItem value="Kolkata">Kolkata</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Board Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Board
                      </label>
                      <Select value={searchBoard} onValueChange={setSearchBoard}>
                        <SelectTrigger className="h-14 px-4 text-base font-medium border-2 border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50/50 transition-all bg-white focus:ring-2 focus:ring-cyan-500/20">
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CBSE">CBSE</SelectItem>
                          <SelectItem value="ICSE">ICSE</SelectItem>
                          <SelectItem value="IB">IB</SelectItem>
                          <SelectItem value="State Board">State Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Class Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Class
                      </label>
                      <Select value={searchClass} onValueChange={setSearchClass}>
                        <SelectTrigger className="h-14 px-4 text-base font-medium border-2 border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50/50 transition-all bg-white focus:ring-2 focus:ring-cyan-500/20">
                          <SelectValue placeholder="Select class" />
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

                    {/* Budget Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Budget
                      </label>
                      <Select value={searchBudget} onValueChange={setSearchBudget}>
                        <SelectTrigger className="h-14 px-4 text-base font-medium border-2 border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50/50 transition-all bg-white focus:ring-2 focus:ring-cyan-500/20">
                          <SelectValue placeholder="Select budget" />
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
                  </div>

                  {/* Search Button - Full Width */}
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="h-16 text-lg font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
                  >
                    <Search className="mr-3 group-hover:scale-110 transition-transform" size={24} />
                    Search Schools
                    <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Schools Section */}
          {!loading && featuredSchools.length >= 2 && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  ✨ Featured Schools
                </h3>
                <p className="text-muted-foreground">
                  Handpicked excellence from across India
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredSchools.slice(0, 2).map((school) => (
                  <Card
                    key={school.id}
                    className="group overflow-hidden cursor-pointer border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30 hover:scale-[1.02]"
                    onClick={() => router.push(`/schools/${school.id}`)}
                  >
                    <CardContent className="p-6">
                      {/* School Header */}
                      <div className="flex items-start justify-between mb-4">
                        {school.logo && (
                          <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden ring-2 ring-cyan-100">
                            <img
                              src={school.logo}
                              alt={school.name}
                              className="w-14 h-14 object-contain"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                          <Star className="w-4 h-4 fill-white" />
                          Featured
                        </div>
                      </div>

                      {/* School Name */}
                      <h4 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                        {school.name}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(school.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {school.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {school.type && (
                          <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-semibold">
                            {school.type}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                          {school.board}
                        </span>
                        {school.gender && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold">
                            {school.gender}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]"
                      >
                        Explore School
                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
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

      {/* Featured Schools Section */}
      <section className="py-16 px-4 bg-gray-50">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
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