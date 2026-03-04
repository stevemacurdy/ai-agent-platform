'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  DEMO_RECEIVING, formatDate, formatDateShort,
  PRODUCT_TYPE_CONFIG,
} from '@/lib/3pl-portal-data';
import type { ReceivingRecord } from '@/lib/3pl-portal-data';
import PhotoGallery from '@/components/portal/PhotoGallery';

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  'putaway-complete': { label: 'Putaway Complete', color: '#059669', bgColor: 'bg-green-50 text-green-700' },
  'in-qc': { label: 'In QC', color: '#D97706', bgColor: 'bg-amber-50 text-amber-700' },
  'received': { label: 'Received', color: '#2563EB', bgColor: 'bg-blue-50 text-blue-700' },
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ReceivingPage() {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const records = DEMO_RECEIVING;
  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter);

  const totalPallets = records.reduce((s, r) => s + r.pallet_count, 0);
  const totalItems = records.reduce((s, r) => s + r.items.reduce((a, i) => a + i.quantity, 0), 0);
  const inQC = records.filter(r => r.status === 'in-qc').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Receiving</h1>
        <p className="text-sm text-gray-500 mt-1">Track inbound shipments received at the warehouse</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Receipts" value={records.length.toString()} sub="All time" />
        <StatCard label="Total Pallets" value={totalPallets.toString()} sub="Received" />
        <StatCard label="Total Units" value={totalItems.toLocaleString()} sub="Across all receipts" />
        <StatCard label="In QC" value={inQC.toString()} sub={inQC > 0 ? 'Awaiting review' : 'All clear'} />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase">Status:</span>
        {['all', 'putaway-complete', 'in-qc', 'received'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-[#1B2A4A] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Receiving Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Vendor / Shipper</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Pallets</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Photos</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => {
                const isExpanded = expandedId === rec.id;
                const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG['received'];
                return (
                  <ReceivingRow
                    key={rec.id}
                    record={rec}
                    isExpanded={isExpanded}
                    statusConfig={cfg}
                    onToggle={() => setExpandedId(isExpanded ? null : rec.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No receiving records match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReceivingRow({
  record,
  isExpanded,
  statusConfig,
  onToggle,
}: {
  record: ReceivingRecord;
  isExpanded: boolean;
  statusConfig: { label: string; bgColor: string };
  onToggle: () => void;
}) {
  const totalQty = record.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <tr
        className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}
        onClick={onToggle}
      >
        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{formatDateShort(record.date)}</td>
        <td className="py-3 px-4 font-medium text-gray-900">{record.vendor}</td>
        <td className="py-3 px-4 text-gray-600">
          {record.items.length} item{record.items.length !== 1 ? 's' : ''} ({totalQty.toLocaleString()} units)
        </td>
        <td className="py-3 px-4 text-center text-gray-700">{record.pallet_count}</td>
        <td className="py-3 px-4 text-center">
          {record.photos.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-[#2A9D8F] text-xs font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {record.photos.length}
            </span>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </td>
        <td className="py-3 px-4">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.bgColor}`}>
            {statusConfig.label}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} className="bg-gray-50/50 border-b border-gray-100">
            <div className="px-6 py-5 space-y-5">
              {/* Line Items */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Items Received</p>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">SKU</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Description</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Lot</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Quantity</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 px-3 font-mono text-xs text-gray-700">{item.sku}</td>
                          <td className="py-2 px-3 text-gray-800">{item.description}</td>
                          <td className="py-2 px-3 font-mono text-xs text-gray-500">{item.lot}</td>
                          <td className="py-2 px-3 text-right font-medium">{item.quantity.toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <span className={`text-xs ${item.condition === 'Good' ? 'text-green-600' : 'text-amber-600'}`}>
                              {item.condition}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Putaway Locations */}
              {record.putaway_locations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Putaway Locations</p>
                  <div className="flex gap-2 flex-wrap">
                    {record.putaway_locations.map((loc, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono font-medium">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {record.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 bg-white rounded-lg border border-gray-200 px-3 py-2">{record.notes}</p>
                </div>
              )}

              {/* Damage Notes */}
              {record.damage_notes && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-red-700 mb-1">Damage / Discrepancy</p>
                  <p className="text-sm text-red-600">{record.damage_notes}</p>
                </div>
              )}

              {/* Photos */}
              {record.photos.length > 0 && (
                <PhotoGallery photos={record.photos} title="Receiving Photos" />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
