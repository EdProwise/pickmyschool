'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, MapPin, Star, Users, Building, 
  GraduationCap, ChevronRight, School as SchoolIcon,
  CheckCircle2, ArrowRight, Quote, Globe, Shield, TrendingUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolCard from '@/components/SchoolCard';
import type { School } from '@/lib/api';

interface HomeClientProps {
  initialFeaturedSchools: School[];
  initialSpotlightSchool: School | null;
  initialTestimonials: any[];
  initialCityStats: Record<string, number>;
  initialFilterOptions: {
    boards: string[];
    k12Levels: string[];
    schoolTypes: string[];
    cities: { name: string; count: number }[];
  };
}

export default function HomeClient({
  initialFeaturedSchools,
  initialSpotlightSchool,
  initialTestimonials,
  initialCityStats,
  initialFilterOptions,
}: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCity) params.append('city', selectedCity);
    window.location.href = `/schools?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050853063-915894367ef7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Badge className="mb-6 px-4 py-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20 text-sm font-semibold backdrop-blur-sm">
                The Most Trusted School Discovery Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Discover the Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Future</span> for Your Child
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Empowering parents with comprehensive data, expert insights, and community reviews to make the most important decision.
              </p>

              {/* Advanced Search Bar */}
              <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <Input 
                      placeholder="Search by school name, board, or keywords..."
                      className="h-14 pl-12 bg-white/5 border-0 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden md:block" />
                  <div className="relative w-full md:w-56">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select 
                      className="w-full h-14 pl-12 bg-white/5 border-0 text-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-xl cursor-pointer"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="" className="bg-slate-900">All Cities</option>
                      {initialFilterOptions.cities.map(city => (
                        <option key={city.name} value={city.name} className="bg-slate-900">{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full md:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/20">
                    Find Schools
                  </Button>
                </div>
              </form>

              {/* Quick Tags */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-slate-400">
                <span className="text-sm font-medium">Popular:</span>
                {initialFilterOptions.cities.slice(0, 5).map(city => (
                  <button 
                    key={city.name}
                    onClick={() => { setSelectedCity(city.name); }}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 bg-white border-b relative z-20 -mt-8 mx-4 rounded-3xl shadow-xl max-w-6xl xl:mx-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Building, label: 'Registered Schools', value: '5,000+' },
                { icon: Users, label: 'Happy Parents', value: '50k+' },
                { icon: MapPin, label: 'Cities Covered', value: '100+' },
                { icon: GraduationCap, label: 'Admission Support', value: 'Expert' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                    <stat.icon className="text-blue-600" size={24} />
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                  <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spotlight School Section */}
        {initialSpotlightSchool && (
          <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8">
                  <div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 mb-4 px-4 py-1">
                      <Star size={14} className="mr-2 fill-amber-500" />
                      School of the Month
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                      Experience Excellence at <span className="text-blue-600">{initialSpotlightSchool.name}</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                      Providing a world-class environment with state-of-the-art facilities and a commitment to holistic development. Discover why this institution stands out this month.
                    </p>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {[
                        { icon: CheckCircle2, label: 'Modern Infrastructure' },
                        { icon: CheckCircle2, label: 'Expert Faculty' },
                        { icon: CheckCircle2, label: 'Safe Environment' },
                        { icon: CheckCircle2, label: 'Co-curricular Focus' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <item.icon className="text-green-500" size={20} />
                          <span className="font-medium text-slate-700">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link href={`/schools/${initialSpotlightSchool.id}`}>
                    <Button size="lg" className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold">
                      View Profile <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 scale-95 opacity-10" />
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
                    <img 
                      src={initialSpotlightSchool.bannerImage || initialSpotlightSchool.logoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80'} 
                      alt={initialSpotlightSchool.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Schools Grid */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl">
                <Badge className="bg-blue-100 text-blue-700 mb-4">Top Rated</Badge>
                <h2 className="text-4xl font-extrabold text-slate-900">Featured Schools</h2>
                <p className="text-lg text-slate-600 mt-4"> Handpicked institutions known for their academic excellence and vibrant community life.</p>
              </div>
              <Link href="/schools">
                <Button variant="outline" className="h-12 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-900 font-bold rounded-xl px-6">
                  View All Schools <ChevronRight className="ml-1" size={20} />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {initialFeaturedSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          </div>
        </section>

        {/* Popular Cities */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Search by City</h2>
              <p className="text-lg text-slate-600">Find the best schools in your neighborhood across India's top educational hubs.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {initialFilterOptions.cities.slice(0, 6).map((city) => (
                <Link key={city.name} href={`/schools?city=${encodeURIComponent(city.name)}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-slate-50 hover:bg-white hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-blue-600 transition-colors">
                        <MapPin className="text-blue-600 group-hover:text-white transition-colors" size={28} />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1">{city.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{city.count} Schools</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {initialTestimonials.length > 0 && (
          <section className="py-24 bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 translate-y-1/2" />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <Quote className="text-blue-500/30 mx-auto mb-6" size={64} />
                <h2 className="text-4xl font-extrabold text-white mb-4">What Parents Are Saying</h2>
                <p className="text-lg text-slate-400">Voices from our community that make us the leading platform for school discovery.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {initialTestimonials.map((testimonial, i) => (
                  <Card key={i} className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={16} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-300 text-lg italic leading-relaxed mb-8">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-500/20">
                          {testimonial.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white">{testimonial.name}</p>
                          <p className="text-sm text-slate-500">{testimonial.role || 'Parent'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="text-blue-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Verified Data</h3>
                <p className="text-slate-600 leading-relaxed">
                  Every school profile is verified by our team to ensure you get accurate and up-to-date information.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="text-green-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Comprehensive Coverage</h3>
                <p className="text-slate-600 leading-relaxed">
                  Explore schools across boards including CBSE, ICSE, International, and State Boards in one place.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="text-purple-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart Comparison</h3>
                <p className="text-slate-600 leading-relaxed">
                  Use our advanced tools to compare schools side-by-side based on 50+ parameters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Are You a School Principal?</h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join our premium network and showcase your institution to thousands of parents searching for the perfect school every day.
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <Link href="/for-schools">
                  <Button size="lg" className="h-14 px-10 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-extrabold shadow-xl">
                    Register Your School
                  </Button>
                </Link>
                <Link href="/contact-expert">
                  <Button variant="outline" size="lg" className="h-14 px-10 border-2 border-white/30 text-white hover:bg-white/10 rounded-xl font-bold">
                    Talk to an Expert
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
