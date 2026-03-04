'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DEMO_ORDERS, ORDER_STATUS_CONFIG, PRODUCT_TYPE_CONFIG, formatDate,
} from '@/lib/3pl-portal-data';
import type { OrderStatus } from '@/lib/3pl-portal-data';
import PhotoGallery from '@/components/portal/PhotoGallery';

const STATUS_FLOW: OrderStatus[] = ['pending', 'processing', 'picking', 'packed', 'shipped', 'delivered'];

function OrderTimeline({ status }: { status: OrderStatus }) {
  const idx = STATUS_FLOW.indexOf(status);
  const cancelled = status === 'cancelled';
  return (
    <div className="flex items-center gap-1 mt-2">
      {STATUS_FLOW.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full border-2 ${cancelled ? 'border-red-300 bg-red-100' : i <= idx ? 'border-[#2A9D8F] bg-[#2A9D8F]' : 'border-gray-200 bg-white'}`} />
          {i < STATUS_FLOW.length - 1 && <div className={`w-6 h-0.5 ${cancelled ? 'bg-red-200' : i < idx ? 'bg-[#2A9D8F]' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = DEMO_ORDERS.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) { const q = search.toLowerCase(); return o.order_number.toLowerCase().includes(q) || o.po_number.toLowerCase().includes(q) || o.ship_to_name.toLowerCase().includes(q); }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your outbound shipments</p>
        </div>
        <Link href={`/portal/${customerCode}/orders/new`} className="flex items-center gap-2 px-4 py-2 bg-[#F5920B] text-white rounded-xl text-sm font-semibold hover:bg-[#E08209] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Order
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
        <input type="text" placeholder="Search order #, PO #, or ship-to..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50">
          <option value="">All Statuses</option>
          {Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(order => {
          const isOpen = expanded === order.id;
          const cfg = ORDER_STATUS_CONFIG[order.status];
          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : order.id)} className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-bold text-[#1B2A4A]">{order.order_number}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bgColor }}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.ship_to_name}</p>
                  <p className="text-xs text-gray-400">{order.line_items.length} item(s) &middot; {order.total_weight.toFixed(0)} lbs &middot; {order.total_pallets} pallet(s)</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  {order.tracking_number && <p className="text-xs text-[#2A9D8F] font-mono mt-0.5">{order.tracking_number}</p>}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isOpen && (
                <div className="px-6 pb-5 border-t border-gray-100 pt-4 space-y-4">
                  <OrderTimeline status={order.status} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Line Items</p>
                    <table className="w-full text-xs">
                      <thead><tr className="text-gray-400 border-b border-gray-100">
                        <th className="text-left py-1 pr-2">SKU</th><th className="text-left py-1">Product</th><th className="text-center py-1">Type</th><th className="text-right py-1">Qty</th><th className="text-right py-1 pl-2">Weight</th>
                      </tr></thead>
                      <tbody>
                        {order.line_items.map((li, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2 pr-2 font-mono font-semibold">{li.sku}</td>
                            <td className="py-2 text-gray-600">{li.description}</td>
                            <td className="py-2 text-center"><span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: PRODUCT_TYPE_CONFIG[li.product_type].color, backgroundColor: PRODUCT_TYPE_CONFIG[li.product_type].bgColor }}>{PRODUCT_TYPE_CONFIG[li.product_type].label}</span></td>
                            <td className="py-2 text-right font-semibold">{li.quantity}</td>
                            <td className="py-2 text-right pl-2 text-gray-500">{li.total_weight.toFixed(0)} lbs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Ship To</p>
                      <p className="text-sm text-gray-700">{order.ship_to_name}</p>
                      <p className="text-xs text-gray-500">{order.ship_to_address.street}, {order.ship_to_address.city}, {order.ship_to_address.state} {order.ship_to_address.zip}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Shipping</p>
                      <p className="text-sm text-gray-700">{order.carrier} ({order.ship_method.toUpperCase()})</p>
                      {order.tracking_number && <p className="text-xs text-[#2A9D8F] font-mono">{order.tracking_number}</p>}
                      {order.actual_ship_date && <p className="text-xs text-gray-500">Shipped: {formatDate(order.actual_ship_date)}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-[#1B2A4A]/5 text-[#1B2A4A] px-3 py-1.5 rounded-lg font-medium">PO: {order.po_number}</span>
                    <span className="text-xs bg-[#1B2A4A]/5 text-[#1B2A4A] px-3 py-1.5 rounded-lg font-medium">BOL: {order.bol_number}</span>
                  </div>
                  {order.special_instructions && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-700">Special Instructions</p>
                      <p className="text-xs text-amber-600 mt-0.5">{order.special_instructions}</p>
                    </div>
                  )}
                  {order.shipping_photos.length > 0 && <PhotoGallery photos={order.shipping_photos} title="Shipping Photos" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
