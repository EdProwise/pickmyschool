'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ExternalLink, Download, MapPin, School, Building2, Home, X, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SchoolRow {
  id: number;
  name: string;
  city: string;
  slug?: string;
  schoolType?: string;
  earningDaySchool?: number | null;
  earningHostelSchool?: number | null;
  prospectusUrl?: string | null;
  newsletterUrl?: string | null;
  feesStructureUrl?: string | null;
  brochureUrl?: string | null;
  brochureVisible?: boolean;
}

export default function ListOfSchoolPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [filtered, setFiltered] = useState<SchoolRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [documentModal, setDocumentModal] = useState<{ isOpen: boolean; school: SchoolRow | null }>({
    isOpen: false,
    school: null,
  });

  useEffect(() => {
    const t = localStorage.getItem('freelancer_token');
    if (!t) { router.push('/freelancer/login'); return; }
    fetchSchools(t);
  }, [router]);

  const fetchSchools = async (token: string) => {
    setLoading(true);
    try {
      // Fetch schools and commission settings in parallel
      const [schoolsRes, commissionRes] = await Promise.all([
        fetch('/api/schools?limit=1000'),
        fetch('/api/freelancer/commission-settings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const schoolsData = await schoolsRes.json();
      const commissionData = commissionRes.ok ? await commissionRes.json() : null;

      // Extract freelancer commission percent (e.g. 5 means 5%)
      const freelancerCommPct: number =
        commissionData?.commissionSettings?.freelancerCommissionPercent ?? 0;

      let raw: any[] = [];
      if (Array.isArray(schoolsData)) raw = schoolsData;
      else if (schoolsData.data && Array.isArray(schoolsData.data)) raw = schoolsData.data;
      else if (schoolsData.schools && Array.isArray(schoolsData.schools)) raw = schoolsData.schools;

      const list: SchoolRow[] = raw
        .filter((s) => s.name && s.city)
        .map((s) => {
          // Day school earning = daySchoolCommission.amount × (freelancerCommPct / 100)
          const dayAmt = s.daySchoolCommission?.amount ?? null;
          const hostelAmt = s.hostelSchoolCommission?.amount ?? null;

          return {
            id: s.id,
            name: s.name,
            city: s.city,
            slug: s.slug,
            schoolType: s.schoolType,
            earningDaySchool:
              dayAmt !== null && freelancerCommPct > 0
                ? Math.round(dayAmt * (freelancerCommPct / 100))
                : null,
            earningHostelSchool:
              hostelAmt !== null && freelancerCommPct > 0
                ? Math.round(hostelAmt * (freelancerCommPct / 100))
                : null,
            prospectusUrl: s.prospectusUrl ?? null,
            newsletterUrl: s.newsletterUrl ?? null,
            feesStructureUrl: s.feesStructureUrl ?? null,
            brochureUrl: s.brochureUrl ?? null,
            brochureVisible: s.brochureVisible ?? true,
          };
        });

      setSchools(list);
      setFiltered(list);
    } catch (e) {
      console.error('Failed to load schools:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q: string) => {
    setQuery(q);
    const lower = q.toLowerCase();
    if (!lower.trim()) {
      setFiltered(schools);
    } else {
      setFiltered(
        schools.filter(
          (s) =>
            s.name.toLowerCase().includes(lower) ||
            s.city.toLowerCase().includes(lower)
        )
      );
    }
  };

  const schoolTypeIcon = (type?: string) => {
    if (!type) return null;
    const t = type.toLowerCase();
    if (t.includes('hostel') || t.includes('residential') || t.includes('boarding')) {
      return <Home className="w-3.5 h-3.5 text-purple-500" />;
    }
    return <Building2 className="w-3.5 h-3.5 text-blue-500" />;
  };

  const schoolTypeBadge = (type?: string) => {
    if (!type) return null;
    const t = type.toLowerCase();
    const isHostel = t.includes('hostel') || t.includes('residential') || t.includes('boarding');
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isHostel
          ? 'bg-purple-50 text-purple-700 border border-purple-100'
          : 'bg-blue-50 text-blue-700 border border-blue-100'
      }`}>
        {isHostel ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
        {type}
      </span>
    );
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">List of Schools</h2>
        <p className="text-slate-500 mt-1">Browse all schools, view profiles and earning details</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Total Schools</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{schools.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Cities Covered</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              {Array.from(new Set(schools.map(s => s.city))).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Showing</p>
            <p className="text-2xl font-bold text-blue-600 mt-0.5">{filtered.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by school name or city..."
          className="h-10 pl-9 pr-9 bg-white"
        />
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">#</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                  <span className="flex items-center gap-1.5"><School className="w-4 h-4" />School Name</span>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />City</span>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">School Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Profile Link</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                  <span className="flex items-center gap-1 justify-end">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    Earning – Day School
                  </span>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                  <span className="flex items-center gap-1 justify-end">
                    <Home className="w-3.5 h-3.5 text-purple-500" />
                    Earning – Hostel School
                  </span>
                </th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 justify-center">
                    <FileText className="w-4 h-4" />Documents
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-6 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-100 rounded ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 bg-slate-100 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                    <School className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="font-medium">No schools found</p>
                    {query && <p className="text-sm mt-1">Try a different search term</p>}
                  </td>
                </tr>
              ) : (
                filtered.map((school, idx) => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    {/* # */}
                    <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 leading-tight">{school.name}</p>
                    </td>

                    {/* City */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {school.city}
                      </span>
                    </td>

                    {/* School Type */}
                    <td className="px-4 py-3">
                      {school.schoolType
                        ? schoolTypeBadge(school.schoolType)
                        : <span className="text-slate-300 text-xs">—</span>
                      }
                    </td>

                    {/* Profile Link */}
                    <td className="px-4 py-3">
                      {school.slug ? (
                        <a
                          href={`/schools/${school.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          View Profile
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Earning – Day School */}
                    <td className="px-4 py-3 text-right">
                      {school.earningDaySchool != null ? (
                        <span className="font-semibold text-blue-700">
                          ₹{school.earningDaySchool.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Earning – Hostel School */}
                    <td className="px-4 py-3 text-right">
                      {school.earningHostelSchool != null ? (
                        <span className="font-semibold text-purple-700">
                          ₹{school.earningHostelSchool.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Download Documents */}
                    <td className="px-4 py-3 text-center">
                      {school.prospectusUrl || school.newsletterUrl || school.feesStructureUrl || (school.brochureUrl && school.brochureVisible) ? (
                        <button
                          onClick={() => setDocumentModal({ isOpen: true, school })}
                          title="Download documents"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium transition-colors"
                        >
                          <Download className="w-3 h-3 shrink-0" />
                          Download
                        </button>
                      ) : (
                        <button
                          disabled
                          title="No documents available"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-md text-xs font-medium cursor-not-allowed"
                        >
                          <Download className="w-3 h-3 shrink-0" />
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            Showing {filtered.length} of {schools.length} schools
            {query && ` matching "${query}"`}
          </div>
        )}
      </Card>

      {/* Documents Modal */}
      {documentModal.isOpen && documentModal.school && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-800">{documentModal.school.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Available Documents</p>
                </div>
                <button
                  onClick={() => setDocumentModal({ isOpen: false, school: null })}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Documents List */}
              <div className="p-4 space-y-3">
                {documentModal.school.prospectusUrl && (
                  <a
                    href={documentModal.school.prospectusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Prospectus</span>
                    </div>
                    <Download className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  </a>
                )}

                {documentModal.school.newsletterUrl && (
                  <a
                    href={documentModal.school.newsletterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Newsletter/Magazine</span>
                    </div>
                    <Download className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  </a>
                )}

                {documentModal.school.feesStructureUrl && (
                  <a
                    href={documentModal.school.feesStructureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Fees Structure</span>
                    </div>
                    <Download className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                  </a>
                )}

                {documentModal.school.brochureUrl && documentModal.school.brochureVisible && (
                  <a
                    href={documentModal.school.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <span className="text-sm font-medium text-teal-900">School Brochure</span>
                        <p className="text-xs text-teal-600 mt-0.5">Premium PDF — All sections</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                  </a>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                <button
                  onClick={() => setDocumentModal({ isOpen: false, school: null })}
                  className="w-full px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
