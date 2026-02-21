'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import Link from 'next/link';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '📊' },
  { id: 'inventory', name: 'Inventory', icon: '📦' },
  { id: 'shipments', name: 'Shipments', icon: '🚚' },
  { id: 'billing', name: 'Billing', icon: '💳' },
  { id: 'support', name: 'Support', icon: '💬' },
];

const MOCK_INVENTORY = [
  { sku: 'SKU-A102', name: 'Widget Pro X', qty: 1247, location: 'A-12-3', status: 'In Stock' },
  { sku: 'SKU-B205', name: 'Bracket Assembly', qty: 8, location: 'B-04-1', status: 'Low Stock' },
  { sku: 'SKU-C310', name: 'Sensor Module v3', qty: 432, location: 'C-08-2', status: 'In Stock' },
  { sku: 'SKU-D418', name: 'Power Supply 12V', qty: 0, location: 'D-01-4', status: 'Out of Stock' },
  { sku: 'SKU-E522', name: 'Cable Harness 2m', qty: 2150, location: 'A-15-1', status: 'In Stock' },
  { sku: 'SKU-F630', name: 'Display Panel LCD', qty: 56, location: 'E-02-3', status: 'In Stock' },
];

const MOCK_SHIPMENTS = [
  { id: 'SHP-001', type: 'Inbound ASN', items: 3, status: 'Arriving Tomorrow', carrier: 'FedEx', tracking: '7489201' },
  { id: 'SHP-002', type: 'Outbound', items: 12, status: 'Shipped', carrier: 'UPS', tracking: '1Z999AA1' },
  { id: 'SHP-003', type: 'Inbound ASN', items: 1, status: 'Pending Receipt', carrier: 'Freight', tracking: 'PRO-44821' },
  { id: 'SHP-004', type: 'Outbound', items: 5, status: 'Processing', carrier: 'USPS', tracking: '-' },
];

export default function CustomerPortal() {
  const { currentCompany, isLoading } = useTenant();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer Portal</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'} — Inventory, Shipments & Billing
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition">+ New ASN</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Export</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition " + (activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
            <span>{tab.icon}</span> {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Total SKUs</div>
              <div className="text-2xl font-bold mt-1">1,247</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Low Stock Items</div>
              <div className="text-2xl font-bold mt-1 text-amber-400">2</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Pending ASNs</div>
              <div className="text-2xl font-bold mt-1 text-blue-400">2</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Shipments Today</div>
              <div className="text-2xl font-bold mt-1 text-emerald-400">3</div>
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>• ASN #SHP-001 arriving tomorrow (3 items)</span><span className="text-gray-600">2h ago</span></div>
              <div className="flex justify-between text-gray-400"><span>• Order #SHP-002 shipped via UPS</span><span className="text-gray-600">5h ago</span></div>
              <div className="flex justify-between text-gray-400"><span>• SKU-B205 low stock alert (8 remaining)</span><span className="text-gray-600">1d ago</span></div>
              <div className="flex justify-between text-gray-400"><span>• Cycle count completed — 99.2% accuracy</span><span className="text-gray-600">2d ago</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">SKU</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Qty</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Location</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_INVENTORY.map(item => (
                <tr key={item.sku} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm font-mono text-blue-400">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-white">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono">{item.qty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{item.location}</td>
                  <td className="px-4 py-3"><span className={"text-[10px] px-2 py-0.5 rounded font-medium " +
                    (item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400' :
                     item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-400' :
                     'bg-red-500/10 text-red-400')}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shipments Tab */}
      {activeTab === 'shipments' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Type</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Items</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Carrier</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Tracking</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {MOCK_SHIPMENTS.map(s => (
                <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm font-mono text-blue-400">{s.id}</td>
                  <td className="px-4 py-3 text-sm text-white">{s.type}</td>
                  <td className="px-4 py-3 text-sm text-right">{s.items}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s.carrier}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">{s.tracking}</td>
                  <td className="px-4 py-3"><span className={"text-[10px] px-2 py-0.5 rounded font-medium " +
                    (s.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400' :
                     s.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' :
                     'bg-amber-500/10 text-amber-400')}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Current Balance</div>
              <div className="text-2xl font-bold mt-1">$4,250.00</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Storage Fee/mo</div>
              <div className="text-2xl font-bold mt-1">$1,850.00</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Last Payment</div>
              <div className="text-2xl font-bold mt-1 text-emerald-400">$2,100</div>
              <div className="text-[10px] text-gray-500 mt-1">Feb 1, 2026</div>
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Invoice History</h3>
            <div className="space-y-2">
              {['INV-2026-002 — Feb Storage — $1,850 — Due Feb 28', 'INV-2026-001 — Jan Storage — $1,850 — Paid', 'INV-2025-012 — Dec Storage — $1,750 — Paid', 'INV-2025-011 — Nov Handling — $400 — Paid'].map((inv, i) => (
                <div key={i} className="flex justify-between items-center text-sm text-gray-400 py-1 border-b border-white/[0.03]">
                  <span>{inv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-gray-400 mb-4">Our team is available Monday-Friday, 8am-6pm MST</p>
          <div className="flex justify-center gap-3">
            <a href="mailto:support@woulfgroup.com" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition">Email Support</a>
            <a href="tel:+18015551234" className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Call Us</a>
          </div>
        </div>
      )}
    </div>
  );
}
