'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Calendar, TrendingUp, ArrowDownToLine, Wallet, IndianRupee,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function StatementOfAccountPage() {
  const router = useRouter();
  const [conversions, setConversions] = useState<ConversionEntry[]>([]);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('freelancer_token');
    if (!token) { router.push('/freelancer/login'); return; }

    fetch('/api/freelancer/statement', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) { router.push('/freelancer/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        setConversions(data.conversions || []);
        setPayments(data.payments || []);
      })
      .catch(() => router.push('/freelancer/login'))
      .finally(() => setLoading(false));
  }, [router]);

  // Merge conversions + payments → sort by date → compute running balance
  const ledger = useMemo<LedgerRow[]>(() => {
    const rows: Omit<LedgerRow, 'balance'>[] = [
      ...conversions.map(c => ({
        dateKey: c.dateKey,
        date: c.date,
        particulars:
          `${c.students} Student${c.students !== 1 ? 's' : ''} Converted` +
          (c.schoolNames.length > 0 ? ` — ${c.schoolNames.slice(0, 3).join(', ')}${c.schoolNames.length > 3 ? ` +${c.schoolNames.length - 3} more` : ''}` : ''),
        earned: c.earned,
        received: 0,
        type: 'conversion' as const,
      })),
      ...payments.map(p => ({
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
  }, [conversions, payments]);

  const totals = useMemo(() => ({
    earned: ledger.reduce((s, r) => s + r.earned, 0),
    received: ledger.reduce((s, r) => s + r.received, 0),
    balance: ledger.length > 0 ? ledger[0].balance : 0,
  }), [ledger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Statement of Account</h2>
        <p className="text-slate-500 mt-1">
          Complete ledger of your earned commissions and payments received
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Earned',
            value: totals.earned,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
          },
          {
            label: 'Total Received',
            value: totals.received,
            icon: ArrowDownToLine,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
          },
          {
            label: 'Closing Balance',
            value: totals.balance,
            icon: Wallet,
            color: totals.balance > 0 ? 'text-amber-600' : 'text-slate-500',
            bg: totals.balance > 0 ? 'bg-amber-50' : 'bg-slate-50',
            border: totals.balance > 0 ? 'border-amber-100' : 'border-slate-100',
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className={`border shadow-md ${item.border}`}>
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">
                  ₹{item.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statement table */}
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
              <p className="text-xs text-slate-400 mt-1">
                Your statement will appear here once you have conversions or payments
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        Date
                      </span>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold">Particulars</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        Earned (₹)
                      </span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end">
                        <ArrowDownToLine className="w-3.5 h-3.5 text-blue-400" />
                        Received (₹)
                      </span>
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold whitespace-nowrap">
                      <span className="flex items-center gap-1 justify-end">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                        Balance (₹)
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {ledger.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        row.type === 'payment'
                          ? 'bg-blue-50/50 hover:bg-blue-50'
                          : 'bg-white hover:bg-emerald-50/40'
                      }`}
                    >
                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-600">{row.date}</span>
                      </td>

                      {/* Particulars */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-start gap-1.5 text-xs leading-snug ${
                            row.type === 'payment' ? 'text-blue-800' : 'text-slate-700'
                          }`}
                        >
                          {row.type === 'conversion' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          {row.particulars}
                        </span>
                      </td>

                      {/* Earned */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {row.earned > 0 ? (
                          <span className="font-semibold text-emerald-700 text-xs">
                            ₹{row.earned.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Received */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {row.received > 0 ? (
                          <span className="font-semibold text-blue-700 text-xs">
                            ₹{row.received.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={`font-bold text-xs ${
                            row.balance > 0
                              ? 'text-amber-700'
                              : row.balance < 0
                              ? 'text-red-600'
                              : 'text-slate-500'
                          }`}
                        >
                          ₹{row.balance.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Totals footer */}
                <tfoot>
                  <tr className="bg-slate-800 text-white border-t-2 border-slate-700">
                    <td className="px-4 py-3 font-bold text-xs text-slate-200">
                      Closing Balance
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-emerald-400 text-xs">
                        ₹{totals.earned.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-blue-300 text-xs">
                        ₹{totals.received.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-bold text-sm ${
                          totals.balance > 0 ? 'text-amber-300' : 'text-slate-300'
                        }`}
                      >
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          Earned — Commission from student conversions
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500" />
          Received — Payments made by admin
        </span>
        <span className="flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
          Balance — Cumulative outstanding amount
        </span>
      </div>
    </div>
  );
}
