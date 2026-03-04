'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  DEMO_INVENTORY, PRODUCT_TYPE_CONFIG, formatDate, daysUntil,
} from '@/lib/3pl-portal-data';
import type { InventoryItem, ProductType, CartItem, UnitOfMeasure } from '@/lib/3pl-portal-data';
import CartSidebar from '@/components/portal/CartSidebar';
import PhotoGallery from '@/components/portal/PhotoGallery';

function TypeBadge({ type }: { type: ProductType }) {
  const cfg = PRODUCT_TYPE_CONFIG[type];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, backgroundColor: cfg.bgColor }}>
      <span>{cfg.icon}</span> {cfg.label}
    </span>
  );
}

function ExpirationBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-xs text-gray-400">N/A</span>;
  const days = daysUntil(date);
  const color = days <= 30 ? 'text-red-600 bg-red-50' : days <= 90 ? 'text-amber-600 bg-amber-50' : 'text-gray-600 bg-gray-50';
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${color}`}>{formatDate(date)}</span>;
}

export default function InventoryPage() {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [mfgFilter, setMfgFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('sku');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addQty, setAddQty] = useState<Record<string, number>>({});
  const [addUnit, setAddUnit] = useState<Record<string, string>>({});

  const manufacturers = useMemo(() => [...new Set(DEMO_INVENTORY.map(i => i.manufacturer))], []);

  const filtered = useMemo(() => {
    let items = [...DEMO_INVENTORY];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.sku.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.lot_number.toLowerCase().includes(q));
    }
    if (typeFilter) items = items.filter(i => i.product_type === typeFilter);
    if (mfgFilter) items = items.filter(i => i.manufacturer === mfgFilter);
    items.sort((a, b) => {
      switch (sortBy) {
        case 'sku': return a.sku.localeCompare(b.sku);
        case 'quantity': return b.quantity_on_hand - a.quantity_on_hand;
        case 'expiration': return (a.expiration_date || '9999').localeCompare(b.expiration_date || '9999');
        case 'received': return b.date_received.localeCompare(a.date_received);
        case 'weight': return b.total_weight - a.total_weight;
        default: return 0;
      }
    });
    return items;
  }, [search, typeFilter, mfgFilter, sortBy]);

  const totalUnits = filtered.reduce((s, i) => s + i.quantity_on_hand, 0);
  const totalWeight = filtered.reduce((s, i) => s + i.total_weight, 0);
  const expiringSoon = filtered.filter(i => i.expiration_date && daysUntil(i.expiration_date) <= 30).length;
  const hazmatCount = filtered.filter(i => i.product_type === 'hazmat').length;

  function addToCart(item: InventoryItem) {
    const qty = addQty[item.id] || 1;
    const unitType = (addUnit[item.id] || item.unit_of_measure) as UnitOfMeasure;
    const existing = cart.find(c => c.inventory_id === item.id);
    if (existing) {
      setCart(cart.map(c => c.inventory_id === item.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      setCart([...cart, { inventory_id: item.id, sku: item.sku, description: item.description, product_type: item.product_type, unit_type: unitType, quantity: qty, weight_per_unit: item.weight_per_unit, available: item.quantity_available }]);
    }
    setCartOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse and manage your warehouse inventory</p>
        </div>
        <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2 bg-[#F5920B] text-white rounded-xl text-sm font-semibold hover:bg-[#E08209] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          Cart
          {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cart.length}</span>}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total SKUs', value: String(filtered.length), color: '#1B2A4A' },
          { label: 'Total Units', value: totalUnits.toLocaleString(), color: '#1B2A4A' },
          { label: 'Total Weight', value: `${totalWeight.toLocaleString()} lbs`, color: '#1B2A4A' },
          { label: 'Expiring Soon', value: String(expiringSoon), color: expiringSoon > 0 ? '#DC2626' : '#059669' },
          { label: 'Hazmat Items', value: String(hazmatCount), color: hazmatCount > 0 ? '#DC2626' : '#9CA3AF' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input type="text" placeholder="Search SKU, description, or lot..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]">
            <option value="">All Types</option>
            {Object.entries(PRODUCT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
          <select value={mfgFilter} onChange={e => setMfgFilter(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]">
            <option value="">All Manufacturers</option>
            {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]">
            <option value="sku">Sort by SKU</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="expiration">Sort by Expiration</option>
            <option value="received">Sort by Received</option>
            <option value="weight">Sort by Weight</option>
          </select>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-xs font-medium ${viewMode === 'table' ? 'bg-[#1B2A4A] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Table</button>
            <button onClick={() => setViewMode('card')} className={`px-3 py-2 text-xs font-medium ${viewMode === 'card' ? 'bg-[#1B2A4A] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Cards</button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Lot</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">On Hand</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Available</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expiration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1B2A4A]">{item.sku}</td>
                    <td className="px-4 py-3 text-gray-700">{item.description}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{item.lot_number}</td>
                    <td className="px-4 py-3"><TypeBadge type={item.product_type} /></td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{item.quantity_on_hand.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#2A9D8F]">{item.quantity_available.toLocaleString()}</td>
                    <td className="px-4 py-3"><ExpirationBadge date={item.expiration_date} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.warehouse_zone}-{item.bin_location}</td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <button onClick={() => addToCart(item)} className="px-3 py-1.5 text-xs font-semibold bg-[#F5920B] text-white rounded-lg hover:bg-[#E08209] transition-colors">Add</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs font-bold text-[#1B2A4A]">{item.sku}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{item.description}</p>
                </div>
                <TypeBadge type={item.product_type} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div><span className="text-gray-500">On Hand:</span> <span className="font-semibold">{item.quantity_on_hand.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Available:</span> <span className="font-semibold text-[#2A9D8F]">{item.quantity_available.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Lot:</span> <span className="font-mono">{item.lot_number}</span></div>
                <div><span className="text-gray-500">Location:</span> {item.warehouse_zone}-{item.bin_location}</div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <ExpirationBadge date={item.expiration_date} />
                <button onClick={() => addToCart(item)} className="ml-auto px-3 py-1.5 text-xs font-semibold bg-[#F5920B] text-white rounded-lg hover:bg-[#E08209] transition-colors">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CartSidebar items={cart} onUpdateQuantity={(id, qty) => setCart(cart.map(c => c.inventory_id === id ? { ...c, quantity: qty } : c))} onRemove={id => setCart(cart.filter(c => c.inventory_id !== id))} onCheckout={() => { window.location.href = `/portal/${customerCode}/orders/new`; }} open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
