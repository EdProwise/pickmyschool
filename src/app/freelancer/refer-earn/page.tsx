'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, IndianRupee, CheckCircle2, CreditCard, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface FreelancerData { name: string; referralCode: string; }

const POLICY = [
  {
    title: 'How It Works', icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50',
    items: [
      'Share your unique referral code or link with potential freelancers',
      'When they register using your code, they become your referral',
      'Earn a bonus every time your referred freelancer converts a lead',
      'Track all referral earnings in your Earnings dashboard',
    ],
  },
  {
    title: 'Commission Structure', icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50',
    items: [
      'Lead Commission: ₹500 per successfully converted lead',
      'Referral Bonus: ₹200 for each lead converted by your referred freelancers',
      'Performance Bonus: Extra ₹1000 on achieving 10+ conversions in a month',
      'All payments are processed within 7 business days of conversion',
    ],
  },
  {
    title: 'Eligibility & Rules', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50',
    items: [
      'Your account must be active and in good standing',
      'Leads must be genuine and result in a valid school admission enquiry',
      'Self-referrals or fake accounts are strictly prohibited',
      'PickMySchool reserves the right to verify all conversions before payout',
      'Minimum payout threshold: ₹500',
    ],
  },
  {
    title: 'Payment Process', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50',
    items: [
      'Add your bank details or UPI ID in the Settings tab',
      'Earnings are calculated at the end of each month',
      'Payments are transferred within 7 working days',
      'You will receive a payment confirmation notification',
    ],
  },
];

export default function ReferEarnPage() {
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('freelancer_token');
    if (!token) { router.push('/freelancer/login'); return; }
    try {
      const d = JSON.parse(localStorage.getItem('freelancer_data') || '{}');
      if (d.referralCode) { setFreelancer({ name: d.name, referralCode: d.referralCode }); return; }
    } catch { /* empty */ }
    fetch('/api/freelancer/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) { router.push('/freelancer/login'); return; }
        const data = await res.json();
        setFreelancer({ name: data.freelancer.name, referralCode: data.freelancer.referralCode });
      })
      .catch(() => router.push('/freelancer/login'));
  }, [router]);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  if (!freelancer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/freelancer/register?ref=${freelancer.referralCode}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Refer & Earn Policy</h2>
        <p className="text-slate-500 mt-1">Invite other freelancers and earn extra income</p>
      </div>

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
            <button onClick={() => copy(freelancer.referralCode)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button onClick={() => copy(referralLink)}
            className="mt-3 w-full text-sm bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg py-2 transition-colors flex items-center justify-center gap-2">
            <Copy className="w-4 h-4" /> Copy Referral Link
          </button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POLICY.map((section, i) => {
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
