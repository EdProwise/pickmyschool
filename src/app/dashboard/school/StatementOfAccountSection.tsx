'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, IndianRupee, FileText, Download, FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as XLSX from 'xlsx';

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
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [schoolName, setSchoolName] = useState('');

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
        setSchoolName(data.schoolName || '');
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

  // Build all statement rows (unfiltered)
  const allStatementRows = useMemo<StatementRow[]>(() => {
    const converted = leads.filter(l => l.status === 'converted');
    const map: Record<string, { count: number; invoiceAmt: number; dateKey: string; date: string }> = {};

    for (const lead of converted) {
      const d = new Date(lead.convertedAt ?? lead.createdAt);
      const dateKey = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!map[dateKey]) map[dateKey] = { count: 0, invoiceAmt: 0, dateKey, date: display };
      map[dateKey].count += 1;
      const rate = isHostelType(lead.schoolType) ? (hostelRate?.amount ?? 0) : (dayRate?.amount ?? 0);
      map[dateKey].invoiceAmt += Math.round(rate * 1.18 * 100) / 100;
    }

    const rows: StatementRow[] = [];
    for (const data of Object.values(map)) {
      rows.push({
        date: data.date,
        dateKey: data.dateKey,
        particulars: `${data.count} Student${data.count !== 1 ? 's' : ''} Converted`,
        invoiceAmt: data.invoiceAmt,
        paid: 0,
        balance: 0,
      });
    }

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

    rows.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    let runningBalance = 0;
    for (const row of rows) {
      runningBalance += row.invoiceAmt - row.paid;
      row.balance = runningBalance;
    }
    return rows.reverse();
  }, [leads, payments, dayRate, hostelRate]);

  // Apply date filter
  const statementRows = useMemo<StatementRow[]>(() => {
    if (!fromDate && !toDate) return allStatementRows;
    return allStatementRows.filter(row => {
      if (fromDate && row.dateKey < fromDate) return false;
      if (toDate && row.dateKey > toDate) return false;
      return true;
    });
  }, [allStatementRows, fromDate, toDate]);

  const totals = useMemo(() => {
    const totalInvoice = statementRows.reduce((s, r) => s + r.invoiceAmt, 0);
    const totalPaid = statementRows.reduce((s, r) => s + r.paid, 0);
    return { totalInvoice, totalPaid, balance: totalInvoice - totalPaid };
  }, [statementRows]);

  // ─── Excel Export ──────────────────────────────────────────────────
  const exportExcel = () => {
    const rows = statementRows.map(r => ({
      Date: r.date,
      Particulars: r.particulars,
      'Invoice Amt (₹)': r.invoiceAmt || '',
      'Paid (₹)': r.paid || '',
      'Balance (₹)': r.balance,
    }));
    rows.push({
      Date: 'TOTAL',
      Particulars: '',
      'Invoice Amt (₹)': totals.totalInvoice,
      'Paid (₹)': totals.totalPaid,
      'Balance (₹)': totals.balance,
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statement of Account');
    const fileName = `SOA${schoolName ? `_${schoolName.replace(/\s+/g, '_')}` : ''}${fromDate ? `_from_${fromDate}` : ''}${toDate ? `_to_${toDate}` : ''}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ─── PDF Export ────────────────────────────────────────────────────
  const exportPDF = () => {
    const filterLabel = fromDate || toDate
      ? `Period: ${fromDate || '—'} to ${toDate || '—'}`
      : 'All Dates';

    const rowsHtml = statementRows.map(r => `
      <tr class="${r.isPaymentRow ? 'payment-row' : ''}">
        <td>${r.date}</td>
        <td>${r.particulars}</td>
        <td class="num">${r.invoiceAmt > 0 ? '₹' + r.invoiceAmt.toLocaleString() : '—'}</td>
        <td class="num">${r.paid > 0 ? '₹' + r.paid.toLocaleString() : '—'}</td>
        <td class="num ${r.balance > 0 ? 'bal-due' : 'bal-clear'}">₹${r.balance.toLocaleString()}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Statement of Account${schoolName ? ' - ' + schoolName : ''}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:24px}
        h2{font-size:18px;margin:0 0 4px}
        .sub{color:#64748b;font-size:11px;margin-bottom:16px}
        .cards{display:flex;gap:12px;margin-bottom:20px}
        .card{flex:1;border-radius:8px;padding:12px 16px}
        .card-blue{background:#eff6ff}.card-green{background:#f0fdf4}.card-orange{background:#fff7ed}
        .card label{display:block;font-size:10px;color:#64748b;margin-bottom:4px}
        .card .val{font-size:16px;font-weight:700}
        .card-blue .val{color:#1d4ed8}.card-green .val{color:#15803d}.card-orange .val{color:#c2410c}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th{background:#f8fafc;color:#475569;font-size:10px;text-align:left;padding:8px 10px;border-bottom:2px solid #e2e8f0}
        td{padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px}
        .num{text-align:right}
        .payment-row td{background:#f0fdf4;color:#166534;font-weight:600}
        .bal-due{color:#c2410c;font-weight:700}
        .bal-clear{color:#15803d;font-weight:700}
        tfoot td{background:#f8fafc;font-weight:700;border-top:2px solid #cbd5e1}
        @media print{body{margin:0}}
      </style></head><body>
      <h2>Statement of Account${schoolName ? ' — ' + schoolName : ''}</h2>
      <div class="sub">${filterLabel}</div>
      <div class="cards">
        <div class="card card-blue"><label>Total Invoice</label><div class="val">₹${totals.totalInvoice.toLocaleString()}</div></div>
        <div class="card card-green"><label>Total Paid</label><div class="val">₹${totals.totalPaid.toLocaleString()}</div></div>
        <div class="card ${totals.balance > 0 ? 'card-orange' : 'card-green'}"><label>Balance</label><div class="val">₹${totals.balance.toLocaleString()}</div></div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Particulars</th><th class="num">Invoice Amt</th><th class="num">Paid</th><th class="num">Balance</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr>
          <td colspan="2">Total</td>
          <td class="num">₹${totals.totalInvoice.toLocaleString()}</td>
          <td class="num">₹${totals.totalPaid.toLocaleString()}</td>
          <td class="num ${totals.balance > 0 ? 'bal-due' : 'bal-clear'}">₹${totals.balance.toLocaleString()}</td>
        </tr></tfoot>
      </table>
      <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script>
      </body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    w?.document.write(html);
    w?.document.close();
  };

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
          { label: 'Total Invoice', value: totals.totalInvoice, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Total Paid', value: totals.totalPaid, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Balance', value: totals.balance, color: totals.balance > 0 ? 'text-orange-700' : 'text-green-700', bg: totals.balance > 0 ? 'bg-orange-50' : 'bg-green-50' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500 mb-2">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>
                ₹{item.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap">To</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(''); setToDate(''); }}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Clear
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={exportExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export PDF
        </button>
      </div>

      {/* Statement table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Statement of Account
            {(fromDate || toDate) && (
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({fromDate || '…'} → {toDate || '…'})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {statementRows.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No transactions found</p>
              <p className="text-xs text-slate-400 mt-1">
                {fromDate || toDate ? 'Try adjusting your date filter' : 'Your invoices and payments will appear here'}
              </p>
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
                        <span className={`font-bold ${row.balance > 0 ? 'text-orange-700' : 'text-green-700'}`}>
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
                      <span className="text-slate-300 text-xs">—</span>
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
