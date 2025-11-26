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

    loadFeaturedSchools();
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

      {/* Hero Section - Modern Split Layout */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50/40 pt-21 pb-18 px-4 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-12">
            {/* Left Side - Main Content + Search */}
            <div className="flex-1 w-full">
              <div className="space-y-5 mb-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Discover Schools
                  </span>
                  <br />
                  <span className="text-foreground">with Data, Not Guesswork</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Explore, Compare, and Choose from Over 20,000 Schools to Shape Your Child's Bright Future
                </p>
              </div>

              {/* Search Form */}
              <Card className="w-full shadow-2xl border-0 rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" style={{ color: '#04d3d3' }} />
                        City/Area
                      </label>
                      <Input
                        placeholder="e.g., Delhi"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        className="h-10 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-xl transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" style={{ color: '#04d3d3' }} />
                        Board
                      </label>
                      <Select value={searchBoard} onValueChange={setSearchBoard}>
                        <SelectTrigger className="h-10 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-xl transition-all">
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

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" style={{ color: '#04d3d3' }} />
                        Class
                      </label>
                      <Select value={searchClass} onValueChange={setSearchClass}>
                        <SelectTrigger className="h-10 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-xl transition-all">
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

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <svg className="w-4 h-4" style={{ color: '#04d3d3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Budget
                      </label>
                      <Select value={searchBudget} onValueChange={setSearchBudget}>
                        <SelectTrigger className="h-10 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-xl transition-all">
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
                  </div>

                  <Button
                    onClick={handleSearch}
                    className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    style={{ backgroundColor: '#04d3d3', color: 'white' }}
                  >
                    <Search className="mr-2" size={20} />
                    Search Schools
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Featured School Card */}
            <div className="w-full lg:w-80 flex-shrink-0 lg:mt-12">
              <Card className="w-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  {/* Featured Badge */}
                  <div className="p-4 pb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: '#04d3d3' }}>
                      <Star className="w-4 h-4 text-white fill-white" />
                      <span className="text-white font-semibold text-sm">Featured School</span>
                    </div>
                  </div>

                  {/* School Image/Logo */}
                  <div className="px-4 pb-3">
                    <div className="relative h-28 bg-gradient-to-br from-cyan-100/50 to-blue-100/50 rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
                        <GraduationCap size={60} className="text-cyan-600/20" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative z-10 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <GraduationCap size={32} style={{ color: '#04d3d3' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* School Details */}
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        St. Mary Convent School
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        Bangalore
                      </p>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400/50 text-yellow-400/50'}`}
                        />
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {['KG School', 'CBSE', 'International School', 'Co-Ed'].map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-foreground border border-gray-200 transition-colors cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Phone Number */}
                    <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span className="font-semibold text-foreground text-sm">+91-9643349619</span>
                    </div>

                    {/* Explore Button */}
                    <Button
                      className="w-full h-10 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm rounded-xl"
                      style={{ backgroundColor: '#8b5cf6' }}
                      onClick={() => router.push('/schools/1')}
                    >
                      Explore
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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