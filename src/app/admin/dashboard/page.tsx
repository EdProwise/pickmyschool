'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Briefcase, MapPin, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalSchools: number;
  totalStudents: number;
  totalFreelancers: number;
  stateStats: { state: string; count: number }[];
  topFreelancers: { name: string; total: number; converted: number; conversionPct: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalFreelancers: 0,
    stateStats: [],
    topFreelancers: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { title: 'Total Schools',     value: stats.totalSchools,     icon: Building2,  bg: 'bg-blue-50',    color: 'text-blue-600',    border: 'border-blue-100' },
    { title: 'Total Students',    value: stats.totalStudents,    icon: Users,       bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' },
    { title: 'Total Freelancers', value: stats.totalFreelancers, icon: Briefcase,   bg: 'bg-purple-50',  color: 'text-purple-600',  border: 'border-purple-100' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Dashboard</h1>
        <p className="text-slate-500">Overview of your platform statistics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className={`border shadow-lg hover:shadow-xl transition-all duration-300 ${kpi.border}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                    <h3 className="text-4xl font-bold text-slate-800">{kpi.value.toLocaleString()}</h3>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two tables side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* State-wise Schools */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              Schools by State
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.stateStats.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">State</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Schools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.stateStats.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-400 text-xs font-medium">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-slate-800">{s.state}</td>
                        <td className="px-5 py-3 text-right">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold text-xs border border-cyan-100">
                            {s.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 10 Freelancers */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Top 10 Freelancers (by Conversion %)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.topFreelancers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Converted</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Conv %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats.topFreelancers.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          {i < 3 ? (
                            <span className="text-sm">{['🥇', '🥈', '🥉'][i]}</span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">{i + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[120px] truncate">{f.name}</td>
                        <td className="px-4 py-3 text-center text-slate-600 font-medium">{f.total}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-700 font-bold text-xs">{f.converted}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs font-bold ${f.conversionPct >= 50 ? 'text-emerald-600' : f.conversionPct >= 25 ? 'text-amber-600' : 'text-slate-500'}`}>
                              {f.conversionPct}%
                            </span>
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${f.conversionPct >= 50 ? 'bg-emerald-500' : f.conversionPct >= 25 ? 'bg-amber-400' : 'bg-slate-300'}`}
                                style={{ width: `${f.conversionPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
