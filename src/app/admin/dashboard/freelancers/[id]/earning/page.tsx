'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  TrendingUp, Wallet, Calendar, Building2, Home,
  IndianRupee, ArrowLeft, User, Phone, MapPin, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FreelancerInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  totalLeads: number;
  totalEarnings: number;
  status: string;
}

interface Lead {
  _id: string;
  schoolInterested?: string;
  schoolType?: string;
  status: string;
  computedEarnings?: number | null;
  earnings: number;
  studentName: string;
  parentName: string;
  createdAt: string;
  convertedAt?: string | null;
}

interface DaySummary {
  date: string;
  dateKey: string;
  dayAdmissions: number;
  hostelAdmissions: number;
  dayEarning: number;
  hostelEarning: number;
  total: number;
}

function isHostelType(schoolType?: string) {
  if (!schoolType) return false;
  const t = schoolType.toLowerCase();
  return t.includes('hostel') || t.includes('residential') || t.includes('boarding');
}

export default function AdminFreelancerEarningPage() {
  const router = useRouter();
  const params = useParams();
  const freelancerId = params.id as string;

  const [freelancer, setFreelancer] = useState<FreelancerInfo | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    fetch(`/api/admin/freelancers/${freelancerId}/earnings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) { router.push('/admin/dashboard/freelancers'); return; }
        const data = await res.json();
        setFreelancer(data.freelancer);
        setLeads(data.leads || []);
      })
      .catch(() => router.push('/admin/dashboard/freelancers'))
      .finally(() => setLoading(false));
  }, [freelancerId, router]);

  // Build date-wise summary from converted leads
  const dateSummary = useMemo<DaySummary[]>(() => {
    const converted = leads.filter(l => l.status === 'converted');
    const map: Record<string, DaySummary> = {};

    for (const lead of converted) {
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      const dateKey = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!map[dateKey]) {
        map[dateKey] = { date: display, dateKey, dayAdmissions: 0, hostelAdmissions: 0, dayEarning: 0, hostelEarning: 0, total: 0 };
      }
      const earning = lead.computedEarnings ?? lead.earnings ?? 0;
      if (isHostelType(lead.schoolType)) {
        map[dateKey].hostelAdmissions += 1;
        map[dateKey].hostelEarning += earning;
      } else {
        map[dateKey].dayAdmissions += 1;
        map[dateKey].dayEarning += earning;
      }
      map[dateKey].total += earning;
    }

    return Object.values(map).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [leads]);

  const summaryTotals = useMemo(() => ({
    dayAdmissions: dateSummary.reduce((s, r) => s + r.dayAdmissions, 0),
    hostelAdmissions: dateSummary.reduce((s, r) => s + r.hostelAdmissions, 0),
    dayEarning: dateSummary.reduce((s, r) => s + r.dayEarning, 0),
    hostelEarning: dateSummary.reduce((s, r) => s + r.hostelEarning, 0),
    total: dateSummary.reduce((s, r) => s + r.total, 0),
  }), [dateSummary]);

  const convertedCount = leads.filter(l => l.status === 'converted').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!freelancer) return null;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard/freelancers')} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Freelancer Earnings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Conversion summary for {freelancer.name}</p>
        </div>
      </div>

      {/* Freelancer info card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{freelancer.name}</p>
                <p className="text-xs text-slate-500">{freelancer.email}</p>
              </div>
            </div>
            {freelancer.phone && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {freelancer.phone}
              </div>
            )}
            {freelancer.city && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                {freelancer.city}
              </div>
            )}
            <div className="ml-auto flex gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">Total Leads</p>
                <p className="text-xl font-bold text-slate-800">{freelancer.totalLeads}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Converted</p>
                <p className="text-xl font-bold text-emerald-600">{convertedCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Earned</p>
                <p className="text-xl font-bold text-slate-800">₹{summaryTotals.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Day School Earnings', value: summaryTotals.dayEarning, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Hostel School Earnings', value: summaryTotals.hostelEarning, icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Earnings', value: summaryTotals.total, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">₹{item.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Date-wise conversion summary */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Date-wise Lead Conversion Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dateSummary.length === 0 ? (
            <div className="p-10 text-center">
              <Wallet className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No converted leads yet</p>
              <p className="text-xs text-slate-400 mt-1">Converted leads will appear here grouped by date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5 justify-center"><Building2 className="w-3.5 h-3.5 text-blue-500" />Day School Admissions</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5 justify-center"><Home className="w-3.5 h-3.5 text-purple-500" />Hostel Admissions</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-blue-500" />Day School Earning</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-purple-500" />Hostel School Earning</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-emerald-600" />Total Earning</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dateSummary.map((row) => (
                    <tr key={row.dateKey} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-slate-700 font-medium text-xs whitespace-nowrap">{row.date}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.dayAdmissions > 0 ? (
                          <span className="inline-block min-w-[2rem] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                            {row.dayAdmissions}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.hostelAdmissions > 0 ? (
                          <span className="inline-block min-w-[2rem] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs">
                            {row.hostelAdmissions}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.dayEarning > 0 ? (
                          <span className="font-semibold text-blue-700 text-xs whitespace-nowrap">₹{row.dayEarning.toLocaleString()}</span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.hostelEarning > 0 ? (
                          <span className="font-semibold text-purple-700 text-xs whitespace-nowrap">₹{row.hostelEarning.toLocaleString()}</span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-emerald-700 text-xs whitespace-nowrap">₹{row.total.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => router.push(`/admin/dashboard/freelancers/${freelancerId}/earning/${row.dateKey}`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                    <td className="px-4 py-3 font-bold text-slate-700 text-xs">Total</td>
                    <td className="px-4 py-3 text-center"><span className="font-bold text-blue-700 text-xs">{summaryTotals.dayAdmissions}</span></td>
                    <td className="px-4 py-3 text-center"><span className="font-bold text-purple-700 text-xs">{summaryTotals.hostelAdmissions}</span></td>
                    <td className="px-4 py-3 text-right"><span className="font-bold text-blue-700 text-xs">₹{summaryTotals.dayEarning.toLocaleString()}</span></td>
                    <td className="px-4 py-3 text-right"><span className="font-bold text-purple-700 text-xs">₹{summaryTotals.hostelEarning.toLocaleString()}</span></td>
                    <td className="px-4 py-3 text-right"><span className="font-bold text-emerald-700 text-sm">₹{summaryTotals.total.toLocaleString()}</span></td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
