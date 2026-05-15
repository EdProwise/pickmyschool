'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, User, Phone, GraduationCap, Building2, Tag, IndianRupee, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Lead {
  _id: string;
  studentName: string;
  parentName: string;
  phone: string;
  grade: string;
  schoolInterested?: string;
  schoolType?: string;
  status: string;
  computedEarnings?: number | null;
  earnings: number;
  createdAt: string;
  convertedAt?: string | null;
}

export default function FreelancerEarningDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dateParam = params.date as string; // YYYY-MM-DD

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Only show converted leads for the selected date
  const dateLeads = useMemo(() => {
    return leads.filter(lead => {
      if (lead.status !== 'converted') return false;
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      return d.toISOString().slice(0, 10) === dateParam;
    });
  }, [leads, dateParam]);

  const totalEarning = useMemo(() =>
    dateLeads.reduce((sum, l) => sum + (l.computedEarnings ?? l.earnings ?? 0), 0),
    [dateLeads]
  );

  const displayDate = useMemo(() => {
    if (!dateParam) return '';
    const d = new Date(dateParam + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [dateParam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/freelancer/earning')} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">View Details</h2>
          <p className="text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {displayDate}
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">{dateLeads.length} Converted Admission{dateLeads.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5">
          <IndianRupee className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">Total Earning: ₹{totalEarning.toLocaleString()}</span>
        </div>
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Converted Leads on {displayDate}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dateLeads.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No converted leads found for this date.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date of Lead</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Student</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Parent</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />Grade</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />School Interested In</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />School Type</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-emerald-600" />Earning</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dateLeads.map(lead => {
                    const earning = lead.computedEarnings ?? lead.earnings ?? 0;
                    return (
                      <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-800">
                          {lead.studentName}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {lead.parentName || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          {lead.phone || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {lead.grade || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {lead.schoolInterested || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {lead.schoolType || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize bg-emerald-100 text-emerald-700">
                            Converted
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {earning > 0 ? (
                            <span className="font-semibold text-emerald-700 text-xs whitespace-nowrap">₹{earning.toLocaleString()}</span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Totals row */}
                {dateLeads.length > 0 && (
                  <tfoot>
                    <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                      <td colSpan={8} className="px-4 py-3 font-bold text-slate-700 text-xs text-right">Total Earning</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-emerald-700 text-sm">₹{totalEarning.toLocaleString()}</span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
