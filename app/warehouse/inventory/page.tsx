// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface InventoryItem {
  id: string;
  sku: string;
  product_name: string;
  upc: string | null;
  lot_number: string | null;
  location_code: string | null;
  qty_on_hand: number;
  qty_allocated: number;
  qty_available: number;
  unit_of_measure: string;
  items_per_case: number | null;
  cases_per_pallet: number | null;
  weight_per_unit: number | null;
  temperature_zone: string;
  warehouse_customers?: { customer_name: string; customer_code: string };
}

const TEMP_BADGES: Record<string, string> = {
  ambient: 'bg-gray-600/30 text-[#4B5563]',
  refrigerated: 'bg-blue-600/30 text-blue-600',
  frozen: 'bg-cyan-600/30 text-cyan-300',
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tempFilter, setTempFilter] = useState<string>('all');
  const [companyId, setCompanyId] = useState<string | null>(null);

  const loadInventory = useCallback(async (cId: string) => {
    const sb = getSupabaseBrowser();
    let query = sb
      .from('warehouse_inventory')
      .select('*, warehouse_customers(customer_name, customer_code)')
      .eq('company_id', cId)
      .order('sku');

    if (tempFilter !== 'all') {
      query = query.eq('temperature_zone', tempFilter);
    }

    if (search.trim()) {
      query = query.or(`sku.ilike.%${search}%,product_name.ilike.%${search}%,upc.ilike.%${search}%,location_code.ilike.%${search}%`);
    }

    const { data } = await query.limit(200);
    setItems(data || []);
    setLoading(false);
  }, [search, tempFilter]);

  useEffect(() => {
    const init = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;

      const { data: memberships } = await sb
        .from('company_members')
        .select('company_id, companies(portal_type)')
        .eq('user_id', session.user.id);

      const wh = memberships?.find(
        (m: any) => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both'
      ) || memberships?.[0];

      if (wh) {
        setCompanyId(wh.company_id);
        loadInventory(wh.company_id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (companyId) {
      const t = setTimeout(() => loadInventory(companyId), 300);
      return () => clearTimeout(t);
    }
  }, [search, tempFilter, companyId, loadInventory]);

  const totals = items.reduce(
    (acc, i) => ({
      onHand: acc.onHand + (i.qty_on_hand || 0),
      allocated: acc.allocated + (i.qty_allocated || 0),
      available: acc.available + (i.qty_available || 0),
    }),
    { onHand: 0, allocated: 0, available: 0 }
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {items.length} SKUs · {totals.onHand.toLocaleString()} on hand · {totals.available.toLocaleString()} available
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search SKU, product, UPC, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]"
        />
        <div className="flex gap-1">
          {['all', 'ambient', 'refrigerated', 'frozen'].map(zone => (
            <button
              key={zone}
              onClick={() => setTempFilter(zone)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                tempFilter === zone
                  ? 'bg-[#1B2A4A] text-white'
                  : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              {zone === 'all' ? 'All Zones' : zone.charAt(0).toUpperCase() + zone.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">Location</th>
                <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">On Hand</th>
                <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">Allocated</th>
                <th className="text-right px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">Available</th>
                <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">UOM</th>
                <th className="text-center px-4 py-3 text-xs text-[#6B7280] font-medium uppercase tracking-wider">Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-4">
                      <div className="h-4 bg-white shadow-sm rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#9CA3AF]">
                    {search ? 'No matching inventory found' : 'No inventory yet. Add items to get started.'}
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-white shadow-sm transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-blue-600">{item.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">{item.product_name}</span>
                      {item.lot_number && (
                        <span className="ml-2 text-[10px] text-[#9CA3AF]">Lot: {item.lot_number}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">
                      {item.warehouse_customers?.customer_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#6B7280]">{item.location_code || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white">{item.qty_on_hand.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-amber-600">
                      {item.qty_allocated > 0 ? item.qty_allocated.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">
                      {item.qty_available.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-[#6B7280]">{item.unit_of_measure}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${TEMP_BADGES[item.temperature_zone] || TEMP_BADGES.ambient}`}>
                        {item.temperature_zone}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
