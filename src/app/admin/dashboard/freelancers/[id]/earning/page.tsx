'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  TrendingUp, Wallet, Calendar, Building2, Home,
  IndianRupee, ArrowLeft, User, Phone, MapPin, Eye,
  ClipboardList, ArrowDownToLine, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FreelancerInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  totalLeads: number;
  totalEarnings: number;
  status: string;
}

interface Lead {
  _id: string;
  schoolInterested?: string;
  schoolType?: string;
  status: string;
  computedEarnings?: number | null;
  earnings: number;
  studentName: string;
  parentName: string;
  createdAt: string;
  convertedAt?: string | null;
}

interface DaySummary {
  date: string;
  dateKey: string;
  dayAdmissions: number;
  hostelAdmissions: number;
  dayEarning: number;
  hostelEarning: number;
  total: number;
}

interface ConversionEntry {
  dateKey: string;
  date: string;
  students: number;
  schoolNames: string[];
  earned: number;
}

interface PaymentEntry {
  dateKey: string;
  date: string;
  amount: number;
  description: string;
}

interface LedgerRow {
  dateKey: string;
  date: string;
  particulars: string;
  earned: number;
  received: number;
  balance: number;
  type: 'conversion' | 'payment';
}

function isHostelType(schoolType?: string) {
  if (!schoolType) return false;
  const t = schoolType.toLowerCase();
  return t.includes('hostel') || t.includes('residential') || t.includes('boarding');
}

export default function AdminFreelancerEarningPage() {
  const router = useRouter();
  const params = useParams();
  const freelancerId = params.id as string;

  const [freelancer, setFreelancer] = useState<FreelancerInfo | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSOA, setShowSOA] = useState(false);
  const [soaConversions, setSoaConversions] = useState<ConversionEntry[]>([]);
  const [soaPayments, setSoaPayments] = useState<PaymentEntry[]>([]);
  const [soaLoading, setSoaLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    fetch(`/api/admin/freelancers/${freelancerId}/earnings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) { router.push('/admin/dashboard/freelancers'); return; }
        const data = await res.json();
        setFreelancer(data.freelancer);
        setLeads(data.leads || []);
      })
      .catch(() => router.push('/admin/dashboard/freelancers'))
      .finally(() => setLoading(false));
  }, [freelancerId, router]);

  const fetchSOA = async () => {
    setSoaLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/freelancers/${freelancerId}/statement`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSoaConversions(data.conversions || []);
      setSoaPayments(data.payments || []);
    } catch (e) {
      console.error('SOA fetch error:', e);
    } finally {
      setSoaLoading(false);
    }
  };

  const ledger = useMemo<LedgerRow[]>(() => {
    const rows: Omit<LedgerRow, 'balance'>[] = [
      ...soaConversions.map(c => ({
        dateKey: c.dateKey,
        date: c.date,
        particulars:
          `${c.students} Student${c.students !== 1 ? 's' : ''} Converted` +
          (c.schoolNames.length > 0 ? ` — ${c.schoolNames.slice(0, 3).join(', ')}${c.schoolNames.length > 3 ? ` +${c.schoolNames.length - 3} more` : ''}` : ''),
        earned: c.earned,
        received: 0,
        type: 'conversion' as const,
      })),
      ...soaPayments.map(p => ({
        dateKey: p.dateKey,
        date: p.date,
        particulars: p.description,
        earned: 0,
        received: p.amount,
        type: 'payment' as const,
      })),
    ].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    let balance = 0;
    const withBalance = rows.map(row => {
      balance += row.earned - row.received;
      return { ...row, balance };
    });
    return withBalance.reverse();
  }, [soaConversions, soaPayments]);

  const soaTotals = useMemo(() => ({
    earned: ledger.reduce((s, r) => s + r.earned, 0),
    received: ledger.reduce((s, r) => s + r.received, 0),
    balance: ledger.length > 0 ? ledger[0].balance : 0,
  }), [ledger]);

  // Build date-wise summary from converted leads
  const dateSummary = useMemo<DaySummary[]>(() => {
    const converted = leads.filter(l => l.status === 'converted');
    const map: Record<string, DaySummary> = {};

    for (const lead of converted) {
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      const dateKey = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!map[dateKey]) {
        map[dateKey] = { date: display, dateKey, dayAdmissions: 0, hostelAdmissions: 0, dayEarning: 0, hostelEarning: 0, total: 0 };
      }
      const earning = lead.computedEarnings ?? lead.earnings ?? 0;
      if (isHostelType(lead.schoolType)) {
        map[dateKey].hostelAdmissions += 1;
        map[dateKey].hostelEarning += earning;
      } else {
        map[dateKey].dayAdmissions += 1;
        map[dateKey].dayEarning += earning;
      }
      map[dateKey].total += earning;
    }

    return Object.values(map).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [leads]);

  const summaryTotals = useMemo(() => ({
    dayAdmissions: dateSummary.reduce((s, r) => s + r.dayAdmissions, 0),
    hostelAdmissions: dateSummary.reduce((s, r) => s + r.hostelAdmissions, 0),
    dayEarning: dateSummary.reduce((s, r) => s + r.dayEarning, 0),
    hostelEarning: dateSummary.reduce((s, r) => s + r.hostelEarning, 0),
    total: dateSummary.reduce((s, r) => s + r.total, 0),
  }), [dateSummary]);

  const convertedCount = leads.filter(l => l.status === 'converted').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!freelancer) return null;

  if (showSOA) {
    return (
      <div className="p-8 space-y-6">
        {/* SOA Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setShowSOA(false)} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Earnings
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Statement of Account</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Complete ledger for {freelancer.name}
              </p>
            </div>
          </div>
        </div>

        {soaLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Earned', value: soaTotals.earned, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Total Received', value: soaTotals.received, icon: ArrowDownToLine, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Closing Balance', value: soaTotals.balance, icon: Wallet, color: soaTotals.balance > 0 ? 'text-amber-600' : 'text-slate-500', bg: soaTotals.balance > 0 ? 'bg-amber-50' : 'bg-slate-50', border: soaTotals.balance > 0 ? 'border-amber-100' : 'border-slate-100' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={i} className={`border shadow-md ${item.border}`}>
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

            {/* Ledger table */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Statement of Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {ledger.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
                    <p className="text-xs text-slate-400 mt-1">Conversions and payments will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-300" />Date</span>
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold">Particulars</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold whitespace-nowrap">
                            <span className="flex items-center gap-1 justify-end"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" />Earned (₹)</span>
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold whitespace-nowrap">
                            <span className="flex items-center gap-1 justify-end"><ArrowDownToLine className="w-3.5 h-3.5 text-blue-400" />Received (₹)</span>
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-semibold whitespace-nowrap">
                            <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-amber-400" />Balance (₹)</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledger.map((row, idx) => (
                          <tr key={idx} className={`transition-colors ${row.type === 'payment' ? 'bg-blue-50/50 hover:bg-blue-50' : 'bg-white hover:bg-emerald-50/40'}`}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs font-semibold text-slate-600">{row.date}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-start gap-1.5 text-xs leading-snug ${row.type === 'payment' ? 'text-blue-800' : 'text-slate-700'}`}>
                                {row.type === 'conversion'
                                  ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  : <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />}
                                {row.particulars}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              {row.earned > 0
                                ? <span className="font-semibold text-emerald-700 text-xs">₹{row.earned.toLocaleString()}</span>
                                : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              {row.received > 0
                                ? <span className="font-semibold text-blue-700 text-xs">₹{row.received.toLocaleString()}</span>
                                : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <span className={`font-bold text-xs ${row.balance > 0 ? 'text-amber-700' : row.balance < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                ₹{row.balance.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-800 text-white border-t-2 border-slate-700">
                          <td className="px-4 py-3 font-bold text-xs text-slate-200">Closing Balance</td>
                          <td className="px-4 py-3" />
                          <td className="px-4 py-3 text-right"><span className="font-bold text-emerald-400 text-xs">₹{soaTotals.earned.toLocaleString()}</span></td>
                          <td className="px-4 py-3 text-right"><span className="font-bold text-blue-300 text-xs">₹{soaTotals.received.toLocaleString()}</span></td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold text-sm ${soaTotals.balance > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                              ₹{soaTotals.balance.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" />Earned — Commission from student conversions</span>
              <span className="flex items-center gap-1.5"><ArrowDownToLine className="w-3.5 h-3.5 text-blue-500" />Received — Payments made by admin</span>
              <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-amber-500" />Balance — Cumulative outstanding amount</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard/freelancers')} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Freelancer Earnings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Conversion summary for {freelancer.name}</p>
          </div>
        </div>
        <button
          onClick={() => { setShowSOA(true); fetchSOA(); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 text-sm font-medium transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          Statement of Account
        </button>
      </div>

      {/* Freelancer info card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{freelancer.name}</p>
                <p className="text-xs text-slate-500">{freelancer.email}</p>
              </div>
            </div>
            {freelancer.phone && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {freelancer.phone}
              </div>
            )}
            {freelancer.city && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                {freelancer.city}
              </div>
            )}
            <div className="ml-auto flex gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">Total Leads</p>
                <p className="text-xl font-bold text-slate-800">{freelancer.totalLeads}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Converted</p>
                <p className="text-xl font-bold text-emerald-600">{convertedCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Earned</p>
                <p className="text-xl font-bold text-slate-800">₹{summaryTotals.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Day School Earnings', value: summaryTotals.dayEarning, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Hostel School Earnings', value: summaryTotals.hostelEarning, icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Earnings', value: summaryTotals.total, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

      {/* Date-wise conversion summary */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Date-wise Lead Conversion Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dateSummary.length === 0 ? (
            <div className="p-10 text-center">
              <Wallet className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No converted leads yet</p>
              <p className="text-xs text-slate-400 mt-1">Converted leads will appear here grouped by date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5 justify-center"><Building2 className="w-3.5 h-3.5 text-blue-500" />Day School Admissions</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5 justify-center"><Home className="w-3.5 h-3.5 text-purple-500" />Hostel Admissions</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-blue-500" />Day School Earning</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-purple-500" />Hostel School Earning</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-emerald-600" />Total Earning</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dateSummary.map((row) => (
                    <tr key={row.dateKey} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-slate-700 font-medium text-xs whitespace-nowrap">{row.date}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.dayAdmissions > 0 ? (
                          <span className="inline-block min-w-[2rem] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                            {row.dayAdmissions}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.hostelAdmissions > 0 ? (
                          <span className="inline-block min-w-[2rem] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs">
                            {row.hostelAdmissions}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.dayEarning > 0 ? (
                          <span className="font-semibold text-blue-700 text-xs whitespace-nowrap">₹{row.dayEarning.toLocaleString()}</span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.hostelEarning > 0 ? (
                          <span className="font-semibold text-purple-700 text-xs whitespace-nowrap">₹{row.hostelEarning.toLocaleString()}</span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-emerald-700 text-xs whitespace-nowrap">₹{row.total.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => router.push(`/admin/dashboard/freelancers/${freelancerId}/earning/${row.dateKey}`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                    <td className="px-4 py-3 font-bold text-slate-700 text-xs">Total</td>
                    <td className="px-4 py-3 text-center"><span className="font-bold text-blue-700 text-xs">{summaryTotals.dayAdmissions}</span></td>
                    <td className="px-4 py-3 text-center"><span className="font-bold text-purple-700 text-xs">{summaryTotals.hostelAdmissions}</span></td>
                    <td className="px-4 py-3 text-right"><span className="font-bold text-blue-700 text-xs">₹{summaryTotals.dayEarning.toLocaleString()}</span></td>
                    <td className="px-4 py-3 text-right"><span className="font-bold text-purple-700 text-xs">₹{summaryTotals.hostelEarning.toLocaleString()}</span></td>
                    <td className="px-4 py-3 text-right"><span className="font-bold text-emerald-700 text-sm">₹{summaryTotals.total.toLocaleString()}</span></td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
