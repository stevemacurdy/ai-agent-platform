'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  DEMO_CUSTOMER, DEMO_INVOICES, DEMO_PAYMENTS,
  INVOICE_STATUS_CONFIG, formatCurrency, formatDate, formatDateShort,
  getPaymentChartData,
} from '@/lib/3pl-portal-data';
import type { Invoice, Payment, PaymentTimeliness } from '@/lib/3pl-portal-data';
import PaymentModal from '@/components/portal/PaymentModal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const TIMELINESS_COLORS: Record<PaymentTimeliness | 'unpaid', string> = {
  'on-time': '#059669',
  'late-15': '#D97706',
  'late-30': '#DC2626',
  unpaid: '#9CA3AF',
};

const TIMELINESS_LABELS: Record<string, string> = {
  'on-time': 'On Time',
  'late-15': '15-29 Days Late',
  'late-30': '30+ Days Late',
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: color || '#111827' }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function BillingPage() {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const customer = DEMO_CUSTOMER;
  const invoices = DEMO_INVOICES;
  const payments = DEMO_PAYMENTS;
  const paymentChartData = getPaymentChartData();

  const [statusFilter, setStatusFilter] = useState('all');
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [autoPayEnabled, setAutoPayEnabled] = useState(customer.auto_pay_enabled);

  const currentInvoice = invoices.find(inv => inv.status === 'posted' || inv.status === 'overdue');
  const arrears = invoices.filter(inv => inv.balance_due > 0 && inv.status === 'overdue').reduce((s, inv) => s + inv.balance_due, 0);
  const totalDue = invoices.reduce((s, inv) => s + inv.balance_due, 0);

  const filteredInvoices = statusFilter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === statusFilter);

  function handleAutoPayToggle() {
    setAutoPayEnabled(!autoPayEnabled);
  }

  const annualSavings = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total_due, 0) * 0.03 / 11 * 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Billing &amp; Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Invoices, payments, and auto-pay management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Month"
          value={currentInvoice ? formatCurrency(currentInvoice.total_due) : '$0.00'}
          sub={currentInvoice ? `Storage $${currentInvoice.storage_charges.toLocaleString()} + Handling $${(currentInvoice.handling_in_charges + currentInvoice.handling_out_charges).toLocaleString()} + Accessorial $${currentInvoice.accessorial_charges.toLocaleString()}` : 'No invoice yet'}
        />
        <StatCard
          label="Amount Due"
          value={formatCurrency(totalDue)}
          color={totalDue > 0 ? '#DC2626' : '#059669'}
          sub={totalDue > 0 ? `Due ${currentInvoice ? formatDateShort(currentInvoice.due_date) : 'soon'}` : 'All paid up'}
        />
        <StatCard
          label="Arrears"
          value={formatCurrency(arrears)}
          color={arrears > 0 ? '#DC2626' : '#059669'}
          sub={arrears > 0 ? 'Past due balance' : 'No overdue invoices'}
        />
        <StatCard
          label="Auto-Pay"
          value={autoPayEnabled ? 'Active' : 'Inactive'}
          color={autoPayEnabled ? '#059669' : '#6B7280'}
          sub={autoPayEnabled ? `Saving ${customer.auto_pay_discount}% per invoice` : 'Enable to save 3%'}
        />
      </div>

      {/* Auto-Pay Banner */}
      {!autoPayEnabled && (
        <div className="bg-gradient-to-r from-[#2A9D8F]/5 to-[#2A9D8F]/10 border border-[#2A9D8F]/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#2A9D8F]">Save with Auto-Pay</p>
            <p className="text-sm text-gray-600 mt-1">
              Enable auto-pay to get a {customer.auto_pay_discount}% discount on every invoice instead of the {customer.convenience_fee_rate}% convenience fee.
              Estimated annual savings: <span className="font-semibold text-[#2A9D8F]">{formatCurrency(annualSavings)}</span>
            </p>
          </div>
          <button
            onClick={handleAutoPayToggle}
            className="shrink-0 px-5 py-2.5 bg-[#2A9D8F] text-white rounded-xl text-sm font-semibold hover:bg-[#248F82] transition-colors"
          >
            Enable Auto-Pay
          </button>
        </div>
      )}

      {autoPayEnabled && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Auto-pay is active</p>
              <p className="text-sm text-green-700">You save {customer.auto_pay_discount}% on every invoice. Invoices are automatically charged on the due date.</p>
            </div>
          </div>
          <button
            onClick={handleAutoPayToggle}
            className="shrink-0 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Disable
          </button>
        </div>
      )}

      {/* Payment History Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Payment History</h2>
        <p className="text-xs text-gray-500 mb-4">Last 12 months payment timeliness</p>
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TIMELINESS_COLORS['on-time'] }} /> On Time
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TIMELINESS_COLORS['late-15'] }} /> 15-29 Days Late
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TIMELINESS_COLORS['late-30'] }} /> 30+ Days Late
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TIMELINESS_COLORS.unpaid }} /> Unpaid
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), '']}
                labelFormatter={(label: string) => label}
                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Invoices</h2>
          <div className="flex items-center gap-2">
            {['all', 'posted', 'paid', 'overdue', 'partial'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-[#1B2A4A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? 'All' : (INVOICE_STATUS_CONFIG[s as keyof typeof INVOICE_STATUS_CONFIG]?.label || s)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Storage</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Handling</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Due</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase w-24" />
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const cfg = INVOICE_STATUS_CONFIG[inv.status] || { label: inv.status, bgColor: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">{formatDateShort(inv.period_start)} - {formatDateShort(inv.period_end)}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(inv.storage_charges)}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(inv.handling_in_charges + inv.handling_out_charges)}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(inv.total_due)}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(inv.amount_paid)}</td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: inv.balance_due > 0 ? '#DC2626' : '#059669' }}>
                      {formatCurrency(inv.balance_due)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{formatDateShort(inv.due_date)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bgColor}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inv.balance_due > 0 && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="px-3 py-1.5 bg-[#F5920B] text-white rounded-lg text-xs font-semibold hover:bg-[#E08209] transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No invoices match your filter.</p>
          </div>
        )}
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Days from Due</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Timeliness</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => {
                const inv = invoices.find(i => i.id === pay.invoice_id);
                const timeColor = TIMELINESS_COLORS[pay.timeliness];
                return (
                  <tr key={pay.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{formatDateShort(pay.created_at)}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{inv?.invoice_number || '—'}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(pay.amount)}</td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{pay.payment_method}</td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {pay.days_from_due <= 0 ? `${Math.abs(pay.days_from_due)} days early` : `${pay.days_from_due} days late`}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: timeColor + '15', color: timeColor }}
                      >
                        {TIMELINESS_LABELS[pay.timeliness] || pay.timeliness}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No payment history yet.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          customer={{ ...customer, auto_pay_enabled: autoPayEnabled }}
          onClose={() => setPayingInvoice(null)}
          onPaid={() => setPayingInvoice(null)}
        />
      )}
    </div>
  );
}
