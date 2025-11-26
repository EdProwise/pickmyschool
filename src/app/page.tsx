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
          <div className="space-y-5 mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-center">
              Making Schools, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Search</span>
              <br />
              <span className="text-foreground">Simple</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed text-center mx-auto">
              Explore, Compare, and Choose from Over 20,000 Schools to Shape Your Child's Bright Future
            </p>
          </div>

          {/* Search Form and Featured Schools Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Search Form - Left Side */}
            <Card className="w-full shadow-2xl border-2 border-purple-500 rounded-3xl overflow-hidden bg-white p-8">
              <CardContent className="p-0">
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    variant="outline"
                    className="h-12 px-6 text-base font-semibold border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                    onClick={() => {
                      const city = prompt('Enter city/location:');
                      if (city) setSearchCity(city);
                    }}
                  >
                    {searchCity || 'Location'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-12 px-6 text-base font-semibold border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                    onClick={() => {
                      const board = prompt('Select board (CBSE/ICSE/IB/State Board):');
                      if (board) setSearchBoard(board);
                    }}
                  >
                    {searchBoard || 'Board'}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 px-6 text-base font-semibold border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                    onClick={() => {
                      const schoolClass = prompt('Select class (Nursery/KG/1-5/6-8/9-10/11-12):');
                      if (schoolClass) setSearchClass(schoolClass);
                    }}
                  >
                    {searchClass || 'K-12 School'}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 px-6 text-base font-semibold border-2 border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                    onClick={() => {
                      const budget = prompt('Select budget (50000/100000/150000/200000/999999):');
                      if (budget) setSearchBudget(budget);
                    }}
                  >
                    {searchBudget ? `₹${parseInt(searchBudget).toLocaleString('en-IN')}` : 'Budget'}
                  </Button>

                  <Button
                    onClick={handleSearch}
                    className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Schools - Right Side */}
            {!loading && featuredSchools.length >= 2 && (
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Featured Schools
                </h3>
                <div className="space-y-4">
                  {featuredSchools.slice(0, 2).map((school) => (
                    <Card
                      key={school.id}
                      className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-purple-200 rounded-3xl"
                      onClick={() => router.push(`/schools/${school.id}`)}
                    >
                      <CardContent className="p-6">
                        {/* Featured Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                            Featured School
                          </div>
                          {school.logo && (
                            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden">
                              <img
                                src={school.logo}
                                alt={school.name}
                                className="w-10 h-10 object-contain"
                              />
                            </div>
                          )}
                        </div>

                        {/* School Name */}
                        <h4 className="text-xl font-bold text-foreground mb-3 line-clamp-2 text-center">
                          {school.name}
                        </h4>

                        {/* Star Rating */}
                        <div className="flex items-center justify-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 ${
                                i < Math.floor(school.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : i < school.rating
                                  ? 'fill-yellow-400/50 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {school.type && (
                            <div className="bg-white px-3 py-1.5 rounded-lg text-sm font-semibold text-foreground shadow-sm">
                              {school.type}
                            </div>
                          )}
                          <div className="bg-white px-3 py-1.5 rounded-lg text-sm font-semibold text-foreground shadow-sm">
                            {school.board}
                          </div>
                          {school.affiliations && school.affiliations.includes('International') && (
                            <div className="bg-white px-3 py-1.5 rounded-lg text-sm font-semibold text-foreground shadow-sm">
                              International School
                            </div>
                          )}
                          {school.gender && (
                            <div className="bg-white px-3 py-1.5 rounded-lg text-sm font-semibold text-foreground shadow-sm">
                              {school.gender}
                            </div>
                          )}
                        </div>

                        {/* Phone Number */}
                        {school.phone && (
                          <div className="flex items-center justify-center gap-2 mb-4 text-foreground">
                            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            </div>
                            <span className="text-lg font-bold">{school.phone}</span>
                          </div>
                        )}

                        {/* Explore Button */}
                        <div className="flex items-center justify-center gap-2">
                          <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-2.5 rounded-full font-bold text-base hover:shadow-lg transition-all duration-300 hover:scale-105">
                            Explore
                          </button>
                          <button className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 hover:scale-105">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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