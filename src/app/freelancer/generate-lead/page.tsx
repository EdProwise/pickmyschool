'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, User, Phone, MapPin, GraduationCap, School, FileText, Search, X, CheckCircle2, Circle, MapPinIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SchoolOption { id: number; name: string; city: string; }

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
          <span>{selected.length > 0 ? `${selected.length} selected` : 'Select school locations...'}</span>
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {/* Dropdown */}
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

      {/* Selected chips */}
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
}: {
  selected: SchoolOption[];
  onChange: (schools: SchoolOption[]) => void;
  selectedCities?: string[];
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

  // Pre-load schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async (q?: string) => {
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (q?.trim()) {
        params.append('search', q);
      }
      // Filter by cities if selectedCities is provided
      if (selectedCities && selectedCities.length > 0) {
        params.append('city', selectedCities.join(','));
      }
      if (!q?.trim() && (!selectedCities || selectedCities.length === 0)) {
        params.append('limit', '100');
      }

      const res = await fetch(`/api/schools?${params.toString()}`);
      const data = await res.json();

      // Handle different API response formats
      let schools = [];
      if (Array.isArray(data)) {
        schools = data;
      } else if (data.data && Array.isArray(data.data)) {
        schools = data.data;
      } else if (data.schools && Array.isArray(data.schools)) {
        schools = data.schools;
      }

      const list: SchoolOption[] = schools
        .map((s: any) => ({ id: s.id, name: s.name, city: s.city }))
        .filter(s => s.id && s.name && s.city);

      console.log('Loaded schools:', list.length, 'for cities:', selectedCities);
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
    debounceRef.current = setTimeout(() => {
      loadSchools(q);
    }, q.trim() ? 300 : 0);
  };

  const handleFocus = () => {
    if (options.length === 0 && !query) {
      loadSchools();
    } else if (options.length > 0) {
      setOpen(true);
    }
  };

  // Toggle: add if not selected, remove if already selected. Keep dropdown open.
  const toggle = (school: SchoolOption) => {
    const isSelected = selected.some(s => s.id === school.id);
    onChange(isSelected ? selected.filter(s => s.id !== school.id) : [...selected, school]);
  };

  const remove = (id: number) => onChange(selected.filter(s => s.id !== id));

  return (
    <div ref={wrapperRef} className="space-y-2">
      {/* Search input */}
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

        {/* Dropdown with tick marks */}
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
                  {/* Tick mark icon */}
                  {isChecked
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    : <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isChecked ? 'text-emerald-800' : 'text-slate-800'}`}>
                      {school.name}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{school.city}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected chips */}
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
  const [form, setForm] = useState({ parentName: '', studentName: '', phone: '', grade: '', notes: '' });
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<SchoolOption[]>([]);
  const [schoolLocations, setSchoolLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('freelancer_token');
    if (!t) { router.push('/freelancer/login'); return; }
    setToken(t);
  }, [router]);

  // Load unique school locations/cities
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
      } catch (e) {
        console.error('Failed to load cities:', e);
      }
    };
    loadCities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      setForm({ parentName: '', studentName: '', phone: '', grade: '', notes: '' });
      setSelectedCities([]);
      setSelectedSchools([]);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Generate Lead</h2>
        <p className="text-slate-500 mt-1">Submit a new student enquiry lead</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

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
                  <MapPin className="w-4 h-4" /> Location of School
                </label>
                <LocationMultiSelect
                  locations={schoolLocations}
                  selected={selectedCities}
                  onChange={setSelectedCities}
                />
              </div>
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <School className="w-4 h-4" /> Schools Interested In
                {selectedSchools.length > 0 && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">
                    {selectedSchools.length} selected
                  </span>
                )}
              </label>
              <SchoolMultiSelect selected={selectedSchools} onChange={setSelectedSchools} selectedCities={selectedCities} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Additional Notes
              </label>
              <textarea name="notes" placeholder="Any additional information about the lead..."
                value={form.notes} onChange={handleChange} rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
