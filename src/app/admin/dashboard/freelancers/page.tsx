'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, Users, TrendingUp, IndianRupee, RefreshCw,
  PlusCircle, Briefcase, ShieldCheck, ShieldOff, CheckCircle2, Eye, EyeOff, Settings2, Percent, CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';

interface FreelancerRecord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  referralCode: string;
  referredBy?: string;
  status: 'active' | 'inactive';
  totalLeads: number;
  totalEarnings: number;
  totalPaid: number;
  createdAt: string;
  leadCounts?: { new: number; contacted: number; converted: number; rejected: number };
}

interface Stats {
  total: number;
  totalActive: number;
  totalLeads: number;
  totalEarnings: number;
}

interface CommissionSettings {
  pmsCommissionPercent?: number;
  freelancerCommissionPercent?: number;
  effectiveFrom?: string;
}

const INIT_FORM = { name: '', email: '', password: '', phone: '', city: '' };
const INIT_COMMISSION: CommissionSettings = { pmsCommissionPercent: undefined, freelancerCommissionPercent: undefined, effectiveFrom: '' };

export default function AdminFreelancersPage() {
  const router = useRouter();
  const [freelancers, setFreelancers] = useState<FreelancerRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, totalActive: 0, totalLeads: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(INIT_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Payment state
  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({});
  const [payingId, setPayingId] = useState<string | null>(null);

  // Commission settings state
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>(INIT_COMMISSION);
  const [commissionForm, setCommissionForm] = useState<CommissionSettings>(INIT_COMMISSION);
  const [savingCommission, setSavingCommission] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    loadFreelancers();
    loadCommissionSettings();
  }, []);

  const loadFreelancers = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/freelancers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFreelancers(data.freelancers);
        setStats(data.stats);
      } else {
        toast.error('Failed to load freelancers');
      }
    } catch {
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (f: FreelancerRecord) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setUpdatingId(f._id);
    const newStatus = f.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch('/api/admin/freelancers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ freelancerId: f._id, status: newStatus }),
      });
      if (res.ok) {
        setFreelancers(prev => prev.map(item => item._id === f._id ? { ...item, status: newStatus } : item));
        setStats(prev => ({
          ...prev,
          totalActive: newStatus === 'active' ? prev.totalActive + 1 : prev.totalActive - 1,
        }));
        toast.success(`Freelancer ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePayment = async (freelancerId: string, action: 'pay-now' | 'manual') => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    const amount = action === 'manual' ? Number(manualAmounts[freelancerId] || '0') : undefined;
    if (action === 'manual' && (!amount || amount <= 0)) {
      toast.error('Please enter a valid amount');
      return;
    }
    setPayingId(freelancerId);
    try {
      const res = await fetch(`/api/admin/freelancers/${freelancerId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setFreelancers(prev => prev.map(f =>
          f._id === freelancerId
            ? { ...f, totalPaid: data.totalPaid }
            : f
        ));
        if (action === 'manual') {
          setManualAmounts(prev => ({ ...prev, [freelancerId]: '' }));
        }
        toast.success(action === 'pay-now' ? 'Payment recorded successfully!' : 'Manual adjustment saved!');
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch {
      toast.error('Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const createFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/freelancers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Freelancer "${form.name}" created successfully!`);
        setShowAddModal(false);
        setForm(INIT_FORM);
        loadFreelancers();
      } else {
        toast.error(data.error || 'Failed to create freelancer');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const loadCommissionSettings = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/settings/commission', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.commissionSettings) {
          setCommissionSettings(data.commissionSettings);
        }
      }
    } catch {
      // silently ignore
    }
  };

  const saveCommissionSettings = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    if (commissionForm.pmsCommissionPercent === undefined && commissionForm.freelancerCommissionPercent === undefined) {
      toast.error('Please enter at least one commission percentage');
      return;
    }
    setSavingCommission(true);
    try {
      const res = await fetch('/api/admin/settings/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(commissionForm),
      });
      const data = await res.json();
      if (res.ok) {
        setCommissionSettings(data.commissionSettings);
        toast.success('Commission settings saved successfully');
        setShowCommissionModal(false);
      } else {
        toast.error(data.error || 'Failed to save commission settings');
      }
    } catch {
      toast.error('Failed to save commission settings');
    } finally {
      setSavingCommission(false);
    }
  };

  const openCommissionModal = () => {
    setCommissionForm({ ...commissionSettings });
    setShowCommissionModal(true);
  };

  const filtered = freelancers.filter(f => {
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      f.name?.toLowerCase().includes(term) ||
      f.email?.toLowerCase().includes(term) ||
      f.city?.toLowerCase().includes(term) ||
      f.phone?.includes(term) ||
      f.referralCode?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading freelancers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Freelancers</h1>
          <p className="text-slate-600">Manage freelancer accounts and track their performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadFreelancers} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={openCommissionModal}
            className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
          >
            <Settings2 className="w-4 h-4" />
            Commission Settings
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2 text-white" style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}>
            <PlusCircle className="w-4 h-4" />
            Add Freelancer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Freelancers', value: stats.total, icon: Users, bg: 'bg-cyan-50', color: 'text-cyan-600' },
          { label: 'Active', value: stats.totalActive, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Total Leads', value: stats.totalLeads, icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: IndianRupee, bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, city, phone or referral code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                statusFilter === s ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-400'
              }`}
              style={statusFilter === s ? { background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' } : {}}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-500 flex items-center">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                <TableHead className="font-semibold text-slate-700">City</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Leads</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Contacted</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Converted</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Rejected</TableHead>
                <TableHead className="font-semibold text-slate-700">Total Earning</TableHead>
                <TableHead className="font-semibold text-slate-700">Paid</TableHead>
                <TableHead className="font-semibold text-slate-700">Balance</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Pay Now</TableHead>
                <TableHead className="font-semibold text-slate-700">Paid (Manual Adj)</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                <TableHead className="font-semibold text-slate-700">Earning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="text-center py-12 text-slate-500">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    No freelancers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(f => (
                  <TableRow
                    key={f._id}
                    className={`transition-colors ${f.status === 'inactive' ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50'}`}
                  >
                    <TableCell className="font-medium text-slate-800">{f.name}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{f.phone || <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{f.city || <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block min-w-[2rem] text-center font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-sm">{(f.leadCounts?.new ?? 0) + (f.leadCounts?.contacted ?? 0)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block min-w-[2rem] text-center font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-sm">{f.leadCounts?.contacted ?? 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block min-w-[2rem] text-center font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-sm">{f.leadCounts?.converted ?? 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block min-w-[2rem] text-center font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded text-sm">{f.leadCounts?.rejected ?? 0}</span>
                    </TableCell>
                    <TableCell className="text-slate-800 font-medium whitespace-nowrap">
                      ₹{(f.totalEarnings || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-semibold text-blue-700">₹{(f.totalPaid || 0).toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {(() => {
                        const bal = Math.max(0, (f.totalEarnings || 0) - (f.totalPaid || 0));
                        return (
                          <span className={`font-semibold ${bal > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                            ₹{bal.toLocaleString()}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const bal = Math.max(0, (f.totalEarnings || 0) - (f.totalPaid || 0));
                        return (
                          <button
                            onClick={() => handlePayment(f._id, 'pay-now')}
                            disabled={bal <= 0 || payingId === f._id}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors whitespace-nowrap border
                              ${bal > 0
                                ? 'text-white bg-emerald-600 hover:bg-emerald-700 border-emerald-700'
                                : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed'
                              }
                            `}
                          >
                            {payingId === f._id ? (
                              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <IndianRupee className="w-3.5 h-3.5" />
                            )}
                            Pay Now
                          </button>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 min-w-[160px]">
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="Amount"
                            value={manualAmounts[f._id] || ''}
                            onChange={e => setManualAmounts(prev => ({ ...prev, [f._id]: e.target.value }))}
                            className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => handlePayment(f._id, 'manual')}
                          disabled={!manualAmounts[f._id] || payingId === f._id}
                          className="flex-shrink-0 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap"
                        >
                          Save
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {f.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-teal-600 text-sm font-medium">
                          <ShieldCheck className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-sm font-medium">
                          <ShieldOff className="w-4 h-4" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={f.status === 'active' ? 'destructive' : 'default'}
                        disabled={updatingId === f._id}
                        onClick={() => toggleStatus(f)}
                        className="text-xs h-7 px-3"
                      >
                        {f.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/dashboard/freelancers/${f._id}/earning`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
                      >
                        View Earning
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Commission Settings Modal */}
      <Dialog open={showCommissionModal} onOpenChange={setShowCommissionModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Settings2 className="w-5 h-5 text-violet-600" />
              Commission Settings
            </DialogTitle>
          </DialogHeader>

          {/* Current active settings badge */}
          {(commissionSettings.pmsCommissionPercent !== undefined || commissionSettings.freelancerCommissionPercent !== undefined) && (
            <div className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3 text-xs text-violet-700 space-y-1">
              <p className="font-semibold mb-1">Currently Active</p>
              {commissionSettings.pmsCommissionPercent !== undefined && (
                <p>PMS Com: <span className="font-bold">{commissionSettings.pmsCommissionPercent}%</span></p>
              )}
              {commissionSettings.freelancerCommissionPercent !== undefined && (
                <p>Freelancer Com: <span className="font-bold">{commissionSettings.freelancerCommissionPercent}%</span></p>
              )}
              {commissionSettings.effectiveFrom && (
                <p className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Effective from: <span className="font-bold">{new Date(commissionSettings.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-violet-500" />
                PMS Commission %
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 10"
                  value={commissionForm.pmsCommissionPercent ?? ''}
                  onChange={e =>
                    setCommissionForm(f => ({
                      ...f,
                      pmsCommissionPercent: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    }))
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-violet-500" />
                Freelancer Commission %
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 5"
                  value={commissionForm.freelancerCommissionPercent ?? ''}
                  onChange={e =>
                    setCommissionForm(f => ({
                      ...f,
                      freelancerCommissionPercent: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    }))
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-violet-500" />
                Effective From
              </label>
              <Input
                type="date"
                value={commissionForm.effectiveFrom ?? ''}
                onChange={e => setCommissionForm(f => ({ ...f, effectiveFrom: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCommissionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveCommissionSettings}
              disabled={savingCommission}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {savingCommission ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Freelancer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-600" />
              Add New Freelancer
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={createFreelancer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Full Name *</label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email Address *</label>
              <Input
                type="email"
                placeholder="freelancer@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Set a password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">City</label>
                <Input
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">A unique referral code will be auto-generated for this freelancer.</p>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setForm(INIT_FORM); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="text-white" style={{ background: 'linear-gradient(135deg, #04d3d3 0%, #03a9a9 100%)' }}>
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : 'Create Freelancer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
