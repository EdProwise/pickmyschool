'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle2, Clock, IndianRupee, Wallet, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FreelancerData {
  _id: string; id: string; name: string; email: string;
  totalLeads: number; totalEarnings: number;
}
interface Lead {
  _id: string; parentName: string; studentName: string;
  city: string; status: 'new' | 'contacted' | 'converted' | 'rejected';
  schoolInterested?: string; computedEarnings?: number | null;
}
const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-blue-100 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700 border-green-200' },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200' },
};

interface SchoolStat {
  school: string;
  total: number;
  converted: number;
  conversionPct: number;
  earning: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('freelancer_token');
    if (!token) { router.push('/freelancer/login'); return; }

    Promise.all([
      fetch('/api/freelancer/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/freelancer/leads',   { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/freelancer/earnings', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([meRes, leadsRes, earningsRes]) => {
      if (!meRes.ok) { router.push('/freelancer/login'); return; }
      const meData = await meRes.json();
      const leadsData = leadsRes.ok ? await leadsRes.json() : { leads: [] };
      const earningsData = earningsRes.ok ? await earningsRes.json() : { totalPaid: 0 };
      const f = { ...meData.freelancer, id: meData.freelancer._id };
      setFreelancer(f);
      setLeads(leadsData.leads || []);
      setTotalPaid(earningsData.totalPaid || 0);
      localStorage.setItem('freelancer_data', JSON.stringify(f));
    }).catch(() => router.push('/freelancer/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!freelancer) return null;

  const totalConverted = leads.filter(l => l.status === 'converted').length;
  const totalPending   = leads.filter(l => l.status === 'new' || l.status === 'contacted').length;
  const totalEarnings  = leads
    .filter(l => l.status === 'converted')
    .reduce((sum, l) => sum + (l.computedEarnings ?? 0), 0);
  const balance        = Math.max(0, totalEarnings - totalPaid);

  // School-wise stats
  const schoolMap: Record<string, SchoolStat> = {};
  for (const lead of leads) {
    const school = lead.schoolInterested?.trim() || '(No School)';
    if (!schoolMap[school]) {
      schoolMap[school] = { school, total: 0, converted: 0, conversionPct: 0, earning: 0 };
    }
    schoolMap[school].total += 1;
    if (lead.status === 'converted') {
      schoolMap[school].converted += 1;
      schoolMap[school].earning += lead.computedEarnings ?? 0;
    }
  }
  const schoolStats: SchoolStat[] = Object.values(schoolMap)
    .map(s => ({ ...s, conversionPct: s.total > 0 ? Math.round((s.converted / s.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total);

  const kpis = [
    { title: 'Total Leads',    value: freelancer.totalLeads,                        icon: Users,        bg: 'bg-blue-50',    color: 'text-blue-600',    border: 'border-blue-100' },
    { title: 'Converted',      value: totalConverted,                               icon: CheckCircle2, bg: 'bg-green-50',   color: 'text-green-600',   border: 'border-green-100' },
    { title: 'Pending Leads',  value: totalPending,                                 icon: Clock,        bg: 'bg-purple-50',  color: 'text-purple-600',  border: 'border-purple-100' },
    { title: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`,  icon: IndianRupee,  bg: 'bg-amber-50',   color: 'text-amber-600',   border: 'border-amber-100' },
    { title: 'Total Paid',     value: `₹${totalPaid.toLocaleString('en-IN')}`,      icon: Wallet,       bg: 'bg-teal-50',    color: 'text-teal-600',    border: 'border-teal-100' },
    { title: 'Balance Amount', value: `₹${balance.toLocaleString('en-IN')}`,        icon: TrendingUp,   bg: 'bg-rose-50',    color: 'text-rose-600',    border: 'border-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back, {freelancer.name}! 👋</h2>
        <p className="text-slate-500 mt-1">Here&apos;s your performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className={`border shadow-sm hover:shadow-md transition-shadow ${kpi.border}`}>
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-xs text-slate-500 leading-tight">{kpi.title}</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* School-wise Performance Table */}
      {schoolStats.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              School-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">School</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Converted</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion %</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Earning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schoolStats.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{s.school}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">{s.total}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50 text-green-700 font-bold text-xs">{s.converted}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs font-semibold ${s.conversionPct >= 50 ? 'text-emerald-600' : s.conversionPct > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {s.conversionPct}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.conversionPct >= 50 ? 'bg-emerald-500' : s.conversionPct > 0 ? 'bg-amber-400' : 'bg-slate-200'}`}
                              style={{ width: `${s.conversionPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {s.earning > 0 ? `₹${s.earning.toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Leads */}
      {leads.length > 0 ? (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.slice(0, 5).map(lead => (
                <div key={lead._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{lead.studentName}</p>
                    <p className="text-xs text-slate-500">{lead.parentName} · {lead.city}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CONFIG[lead.status].color}`}>
                    {STATUS_CONFIG[lead.status].label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md border-dashed border-2 border-slate-200 bg-slate-50">
          <CardContent className="p-10 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No leads yet</p>
            <p className="text-sm text-slate-400 mt-1">Start generating leads to see your stats here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
