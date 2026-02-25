// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface Customer {
  id: string;
  customer_name: string;
  customer_code: string;
  contact_email: string | null;
  order_email: string | null;
}

interface InventoryItem {
  id: string;
  sku: string;
  product_name: string;
  qty_available: number;
  unit_of_measure: string;
  weight_per_unit: number | null;
}

interface OrderLine {
  inventory_id: string;
  sku: string;
  product_name: string;
  qty_ordered: number;
  order_unit: string;
  unit_qty: number;
  line_weight: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Order fields
  const [customerId, setCustomerId] = useState('');
  const [orderType, setOrderType] = useState<'outbound' | 'inbound' | 'transfer'>('outbound');
  const [shipToName, setShipToName] = useState('');
  const [shipToAddress, setShipToAddress] = useState('');
  const [shipToCity, setShipToCity] = useState('');
  const [shipToState, setShipToState] = useState('');
  const [shipToZip, setShipToZip] = useState('');
  const [carrier, setCarrier] = useState('');
  const [serviceLevel, setServiceLevel] = useState('');
  const [requestedShipDate, setRequestedShipDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [generateBol, setGenerateBol] = useState(true);
  const [notifyWarehouse, setNotifyWarehouse] = useState(true);

  // Add line item form
  const [addSku, setAddSku] = useState('');
  const [addQty, setAddQty] = useState(1);

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

      if (!wh) return;
      const cId = wh.company_id;
      setCompanyId(cId);

      // Load customers and inventory
      const [custRes, invRes] = await Promise.all([
        sb.from('warehouse_customers').select('id, customer_name, customer_code, contact_email, order_email').eq('company_id', cId).eq('is_active', true),
        sb.from('warehouse_inventory').select('id, sku, product_name, qty_available, unit_of_measure, weight_per_unit').eq('company_id', cId).gt('qty_available', 0).order('sku'),
      ]);

      setCustomers(custRes.data || []);
      setInventory(invRes.data || []);
    };
    init();
  }, []);

  const addLine = () => {
    const item = inventory.find(i => i.id === addSku);
    if (!item) return;
    if (lines.some(l => l.inventory_id === item.id)) return; // no duplicates

    setLines(prev => [...prev, {
      inventory_id: item.id,
      sku: item.sku,
      product_name: item.product_name,
      qty_ordered: addQty,
      order_unit: item.unit_of_measure,
      unit_qty: addQty,
      line_weight: (item.weight_per_unit || 0) * addQty,
    }]);
    setAddSku('');
    setAddQty(1);
  };

  const removeLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const updateLineQty = (idx: number, qty: number) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const item = inventory.find(inv => inv.id === l.inventory_id);
      return {
        ...l,
        qty_ordered: qty,
        unit_qty: qty,
        line_weight: (item?.weight_per_unit || 0) * qty,
      };
    }));
  };

  const totalItems = lines.reduce((s, l) => s + l.qty_ordered, 0);
  const totalWeight = lines.reduce((s, l) => s + l.line_weight, 0);

  const submit = async (asDraft: boolean) => {
    if (!companyId || lines.length === 0) return;
    setSaving(true);

    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const { data: order, error: orderErr } = await sb
        .from('warehouse_orders')
        .insert({
          company_id: companyId,
          customer_id: customerId || null,
          order_number: orderNumber,
          order_type: orderType,
          status: asDraft ? 'draft' : 'submitted',
          ship_to_name: shipToName,
          ship_to_address: shipToAddress,
          ship_to_city: shipToCity,
          ship_to_state: shipToState,
          ship_to_zip: shipToZip,
          carrier: carrier || null,
          service_level: serviceLevel || null,
          requested_ship_date: requestedShipDate || null,
          po_number: poNumber || null,
          special_instructions: specialInstructions || null,
          total_items: totalItems,
          total_weight: Math.round(totalWeight * 100) / 100,
          total_pallets: 0,
          total_cases: 0,
          created_by: session.user.id,
          submitted_at: asDraft ? null : new Date().toISOString(),
        })
        .select()
        .single();

      if (orderErr || !order) throw orderErr || new Error('Failed to create order');

      // Create line items
      const lineInserts = lines.map((l, i) => ({
        order_id: order.id,
        inventory_id: l.inventory_id,
        sku: l.sku,
        product_name: l.product_name,
        qty_ordered: l.qty_ordered,
        qty_picked: 0,
        qty_shipped: 0,
        order_unit: l.order_unit,
        unit_qty: l.unit_qty,
        line_weight: l.line_weight,
      }));

      await sb.from('warehouse_order_items').insert(lineInserts);

      // Auto-generate BOL if checked
      if (generateBol && !asDraft) {
        const bolNumber = `BOL-${Date.now().toString(36).toUpperCase()}`;
        const { data: bol } = await sb
          .from('bills_of_lading')
          .insert({
            company_id: companyId,
            order_id: order.id,
            bol_number: bolNumber,
            shipper_name: 'Woulf Group Warehouse',
            shipper_address: '',
            consignee_name: shipToName,
            consignee_address: [shipToAddress, shipToCity, shipToState, shipToZip].filter(Boolean).join(', '),
            carrier_name: carrier || null,
            ship_date: requestedShipDate || new Date().toISOString().split('T')[0],
            freight_charge_terms: 'prepaid',
            total_pieces: totalItems,
            total_weight: Math.round(totalWeight * 100) / 100,
            total_pallets: 0,
            status: 'draft',
          })
          .select()
          .single();

        // Add BOL line items
        if (bol) {
          const bolItems = lines.map(l => ({
            bol_id: bol.id,
            description: l.product_name,
            packaging_type: 'CS' as const,
            quantity: l.qty_ordered,
            weight: l.line_weight,
          }));
          await sb.from('bol_items').insert(bolItems);
        }
      }

      // Notify warehouse via email (placeholder — requires Resend integration)
      if (notifyWarehouse && !asDraft) {
        // This would call /api/warehouse/notify with order details
        // For now we just log it
        console.log('Warehouse notification would be sent for order:', orderNumber);
      }

      router.push('/warehouse/orders');
    } catch (err) {
      console.error('Order creation failed:', err);
      alert('Failed to create order. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Order</h1>
        <p className="text-sm text-white/40 mt-1">Create a warehouse order with line items</p>
      </div>

      <div className="space-y-6">
        {/* Order Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Order Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-gray-900">Select customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-gray-900">
                    {c.customer_name} ({c.customer_code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Order Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="outbound" className="bg-gray-900">Outbound</option>
                <option value="inbound" className="bg-gray-900">Inbound</option>
                <option value="transfer" className="bg-gray-900">Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">PO Number</label>
              <input type="text" value={poNumber} onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Customer PO #"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Requested Ship Date</label>
              <input type="date" value={requestedShipDate} onChange={(e) => setRequestedShipDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Ship To */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Ship To</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-white/50 mb-1">Name / Company</label>
              <input type="text" value={shipToName} onChange={(e) => setShipToName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-white/50 mb-1">Address</label>
              <input type="text" value={shipToAddress} onChange={(e) => setShipToAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">City</label>
              <input type="text" value={shipToCity} onChange={(e) => setShipToCity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">State</label>
                <input type="text" value={shipToState} onChange={(e) => setShipToState(e.target.value)} maxLength={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">ZIP</label>
                <input type="text" value={shipToZip} onChange={(e) => setShipToZip(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Carrier</label>
              <input type="text" value={carrier} onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. FedEx, UPS, XPO"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Service Level</label>
              <input type="text" value={serviceLevel} onChange={(e) => setServiceLevel(e.target.value)}
                placeholder="e.g. Ground, 2-Day"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Line Items</h2>

          {/* Add line */}
          <div className="flex items-end gap-3 p-3 bg-white/5 rounded-lg">
            <div className="flex-1">
              <label className="block text-xs text-white/50 mb-1">Product</label>
              <select
                value={addSku}
                onChange={(e) => setAddSku(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" className="bg-gray-900">Select product...</option>
                {inventory.map(i => (
                  <option key={i.id} value={i.id} className="bg-gray-900">
                    {i.sku} — {i.product_name} ({i.qty_available} {i.unit_of_measure} avail)
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs text-white/50 mb-1">Qty</label>
              <input type="number" min={1} value={addQty} onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={addLine}
              disabled={!addSku}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors"
            >
              Add
            </button>
          </div>

          {/* Lines table */}
          {lines.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-xs text-white/40">SKU</th>
                  <th className="text-left py-2 text-xs text-white/40">Product</th>
                  <th className="text-right py-2 text-xs text-white/40">Qty</th>
                  <th className="text-center py-2 text-xs text-white/40">UOM</th>
                  <th className="text-right py-2 text-xs text-white/40">Weight</th>
                  <th className="text-right py-2 text-xs text-white/40"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="py-2 font-mono text-xs text-blue-400">{l.sku}</td>
                    <td className="py-2 text-white/70">{l.product_name}</td>
                    <td className="py-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={l.qty_ordered}
                        onChange={(e) => updateLineQty(i, parseInt(e.target.value) || 1)}
                        className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 text-center text-xs text-white/50">{l.order_unit}</td>
                    <td className="py-2 text-right font-mono text-xs text-white/50">
                      {l.line_weight > 0 ? `${l.line_weight.toFixed(1)} lbs` : '—'}
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeLine(i)} className="text-red-400/60 hover:text-red-400 text-xs">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td colSpan={2} className="py-2 text-xs text-white/40">Totals</td>
                  <td className="py-2 text-right font-bold text-white">{totalItems}</td>
                  <td></td>
                  <td className="py-2 text-right font-mono text-xs text-white">
                    {totalWeight > 0 ? `${totalWeight.toFixed(1)} lbs` : '—'}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Special Instructions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
          <label className="block text-xs text-white/50">Special Instructions</label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            placeholder="Delivery notes, handling requirements..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Options */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={generateBol}
              onChange={(e) => setGenerateBol(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5"
            />
            <span className="text-sm text-white/70">Auto-generate Bill of Lading</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyWarehouse}
              onChange={(e) => setNotifyWarehouse(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5"
            />
            <span className="text-sm text-white/70">Email notification to warehouse</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => router.push('/warehouse/orders')}
            className="px-4 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => submit(true)}
            disabled={saving || lines.length === 0}
            className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-30 text-sm text-white font-medium transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => submit(false)}
            disabled={saving || lines.length === 0 || !shipToName}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors"
          >
            {saving ? 'Creating...' : 'Submit Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
