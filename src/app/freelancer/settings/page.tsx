'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FreelancerData {
  _id: string; name: string; email: string; phone?: string; city?: string;
  referralCode: string; totalLeads: number;
  bankDetails?: { accountName?: string; accountNumber?: string; ifscCode?: string; bankName?: string; upiId?: string; };
}

export default function SettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [profile, setProfile] = useState({ name: '', phone: '', city: '' });
  const [bank, setBank] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('freelancer_token');
    if (!t) { router.push('/freelancer/login'); return; }
    setToken(t);
    fetch('/api/freelancer/auth/me', { headers: { Authorization: `Bearer ${t}` } })
      .then(async res => {
        if (!res.ok) { router.push('/freelancer/login'); return; }
        const data = await res.json();
        const f = data.freelancer;
        setFreelancer(f);
        setProfile({ name: f.name || '', phone: f.phone || '', city: f.city || '' });
        setBank(f.bankDetails || {});
        localStorage.setItem('freelancer_data', JSON.stringify({ ...f, id: f._id }));
      })
      .catch(() => router.push('/freelancer/login'));
  }, [router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/freelancer/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        setFreelancer(data.freelancer);
        localStorage.setItem('freelancer_data', JSON.stringify({ ...data.freelancer, id: data.freelancer._id }));
        toast.success('Profile updated!');
      } else {
        const d = await res.json(); toast.error(d.error || 'Failed to update');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setSavingProfile(false); }
  };

  const saveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      const res = await fetch('/api/freelancer/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bankDetails: bank }),
      });
      if (res.ok) { toast.success('Bank details saved!'); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to save'); }
    } catch { toast.error('Something went wrong'); }
    finally { setSavingBank(false); }
  };

  if (!freelancer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your profile and account settings</p>
      </div>

      {/* Profile */}
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
              <Input value={freelancer.referralCode} disabled className="h-11 bg-slate-50 font-mono font-bold text-emerald-600" />
            </div>
            <Button type="submit" disabled={savingProfile} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {savingProfile ? 'Saving...' : 'Save Profile'}
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
          <form onSubmit={saveBank} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Account Holder Name</label>
                <Input placeholder="Name as on bank account" value={bank.accountName || ''} onChange={e => setBank(b => ({ ...b, accountName: e.target.value }))} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Bank Name</label>
                <Input placeholder="e.g. HDFC Bank" value={bank.bankName || ''} onChange={e => setBank(b => ({ ...b, bankName: e.target.value }))} className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Account Number</label>
                <Input placeholder="Enter account number" value={bank.accountNumber || ''} onChange={e => setBank(b => ({ ...b, accountNumber: e.target.value }))} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">IFSC Code</label>
                <Input placeholder="e.g. HDFC0001234" value={bank.ifscCode || ''} onChange={e => setBank(b => ({ ...b, ifscCode: e.target.value }))} className="h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">UPI ID (optional)</label>
              <Input placeholder="yourname@upi" value={bank.upiId || ''} onChange={e => setBank(b => ({ ...b, upiId: e.target.value }))} className="h-11" />
            </div>
            <Button type="submit" disabled={savingBank} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {savingBank ? 'Saving...' : 'Save Bank Details'}
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
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active
              </span>
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
