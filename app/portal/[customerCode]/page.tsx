'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePortalData } from '@/lib/portal-data-context';
import {
  formatCurrency, formatDate, formatDateShort,
  ORDER_STATUS_CONFIG, PRODUCT_TYPE_CONFIG,
} from '@/lib/3pl-portal-data';
import type { ActivityEvent } from '@/lib/3pl-portal-data';
import { usePortal } from '@/lib/portal-context';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ text, type }: { text: string; type: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-blue-50 text-blue-700',
    picking: 'bg-amber-50 text-amber-700',
    shipped: 'bg-green-50 text-green-700',
    delivered: 'bg-green-50 text-green-700',
    posted: 'bg-blue-50 text-blue-700',
    'in-qc': 'bg-amber-50 text-amber-700',
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[type] || 'bg-gray-100 text-gray-600'}`}>{text}</span>;
}

const PAYMENT_COLORS: Record<string, string> = { 'on-time': '#059669', 'late-15': '#D97706', 'late-30': '#DC2626', unpaid: '#9CA3AF' };

export default function PortalDashboard() {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const { basePath } = usePortal();
  const { customer, activity, kpis, paymentChartData: paymentData, inventoryChartData: inventoryData } = usePortalData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome back, {customer.contact_name.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{customer.customer_name} &middot; Account {customer.customer_code}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold capitalize">{customer.status}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Balance"
          value={formatCurrency(kpis.currentBalance)}
          sub={`Due in ${kpis.dueIn} days`}
          color={kpis.balanceStatus === 'overdue' ? '#DC2626' : '#1B2A4A'}
        />
        <StatCard label="Total Inventory" value={kpis.totalUnits.toLocaleString()} sub={`${kpis.totalSKUs} SKUs`} color="#1B2A4A" />
        <StatCard label="Open Orders" value={String(kpis.openOrderCount)} sub="In progress" color="#1B2A4A" />
        <StatCard
          label="Payment Status"
          value={kpis.paymentStatus}
          color={kpis.paymentHealth === 'good' ? '#059669' : kpis.paymentHealth === 'fair' ? '#D97706' : '#DC2626'}
        />
      </div>

      {/* Contract Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Contract Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Contract Period</p>
            <p className="font-medium text-gray-900">{formatDate(customer.contract_start)} - {formatDate(customer.contract_end)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Storage Rate</p>
            <p className="font-medium text-gray-900">{formatCurrency(customer.storage_rate_pallet)}/pallet/mo</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Handling Rates</p>
            <p className="font-medium text-gray-900">{formatCurrency(customer.handling_rate_in)} in / {formatCurrency(customer.handling_rate_out)} out</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payment Terms</p>
            <p className="font-medium text-gray-900">{customer.payment_terms}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Payment History (12 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelStyle={{ fontWeight: 600 }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}
                fill="#059669"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const c = PAYMENT_COLORS[payload.status] || '#9CA3AF';
                  return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={c} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-[#059669]" /> On Time</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-[#D97706]" /> 15-29 Days Late</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-[#DC2626]" /> 30+ Days Late</span>
          </div>
        </div>

        {/* Inventory Level Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Inventory Levels (12 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip />
              <Area type="monotone" dataKey="powder" stackId="1" stroke="#7C3AED" fill="#EDE9FE" />
              <Area type="monotone" dataKey="cube" stackId="1" stroke="#2563EB" fill="#DBEAFE" />
              <Area type="monotone" dataKey="liquid" stackId="1" stroke="#0891B2" fill="#CFFAFE" />
              <Area type="monotone" dataKey="perishable" stackId="1" stroke="#EA580C" fill="#FFF7ED" />
              <Area type="monotone" dataKey="hazmat" stackId="1" stroke="#DC2626" fill="#FEE2E2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Activity</h2>
        <div className="space-y-3">
          {activity.map(evt => (
            <div key={evt.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                evt.type === 'order' ? 'bg-blue-50 text-blue-600' :
                evt.type === 'shipment' ? 'bg-green-50 text-green-600' :
                evt.type === 'receiving' ? 'bg-purple-50 text-purple-600' :
                evt.type === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{evt.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(evt.timestamp)}</p>
              </div>
              <StatusBadge text={evt.status} type={evt.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href={`${basePath}/orders/new`} className="flex items-center justify-center gap-2 bg-[#F5920B] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#E08209] transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          Place Order
        </Link>
        <Link href={`${basePath}/billing`} className="flex items-center justify-center gap-2 bg-[#1B2A4A] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#1B2A4A]/90 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" /></svg>
          Pay Invoice
        </Link>
        <Link href={`${basePath}/support`} className="flex items-center justify-center gap-2 bg-[#2A9D8F] text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-[#248F82] transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Contact Support
        </Link>
        <Link href={`${basePath}/inventory`} className="flex items-center justify-center gap-2 bg-white text-[#1B2A4A] border border-gray-200 rounded-xl py-3.5 text-sm font-semibold hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          View Inventory
        </Link>
      </div>
    </div>
  );
}
