'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, User, Phone, MapPin, GraduationCap, School, FileText, Search, X, CheckCircle2, Circle, ArrowRight, ArrowLeft, Building2, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SchoolOption { id: number; name: string; city: string; board?: string; schoolType?: string; }

// ─── Multi-Select Location Picker ─────────────────────────────────────────────
function LocationMultiSelect({
  locations,
  selected,
  onChange,
}: {
  locations: string[];
  selected: string[];
  onChange: (locs: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (city: string) => {
    onChange(selected.includes(city) ? selected.filter(c => c !== city) : [...selected, city]);
  };

  const remove = (city: string) => onChange(selected.filter(c => c !== city));

  return (
    <div ref={wrapperRef} className="space-y-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm text-left flex items-center justify-between text-slate-700 hover:bg-slate-50"
        >
          <span>{selected.length > 0 ? `${selected.length} location${selected.length !== 1 ? 's' : ''} selected` : 'Select school locations...'}</span>
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {open && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between sticky top-0">
              <span className="text-xs text-slate-500 font-medium">{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
              {selected.length > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">{selected.length} selected</span>
              )}
            </div>
            {locations.map(city => {
              const isChecked = selected.includes(city);
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggle(city)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 ${
                    isChecked ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-slate-50'
                  }`}
                >
                  {isChecked
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    : <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  }
                  <span className={`text-sm font-medium ${isChecked ? 'text-emerald-800' : 'text-slate-800'}`}>
                    {city}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selected.map(city => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {city}
              <button
                type="button"
                onClick={() => remove(city)}
                className="text-emerald-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Multi-Select School Picker ───────────────────────────────────────────────
function SchoolMultiSelect({
  selected,
  onChange,
  selectedCities,
  selectedBoard,
  selectedSchoolType,
}: {
  selected: SchoolOption[];
  onChange: (schools: SchoolOption[]) => void;
  selectedCities?: string[];
  selectedBoard?: string;
  selectedSchoolType?: string;
}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SchoolOption[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filterKey = [(selectedCities ?? []).join(','), selectedBoard ?? '', selectedSchoolType ?? ''].join('|');
  useEffect(() => {
    setQuery('');
    setOpen(false);
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const loadSchools = async (q?: string) => {
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (q?.trim()) params.append('search', q);
      if (selectedCities && selectedCities.length > 0) {
        params.append('city', selectedCities.join(','));
      }
      if (selectedBoard && selectedBoard !== 'all') params.append('board', selectedBoard);
      if (selectedSchoolType && selectedSchoolType !== 'all') params.append('schoolType', selectedSchoolType);
      if (!q?.trim() && (!selectedCities || selectedCities.length === 0)) {
        params.append('limit', '100');
      }

      const res = await fetch(`/api/schools?${params.toString()}`);
      const data = await res.json();

      let schools = [];
      if (Array.isArray(data)) schools = data;
      else if (data.data && Array.isArray(data.data)) schools = data.data;
      else if (data.schools && Array.isArray(data.schools)) schools = data.schools;

      const list: SchoolOption[] = schools
        .map((s: any) => ({ id: s.id, name: s.name, city: s.city, board: s.board, schoolType: s.schoolType }))
        .filter((s: SchoolOption) => s.id && s.name && s.city);

      setOptions(list);
      setOpen(list.length > 0);
    } catch (e) {
      console.error('Failed to fetch schools:', e);
      toast.error('Failed to load schools');
    } finally {
      setFetching(false);
    }
  };

  const search = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadSchools(q), q.trim() ? 300 : 0);
  };

  const handleFocus = () => {
    if (options.length === 0 && !query) loadSchools();
    else if (options.length > 0) setOpen(true);
  };

  const toggle = (school: SchoolOption) => {
    const isSelected = selected.some(s => s.id === school.id);
    onChange(isSelected ? selected.filter(s => s.id !== school.id) : [...selected, school]);
  };

  const remove = (id: number) => onChange(selected.filter(s => s.id !== id));

  return (
    <div ref={wrapperRef} className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={handleFocus}
          placeholder="Type school name or click to browse..."
          className="h-11 pl-9 pr-9"
        />
        {fetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        )}
        {!fetching && query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOptions([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {open && options.length > 0 && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{options.length} school{options.length !== 1 ? 's' : ''} found</span>
              {selected.length > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">{selected.length} selected</span>
              )}
            </div>
            {options.map(school => {
              const isChecked = selected.some(s => s.id === school.id);
              return (
                <button
                  key={school.id}
                  type="button"
                  onClick={() => toggle(school)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0 ${
                    isChecked ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-slate-50'
                  }`}
                >
                  {isChecked
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    : <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isChecked ? 'text-emerald-800' : 'text-slate-800'}`}>
                      {school.name}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 flex-wrap">
                      <MapPin className="w-3 h-3 shrink-0" />{school.city}
                      {school.board && <><span className="mx-0.5">·</span><span>{school.board}</span></>}
                      {school.schoolType && <><span className="mx-0.5">·</span><span>{school.schoolType}</span></>}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selected.map(school => (
            <span
              key={school.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {school.name}
              <button
                type="button"
                onClick={() => remove(school.id)}
                className="text-emerald-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GenerateLeadPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ parentName: '', studentName: '', phone: '', grade: '', notes: '', studentCity: '', studentState: '', schoolType: '' });
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<SchoolOption[]>([]);
  const [schoolLocations, setSchoolLocations] = useState<string[]>([]);
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [availableSchoolTypes, setAvailableSchoolTypes] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedSchoolType, setSelectedSchoolType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('freelancer_token');
    if (!t) { router.push('/freelancer/login'); return; }
    setToken(t);
  }, [router]);

  // Load unique cities from school DB
  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch('/api/schools?limit=1000');
        const data = await res.json();
        let schools = [];
        if (Array.isArray(data)) schools = data;
        else if (data.data && Array.isArray(data.data)) schools = data.data;
        else if (data.schools && Array.isArray(data.schools)) schools = data.schools;

        const uniqueCities = Array.from(new Set(schools.map((s: any) => s.city).filter(Boolean))).sort() as string[];
        setSchoolLocations(uniqueCities);
        const uniqueBoards = Array.from(new Set(schools.map((s: any) => s.board).filter(Boolean))).sort() as string[];
        setAvailableBoards(uniqueBoards);
        const uniqueSchoolTypes = Array.from(new Set(schools.map((s: any) => s.schoolType).filter(Boolean))).sort() as string[];
        setAvailableSchoolTypes(uniqueSchoolTypes);
      } catch (e) {
        console.error('Failed to load cities:', e);
      }
    };
    loadCities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const schoolInterested = selectedSchools.map(s => s.name).join(', ');
      const city = selectedCities.join(', ');
      const res = await fetch('/api/freelancer/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, city, schoolInterested }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to submit lead'); return; }
      toast.success('Lead submitted successfully!');
      setForm({ parentName: '', studentName: '', phone: '', grade: '', notes: '', studentCity: '', studentState: '', schoolType: '' });
      setSelectedCities([]);
      setSelectedSchools([]);
      setSelectedBoard('');
      setSelectedSchoolType('');
      setStep(1);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Generate Lead</h2>
        <p className="text-slate-500 mt-1">Submit a new student enquiry lead</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6">
        {/* Step 1 */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {step === 2 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <span className={`text-sm font-medium ${step === 1 ? 'text-emerald-700' : 'text-slate-500'}`}>
            Provide Lead
          </span>
        </div>

        {/* Connector */}
        <div className={`flex-1 h-0.5 rounded transition-colors ${step === 2 ? 'bg-emerald-400' : 'bg-slate-200'}`} />

        {/* Step 2 */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            2
          </div>
          <span className={`text-sm font-medium ${step === 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
            Select School
          </span>
        </div>
      </div>

      {/* ── STEP 1: Provide Lead ──────────────────────────────────────────────── */}
      {step === 1 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Provide Lead Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleProceed} className="space-y-5 mt-2">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Parent Name *
                  </label>
                  <Input name="parentName" placeholder="e.g. Rahul Sharma" value={form.parentName} onChange={handleChange} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> Student Name *
                  </label>
                  <Input name="studentName" placeholder="e.g. Aryan Sharma" value={form.studentName} onChange={handleChange} required className="h-11" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> Phone Number *
                  </label>
                  <Input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> Grade / Class *
                  </label>
                  <select name="grade" value={form.grade} onChange={handleChange} required
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select grade</option>
                    {['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> City of Student
                  </label>
                  <Input name="studentCity" placeholder="e.g. Pune" value={form.studentCity} onChange={handleChange} className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> State of Student
                  </label>
                  <Input name="studentState" placeholder="e.g. Maharashtra" value={form.studentState} onChange={handleChange} className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <School className="w-4 h-4" /> School Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'Day School', label: 'Day School', icon: Building2, desc: 'Regular day school' },
                    { value: 'Hostel School', label: 'Hostel School', icon: Home, desc: 'Residential / boarding' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, schoolType: prev.schoolType === value ? '' : value }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all ${
                        form.schoolType === value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${form.schoolType === value ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                      {form.schoolType === value && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Additional Notes
                </label>
                <textarea name="notes" placeholder="Any additional information about the lead..."
                  value={form.notes} onChange={handleChange} rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>

              <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <span className="flex items-center gap-2">
                  Proceed
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2: Select School ─────────────────────────────────────────────── */}
      {step === 2 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <School className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              Select School
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {/* Lead summary pill */}
            <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
              <span><span className="font-medium text-slate-800">{form.parentName}</span> (Parent)</span>
              <span>·</span>
              <span><span className="font-medium text-slate-800">{form.studentName}</span> (Student)</span>
              <span>·</span>
              <span>{form.phone}</span>
              <span>·</span>
              <span>{form.grade}</span>
              {form.studentCity && <><span>·</span><span>{form.studentCity}{form.studentState ? `, ${form.studentState}` : ''}</span></>}
              {form.schoolType && <><span>·</span><span className="text-emerald-700 font-medium">{form.schoolType}</span></>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Location of School
                </label>
                <LocationMultiSelect
                  locations={schoolLocations}
                  selected={selectedCities}
                  onChange={setSelectedCities}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> Board
                  </label>
                  <select
                    value={selectedBoard}
                    onChange={e => { setSelectedBoard(e.target.value); setSelectedSchools([]); }}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Boards</option>
                    {availableBoards.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> School Type
                  </label>
                  <select
                    value={selectedSchoolType}
                    onChange={e => { setSelectedSchoolType(e.target.value); setSelectedSchools([]); }}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Types</option>
                    {availableSchoolTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <School className="w-4 h-4" /> Schools Interested In
                  {selectedSchools.length > 0 && (
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">
                      {selectedSchools.length} selected
                    </span>
                  )}
                </label>
                <SchoolMultiSelect
                  selected={selectedSchools}
                  onChange={setSelectedSchools}
                  selectedCities={selectedCities}
                  selectedBoard={selectedBoard}
                  selectedSchoolType={selectedSchoolType}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </span>
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      Submit Lead
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
