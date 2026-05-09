'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, CheckCircle2, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Earning {
  _id: string; amount: number; type: string; status: 'pending' | 'paid';
  description?: string; createdAt: string;
  leadId?: { studentName: string; schoolInterested?: string };
}

export default function EarningPage() {
  const router = useRouter();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('freelancer_token');
    if (!token) { router.push('/freelancer/login'); return; }

    Promise.all([
      fetch('/api/freelancer/auth/me',  { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/freelancer/earnings', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([meRes, earningsRes]) => {
      if (!meRes.ok) { router.push('/freelancer/login'); return; }
      const meData = await meRes.json();
      setTotalEarnings(meData.freelancer?.totalEarnings || 0);
      if (earningsRes.ok) {
        const data = await earningsRes.json();
        setEarnings(data.earnings || []);
        setTotalPaid(data.totalPaid || 0);
        setTotalPending(data.totalPending || 0);
      }
    }).catch(() => router.push('/freelancer/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Earnings</h2>
        <p className="text-slate-500 mt-1">Track your commissions and payouts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: totalEarnings, icon: TrendingUp,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Paid Out',     value: totalPaid,     icon: CheckCircle2, color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Pending',      value: totalPending,  icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50' },
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

      {earnings.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-10 text-center">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No earnings yet</p>
            <p className="text-sm text-slate-400 mt-1">Earnings appear when your leads are converted</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnings.map(e => (
                <div key={e._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800 text-sm capitalize">{e.type}</p>
                    <p className="text-xs text-slate-500">
                      {e.leadId ? `${e.leadId.studentName} · ${e.leadId.schoolInterested || 'N/A'}` : e.description || '—'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{e.amount.toLocaleString()}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${e.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {e.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
