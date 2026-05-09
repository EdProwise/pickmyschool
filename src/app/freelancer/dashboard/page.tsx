'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FreelancerData {
  _id: string; id: string; name: string; email: string;
  totalLeads: number; totalEarnings: number;
}
interface Lead {
  _id: string; parentName: string; studentName: string;
  city: string; status: 'new' | 'contacted' | 'converted' | 'rejected';
}
const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-blue-100 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700 border-green-200' },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('freelancer_token');
    if (!token) { router.push('/freelancer/login'); return; }

    Promise.all([
      fetch('/api/freelancer/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/freelancer/leads',   { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([meRes, leadsRes]) => {
      if (!meRes.ok) { router.push('/freelancer/login'); return; }
      const meData = await meRes.json();
      const leadsData = leadsRes.ok ? await leadsRes.json() : { leads: [] };
      const f = { ...meData.freelancer, id: meData.freelancer._id };
      setFreelancer(f);
      setLeads(leadsData.leads || []);
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

  const kpis = [
    { title: 'Total Leads',    value: freelancer.totalLeads,                           icon: Users,        bg: 'bg-blue-50',   color: 'text-blue-600' },
    { title: 'Converted',      value: totalConverted,                                  icon: CheckCircle2, bg: 'bg-green-50',  color: 'text-green-600' },
    { title: 'Total Earnings', value: `₹${freelancer.totalEarnings.toLocaleString()}`, icon: IndianRupee,  bg: 'bg-amber-50',  color: 'text-amber-600' },
    { title: 'Pending Leads',  value: totalPending,                                    icon: Clock,        bg: 'bg-purple-50', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back, {freelancer.name}! 👋</h2>
        <p className="text-slate-500 mt-1">Here&apos;s your performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <p className="text-sm text-slate-500">{kpi.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
