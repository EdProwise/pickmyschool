'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Building2, Home, IndianRupee, Eye,
  ArrowLeft, User, Phone, GraduationCap, Tag,
  FileText, CheckCircle2, RefreshCw, Receipt, Save, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PmsLead {
  _id: string;
  studentName: string;
  parentName: string;
  phone: string;
  grade: string;
  schoolInterested?: string;
  schoolType?: string;
  status: string;
  createdAt: string;
  convertedAt?: string | null;
}

interface CommissionRate {
  amount: number;
  effectiveFrom?: string;
}

interface DaySummary {
  date: string;
  dateKey: string;
  dayAdmissions: number;
  hostelAdmissions: number;
  dayCommission: number;
  hostelCommission: number;
  totalExclTax: number;
  gst: number;
  totalInvoice: number;
}

interface Payment {
  _id: string;
  amount: number;
  receivedDate: string;
}

function isHostelType(schoolType?: string) {
  if (!schoolType) return false;
  const t = schoolType.toLowerCase();
  return t.includes('hostel') || t.includes('residential') || t.includes('boarding');
}

function calcInvoice(exclTax: number) {
  const gst = Math.round(exclTax * 0.18 * 100) / 100;
  return { exclTax, gst, total: exclTax + gst };
}

export default function AdminSchoolEarningPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id as string;

  const [leads, setLeads] = useState<PmsLead[]>([]);
  const [dayRate, setDayRate] = useState<CommissionRate | null>(null);
  const [hostelRate, setHostelRate] = useState<CommissionRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState('');
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentInputs, setPaymentInputs] = useState<Record<string, { amount: string; date: string }>>({});
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const [earningRes, paymentRes] = await Promise.all([
        fetch(`/api/admin/schools/${schoolId}/earning`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/schools/${schoolId}/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!earningRes.ok) throw new Error('Failed to fetch earnings');
      const data = await earningRes.json();
      setLeads(data.leads || []);
      setSchoolName(data.schoolName || '');
      setDayRate(data.daySchoolCommission ?? null);
      setHostelRate(data.hostelSchoolCommission ?? null);

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        setPayments(paymentData.payments || []);
      }
    } catch (e) {
      console.error('Failed to fetch school earning data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [schoolId]);

  const handleAddPayment = async (dateKey: string) => {
    const input = paymentInputs[dateKey];
    if (!input || !input.amount || !input.date) {
      alert('Please fill in both amount and date');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/schools/${schoolId}/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(input.amount),
          receivedDate: input.date,
        }),
      });

      if (res.ok) {
        setPaymentInputs(prev => {
          const next = { ...prev };
          delete next[dateKey];
          return next;
        });
        setEditingDate(null);
        fetchData();
      } else {
        alert('Failed to save payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error saving payment');
    }
  };

  // Build date-wise summary from converted leads
  const dateSummary = useMemo<DaySummary[]>(() => {
    const converted = leads.filter(l => l.status === 'converted');
    const map: Record<string, DaySummary> = {};

    for (const lead of converted) {
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      const dateKey = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      if (!map[dateKey]) {
        map[dateKey] = {
          date: display, dateKey,
          dayAdmissions: 0, hostelAdmissions: 0,
          dayCommission: 0, hostelCommission: 0,
          totalExclTax: 0, gst: 0, totalInvoice: 0,
        };
      }

      if (isHostelType(lead.schoolType)) {
        map[dateKey].hostelAdmissions += 1;
        map[dateKey].hostelCommission += hostelRate?.amount ?? 0;
      } else {
        map[dateKey].dayAdmissions += 1;
        map[dateKey].dayCommission += dayRate?.amount ?? 0;
      }
    }

    return Object.values(map).map(row => {
      const exclTax = row.dayCommission + row.hostelCommission;
      const gst = Math.round(exclTax * 0.18 * 100) / 100;
      return { ...row, totalExclTax: exclTax, gst, totalInvoice: exclTax + gst };
    }).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [leads, dayRate, hostelRate]);

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const grandTotals = useMemo(() => ({
    dayAdmissions: dateSummary.reduce((s, r) => s + r.dayAdmissions, 0),
    hostelAdmissions: dateSummary.reduce((s, r) => s + r.hostelAdmissions, 0),
    dayCommission: dateSummary.reduce((s, r) => s + r.dayCommission, 0),
    hostelCommission: dateSummary.reduce((s, r) => s + r.hostelCommission, 0),
    totalExclTax: dateSummary.reduce((s, r) => s + r.totalExclTax, 0),
    gst: dateSummary.reduce((s, r) => s + r.gst, 0),
    totalInvoice: dateSummary.reduce((s, r) => s + r.totalInvoice, 0),
  }), [dateSummary]);

  const detailLeads = useMemo(() => {
    if (!detailDate) return [];
    return leads.filter(lead => {
      if (lead.status !== 'converted') return false;
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      return d.toISOString().slice(0, 10) === detailDate;
    });
  }, [leads, detailDate]);

  const detailDisplayDate = useMemo(() => {
    if (!detailDate) return '';
    const d = new Date(detailDate + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [detailDate]);

  const detailTotals = useMemo(() => {
    let exclTax = 0;
    for (const lead of detailLeads) {
      const rate = isHostelType(lead.schoolType) ? (hostelRate?.amount ?? 0) : (dayRate?.amount ?? 0);
      exclTax += rate;
    }
    const gst = Math.round(exclTax * 0.18 * 100) / 100;
    return { exclTax, gst, total: exclTax + gst };
  }, [detailLeads, dayRate, hostelRate]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Detail View ───────────────────────────────────────────────────
  if (detailDate) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setDetailDate(null)} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoice Summary
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Invoice Details</h2>
            <p className="text-slate-500 mt-0.5 flex items-center gap-1.5 text-sm">
              <Calendar className="w-4 h-4" />
              {detailDisplayDate}
              {schoolName && <span className="text-slate-400">· {schoolName}</span>}
            </p>
          </div>
        </div>

        {/* Detail summary strip */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">{detailLeads.length} Converted Admission{detailLeads.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
            <IndianRupee className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Excl Tax: ₹{detailTotals.exclTax.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">GST @18%: ₹{detailTotals.gst.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Total Invoice: ₹{detailTotals.total.toLocaleString()}</span>
          </div>
        </div>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Converted Leads · {detailDisplayDate}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {detailLeads.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">No converted leads found for this date.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date of Lead</span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Student</span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Parent</span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />Grade</span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />School Interested In</span>
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />School Type</span>
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Converted Date</span>
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-blue-600" />Invoice Excl Tax</span>
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-amber-500" />GST @18%</span>
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-emerald-600" />Invoice Amt</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailLeads.map(lead => {
                      const rate = isHostelType(lead.schoolType) ? (hostelRate?.amount ?? 0) : (dayRate?.amount ?? 0);
                      const inv = calcInvoice(rate);
                      const convertedDate = lead.convertedAt ? fmt(lead.convertedAt) : fmt(lead.createdAt);
                      return (
                        <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{fmt(lead.createdAt)}</td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-800">{lead.studentName}</td>
                          <td className="px-4 py-3 text-xs text-slate-700">{lead.parentName || <span className="text-slate-400">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{lead.phone || <span className="text-slate-400">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{lead.grade || <span className="text-slate-400">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">{lead.schoolInterested || <span className="text-slate-400">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {lead.schoolType ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                isHostelType(lead.schoolType)
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {isHostelType(lead.schoolType) ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                                {lead.schoolType}
                              </span>
                            ) : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize bg-emerald-100 text-emerald-700">
                              Converted
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{convertedDate}</td>
                          <td className="px-4 py-3 text-right">
                            {inv.exclTax > 0
                              ? <span className="font-semibold text-blue-700 text-xs whitespace-nowrap">₹{inv.exclTax.toLocaleString()}</span>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inv.gst > 0
                              ? <span className="font-semibold text-amber-600 text-xs whitespace-nowrap">₹{inv.gst.toLocaleString()}</span>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inv.total > 0
                              ? <span className="font-bold text-emerald-700 text-xs whitespace-nowrap">₹{inv.total.toLocaleString()}</span>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                      <td colSpan={9} className="px-4 py-3 font-bold text-slate-700 text-xs text-right">Totals</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-blue-700 text-xs">₹{detailTotals.exclTax.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-amber-600 text-xs">₹{detailTotals.gst.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-emerald-700 text-sm">₹{detailTotals.total.toLocaleString()}</span>
                      </td>
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

  // ─── Summary View ──────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/dashboard/schools')}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schools
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </span>
              Invoice from PMS
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Date-wise lead conversion invoice{schoolName ? ` for ${schoolName}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Commission rate info */}
      {(dayRate || hostelRate) && (
        <div className="flex flex-wrap gap-3">
          {dayRate && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Day School Rate: <span className="font-semibold">₹{dayRate.amount.toLocaleString()}</span> / admission</span>
            </div>
          )}
          {hostelRate && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-4 py-2.5">
              <Home className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">Hostel Rate: <span className="font-semibold">₹{hostelRate.amount.toLocaleString()}</span> / admission</span>
            </div>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Conversions', value: grandTotals.dayAdmissions + grandTotals.hostelAdmissions, suffix: '', color: 'text-slate-800', bg: 'bg-slate-50', border: 'border-slate-200' },
          { label: 'Invoice Excl Tax', value: grandTotals.totalExclTax, suffix: '₹', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'GST @18%', value: grandTotals.gst, suffix: '₹', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Total Invoice Amt', value: grandTotals.totalInvoice, suffix: '₹', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Total Paid', value: totalPaid, suffix: '₹', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
        ].map((item, i) => (
          <div key={i} className={`${item.bg} border ${item.border} rounded-xl p-4`}>
            <p className="text-xs font-medium text-slate-500 mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${item.color}`}>
              {item.suffix}{item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Date-wise table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Date-wise Lead Conversion Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dateSummary.length === 0 ? (
            <div className="p-14 text-center">
              <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-3" />
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
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-blue-500" />Day School Commission</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-purple-500" />Hostel School Commission</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-slate-500" />Total Invoice Excl Tax</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-amber-500" />GST @18%</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-emerald-600" />Total Invoice Amt</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-green-600" />Paid</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5 text-orange-600" />Balance</span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">View Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dateSummary.map(row => (
                    <tr key={row.dateKey} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-slate-700 font-medium text-xs whitespace-nowrap">{row.date}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.dayAdmissions > 0
                          ? <span className="inline-block min-w-[2rem] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">{row.dayAdmissions}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.hostelAdmissions > 0
                          ? <span className="inline-block min-w-[2rem] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs">{row.hostelAdmissions}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.dayCommission > 0
                          ? <span className="font-semibold text-blue-700 text-xs whitespace-nowrap">₹{row.dayCommission.toLocaleString()}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.hostelCommission > 0
                          ? <span className="font-semibold text-purple-700 text-xs whitespace-nowrap">₹{row.hostelCommission.toLocaleString()}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.totalExclTax > 0
                          ? <span className="font-semibold text-slate-700 text-xs whitespace-nowrap">₹{row.totalExclTax.toLocaleString()}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.gst > 0
                          ? <span className="font-semibold text-amber-600 text-xs whitespace-nowrap">₹{row.gst.toLocaleString()}</span>
                          : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-emerald-700 text-xs whitespace-nowrap">₹{row.totalInvoice.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        {editingDate === row.dateKey ? (
                          <div className="flex gap-1 items-center">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={paymentInputs[row.dateKey]?.amount || ''}
                              onChange={(e) => setPaymentInputs(prev => ({
                                ...prev,
                                [row.dateKey]: { ...prev[row.dateKey], amount: e.target.value }
                              }))}
                              className="w-20 px-2 py-1 text-xs border border-slate-300 rounded"
                            />
                            <input
                              type="date"
                              value={paymentInputs[row.dateKey]?.date || ''}
                              onChange={(e) => setPaymentInputs(prev => ({
                                ...prev,
                                [row.dateKey]: { ...prev[row.dateKey], date: e.target.value }
                              }))}
                              className="w-24 px-2 py-1 text-xs border border-slate-300 rounded"
                            />
                            <button
                              onClick={() => handleAddPayment(row.dateKey)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingDate(null);
                                setPaymentInputs(prev => {
                                  const next = { ...prev };
                                  delete next[row.dateKey];
                                  return next;
                                });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingDate(row.dateKey)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                          >
                            + Add Payment
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold text-xs whitespace-nowrap ${
                          row.totalInvoice - totalPaid > 0 ? 'text-orange-700' : 'text-green-700'
                        }`}>
                          ₹{Math.max(0, row.totalInvoice - totalPaid).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setDetailDate(row.dateKey)}
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
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-700 text-xs">{grandTotals.dayAdmissions}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-purple-700 text-xs">{grandTotals.hostelAdmissions}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-blue-700 text-xs">₹{grandTotals.dayCommission.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-purple-700 text-xs">₹{grandTotals.hostelCommission.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-slate-700 text-xs">₹{grandTotals.totalExclTax.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-amber-600 text-xs">₹{grandTotals.gst.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-emerald-700 text-sm">₹{grandTotals.totalInvoice.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-green-700 text-sm">₹{totalPaid.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold text-sm ${
                        grandTotals.totalInvoice - totalPaid > 0 ? 'text-orange-700' : 'text-green-700'
                      }`}>
                        ₹{Math.max(0, grandTotals.totalInvoice - totalPaid).toLocaleString()}
                      </span>
                    </td>
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
