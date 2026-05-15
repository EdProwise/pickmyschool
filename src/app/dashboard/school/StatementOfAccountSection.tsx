'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, IndianRupee, RefreshCw, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatementRow {
  date: string;
  dateKey: string;
  particulars: string;
  invoiceAmt: number;
  paid: number;
  balance: number;
  isPaymentRow?: boolean;
}

interface CommissionRate {
  amount: number;
  effectiveFrom?: string;
}

interface PmsLead {
  _id: string;
  studentName: string;
  status: string;
  createdAt: string;
  convertedAt?: string | null;
  schoolType?: string;
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

export function StatementOfAccountSection() {
  const [leads, setLeads] = useState<PmsLead[]>([]);
  const [dayRate, setDayRate] = useState<CommissionRate | null>(null);
  const [hostelRate, setHostelRate] = useState<CommissionRate | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [invoiceRes, paymentsRes] = await Promise.all([
        fetch('/api/schools/pms-invoice', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/schools/statement-of-account', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (invoiceRes.ok) {
        const data = await invoiceRes.json();
        setLeads(data.leads || []);
        setDayRate(data.daySchoolCommission ?? null);
        setHostelRate(data.hostelSchoolCommission ?? null);
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.error('Failed to fetch statement data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Build date-wise summary from converted leads with payment info
  const statementRows = useMemo<StatementRow[]>(() => {
    const converted = leads.filter(l => l.status === 'converted');
    const map: Record<string, { count: number; invoiceAmt: number; dateKey: string; date: string }> = {};

    // Group by conversion date
    for (const lead of converted) {
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      const dateKey = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      if (!map[dateKey]) {
        map[dateKey] = { count: 0, invoiceAmt: 0, dateKey, date: display };
      }

      map[dateKey].count += 1;
      const rate = isHostelType(lead.schoolType) ? (hostelRate?.amount ?? 0) : (dayRate?.amount ?? 0);
      const inv = Math.round(rate * 1.18 * 100) / 100;
      map[dateKey].invoiceAmt += inv;
    }

    // Build rows from conversion data
    const rows: StatementRow[] = [];
    for (const [dateKey, data] of Object.entries(map)) {
      rows.push({
        date: data.date,
        dateKey,
        particulars: `${data.count} Student${data.count !== 1 ? 's' : ''} Converted`,
        invoiceAmt: data.invoiceAmt,
        paid: 0,
        balance: 0,
      });
    }

    // Add payment rows
    for (const payment of payments) {
      const d = new Date(payment.receivedDate);
      const dateKey = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      rows.push({
        date: display,
        dateKey,
        particulars: 'Payment Received',
        invoiceAmt: 0,
        paid: payment.amount,
        balance: 0,
        isPaymentRow: true,
      });
    }

    // Sort by date (newest first)
    rows.sort((a, b) => b.dateKey.localeCompare(a.dateKey));

    // Calculate running balance
    let runningBalance = 0;
    const reversedRows = [...rows].reverse();

    for (let i = 0; i < reversedRows.length; i++) {
      const row = reversedRows[i];
      runningBalance += row.invoiceAmt - row.paid;
      row.balance = runningBalance;
    }

    return rows.reverse(); // Return in descending date order for display
  }, [leads, payments, dayRate, hostelRate]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalInvoice = 0;
    let totalPaid = 0;

    for (const row of statementRows) {
      totalInvoice += row.invoiceAmt;
      totalPaid += row.paid;
    }

    return {
      totalInvoice,
      totalPaid,
      balance: totalInvoice - totalPaid,
    };
  }, [statementRows]);

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
        <h2 className="text-2xl font-bold text-slate-800">Statement of Account</h2>
        <p className="text-slate-500 mt-1">Track your invoices and payments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Invoice', value: totals.totalInvoice, icon: '₹', color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Total Paid', value: totals.totalPaid, icon: '₹', color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Balance', value: totals.balance, icon: '₹', color: totals.balance > 0 ? 'text-orange-700' : 'text-green-700', bg: totals.balance > 0 ? 'bg-orange-50' : 'bg-green-50' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500 mb-2">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>
                {item.icon}{item.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statement table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Statement of Account
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {statementRows.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
              <p className="text-xs text-slate-400 mt-1">Your invoices and payments will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date</span>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      Particulars
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5" />Invoice Amt</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5" />Paid</span>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end"><IndianRupee className="w-3.5 h-3.5" />Balance</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statementRows.map((row, idx) => (
                    <tr key={`${row.dateKey}-${idx}`} className={`${row.isPaymentRow ? 'bg-green-50' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        <span className={row.isPaymentRow ? 'font-semibold text-green-700' : 'text-slate-600'}>{row.particulars}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {row.invoiceAmt > 0 ? (
                          <span className="font-semibold text-slate-700">₹{row.invoiceAmt.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {row.paid > 0 ? (
                          <span className="font-semibold text-green-700">₹{row.paid.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        <span className={`font-bold ${
                          row.balance > 0 ? 'text-orange-700' : 'text-green-700'
                        }`}>
                          ₹{row.balance.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300">
                    <td colSpan={2} className="px-4 py-3 font-bold text-slate-700 text-xs">Total</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-slate-700 text-xs">₹{totals.totalInvoice.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-green-700 text-xs">₹{totals.totalPaid.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold text-sm ${
                        totals.balance > 0 ? 'text-orange-700' : 'text-green-700'
                      }`}>
                        ₹{totals.balance.toLocaleString()}
                      </span>
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
