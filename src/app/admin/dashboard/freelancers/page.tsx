'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  PlusCircle, Briefcase, ShieldCheck, ShieldOff, CheckCircle2, Eye, EyeOff,
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
  createdAt: string;
}

interface Stats {
  total: number;
  totalActive: number;
  totalLeads: number;
  totalEarnings: number;
}

const INIT_FORM = { name: '', email: '', password: '', phone: '', city: '' };

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

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    loadFreelancers();
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
                <TableHead className="font-semibold text-slate-700">Email</TableHead>
                <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                <TableHead className="font-semibold text-slate-700">City</TableHead>
                <TableHead className="font-semibold text-slate-700">Referral Code</TableHead>
                <TableHead className="font-semibold text-slate-700">Leads</TableHead>
                <TableHead className="font-semibold text-slate-700">Earnings</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-500">
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
                    <TableCell className="text-slate-600 text-sm">{f.email}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{f.phone || <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{f.city || <span className="text-slate-400">—</span>}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold tracking-widest">
                        {f.referralCode}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-800 font-medium">{f.totalLeads}</TableCell>
                    <TableCell className="text-slate-800 font-medium">₹{(f.totalEarnings || 0).toLocaleString()}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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
