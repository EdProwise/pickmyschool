'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListChecks, Phone, MapPin, GraduationCap, School } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Lead {
  _id: string; parentName: string; studentName: string; phone: string;
  city: string; grade: string; schoolInterested?: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  earnings: number; notes?: string; createdAt: string;
}
const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-blue-100 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700 border-green-200' },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200' },
};

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Track Leads</h2>
        <p className="text-slate-500 mt-1">Monitor the status of all your submitted leads</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'contacted', 'converted', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
            }`}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            <span className="ml-1.5 opacity-70">
              ({s === 'all' ? leads.length : leads.filter(l => l.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-10 text-center">
            <ListChecks className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No leads found</p>
            <p className="text-sm text-slate-400 mt-1">
              {filter === 'all' ? 'Start by generating your first lead' : `No ${filter} leads`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <Card key={lead._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{lead.studentName}</span>
                      <span className="text-slate-400 text-sm">·</span>
                      <span className="text-slate-500 text-sm">{lead.parentName}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{lead.city}</span>
                      <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{lead.grade}</span>
                      {lead.schoolInterested && <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" />{lead.schoolInterested}</span>}
                    </div>
                    {lead.notes && <p className="text-xs text-slate-400 mt-1.5 italic">{lead.notes}</p>}
                    <p className="text-xs text-slate-400 mt-1.5">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CONFIG[lead.status].color}`}>
                      {STATUS_CONFIG[lead.status].label}
                    </span>
                    {lead.earnings > 0 && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        ₹{lead.earnings}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
