// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [vendorName, setVendorName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [shipVia, setShipVia] = useState('');
  const [fob, setFob] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([]);

  const [addSku, setAddSku] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [addPrice, setAddPrice] = useState(0);
  const [addUom, setAddUom] = useState('EA');

  useEffect(() => {
    const init = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;
      const { data: memberships } = await sb
        .from('company_members')
        .select('company_id, companies(portal_type)')
        .eq('user_id', session.user.id);
      const wh = memberships?.find(m => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both') || memberships?.[0];
      if (wh) setCompanyId(wh.company_id);
    };
    init();
  }, []);

  const addLine = () => {
    if (!addDesc.trim()) return;
    setLines(prev => [...prev, { sku: addSku, description: addDesc, quantity: addQty, unit_price: addPrice, unit_of_measure: addUom }]);
    setAddSku(''); setAddDesc(''); setAddQty(1); setAddPrice(0); setAddUom('EA');
  };

  const removeLine = (idx) => setLines(prev => prev.filter((_, i) => i !== idx));
  const updateLine = (idx, field, value) => setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

  const subtotal = lines.reduce((s, l) => s + (l.quantity * l.unit_price), 0);
  const total = subtotal;

  const submit = async (asDraft) => {
    if (!companyId || lines.length === 0 || !vendorName.trim()) return;
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;
      const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
      const { data: po, error: poErr } = await sb
        .from('purchase_orders')
        .insert({
          company_id: companyId, po_number: poNumber, vendor_name: vendorName,
          buyer_name: buyerName || null, buyer_email: buyerEmail || null,
          payment_terms: paymentTerms || null, ship_via: shipVia || null, fob: fob || null,
          notes: notes || null, subtotal, tax: 0, total, status: asDraft ? 'draft' : 'submitted',
          created_by: session.user.id,
        })
        .select().single();
      if (poErr || !po) throw poErr || new Error('Failed to create PO');

      const lineInserts = lines.map((l, i) => ({
        po_id: po.id, line_number: i + 1, sku: l.sku || null,
        description: l.description, quantity: l.quantity, unit_price: l.unit_price,
        unit_of_measure: l.unit_of_measure || 'EA',
      }));
      await sb.from('po_items').insert(lineInserts);
      router.push('/warehouse/purchase-orders');
    } catch (err) {
      console.error('PO creation failed:', err);
      alert('Failed to create purchase order.');
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Purchase Order</h1>
        <p className="text-sm text-[#6B7280] mt-1">Create a purchase order for inbound inventory</p>
      </div>
      <div className="space-y-6">
        {/* Vendor & Buyer */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider">Vendor & Buyer</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-[#6B7280] mb-1">Vendor Name *</label>
              <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="e.g. Steel King Industries"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Buyer Name</label>
              <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Buyer Email</label>
              <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
          </div>
        </div>
        {/* Terms */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider">Terms & Shipping</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Payment Terms</label>
              <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]">
                {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', 'Prepaid'].map(t => (
                  <option key={t} value={t} className="bg-white">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Ship Via</label>
              <input type="text" value={shipVia} onChange={(e) => setShipVia(e.target.value)} placeholder="e.g. FedEx Freight"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">FOB</label>
              <input type="text" value={fob} onChange={(e) => setFob(e.target.value)} placeholder="e.g. Destination"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
          </div>
        </div>
        {/* Line Items */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider">Line Items</h2>
          <div className="flex items-end gap-2 p-3 bg-white shadow-sm rounded-lg">
            <div className="w-28">
              <label className="block text-xs text-[#6B7280] mb-1">SKU</label>
              <input type="text" value={addSku} onChange={(e) => setAddSku(e.target.value)} placeholder="Optional"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-2 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#6B7280] mb-1">Description *</label>
              <input type="text" value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Item description"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-2 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div className="w-16">
              <label className="block text-xs text-[#6B7280] mb-1">Qty</label>
              <input type="number" min={1} value={addQty} onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div className="w-24">
              <label className="block text-xs text-[#6B7280] mb-1">Unit Price</label>
              <input type="number" min={0} step={0.01} value={addPrice} onChange={(e) => setAddPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div className="w-20">
              <label className="block text-xs text-[#6B7280] mb-1">UOM</label>
              <select value={addUom} onChange={(e) => setAddUom(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]">
                {['EA', 'CS', 'PL', 'LB', 'KG', 'FT', 'BX'].map(u => (
                  <option key={u} value={u} className="bg-white">{u}</option>
                ))}
              </select>
            </div>
            <button onClick={addLine} disabled={!addDesc.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors">
              Add
            </button>
          </div>
          {lines.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-2 text-xs text-[#6B7280]">#</th>
                  <th className="text-left py-2 text-xs text-[#6B7280]">SKU</th>
                  <th className="text-left py-2 text-xs text-[#6B7280]">Description</th>
                  <th className="text-right py-2 text-xs text-[#6B7280]">Qty</th>
                  <th className="text-center py-2 text-xs text-[#6B7280]">UOM</th>
                  <th className="text-right py-2 text-xs text-[#6B7280]">Unit Price</th>
                  <th className="text-right py-2 text-xs text-[#6B7280]">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {lines.map((l, i) => (
                  <tr key={i}>
                    <td className="py-2 text-xs text-[#9CA3AF]">{i + 1}</td>
                    <td className="py-2 font-mono text-xs text-blue-600">{l.sku || '\u2014'}</td>
                    <td className="py-2 text-[#4B5563]">{l.description}</td>
                    <td className="py-2 text-right">
                      <input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(i, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 bg-white border border-[#E5E7EB] shadow-sm rounded px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-[#2A9D8F]" />
                    </td>
                    <td className="py-2 text-center text-xs text-[#6B7280]">{l.unit_of_measure}</td>
                    <td className="py-2 text-right">
                      <input type="number" min={0} step={0.01} value={l.unit_price} onChange={(e) => updateLine(i, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-white border border-[#E5E7EB] shadow-sm rounded px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-[#2A9D8F]" />
                    </td>
                    <td className="py-2 text-right font-mono text-white">${(l.quantity * l.unit_price).toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeLine(i)} className="text-red-600/60 hover:text-red-600 text-xs">\u2715</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#E5E7EB]">
                  <td colSpan={6} className="py-3 text-right text-sm text-[#6B7280]">Subtotal</td>
                  <td className="py-3 text-right font-mono font-bold text-white">${subtotal.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr className="border-t border-[#E5E7EB]">
                  <td colSpan={6} className="py-3 text-right text-sm font-bold text-white">Total</td>
                  <td className="py-3 text-right font-mono font-bold text-lg text-white">${total.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
        {/* Notes */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5">
          <label className="block text-xs text-[#6B7280] mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Special instructions, delivery notes..."
            className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F] resize-none" />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => router.push('/warehouse/purchase-orders')}
            className="px-4 py-2.5 rounded-lg text-sm text-[#6B7280] hover:text-[#4B5563] transition-colors">Cancel</button>
          <button onClick={() => submit(true)} disabled={saving || lines.length === 0 || !vendorName.trim()}
            className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-white/15 disabled:opacity-30 text-sm text-white font-medium transition-colors">Save Draft</button>
          <button onClick={() => submit(false)} disabled={saving || lines.length === 0 || !vendorName.trim()}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors">
            {saving ? 'Creating...' : 'Submit PO'}
          </button>
        </div>
      </div>
    </div>
  );
}
