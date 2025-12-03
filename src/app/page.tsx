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
  const [spotlightSchool, setSpotlightSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  
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

    const loadSpotlightSchool = async () => {
      try {
        const response = await fetch('/api/schools/spotlight');
        if (response.ok) {
          const data = await response.json();
          setSpotlightSchool(data.school);
        }
      } catch (error) {
        console.error('Failed to load spotlight school:', error);
      } finally {
        setSpotlightLoading(false);
      }
    };

    loadFeaturedSchools();
    loadSpotlightSchool();
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
          {/* Split Layout: 75% (left) / 25% (right) on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-stretch">
            {/* Left: Hero + Search (75%) */}
            <div className="lg:col-span-3">
              {/* Heading Section */}
              <div className="text-center space-y-6 mb-10">
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
                  Discover, compare, and connect with schools near you.
                </p>
              </div>

              {/* Premium Search Card */}
              <div className="max-w-5xl mx-auto mb-4">
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
            </div>

            {/* Right: Featured School (25%)) */}
            <div className="lg:col-span-1 self-center">
              {!spotlightLoading && spotlightSchool && (
                <div className="flex flex-col gap-5">
                  <Card
                    className="overflow-hidden border-0 rounded-3xl shadow-2xl bg-white hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 group relative cursor-pointer"
                    onClick={() => router.push(`/schools/${spotlightSchool.id}`)}
                  >
                    {/* Premium Top Accent Border with animated gradient */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-gradient" />
                    
                    {/* Decorative Corner Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-orange-600/10 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                    <CardContent className="p-6 relative">
                      <div className="relative">
                        {/* Premium Featured Badge */}
                        <div className="mb-4 flex items-center justify-between">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 text-yellow-700 text-xs font-bold border-2 border-yellow-300 shadow-md animate-pulse">
                            <Star className="w-3.5 h-3.5 mr-1.5 fill-yellow-500 text-yellow-500" />
                            Featured School
                          </span>
                        </div>
                        
                        {/* Premium Logo & Name Container */}
                        <div className="flex items-start gap-4 mb-4">
                          {/* Enhanced Logo Frame */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 flex items-center justify-center overflow-hidden ring-2 ring-cyan-300/50 shadow-lg group-hover:ring-cyan-400 group-hover:scale-105 transition-all duration-300">
                              {spotlightSchool.logo ? (
                                <img src={spotlightSchool.logo} alt={spotlightSchool.name} className="w-14 h-14 object-contain" />
                              ) : (
                                <span className="text-lg font-bold bg-gradient-to-br from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                                  {spotlightSchool.name?.charAt(0) || 'S'}
                                </span>
                              )}
                            </div>
                            {/* Decorative dot */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-white shadow-md" />
                          </div>

                          {/* School Name */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg md:text-xl font-bold text-foreground leading-tight break-words group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                              {spotlightSchool.name}
                            </h4>
                          </div>
                        </div>

                        {/* Premium Location Badge */}
                        <div className="flex items-center mb-4 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 w-fit">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-2 shadow-sm">
                            <MapPin className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {spotlightSchool.city}
                            {spotlightSchool.state ? `, ${spotlightSchool.state}` : ''}
                          </span>
                        </div>

                        {/* Premium Tags/Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-300/50 shadow-sm">
                            {spotlightSchool.board}
                          </span>
                          {spotlightSchool.schoolType && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-300/50 shadow-sm">
                              {spotlightSchool.schoolType}
                            </span>
                          )}
                        </div>

                        {/* Premium Fees Display */}
                        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-xs font-bold text-green-700">Annual Fees</span>
                          </div>
                          <p className="text-sm font-bold text-foreground">
                            {spotlightSchool.feesMin !== null && spotlightSchool.feesMax !== null
                              ? `₹${spotlightSchool.feesMin.toLocaleString('en-IN')} – ₹${spotlightSchool.feesMax.toLocaleString('en-IN')}`
                              : 'Fee info not available'}
                          </p>
                        </div>

                        {/* Premium Rating Badge */}
                        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 w-fit shadow-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                            <span className="text-base font-bold bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent">
                              {spotlightSchool.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            ({spotlightSchool.reviewCount} reviews)
                          </span>
                        </div>

                        {/* Premium Facilities */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {Array.isArray(spotlightSchool.facilities) && spotlightSchool.facilities.slice(0, 3).map((fac) => (
                            <span key={fac} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 text-foreground text-xs font-medium border border-gray-200/50 shadow-sm">
                              {fac}
                            </span>
                          ))}
                          {Array.isArray(spotlightSchool.facilities) && spotlightSchool.facilities.length > 3 && (
                            <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 text-xs font-bold border border-cyan-200/50 shadow-sm">
                              +{spotlightSchool.facilities.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Premium Action Button */}
                        <Button 
                          className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group/btn relative overflow-hidden"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/schools/${spotlightSchool.id}`);
                          }}
                        >
                          {/* Button shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            View Details
                            <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Top Cities Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50/30">
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

      {/* Top Rated Schools Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-10 right-20 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="inline-block px-5 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-full text-sm font-bold text-yellow-700">
                ⭐ Parent's Choice
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Top Rated Schools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Highest rated schools based on parent reviews
            </p>
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

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => router.push('/schools')}
              className="h-14 px-8 text-base font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              View All Schools
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section - Premium Design */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 right-20 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200 rounded-full text-sm font-bold text-cyan-700">
                Simple & Effective Process
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How PickMySchool Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Finding the right school has never been easier. Follow these simple steps to discover your child's perfect educational journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Card className="relative group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              {/* Step Number Badge */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                1
              </div>
              <CardContent className="p-8">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Search className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Search</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Search schools by location, board, budget, and facilities with our advanced filters
                </p>
              </CardContent>
            </Card>

            <Card className="relative group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              {/* Step Number Badge */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                2
              </div>
              <CardContent className="p-8">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Compare</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Compare schools based on fees, facilities, ratings, and authentic parent reviews
                </p>
              </CardContent>
            </Card>

            <Card className="relative group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              {/* Step Number Badge */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                3
              </div>
              <CardContent className="p-8">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Connect</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Submit enquiries and connect directly with schools for personalized assistance
                </p>
              </CardContent>
            </Card>

            <Card className="relative group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              {/* Step Number Badge */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                4
              </div>
              <CardContent className="p-8">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Award className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Enroll</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get expert guidance through the admission process and secure your child's future
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50/30 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-10 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200 rounded-full text-sm font-bold text-cyan-700">
                ✨ Your Trusted Partner
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose PickMySchool?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We make school selection seamless with verified data, smart technology, and personalized support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Card 1: Comprehensive Database */}
            <Card className="relative group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm overflow-hidden hover:scale-[1.05] hover:-translate-y-2">
              {/* Top Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600" />
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-8 relative">
                {/* Premium Icon Container */}
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <BookOpen className="text-white" size={36} />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-foreground text-center group-hover:text-cyan-600 transition-colors">
                  Comprehensive Database
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  Access detailed profiles of 1000+ schools across India with complete information on academics, facilities, and fees
                </p>

                {/* Premium Feature Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-cyan-600 font-semibold text-sm">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    1000+ Schools Listed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Verified Information */}
            <Card className="relative group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm overflow-hidden hover:scale-[1.05] hover:-translate-y-2">
              {/* Top Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-8 relative">
                {/* Premium Icon Container */}
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Shield className="text-white" size={36} />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-foreground text-center group-hover:text-blue-600 transition-colors">
                  Verified Information
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  All school data is verified and regularly updated to ensure accuracy and help you make informed decisions
                </p>

                {/* Premium Feature Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    100% Verified Data
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Smart Recommendations */}
            <Card className="relative group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm overflow-hidden hover:scale-[1.05] hover:-translate-y-2">
              {/* Top Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600" />
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-purple-600/10 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-8 relative">
                {/* Premium Icon Container */}
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <TrendingUp className="text-white" size={36} />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-foreground text-center group-hover:text-purple-600 transition-colors">
                  Smart Recommendations
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  AI-powered intelligent suggestions based on your location, budget, preferences, and your child's needs
                </p>

                {/* Premium Feature Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    AI-Powered Matching
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Expert Guidance */}
            <Card className="relative group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm overflow-hidden hover:scale-[1.05] hover:-translate-y-2">
              {/* Top Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-green-500 to-green-600" />
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-8 relative">
                {/* Premium Icon Container */}
                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Users className="text-white" size={36} />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-foreground text-center group-hover:text-green-600 transition-colors">
                  Expert Guidance
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center">
                  Get personalized support from admission experts throughout your school search and application journey
                </p>

                {/* Premium Feature Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    24/7 Support Available
                  </div>
                </div>
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