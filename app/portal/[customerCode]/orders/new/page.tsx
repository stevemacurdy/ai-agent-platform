'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PRODUCT_TYPE_CONFIG,
  generateOrderNumber, generatePONumber, generateBOLNumber,
} from '@/lib/3pl-portal-data';
import type { InventoryItem, CartItem, UnitOfMeasure } from '@/lib/3pl-portal-data';
import { usePortalData } from '@/lib/portal-data-context';
import CartSidebar from '@/components/portal/CartSidebar';
import DocumentUpload from '@/components/portal/DocumentUpload';
import { usePortal } from '@/lib/portal-context';

const SHIP_METHODS = [
  { value: 'ground', label: 'Ground' },
  { value: 'express', label: 'Express' },
  { value: 'ltl', label: 'Freight LTL' },
  { value: 'ftl', label: 'Freight FTL' },
  { value: 'pickup', label: 'Customer Pickup' },
  { value: 'other', label: 'Other' },
];
const CARRIERS = ['FedEx Freight', 'UPS', 'YRC Freight', 'Estes Express', 'XPO Logistics', 'Old Dominion', 'SAIA', 'Other'];

export default function PlaceOrderPage() {
  const params = useParams();
  const router = useRouter();
  const customerCode = params.customerCode as string;
  const { basePath } = usePortal();
  const { inventory: inventoryItems } = usePortalData();
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [addQty, setAddQty] = useState<Record<string, number>>({});
  const [addUnit, setAddUnit] = useState<Record<string, string>>({});
  const [shipTo, setShipTo] = useState({ name: '', street: '', city: '', state: '', zip: '' });
  const [shipMethod, setShipMethod] = useState('ground');
  const [carrier, setCarrier] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customerPO, setCustomerPO] = useState('');
  const [coiFiles, setCoiFiles] = useState<File[]>([]);
  const [asnFiles, setAsnFiles] = useState<File[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [poNumber, setPONumber] = useState('');
  const [bolNumber, setBOLNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    let items = [...inventoryItems].filter(i => i.quantity_available > 0);
    if (search) { const q = search.toLowerCase(); items = items.filter(i => i.sku.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)); }
    if (typeFilter) items = items.filter(i => i.product_type === typeFilter);
    return items;
  }, [search, typeFilter]);

  const totalWeight = cart.reduce((s, i) => s + i.weight_per_unit * i.quantity, 0);
  const totalCases = cart.reduce((s, i) => s + i.quantity, 0);
  const estimatedPallets = Math.max(1, Math.ceil(totalWeight / 2000));

  function addToCart(item: InventoryItem) {
    const qty = addQty[item.id] || 1;
    const unitType = (addUnit[item.id] || item.unit_of_measure) as UnitOfMeasure;
    const existing = cart.find(c => c.inventory_id === item.id);
    if (existing) {
      setCart(cart.map(c => c.inventory_id === item.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      setCart([...cart, { inventory_id: item.id, sku: item.sku, description: item.description, product_type: item.product_type, unit_type: unitType, quantity: qty, weight_per_unit: item.weight_per_unit, available: item.quantity_available }]);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    const on = generateOrderNumber(); const pn = customerPO || generatePONumber(); const bn = generateBOLNumber();
    setOrderNumber(on); setPONumber(pn); setBOLNumber(bn);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false); setConfirmed(true);
  }

  const stepLabels = ['Select Items', 'Shipping Details', 'Documents', 'Review & Submit'];

  if (confirmed) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Order Submitted</h2>
          <p className="text-sm text-gray-500 mb-6">Operations team has been notified.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Order #</span><span className="font-mono font-semibold">{orderNumber}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">PO #</span><span className="font-mono font-semibold">{poNumber}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">BOL #</span><span className="font-mono font-semibold">{bolNumber}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Items</span><span className="font-semibold">{cart.length} lines, {totalCases} units</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Weight</span><span className="font-semibold">{totalWeight.toFixed(0)} lbs ({estimatedPallets} pallets)</span></div>
          </div>
          <button onClick={() => router.push(`${basePath}/orders`)} className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-semibold hover:bg-[#1B2A4A]/90 transition-colors">View Orders</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Place Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create an outbound shipment from your inventory</p>
        </div>
        <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2 bg-[#F5920B] text-white rounded-xl text-sm font-semibold hover:bg-[#E08209] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" /></svg>
          Cart ({cart.length})
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button onClick={() => { if (i + 1 <= step) setStep(i + 1); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${step === i + 1 ? 'bg-[#1B2A4A] text-white' : step > i + 1 ? 'bg-[#2A9D8F]/10 text-[#2A9D8F]' : 'bg-gray-100 text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step > i + 1 ? 'bg-[#2A9D8F] text-white' : ''}`}>
                {step > i + 1 ? <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < stepLabels.length - 1 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Items */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
            <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50">
              <option value="">All Types</option>
              {Object.entries(PRODUCT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">SKU / Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Available</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Unit</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Qty</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Add</th>
              </tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-bold text-[#1B2A4A]">{item.sku}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: PRODUCT_TYPE_CONFIG[item.product_type].color, backgroundColor: PRODUCT_TYPE_CONFIG[item.product_type].bgColor }}>{PRODUCT_TYPE_CONFIG[item.product_type].label}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#2A9D8F]">{item.quantity_available.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={addUnit[item.id] || item.unit_of_measure} onChange={e => setAddUnit({ ...addUnit, [item.id]: e.target.value })} className="text-xs rounded-lg border border-gray-200 px-2 py-1.5 bg-gray-50">
                        {['pallet','case','each','bag','box'].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="number" min={1} max={item.quantity_available} value={addQty[item.id] || ''} onChange={e => setAddQty({ ...addQty, [item.id]: parseInt(e.target.value) || 0 })} placeholder="Qty"
                        className="w-16 text-xs text-center rounded-lg border border-gray-200 px-2 py-1.5 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => addToCart(item)} disabled={!addQty[item.id]} className="px-3 py-1.5 text-xs font-semibold bg-[#F5920B] text-white rounded-lg hover:bg-[#E08209] disabled:opacity-40 transition-colors">Add</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cart.length > 0 && (
            <div className="flex justify-end">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-semibold hover:bg-[#1B2A4A]/90 transition-colors">Continue to Shipping</button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Shipping */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Ship-To Address</h2>
            <input type="text" placeholder="Company / Recipient Name" value={shipTo.name} onChange={e => setShipTo({ ...shipTo, name: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
            <input type="text" placeholder="Street Address" value={shipTo.street} onChange={e => setShipTo({ ...shipTo, street: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="City" value={shipTo.city} onChange={e => setShipTo({ ...shipTo, city: e.target.value })} className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
              <input type="text" placeholder="State" value={shipTo.state} onChange={e => setShipTo({ ...shipTo, state: e.target.value })} className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
              <input type="text" placeholder="ZIP" value={shipTo.zip} onChange={e => setShipTo({ ...shipTo, zip: e.target.value })} className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Shipping Method</h2>
            <div className="grid grid-cols-2 gap-3">
              <select value={shipMethod} onChange={e => setShipMethod(e.target.value)} className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50">
                {SHIP_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={carrier} onChange={e => setCarrier(e.target.value)} className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50">
                <option value="">Select Carrier</option>
                {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Requested Ship Date</label>
                <input type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your PO # (optional)</label>
                <input type="text" placeholder="PO-12345" value={customerPO} onChange={e => setCustomerPO(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Special Instructions</label>
              <textarea rows={3} value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="Stacking limits, delivery window, etc." className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A] resize-none" />
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Back</button>
            <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-semibold hover:bg-[#1B2A4A]/90 transition-colors">Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <DocumentUpload label="Certificate of Inspection (COI)" accept=".pdf,.jpg,.jpeg,.png" onUpload={files => setCoiFiles(files)} />
            <DocumentUpload label="ASN / Advance Ship Notice Documents" accept=".pdf,.jpg,.jpeg,.png" multiple onUpload={files => setAsnFiles(files)} />
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Back</button>
            <button onClick={() => setStep(4)} className="px-6 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-semibold hover:bg-[#1B2A4A]/90 transition-colors">Review Order</button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>
            {cart.map(item => (
              <div key={item.inventory_id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div><p className="text-sm font-medium">{item.sku}</p><p className="text-xs text-gray-500">{item.description}</p></div>
                <div className="text-right text-sm"><p className="font-semibold">{item.quantity} {item.unit_type}(s)</p><p className="text-xs text-gray-400">{(item.weight_per_unit * item.quantity).toFixed(0)} lbs</p></div>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100 text-center">
              <div><p className="text-xs text-gray-500">Items</p><p className="font-bold">{totalCases}</p></div>
              <div><p className="text-xs text-gray-500">Weight</p><p className="font-bold">{totalWeight.toFixed(0)} lbs</p></div>
              <div><p className="text-xs text-gray-500">Pallets</p><p className="font-bold">{estimatedPallets}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Shipping Details</h2>
            <p className="text-sm text-gray-700">{shipTo.name}</p>
            <p className="text-sm text-gray-500">{shipTo.street}, {shipTo.city}, {shipTo.state} {shipTo.zip}</p>
            <p className="text-sm text-gray-500">{SHIP_METHODS.find(m => m.value === shipMethod)?.label}{carrier && ` via ${carrier}`}</p>
            {requestedDate && <p className="text-sm text-gray-500">Ship by: {requestedDate}</p>}
            {specialInstructions && <p className="text-sm text-gray-400 italic">{specialInstructions}</p>}
          </div>
          {(coiFiles.length > 0 || asnFiles.length > 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Documents</h2>
              {coiFiles.length > 0 && <p className="text-sm text-gray-600">COI: {coiFiles.length} file(s)</p>}
              {asnFiles.length > 0 && <p className="text-sm text-gray-600">ASN: {asnFiles.length} file(s)</p>}
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-8 py-3 bg-[#F5920B] text-white rounded-xl text-sm font-bold hover:bg-[#E08209] disabled:opacity-50 transition-colors flex items-center gap-2">
              {submitting ? (<><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Placing Order...</>) : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      <CartSidebar items={cart} onUpdateQuantity={(id, qty) => setCart(cart.map(c => c.inventory_id === id ? { ...c, quantity: qty } : c))} onRemove={id => setCart(cart.filter(c => c.inventory_id !== id))} onCheckout={() => { setCartOpen(false); setStep(2); }} open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
