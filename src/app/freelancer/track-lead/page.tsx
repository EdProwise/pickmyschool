'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ListChecks, Phone, MapPin, GraduationCap, School,
  User, IndianRupee, Calendar, Building2, Home, FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Lead {
  _id: string;
  parentName: string;
  studentName: string;
  phone: string;
  city: string;
  studentCity?: string;
  studentState?: string;
  grade: string;
  schoolInterested?: string;
  schoolType?: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  earnings: number;
  computedEarnings?: number | null;
  notes?: string;
  createdAt: string;
  convertedAt?: string | null;
}

const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  contacted: { label: 'Contacted', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  converted: { label: 'Converted', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected:  { label: 'Rejected',  color: 'bg-red-50 text-red-700 border border-red-200' },
};

const FILTER_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'new',       label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'converted', label: 'Converted' },
  { key: 'rejected',  label: 'Rejected' },
] as const;

export default function TrackLeadPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'converted' | 'rejected'>('all');

  useEffect(() => {
    const token = localStorage.getItem('freelancer_token');
    if (!token) { router.push('/freelancer/login'); return; }
    fetch('/api/freelancer/leads', { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) { router.push('/freelancer/login'); return; }
        const data = await res.json();
        setLeads(data.leads || []);
      })
      .catch(() => router.push('/freelancer/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  const countFor = (key: string) =>
    key === 'all' ? leads.length : leads.filter(l => l.status === key).length;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Track Leads</h2>
        <p className="text-slate-500 mt-1">Monitor the status of all your submitted leads</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['new', 'contacted', 'converted', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-left p-3 rounded-xl border transition-all ${
              filter === s ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
            } ${STATUS_CONFIG[s].color} bg-opacity-60`}
          >
            <p className="text-xs font-medium opacity-70">{STATUS_CONFIG[s].label}</p>
            <p className="text-2xl font-bold mt-0.5">{countFor(s)}</p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === key
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
            }`}
          >
            {label}
            <span className="ml-1.5 opacity-70">({countFor(key)})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['#', 'Student', 'Parent', 'Phone', 'City / State', 'Grade', 'School Type', 'Schools Interested', 'Status', 'Earnings', 'Date', 'Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-slate-500 whitespace-nowrap text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 12 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <ListChecks className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No leads found</p>
            <p className="text-sm text-slate-400 mt-1">
              {filter === 'all' ? 'Start by generating your first lead' : `No ${filter} leads yet`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Student</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Parent</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />City / State</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />Grade</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />School Type</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><School className="w-3.5 h-3.5" />Schools Interested</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Converted Date</span>
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5" />Earnings</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date</span>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Notes</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lead, idx) => {
                  const cityDisplay = [lead.studentCity || lead.city, lead.studentState].filter(Boolean).join(', ') || '—';
                  const isHostel = lead.schoolType?.toLowerCase().includes('hostel');
                  return (
                    <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                      {/* # */}
                      <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>

                      {/* Student */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 whitespace-nowrap">{lead.studentName}</p>
                      </td>

                      {/* Parent */}
                      <td className="px-4 py-3">
                        <p className="text-slate-600 whitespace-nowrap">{lead.parentName}</p>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3">
                        <a href={`tel:${lead.phone}`} className="text-slate-600 hover:text-emerald-600 whitespace-nowrap font-mono text-xs">
                          {lead.phone}
                        </a>
                      </td>

                      {/* City / State */}
                      <td className="px-4 py-3">
                        <span className="text-slate-600 whitespace-nowrap text-xs">{cityDisplay}</span>
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium whitespace-nowrap">
                          {lead.grade || '—'}
                        </span>
                      </td>

                      {/* School Type */}
                      <td className="px-4 py-3">
                        {lead.schoolType ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            isHostel
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {isHostel
                              ? <Home className="w-3 h-3 shrink-0" />
                              : <Building2 className="w-3 h-3 shrink-0" />
                            }
                            {lead.schoolType}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Schools Interested */}
                      <td className="px-4 py-3 max-w-[200px]">
                        {lead.schoolInterested ? (
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2" title={lead.schoolInterested}>
                            {lead.schoolInterested}
                          </p>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_CONFIG[lead.status].color}`}>
                          {STATUS_CONFIG[lead.status].label}
                        </span>
                      </td>

                      {/* Converted Date */}
                      <td className="px-4 py-3">
                        {lead.convertedAt ? (
                          <span className="text-emerald-700 font-medium text-xs whitespace-nowrap">
                            {fmt(lead.convertedAt)}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Earnings */}
                      <td className="px-4 py-3 text-right">
                        {lead.status === 'converted' && lead.computedEarnings != null ? (
                          <span className="font-semibold text-emerald-700 text-xs whitespace-nowrap">
                            ₹{lead.computedEarnings.toLocaleString()}
                          </span>
                        ) : lead.earnings > 0 ? (
                          <span className="font-semibold text-emerald-700 text-xs whitespace-nowrap">
                            ₹{lead.earnings.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-slate-500 text-xs whitespace-nowrap">{fmt(lead.createdAt)}</span>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3 max-w-[160px]">
                        {lead.notes ? (
                          <p className="text-slate-400 text-xs italic line-clamp-2" title={lead.notes}>
                            {lead.notes}
                          </p>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filtered.length} of {leads.length} leads</span>
            {leads.filter(l => l.status === 'converted').length > 0 && (
              <span className="text-emerald-600 font-medium">
                Total Earned: ₹{leads.reduce((sum, l) => {
                  if (l.status === 'converted' && l.computedEarnings != null) return sum + l.computedEarnings;
                  return sum + (l.earnings || 0);
                }, 0).toLocaleString()}
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
