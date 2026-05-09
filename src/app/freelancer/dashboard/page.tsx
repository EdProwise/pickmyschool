'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard, PlusCircle, ListChecks, Wallet, Gift, Settings, LogOut,
  Briefcase, TrendingUp, Users, CheckCircle2, Clock, XCircle, Copy, Check,
  IndianRupee, Phone, Mail, MapPin, GraduationCap, School, FileText,
  User, Lock, CreditCard, Menu, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FreelancerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  referralCode: string;
  totalLeads: number;
  totalEarnings: number;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
}

interface Lead {
  _id: string;
  parentName: string;
  studentName: string;
  phone: string;
  email?: string;
  city: string;
  grade: string;
  schoolInterested?: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  earnings: number;
  notes?: string;
  createdAt: string;
}

interface Earning {
  _id: string;
  amount: number;
  type: string;
  status: 'pending' | 'paid';
  description?: string;
  createdAt: string;
  leadId?: { parentName: string; studentName: string; schoolInterested?: string };
}

type TabId = 'dashboard' | 'generate-lead' | 'track-lead' | 'earning' | 'refer-earn' | 'settings';

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'generate-lead', label: 'Generate Lead', icon: PlusCircle },
  { id: 'track-lead', label: 'Track Lead', icon: ListChecks },
  { id: 'earning', label: 'Earning', icon: Wallet },
  { id: 'refer-earn', label: 'Refer & Earn Policy', icon: Gift },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
};

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ freelancer, leads }: { freelancer: FreelancerData; leads: Lead[] }) {
  const totalConverted = leads.filter(l => l.status === 'converted').length;
  const totalNew = leads.filter(l => l.status === 'new').length;
  const totalContacted = leads.filter(l => l.status === 'contacted').length;

  const kpis = [
    { title: 'Total Leads', value: freelancer.totalLeads, icon: Users, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'Converted', value: totalConverted, icon: CheckCircle2, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', iconColor: 'text-green-600' },
    { title: 'Total Earnings', value: `₹${freelancer.totalEarnings.toLocaleString()}`, icon: IndianRupee, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { title: 'Pending Leads', value: totalNew + totalContacted, icon: Clock, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
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
                  <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                </div>
                <p className="text-sm text-slate-500">{kpi.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {leads.length > 0 && (
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
      )}

      {leads.length === 0 && (
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

// ─── Generate Lead Tab ────────────────────────────────────────────────────────
function GenerateLeadTab({ token, onLeadAdded }: { token: string; onLeadAdded: () => void }) {
  const [form, setForm] = useState({
    parentName: '', studentName: '', phone: '', email: '',
    city: '', grade: '', schoolInterested: '', notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/freelancer/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to submit lead'); return; }
      toast.success('Lead submitted successfully!');
      setForm({ parentName: '', studentName: '', phone: '', email: '', city: '', grade: '', schoolInterested: '', notes: '' });
      onLeadAdded();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Generate Lead</h2>
        <p className="text-slate-500 mt-1">Submit a new student enquiry lead</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Parent Name *
                </label>
                <Input name="parentName" placeholder="e.g. Rahul Sharma" value={form.parentName} onChange={handleChange} required className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Student Name *
                </label>
                <Input name="studentName" placeholder="e.g. Aryan Sharma" value={form.studentName} onChange={handleChange} required className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> Phone Number *
                </label>
                <Input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} required className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <Input name="email" type="email" placeholder="parent@example.com" value={form.email} onChange={handleChange} className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> City *
                </label>
                <Input name="city" placeholder="e.g. Mumbai" value={form.city} onChange={handleChange} required className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> Grade / Class *
                </label>
                <select
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select grade</option>
                  {['Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <School className="w-4 h-4" /> School Interested In
              </label>
              <Input name="schoolInterested" placeholder="e.g. DPS Mumbai, Ryan International..." value={form.schoolInterested} onChange={handleChange} className="h-11" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Additional Notes
              </label>
              <textarea
                name="notes"
                placeholder="Any additional information about the lead..."
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Submit Lead
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Track Lead Tab ───────────────────────────────────────────────────────────
function TrackLeadTab({ leads, isLoading }: { leads: Lead[]; isLoading: boolean }) {
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'converted' | 'rejected'>('all');

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Track Leads</h2>
        <p className="text-slate-500 mt-1">Monitor the status of all your submitted leads</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'contacted', 'converted', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === s
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
            }`}
          >
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
                    <p className="text-xs text-slate-400 mt-1.5">{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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

// ─── Earning Tab ──────────────────────────────────────────────────────────────
function EarningTab({ token, freelancer }: { token: string; freelancer: FreelancerData }) {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch('/api/freelancer/earnings', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setEarnings(data.earnings);
          setTotalPaid(data.totalPaid);
          setTotalPending(data.totalPending);
        }
      } catch { /* empty */ }
      finally { setIsLoading(false); }
    };
    fetchEarnings();
  }, [token]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Earnings</h2>
        <p className="text-slate-500 mt-1">Track your commissions and payouts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: freelancer.totalEarnings, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Paid Out', value: totalPaid, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: totalPending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
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
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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

// ─── Refer & Earn Tab ─────────────────────────────────────────────────────────
function ReferEarnTab({ freelancer }: { freelancer: FreelancerData }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/freelancer/register?ref=${freelancer.referralCode}`;

  const copyCode = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const policy = [
    {
      title: 'How It Works',
      icon: Gift,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      items: [
        'Share your unique referral code or link with potential freelancers',
        'When they register using your code, they become your referral',
        'Earn a bonus every time your referred freelancer converts a lead',
        'Track all referral earnings in your Earnings dashboard',
      ],
    },
    {
      title: 'Commission Structure',
      icon: IndianRupee,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: [
        'Lead Commission: ₹500 per successfully converted lead',
        'Referral Bonus: ₹200 for each lead converted by your referred freelancers',
        'Performance Bonus: Extra ₹1000 on achieving 10+ conversions in a month',
        'All payments are processed within 7 business days of conversion',
      ],
    },
    {
      title: 'Eligibility & Rules',
      icon: CheckCircle2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      items: [
        'Your account must be active and in good standing',
        'Leads must be genuine and result in a valid school admission enquiry',
        'Self-referrals or fake accounts are strictly prohibited',
        'PickMySchool reserves the right to verify all conversions before payout',
        'Minimum payout threshold: ₹500',
      ],
    },
    {
      title: 'Payment Process',
      icon: CreditCard,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      items: [
        'Add your bank details or UPI ID in the Settings tab',
        'Earnings are calculated at the end of each month',
        'Payments are transferred within 7 working days',
        'You will receive a payment confirmation notification',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Refer & Earn Policy</h2>
        <p className="text-slate-500 mt-1">Invite other freelancers and earn extra income</p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Your Referral Code</p>
              <p className="text-sm text-emerald-100">Share this with other freelancers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono font-bold text-xl tracking-widest">
              {freelancer.referralCode}
            </div>
            <button
              onClick={() => copyCode(freelancer.referralCode)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={() => copyCode(referralLink)}
            className="mt-3 w-full text-sm bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg py-2 transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> Copy Referral Link
          </button>
        </CardContent>
      </Card>

      {/* Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policy.map((section, i) => {
          const Icon = section.icon;
          return (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-800">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ token, freelancer, onUpdate }: { token: string; freelancer: FreelancerData; onUpdate: () => void }) {
  const [profile, setProfile] = useState({ name: freelancer.name, phone: freelancer.phone || '', city: freelancer.city || '' });
  const [bankDetails, setBankDetails] = useState(freelancer.bankDetails || {});
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/freelancer/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (res.ok) { toast.success('Profile updated!'); onUpdate(); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to update'); }
    } catch { toast.error('Something went wrong'); }
    finally { setIsSavingProfile(false); }
  };

  const saveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      const res = await fetch('/api/freelancer/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bankDetails }),
      });
      if (res.ok) { toast.success('Bank details saved!'); onUpdate(); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to save'); }
    } catch { toast.error('Something went wrong'); }
    finally { setIsSavingBank(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your profile and account settings</p>
      </div>

      {/* Profile Settings */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-base font-semibold text-slate-800">Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <Input value={freelancer.email} disabled className="h-11 bg-slate-50 text-slate-400" />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input placeholder="9876543210" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">City</label>
                <Input placeholder="Mumbai" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} className="h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Referral Code</label>
              <div className="flex items-center gap-2">
                <Input value={freelancer.referralCode} disabled className="h-11 bg-slate-50 font-mono font-bold text-emerald-600" />
              </div>
            </div>
            <Button type="submit" disabled={isSavingProfile} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-base font-semibold text-slate-800">Bank / Payment Details</CardTitle>
          </div>
          <CardDescription>Required for receiving your earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveBankDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Account Holder Name</label>
                <Input
                  placeholder="Name as on bank account"
                  value={(bankDetails as Record<string, string>).accountName || ''}
                  onChange={e => setBankDetails((p: Record<string, string>) => ({ ...p, accountName: e.target.value }))}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Bank Name</label>
                <Input
                  placeholder="e.g. HDFC Bank"
                  value={(bankDetails as Record<string, string>).bankName || ''}
                  onChange={e => setBankDetails((p: Record<string, string>) => ({ ...p, bankName: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Account Number</label>
                <Input
                  placeholder="Enter account number"
                  value={(bankDetails as Record<string, string>).accountNumber || ''}
                  onChange={e => setBankDetails((p: Record<string, string>) => ({ ...p, accountNumber: e.target.value }))}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">IFSC Code</label>
                <Input
                  placeholder="e.g. HDFC0001234"
                  value={(bankDetails as Record<string, string>).ifscCode || ''}
                  onChange={e => setBankDetails((p: Record<string, string>) => ({ ...p, ifscCode: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">UPI ID (optional)</label>
              <Input
                placeholder="yourname@upi"
                value={(bankDetails as Record<string, string>).upiId || ''}
                onChange={e => setBankDetails((p: Record<string, string>) => ({ ...p, upiId: e.target.value }))}
                className="h-11"
              />
            </div>
            <Button type="submit" disabled={isSavingBank} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSavingBank ? 'Saving...' : 'Save Bank Details'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-500" />
            <CardTitle className="text-base font-semibold text-slate-800">Account Info</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Account Status</span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Member Since</span>
              <span className="font-medium text-slate-700">
                {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Total Leads Submitted</span>
              <span className="font-bold text-slate-800">{freelancer.totalLeads}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function FreelancerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState('');

  const fetchFreelancer = useCallback(async (t: string) => {
    try {
      const res = await fetch('/api/freelancer/auth/me', { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) { router.push('/freelancer/login'); return; }
      const data = await res.json();
      setFreelancer(data.freelancer);
    } catch {
      router.push('/freelancer/login');
    }
  }, [router]);

  const fetchLeads = useCallback(async (t: string) => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch('/api/freelancer/leads', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (res.ok) setLeads(data.leads);
    } catch { /* empty */ }
    finally { setIsLoadingLeads(false); }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('freelancer_token');
    if (!t) { router.push('/freelancer/login'); return; }
    setToken(t);
    fetchFreelancer(t);
    fetchLeads(t);
  }, [router, fetchFreelancer, fetchLeads]);

  const handleLogout = () => {
    localStorage.removeItem('freelancer_token');
    localStorage.removeItem('freelancer_data');
    toast.success('Logged out successfully');
    router.push('/freelancer/login');
  };

  if (!freelancer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab freelancer={freelancer} leads={leads} />;
      case 'generate-lead': return <GenerateLeadTab token={token} onLeadAdded={() => fetchLeads(token)} />;
      case 'track-lead': return <TrackLeadTab leads={leads} isLoading={isLoadingLeads} />;
      case 'earning': return <EarningTab token={token} freelancer={freelancer} />;
      case 'refer-earn': return <ReferEarnTab freelancer={freelancer} />;
      case 'settings': return <SettingsTab token={token} freelancer={freelancer} onUpdate={() => fetchFreelancer(token)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">PickMySchool</p>
              <p className="text-xs text-slate-500">Freelancer Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
              {freelancer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{freelancer.name}</p>
              <p className="text-xs text-slate-500 truncate">{freelancer.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} style={{ width: '1.125rem', height: '1.125rem' }} />
                {item.label}
                {item.id === 'track-lead' && leads.length > 0 && (
                  <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {leads.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>
            <div>
              <h1 className="font-semibold text-slate-800 text-sm">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
              <span className="text-xs text-slate-500">Balance:</span>
              <span className="text-sm font-bold text-emerald-700">₹{freelancer.totalEarnings.toLocaleString()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
