'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  X, Plus, Search, MapPin, DollarSign, Users, Award, 
  CheckCircle2, Building2, Calendar, BookOpen, Star, 
  Phone, Mail, GraduationCap, Shield, Sparkles, TrendingUp,
  Clock, Globe, Heart, Check, XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSchools, type School, type SchoolResult } from '@/lib/api';
import { toast } from 'sonner';

interface ComparisonRowProps {
  label: string;
  icon: React.ReactNode;
  getValue: (school: School) => React.ReactNode;
  index: number;
  iconBgColor?: string;
  selectedSchools: School[];
}

function ComparisonRow({ 
  label, 
  icon, 
  getValue, 
  index, 
  iconBgColor = 'bg-cyan-500',
  selectedSchools 
}: ComparisonRowProps) {
  const isEven = index % 2 === 0;
  const cols = selectedSchools.length + 1;
  const gridStyle = { gridTemplateColumns: `repeat(${cols}, minmax(180px, 1fr))` };
  const gridClass = `grid gap-4 p-6 ${isEven ? 'bg-white' : 'bg-gray-50/50'} border-b border-gray-100 last:border-b-0 transition-colors hover:bg-cyan-50/30 group min-w-max md:min-w-full`;
  const headerClass = `flex items-center gap-3 sticky left-0 z-20 ${isEven ? 'bg-white' : 'bg-[#fcfdfe]'} md:bg-transparent pl-4 sm:pl-8 pr-4 md:pr-0 border-r border-gray-100 md:border-r-0 transition-colors group-hover:bg-[#f2fafd]`;

  return (
    <div className={gridClass} style={gridStyle}>
      <div className={headerClass}>
        <div className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all group-hover:scale-110 flex-shrink-0`}>
          {icon}
        </div>
        <span className="font-bold text-foreground text-sm md:text-base leading-tight">{label}</span>
      </div>
      {selectedSchools.map((school) => (
        <div key={school.id} className="flex items-center justify-center text-center px-4">
          <div className="text-sm md:text-base font-medium text-foreground">
            {getValue(school)}
          </div>
        </div>
      ))}
    </div>
  );
}

const facilityMapping: Record<string, string> = {
  hasLibrary: 'Library',
  hasComputerLab: 'Computer Lab',
  hasPhysicsLab: 'Physics Lab',
  hasChemistryLab: 'Chemistry Lab',
  hasBiologyLab: 'Biology Lab',
  hasMathsLab: 'Maths Lab',
  hasLanguageLab: 'Language Lab',
  hasRoboticsLab: 'Robotics Lab',
  hasStemLab: 'STEM Lab',
  hasAuditorium: 'Auditorium',
  hasPlayground: 'Playground',
  hasSwimmingPool: 'Swimming Pool',
  hasFitnessCentre: 'Fitness Centre',
  hasYoga: 'Yoga',
  hasMartialArts: 'Martial Arts',
  hasMusicDance: 'Music & Dance',
  hasHorseRiding: 'Horse Riding',
  hasSmartBoard: 'Smart Board',
  hasWifi: 'Wi-Fi',
  hasCctv: 'CCTV',
  hasElearning: 'E-Learning',
  hasAcClassrooms: 'AC Classrooms',
  hasAiTools: 'AI Tools',
  hasTransport: 'Transport',
  hasGpsBuses: 'GPS in Buses',
  hasCctvBuses: 'CCTV in Buses',
  hasBusCaretaker: 'Bus Caretaker',
  hasMedicalRoom: 'Medical Room',
  hasDoctorNurse: 'Doctor/Nurse',
  hasFireSafety: 'Fire Safety',
  hasCleanWater: 'Clean Water',
  hasSecurityGuards: 'Security Guards',
  hasAirPurifier: 'Air Purifier',
  hasHostel: 'Hostel',
  hasMess: 'Mess',
  hasHostelStudyRoom: 'Hostel Study Room',
  hasAcHostel: 'AC Hostel',
  hasCafeteria: 'Cafeteria',
};

function CompareSchoolsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<number, SchoolResult[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    const schoolsParam = searchParams.get('schools');
    const schoolIds = schoolsParam?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) || [];
    if (schoolIds.length > 0) {
      loadSchoolsByIds(schoolIds);
      localStorage.setItem('compare_schools', schoolIds.join(','));
    } else {
      const localIds = localStorage.getItem('compare_schools');
      if (localIds) {
        router.replace(`/compare?schools=${localIds}`);
      }
    }
  }, [searchParams, router]);

  const loadSchoolsByIds = async (ids: number[]) => {
    try {
      const validIds = ids.slice(0, 4).filter(id => !isNaN(id));
      if (validIds.length === 0) {
        setSelectedSchools([]);
        return;
      }
      const response = await fetch(`/api/schools?ids=${validIds.join(',')}`);
      if (response.ok) {
        const schools = await response.json();
        setSelectedSchools(schools);
        const newResultsMap: Record<number, SchoolResult[]> = {};
        await Promise.all(schools.map(async (school: School) => {
          try {
            const res = await fetch(`/api/schools/results?schoolId=${school.id}`);
            if (res.ok) {
              const results = await res.json();
              newResultsMap[school.id] = results;
            }
          } catch (err) {
            console.error(err);
          }
        }));
        setResultsMap(newResultsMap);
      } else {
        setSelectedSchools([]);
      }
    } catch (error) {
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
    const ids = newSchools.map(s => s.id).join(',');
    localStorage.setItem('compare_schools', ids);
    router.push(`/compare?schools=${ids}`);
    toast.success(`${school.name} added to comparison`);
  };

  const removeSchool = (schoolId: number) => {
    const newSchools = selectedSchools.filter(s => s.id !== schoolId);
    setSelectedSchools(newSchools);
    if (newSchools.length > 0) {
      const ids = newSchools.map(s => s.id).join(',');
      localStorage.setItem('compare_schools', ids);
      router.push(`/compare?schools=${ids}`);
    } else {
      localStorage.removeItem('compare_schools');
      router.push('/compare');
    }
    toast.success('School removed from comparison');
  };

  const hasFacility = (school: School, facilityKey: string): boolean => {
    if ((school as any)[facilityKey] === true) return true;
    const facilityLabel = facilityMapping[facilityKey]?.toLowerCase();
    if (school.facilities && Array.isArray(school.facilities)) {
      return school.facilities.some(f => f.toLowerCase() === facilityLabel);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30">
      <Navbar />
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
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
          <Card className="max-w-5xl mx-auto shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl">
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Selected Schools ({selectedSchools.length}/4)
                </h2>
                <Button onClick={() => setShowSearchModal(true)} disabled={selectedSchools.length >= 4} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold">
                  <Plus className="mr-2" size={20} />
                  Add School
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {selectedSchools.map((school) => (
                  <Card key={school.id} className="relative group hover:shadow-xl transition-all duration-300 border-2 border-cyan-200/50 rounded-xl sm:rounded-2xl">
                    <CardContent className="p-3 sm:p-6">
                      <button onClick={() => removeSchool(school.id)} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">
                        <X size={14} />
                      </button>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mb-3 mx-auto">
                          {school.logo ? <img src={school.logo} alt={school.name} className="w-10 h-10 object-contain" /> : <GraduationCap className="text-cyan-600" size={24} />}
                      </div>
                      <h3 className="font-bold text-foreground text-center mb-1.5 line-clamp-2 h-10 text-[11px] sm:text-base">{school.name}</h3>
                      <div className="flex items-center justify-center gap-1 text-[10px] sm:text-sm text-muted-foreground mb-1.5">
                        <MapPin size={12} />
                        <span className="truncate">{school.city}</span>
                      </div>
                      <Badge className="w-full justify-center bg-blue-100 text-blue-700">{school.board}</Badge>
                    </CardContent>
                  </Card>
                ))}
                {[...Array(Math.max(0, 4 - selectedSchools.length))].map((_, index) => (
                  <Card key={`empty-${index}`} className="border-2 border-dashed border-gray-300 bg-gray-50/50 hover:border-cyan-400 cursor-pointer rounded-xl sm:rounded-2xl" onClick={() => setShowSearchModal(true)}>
                    <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[200px]">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                          <Plus className="text-gray-400" size={24} />
                        </div>
                      <p className="text-gray-400 font-bold text-center text-[10px] sm:text-sm">Add Slot</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {selectedSchools.length > 0 && (
        <section className="py-8 sm:py-16 px-3 sm:px-4">
          <div className="container mx-auto">
            <Card className="shadow-2xl border-0 rounded-2xl bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-6 text-white text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">Detailed Comparison</h2>
                <p className="text-sm sm:text-base">Compare all aspects side by side</p>
              </div>
                <div className="overflow-x-auto">
                  <div className="sticky top-0 z-30 grid gap-3 p-4 bg-white border-b-4 border-cyan-500 shadow-md min-w-max md:min-w-full"
                       style={{ gridTemplateColumns: `repeat(${selectedSchools.length + 1}, minmax(180px, 1fr))` }}>
                    <div className="sticky left-0 bg-white z-40 md:static border-r border-gray-100 md:border-r-0" />
                    {selectedSchools.map((school) => (
                      <div key={school.id} className="text-center">
                        <div className="relative group mb-2">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto shadow-xl">
                            {school.logo ? <img src={school.logo} alt={school.name} className="w-12 h-12 object-contain" /> : <GraduationCap className="text-cyan-600" size={32} />}
                          </div>
                        </div>
                        <h3 className="font-bold text-sm sm:text-lg text-foreground mb-1.5 px-1 line-clamp-1">{school.name}</h3>
                        <Button onClick={() => router.push(`/schools/${school.id}`)} variant="outline" size="sm" className="h-8 text-[10px] sm:text-xs">View Details</Button>
                      </div>
                    ))}
                  </div>
                  <div className="min-w-max md:min-w-full">
                    <Accordion type="multiple" defaultValue={["rating", "overview", "contact", "facilities", "fees", "results"]} className="w-full">
                      <AccordionItem value="rating" className="border-b-0">
                        <AccordionTrigger className="px-4 py-3 bg-gray-50/80 hover:no-underline border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-white shadow-md">
                              <Star size={16} />
                            </div>
                            <span className="font-bold text-foreground text-base sm:text-lg">Rating</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                          <ComparisonRow label="Overall Rating" icon={<Star size={16} />} getValue={(school) => (
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                <Star className="fill-yellow-400 text-yellow-400" size={16} />
                                <span className="text-base sm:text-xl font-bold">{school.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-[10px] sm:text-xs text-muted-foreground">({school.reviewCount} reviews)</span>
                            </div>
                          )} index={0} iconBgColor="bg-yellow-400" selectedSchools={selectedSchools} />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="overview" className="border-b-0">
                        <AccordionTrigger className="px-6 py-4 bg-gray-50/80 hover:no-underline border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md">
                              <BookOpen size={20} />
                            </div>
                            <span className="font-bold text-foreground text-lg">Overview</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                          <ComparisonRow label="Board" icon={<Award size={20} />} getValue={(school) => <Badge className="bg-blue-100 text-blue-700">{school.board}</Badge>} index={0} iconBgColor="bg-blue-500" selectedSchools={selectedSchools} />
                          <ComparisonRow label="School Type" icon={<Building2 size={20} />} getValue={(school) => <span className="text-sm font-semibold">{school.schoolType || 'N/A'}</span>} index={1} iconBgColor="bg-blue-500" selectedSchools={selectedSchools} />
                          <ComparisonRow label="Established" icon={<Calendar size={20} />} getValue={(school) => <span className="text-sm font-semibold">{school.establishmentYear || 'N/A'}</span>} index={2} iconBgColor="bg-blue-500" selectedSchools={selectedSchools} />
                          <ComparisonRow label="Medium" icon={<Globe size={20} />} getValue={(school) => <span className="text-sm font-medium">{school.languages || school.medium || 'N/A'}</span>} index={3} iconBgColor="bg-blue-500" selectedSchools={selectedSchools} />
                          <ComparisonRow label="Total Students" icon={<Users size={20} />} getValue={(school) => <span className="text-sm font-semibold">{school.totalStudents || 'N/A'}</span>} index={4} iconBgColor="bg-blue-500" selectedSchools={selectedSchools} />
                          <ComparisonRow label="International" icon={<Globe size={20} />} getValue={(school) => <Badge className={school.isInternational ? "bg-green-100 text-green-700" : "bg-gray-100"}>{school.isInternational ? 'Yes' : 'No'}</Badge>} index={5} iconBgColor="bg-blue-500" selectedSchools={selectedSchools} />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="contact" className="border-b-0">
                        <AccordionTrigger className="px-6 py-4 bg-gray-50/80 hover:no-underline border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-md">
                              <Phone size={20} />
                            </div>
                            <span className="font-bold text-foreground text-lg">Contact</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                          <ComparisonRow label="Phone" icon={<Phone size={20} />} getValue={(school) => <span className="text-sm font-medium text-cyan-600">{school.contactPhone || 'N/A'}</span>} index={0} iconBgColor="bg-green-500" selectedSchools={selectedSchools} />
                          <ComparisonRow label="Email" icon={<Mail size={20} />} getValue={(school) => <span className="text-sm font-medium text-blue-600 break-all">{school.email || 'N/A'}</span>} index={1} iconBgColor="bg-green-500" selectedSchools={selectedSchools} />
                        </AccordionContent>
                      </AccordionItem>
                        <AccordionItem value="facilities" className="border-b-0">
                          <AccordionTrigger className="px-6 py-4 bg-gray-50/80 hover:no-underline border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-md">
                                <Sparkles size={20} />
                              </div>
                              <span className="font-bold text-foreground text-lg">Facilities</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-0">
                            {Object.entries(facilityMapping).slice(0, 10).map(([key, label], idx) => (
                              <ComparisonRow 
                                key={key}
                                label={label}
                                icon={<CheckCircle2 size={18} />}
                                getValue={(school) => hasFacility(school, key) ? <Check className="text-green-600" size={20} /> : <X className="text-red-400" size={20} />}
                                index={idx}
                                iconBgColor="bg-purple-500"
                                selectedSchools={selectedSchools}
                              />
                            ))}
                          </AccordionContent>
                        </AccordionItem>

                          <AccordionItem value="fees" className="border-b-0">
                            <AccordionTrigger className="px-6 py-4 bg-gray-50/80 hover:no-underline border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md">
                                  <DollarSign size={20} />
                                </div>
                                <span className="font-bold text-foreground text-lg">Fees Structure</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0">
                              <ComparisonRow 
                                label="Annual Fees (Range)" 
                                icon={<DollarSign size={20} />} 
                                getValue={(school) => (
                                  <div className="text-center">
                                    <div className="text-sm font-bold text-foreground">
                                      {school.feesMin && school.feesMax 
                                        ? `₹${school.feesMin.toLocaleString()} - ₹${school.feesMax.toLocaleString()}`
                                        : school.feesMin ? `From ₹${school.feesMin.toLocaleString()}`
                                        : 'Contact for Fees'}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">Approx. per year</span>
                                  </div>
                                )} 
                                index={0} 
                                iconBgColor="bg-green-600" 
                                selectedSchools={selectedSchools} 
                              />
                              {(() => {
                                // Extract all unique classes
                                const classesSet = new Set<string>();
                                selectedSchools.forEach(school => {
                                  const fs = typeof school.feesStructure === 'string' 
                                    ? JSON.parse(school.feesStructure) 
                                    : school.feesStructure;
                                    
                                  if (fs && typeof fs === 'object') {
                                    Object.keys(fs).forEach(className => {
                                      const val = fs[className];
                                      if (typeof val === 'object' && val !== null) {
                                        Object.keys(val).forEach(stream => {
                                          classesSet.add(`${className} (${stream})`);
                                        });
                                      } else {
                                        classesSet.add(className);
                                      }
                                    });
                                  }
                                });

                                const order = ['nursery', 'kg', 'lkg', 'ukg', 'class1', 'class2', 'class3', 'class4', 'class5', 'class6', 'class7', 'class8', 'class9', 'class10', 'class11', 'class12'];
                                
                                const sortedClasses = Array.from(classesSet).sort((a, b) => {
                                  const aBase = a.split(' (')[0].toLowerCase();
                                  const bBase = b.split(' (')[0].toLowerCase();
                                  const aIdx = order.indexOf(aBase);
                                  const bIdx = order.indexOf(bBase);
                                  
                                  if (aIdx !== -1 && bIdx !== -1) {
                                    if (aIdx !== bIdx) return aIdx - bIdx;
                                    return a.localeCompare(b);
                                  }
                                  if (aIdx !== -1) return -1;
                                  if (bIdx !== -1) return 1;
                                  return a.localeCompare(b);
                                });

                                return sortedClasses.map((classKey, idx) => (
                                  <ComparisonRow 
                                    key={classKey}
                                    label={classKey
                                      .replace('class', 'Class ')
                                      .replace('kg', 'KG')
                                      .replace('lkg', 'LKG')
                                      .replace('ukg', 'UKG')
                                      .replace('nursery', 'Nursery')
                                      .replace(/\b\w/g, l => l.toUpperCase())}
                                    icon={<DollarSign size={18} />}
                                    getValue={(school) => {
                                      const fs = typeof school.feesStructure === 'string' 
                                        ? JSON.parse(school.feesStructure) 
                                        : school.feesStructure;
                                        
                                      if (!fs) return <span className="text-gray-400">N/A</span>;
                                      
                                      const parts = classKey.split(' (');
                                      const className = parts[0];
                                      const stream = parts[1] ? parts[1].replace(')', '') : null;
                                      
                                      const val = fs[className];
                                      if (val === undefined || val === null) return <span className="text-gray-400">N/A</span>;
                                      
                                      if (stream) {
                                        return val[stream] ? `₹${val[stream].toLocaleString()}` : <span className="text-gray-400">N/A</span>;
                                      }
                                      
                                      if (typeof val === 'object') {
                                        const values = Object.values(val).filter(v => typeof v === 'number') as number[];
                                        if (values.length > 0) {
                                          const min = Math.min(...values);
                                          const max = Math.max(...values);
                                          return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
                                        }
                                        return <span className="text-gray-400">N/A</span>;
                                      }
                                      
                                      return typeof val === 'number' ? `₹${val.toLocaleString()}` : <span className="text-gray-400">N/A</span>;
                                    }}
                                    index={idx + 1}
                                    iconBgColor="bg-green-600"
                                    selectedSchools={selectedSchools}
                                  />
                                ));
                              })()}
                            </AccordionContent>
                          </AccordionItem>


                        <AccordionItem value="results" className="border-b-0">
                          <AccordionTrigger className="px-6 py-4 bg-gray-50/80 hover:no-underline border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                                <Award size={20} />
                              </div>
                              <span className="font-bold text-foreground text-lg">Academic Results</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-0">
                            <ComparisonRow 
                              label="Board Results" 
                              icon={<GraduationCap size={20} />} 
                              getValue={(school) => {
                                const results = resultsMap[school.id];
                                if (!results || results.length === 0) return <span className="text-sm text-muted-foreground italic">N/A</span>;
                                // Get the latest result
                                const latest = [...results].sort((a, b) => b.year - a.year)[0];
                                return (
                                  <div className="text-center">
                                    <div className="text-sm font-bold text-orange-600">
                                      {latest.passPercentage}% Pass Rate
                                    </div>
                                    <div className="text-[10px] font-medium text-muted-foreground">
                                      {latest.examType} ({latest.year})
                                    </div>
                                  </div>
                                );
                              }} 
                              index={0} 
                              iconBgColor="bg-orange-500" 
                              selectedSchools={selectedSchools} 
                            />
                            <ComparisonRow 
                              label="Class Level" 
                              icon={<BookOpen size={20} />} 
                              getValue={(school) => {
                                const results = resultsMap[school.id];
                                if (!results || results.length === 0) return <span className="text-sm text-muted-foreground italic">N/A</span>;
                                const latest = [...results].sort((a, b) => b.year - a.year)[0];
                                return <Badge variant="outline" className="text-[10px]">{latest.classLevel || 'N/A'}</Badge>;
                              }} 
                              index={1} 
                              iconBgColor="bg-orange-500" 
                              selectedSchools={selectedSchools} 
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    <div className="grid gap-4 p-6 bg-gradient-to-br from-gray-50 to-white min-w-max md:min-w-full"
                         style={{ gridTemplateColumns: `repeat(${selectedSchools.length + 1}, minmax(180px, 1fr))` }}>
                      <div className="sticky left-0 bg-white z-20 md:static border-r border-gray-100 md:border-r-0" />
                      {selectedSchools.map((school) => (
                        <div key={school.id} className="space-y-3">
                          <Button onClick={() => router.push(`/schools/${school.id}`)} className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold">View Details</Button>
                          <Button onClick={() => removeSchool(school.id)} variant="outline" className="w-full border-red-300 text-red-600">Remove</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </Card>
          </div>
        </section>
      )}
      {selectedSchools.length === 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <Card className="p-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                <Building2 className="text-cyan-600" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">No Schools Selected Yet</h2>
              <p className="text-lg text-muted-foreground mb-8">Start comparing schools by adding them to your comparison list.</p>
              <Button onClick={() => setShowSearchModal(true)} size="lg" className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold">
                <Plus className="mr-2" size={24} />
                Add Your First School
              </Button>
            </Card>
          </div>
        </section>
      )}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Add School to Compare</h3>
                <button onClick={() => { setShowSearchModal(false); setSearchQuery(''); setSearchResults([]); }} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <X size={24} />
                </button>
              </div>
              <div className="flex gap-3">
                <Input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="flex-1 h-12 bg-white text-foreground border-0" />
                <Button onClick={handleSearch} disabled={isSearching} className="bg-white text-cyan-600 hover:bg-gray-100 font-semibold px-6">
                  <Search className="mr-2" size={20} />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
            <CardContent className="p-6 max-h-[calc(80vh-200px)] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((school) => (
                    <Card key={school.id} className={`cursor-pointer ${selectedSchools.find(s => s.id === school.id) ? 'opacity-50' : ''}`} onClick={() => !selectedSchools.find(s => s.id === school.id) && addSchool(school)}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          {school.logo ? <img src={school.logo} alt={school.name} className="w-14 h-14 object-contain" /> : <GraduationCap className="text-cyan-600" size={32} />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground mb-1">{school.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{school.city}</span>
                            <Badge>{school.board}</Badge>
                          </div>
                        </div>
                        {!selectedSchools.find(s => s.id === school.id) && <Button size="sm">Add</Button>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-12">
                  <Search className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-muted-foreground">No schools found.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-muted-foreground">Search for schools</p>
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

function ComparePageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-20 text-center">Loading...</div>
      <Footer />
    </div>
  );
}

export default function CompareSchoolsPage() {
  return (
    <Suspense fallback={<ComparePageLoading />}>
      <CompareSchoolsContent />
    </Suspense>
  );
}
