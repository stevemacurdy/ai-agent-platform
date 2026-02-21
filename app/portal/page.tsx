'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getPortal } from '@/lib/tenant-data';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '\uD83D\uDCCA' },
  { id: 'inventory', name: 'Inventory', icon: '\uD83D\uDCE6' },
  { id: 'shipments', name: 'Shipments', icon: '\uD83D\uDE9A' },
  { id: 'bol', name: 'Bill of Lading', icon: '\uD83D\uDCC4' },
  { id: 'po', name: 'Purchase Orders', icon: '\uD83D\uDED2' },
  { id: 'billing', name: 'Billing', icon: '\uD83D\uDCB3' },
  { id: 'support', name: 'Support', icon: '\uD83D\uDCAC' },
];

const FREIGHT_CLASSES = ['50','55','60','65','70','77.5','85','92.5','100','110','125','150','175','200','250','300','400','500'];
const UNIT_TYPES = ['Pallet', 'Case', 'Box', 'Weight'];
const MEASUREMENTS = ['Standard (lbs/in)', 'Metric (kg/cm)'];

interface BOLItem { sku: string; lotNumber: string; expDate: string; description: string; qty: number; unitType: string; weight: number; freightClass: string; }

export default function CustomerPortal() {
  const { currentCompany, isLoading } = useTenant();
  const portal = getPortal(currentCompany?.name);
  const [activeTab, setActiveTab] = useState('overview');
  const [bolItems, setBolItems] = useState<BOLItem[]>([]);
  const [measurement, setMeasurement] = useState('Standard (lbs/in)');
  const [shipTo, setShipTo] = useState({ name: '', address: '', city: '', state: '', zip: '' });
  const [shipFrom, setShipFrom] = useState({ name: currentCompany?.name || '', address: '', city: 'Grantsville', state: 'UT', zip: '84029' });
  const [carrier, setCarrier] = useState('');
  const [unitType, setUnitType] = useState('Pallet');
  const [showNewPO, setShowNewPO] = useState(false);

  const addToBOL = (inv: typeof portal.inventory[0], qty: number) => {
    const existing = bolItems.findIndex(b => b.sku === inv.sku && b.lotNumber === inv.lot);
    if (existing >= 0) { const u = [...bolItems]; u[existing].qty += qty; setBolItems(u); }
    else { setBolItems([...bolItems, { sku: inv.sku, lotNumber: inv.lot, expDate: inv.exp, description: inv.name, qty, unitType, weight: inv.weight * qty, freightClass: inv.freightClass }]); }
  };
  const removeBOLItem = (i: number) => setBolItems(bolItems.filter((_, idx) => idx !== i));
  const totalWeight = bolItems.reduce((sum, b) => sum + b.weight, 0);
  const weightUnit = measurement.includes('lbs') ? 'lbs' : 'kg';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Customer Portal</h1><p className="text-sm text-gray-400 mt-1">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p></div>

      <div className="flex gap-2 border-b border-white/5 pb-3 overflow-x-auto">
        {TABS.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ' + (activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}><span>{tab.icon}</span> {tab.name}</button>))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total SKUs</div><div className="text-2xl font-bold mt-1">{portal.totalSkus.toLocaleString()}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Low Stock</div><div className="text-2xl font-bold mt-1 text-amber-400">{portal.lowStock}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Pending ASNs</div><div className="text-2xl font-bold mt-1 text-blue-400">{portal.pendingAsns}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Open BOLs</div><div className="text-2xl font-bold mt-1">{bolItems.length > 0 ? 1 : 0}</div></div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-xs text-gray-500">SKU</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Name</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Lot #</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Exp Date</th>
            <th className="text-right px-4 py-3 text-xs text-gray-500">Qty</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Location</th>
            <th className="text-right px-4 py-3 text-xs text-gray-500">Ship</th>
          </tr></thead><tbody>
            {portal.inventory.map((item, i) => (
              <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-mono text-blue-400">{item.sku}</td>
                <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-400">{item.lot}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{item.exp}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{item.qty}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.location}</td>
                <td className="px-4 py-3 text-right">{item.qty > 0 && <button onClick={() => { addToBOL(item, 1); setActiveTab('bol'); }} className="text-[10px] px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">+ BOL</button>}</td>
              </tr>
            ))}
            {portal.inventory.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No inventory for this company.</td></tr>}
          </tbody></table>
        </div>
      )}

      {activeTab === 'shipments' && (
        portal.shipments.length > 0 ? (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full"><thead><tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500">ID</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500">Type</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500">Items</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500">Carrier</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
            </tr></thead><tbody>
              {portal.shipments.map(s => (
                <tr key={s.id} className="border-b border-white/[0.03]">
                  <td className="px-4 py-3 text-sm font-mono text-blue-400">{s.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{s.type}</td>
                  <td className="px-4 py-3 text-sm text-right">{s.items}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s.carrier}</td>
                  <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">{s.status}</span></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        ) : (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 text-center text-gray-500 text-sm">
            <div className="text-3xl mb-3">{'\uD83D\uDE9A'}</div><p>No shipments for this company.</p>
          </div>
        )
      )}

      {activeTab === 'bol' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center"><h2 className="text-lg font-bold">STRAIGHT BILL OF LADING</h2><div className="text-[10px] text-gray-500">DOT Compliant</div></div>
          <div className="grid grid-cols-2 gap-6">
            <div><h3 className="text-xs text-gray-400 uppercase font-semibold mb-2">Ship From</h3>
              <input value={shipFrom.name} onChange={e => setShipFrom({...shipFrom, name: e.target.value})} placeholder="Company" className="w-full mb-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" />
              <input value={shipFrom.address} onChange={e => setShipFrom({...shipFrom, address: e.target.value})} placeholder="Address" className="w-full mb-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" />
              <div className="grid grid-cols-3 gap-1"><input value={shipFrom.city} onChange={e => setShipFrom({...shipFrom, city: e.target.value})} placeholder="City" className="px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /><input value={shipFrom.state} onChange={e => setShipFrom({...shipFrom, state: e.target.value})} placeholder="ST" className="px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /><input value={shipFrom.zip} onChange={e => setShipFrom({...shipFrom, zip: e.target.value})} placeholder="ZIP" className="px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /></div>
            </div>
            <div><h3 className="text-xs text-gray-400 uppercase font-semibold mb-2">Ship To</h3>
              <input value={shipTo.name} onChange={e => setShipTo({...shipTo, name: e.target.value})} placeholder="Company" className="w-full mb-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" />
              <input value={shipTo.address} onChange={e => setShipTo({...shipTo, address: e.target.value})} placeholder="Address" className="w-full mb-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" />
              <div className="grid grid-cols-3 gap-1"><input value={shipTo.city} onChange={e => setShipTo({...shipTo, city: e.target.value})} placeholder="City" className="px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /><input value={shipTo.state} onChange={e => setShipTo({...shipTo, state: e.target.value})} placeholder="ST" className="px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /><input value={shipTo.zip} onChange={e => setShipTo({...shipTo, zip: e.target.value})} placeholder="ZIP" className="px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Carrier</label><input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="Carrier" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Unit Type</label><select value={unitType} onChange={e => setUnitType(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white">{UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Measurement</label><select value={measurement} onChange={e => setMeasurement(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white">{MEASUREMENTS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          </div>
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full"><thead><tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-3 py-2 text-[10px] text-gray-400">SKU</th><th className="text-left px-3 py-2 text-[10px] text-gray-400">Description</th><th className="text-left px-3 py-2 text-[10px] text-gray-400">Lot #</th><th className="text-left px-3 py-2 text-[10px] text-gray-400">Exp</th><th className="text-right px-3 py-2 text-[10px] text-gray-400">Qty</th><th className="text-left px-3 py-2 text-[10px] text-gray-400">Unit</th><th className="text-right px-3 py-2 text-[10px] text-gray-400">Weight</th><th className="text-left px-3 py-2 text-[10px] text-gray-400">Class</th><th className="px-3 py-2"></th>
            </tr></thead><tbody>
              {bolItems.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-xs text-gray-600">No items. Go to Inventory tab and click + BOL.</td></tr>
              ) : bolItems.map((item, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="px-3 py-2 text-xs font-mono text-blue-400">{item.sku}</td>
                  <td className="px-3 py-2 text-xs text-white">{item.description}</td>
                  <td className="px-3 py-2 text-xs font-mono text-gray-400">{item.lotNumber}</td>
                  <td className="px-3 py-2 text-xs text-gray-400">{item.expDate}</td>
                  <td className="px-3 py-2 text-xs text-right"><input type="number" value={item.qty} min={1} onChange={e => { const u = [...bolItems]; u[i].qty = Number(e.target.value); u[i].weight = Number(e.target.value) * (portal.inventory.find(m => m.sku === item.sku)?.weight || 1); setBolItems(u); }} className="w-16 text-right px-1 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white" /></td>
                  <td className="px-3 py-2 text-xs text-gray-400">{unitType}</td>
                  <td className="px-3 py-2 text-xs text-right font-mono">{item.weight.toFixed(1)}</td>
                  <td className="px-3 py-2 text-xs"><select value={item.freightClass} onChange={e => { const u = [...bolItems]; u[i].freightClass = e.target.value; setBolItems(u); }} className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white">{FREIGHT_CLASSES.map(fc => <option key={fc} value={fc}>{fc}</option>)}</select></td>
                  <td className="px-3 py-2"><button onClick={() => removeBOLItem(i)} className="text-red-400 text-xs">X</button></td>
                </tr>
              ))}
            </tbody></table>
          </div>
          {bolItems.length > 0 && <div className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-3"><span className="text-sm text-gray-400">{bolItems.length} items</span><span className="text-sm text-white font-bold">{totalWeight.toFixed(1)} {weightUnit}</span></div>}
          <div className="flex gap-3">
            <button onClick={() => setActiveTab('inventory')} className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">+ Add Items</button>
            {bolItems.length > 0 && <><button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">Generate BOL PDF</button><button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-500">Submit BOL</button></>}
          </div>
        </div>
      )}

      {activeTab === 'po' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center"><h2 className="text-lg font-semibold">Purchase Orders</h2><button onClick={() => setShowNewPO(!showNewPO)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">{showNewPO ? 'Cancel' : '+ New PO'}</button></div>
          {showNewPO && <div className="bg-[#0A0E15] border border-blue-500/20 rounded-xl p-6"><h3 className="text-sm font-semibold mb-3">Create Purchase Order</h3><div className="grid grid-cols-2 gap-4 mb-3"><div><label className="text-xs text-gray-400 mb-1 block">Vendor</label><input placeholder="Vendor" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /></div><div><label className="text-xs text-gray-400 mb-1 block">Delivery Date</label><input type="date" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white" /></div></div><button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">Submit PO</button></div>}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Balance</div><div className="text-2xl font-bold mt-1">{'$' + portal.balance.toLocaleString()}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Storage/mo</div><div className="text-2xl font-bold mt-1">{'$' + portal.storageFee.toLocaleString()}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Last Payment</div><div className="text-2xl font-bold mt-1 text-emerald-400">{'$' + portal.lastPayment.toLocaleString()}</div></div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">{'\uD83D\uDCAC'}</div><h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-gray-400 mb-4">Monday-Friday, 8am-6pm MST</p>
          <div className="flex justify-center gap-3"><a href="mailto:support@woulfgroup.com" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">Email Support</a><a href="tel:+18015551234" className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">Call Us</a></div>
        </div>
      )}
    </div>
  );
}