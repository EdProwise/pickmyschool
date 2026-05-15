'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Building2, MapPin, Star, ExternalLink, Pencil, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import type { School as SchoolBase } from '@/lib/api';

type School = SchoolBase & {
  leadCounts?: { total: number; new: number; contacted: number; converted: number; rejected: number };
};

interface CommissionForm {
  dayAmount: string;
  dayEffectiveFrom: string;
  hostelAmount: string;
  hostelEffectiveFrom: string;
}

export default function SchoolsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterSchoolType, setFilterSchoolType] = useState('all');
  const [availableCities, setAvailableCities] = useState<{ name: string; count: number }[]>([]);
  const [availableStates, setAvailableStates] = useState<{ name: string; count: number }[]>([]);
  const [availableSchoolTypes, setAvailableSchoolTypes] = useState<{ name: string; count: number }[]>([]);

  // Commission dialog state
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [commissionForm, setCommissionForm] = useState<CommissionForm>({
    dayAmount: '',
    dayEffectiveFrom: '',
    hostelAmount: '',
    hostelEffectiveFrom: '',
  });
  const [savingCommission, setSavingCommission] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadSchools();
    loadFilters();
  }, []);

  const loadFilters = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/schools/filters', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCities(data.cities);
        setAvailableStates(data.states);
        setAvailableSchoolTypes(data.schoolTypes);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const loadSchools = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/schools?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSchools(data);
      } else {
        toast.error('Failed to load schools');
      }
    } catch (error) {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (schoolId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/featured`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadSchools();
      } else {
        toast.error('Failed to toggle featured status');
      }
    } catch (error) {
      toast.error('Failed to toggle featured status');
    }
  };

  const openCommissionDialog = (school: School) => {
    setSelectedSchool(school);
    setCommissionForm({
      dayAmount: school.daySchoolCommission?.amount?.toString() ?? '',
      dayEffectiveFrom: school.daySchoolCommission?.effectiveFrom ?? '',
      hostelAmount: school.hostelSchoolCommission?.amount?.toString() ?? '',
      hostelEffectiveFrom: school.hostelSchoolCommission?.effectiveFrom ?? '',
    });
    setCommissionDialogOpen(true);
  };

  const saveCommission = async () => {
    if (!selectedSchool) return;
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    // At least one commission must have an amount
    if (!commissionForm.dayAmount && !commissionForm.hostelAmount) {
      toast.error('Please enter at least one commission amount');
      return;
    }

    setSavingCommission(true);
    try {
      const body: Record<string, unknown> = {};

      if (commissionForm.dayAmount) {
        body.daySchoolCommission = {
          amount: parseFloat(commissionForm.dayAmount),
          effectiveFrom: commissionForm.dayEffectiveFrom,
        };
      }

      if (commissionForm.hostelAmount) {
        body.hostelSchoolCommission = {
          amount: parseFloat(commissionForm.hostelAmount),
          effectiveFrom: commissionForm.hostelEffectiveFrom,
        };
      }

      const response = await fetch(`/api/admin/schools/${selectedSchool.id}/commission`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Commission updated successfully');
        setSchools((prev) =>
          prev.map((s) =>
            s.id === selectedSchool.id
              ? {
                  ...s,
                  daySchoolCommission: data.daySchoolCommission ?? s.daySchoolCommission,
                  hostelSchoolCommission: data.hostelSchoolCommission ?? s.hostelSchoolCommission,
                }
              : s
          )
        );
        setCommissionDialogOpen(false);
      } else {
        toast.error(data?.error || 'Failed to update commission');
      }
    } catch (error) {
      toast.error('Failed to update commission');
    } finally {
      setSavingCommission(false);
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !filterCity || filterCity === 'all' || school.city === filterCity;
    const matchesState = !filterState || filterState === 'all' || school.state === filterState;
    const matchesType =
      !filterSchoolType || filterSchoolType === 'all' || school.schoolType === filterSchoolType;
    return matchesSearch && matchesCity && matchesState && matchesType;
  });

  const formatCommission = (com?: { amount: number; effectiveFrom: string } | null) => {
    if (!com || com.amount === undefined) return null;
    return {
      amount: `₹${com.amount.toLocaleString('en-IN')}`,
      from: com.effectiveFrom
        ? new Date(com.effectiveFrom).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : null,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Schools</h1>
        <p className="text-slate-600">Browse and manage all schools in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Schools</p>
                <p className="text-2xl font-bold text-slate-800">{schools.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Cities</p>
                  <p className="text-2xl font-bold text-slate-800">{availableCities.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">States</p>
                  <p className="text-2xl font-bold text-slate-800">{availableStates.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Filtered Results</p>
                <p className="text-2xl font-bold text-slate-800">{filteredSchools.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <Search className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {availableCities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name} ({city.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {availableStates.map((state) => (
                      <SelectItem key={state.name} value={state.name}>
                        {state.name} ({state.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">School Type</label>
                <Select value={filterSchoolType} onValueChange={setFilterSchoolType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableSchoolTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name}>
                        {type.name} ({type.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">School Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">City</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">State</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Board</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">School Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Featured</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Profile</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Day School Com.</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Hostel School Com.</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700">Leads</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700">Contacted</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700">Converted</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700">Rejected</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-700">Earning</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="text-center py-12 text-slate-500">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>No schools match your criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school, index) => {
                    const dayCom = formatCommission(school.daySchoolCommission);
                    const hostelCom = formatCommission(school.hostelSchoolCommission);
                    return (
                      <tr
                        key={school.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[220px]">
                          <span className="block truncate" title={school.name}>{school.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{school.city || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{school.state || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{school.board || '—'}</td>
                        <td className="px-4 py-3">
                          {school.schoolType ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                              {school.schoolType}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant={school.featured ? 'default' : 'outline'}
                            onClick={(e) => toggleFeatured(school.id, e)}
                            className={`h-7 px-2 ${
                              school.featured
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0'
                                : ''
                            }`}
                            title={school.featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            <Star className={`w-3.5 h-3.5 ${school.featured ? 'fill-white' : ''}`} />
                          </Button>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`/schools/${school.slug || school.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-800 font-medium"
                          >
                            View <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                        {/* Day School Commission */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              {dayCom ? (
                                <div>
                                  <span className="font-semibold text-slate-800">{dayCom.amount}</span>
                                  {dayCom.from && (
                                    <p className="text-xs text-slate-400">from {dayCom.from}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">Not set</span>
                              )}
                            </div>
                            <button
                              onClick={() => openCommissionDialog(school)}
                              className="text-slate-400 hover:text-cyan-600 transition-colors"
                              title="Edit commission"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        {/* Hostel School Commission */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              {hostelCom ? (
                                <div>
                                  <span className="font-semibold text-slate-800">{hostelCom.amount}</span>
                                  {hostelCom.from && (
                                    <p className="text-xs text-slate-400">from {hostelCom.from}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">Not set</span>
                              )}
                            </div>
                            <button
                              onClick={() => openCommissionDialog(school)}
                              className="text-slate-400 hover:text-cyan-600 transition-colors"
                              title="Edit commission"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        {/* PMS Lead counts */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block min-w-[2rem] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">{(school.leadCounts?.new ?? 0) + (school.leadCounts?.contacted ?? 0)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block min-w-[2rem] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">{school.leadCounts?.contacted ?? 0}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block min-w-[2rem] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">{school.leadCounts?.converted ?? 0}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block min-w-[2rem] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded text-xs">{school.leadCounts?.rejected ?? 0}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={`/admin/dashboard/schools/${school.id}/earning`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
                          >
                            <IndianRupee className="w-3.5 h-3.5" />
                            View Details
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Commission Edit Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">
              Set Commission — {selectedSchool?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Day School Commission */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Day School Commission</p>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Amount (₹)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  value={commissionForm.dayAmount}
                  onChange={(e) =>
                    setCommissionForm((f) => ({ ...f, dayAmount: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Effective From</label>
                <Input
                  type="date"
                  value={commissionForm.dayEffectiveFrom}
                  onChange={(e) =>
                    setCommissionForm((f) => ({ ...f, dayEffectiveFrom: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Hostel School Commission */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Hostel School Commission</p>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Amount (₹)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 8000"
                  value={commissionForm.hostelAmount}
                  onChange={(e) =>
                    setCommissionForm((f) => ({ ...f, hostelAmount: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Effective From</label>
                <Input
                  type="date"
                  value={commissionForm.hostelEffectiveFrom}
                  onChange={(e) =>
                    setCommissionForm((f) => ({ ...f, hostelEffectiveFrom: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCommissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveCommission}
              disabled={savingCommission}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingCommission ? 'Saving...' : 'Save Commission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
