'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Warehouse, Package, FileText, Truck, Search, Filter, Plus, 
  Download, Upload, ChevronDown, MoreHorizontal, Eye, ShoppingCart,
  LogOut, Bell, User, BarChart3, Clock, CheckCircle2, AlertCircle,
  ArrowUpRight, ArrowDownRight, Box, Layers
} from 'lucide-react'

// Sample inventory data
const inventoryData = [
  { id: 'INV-001', sku: 'WDG-1001', name: 'Industrial Widget A', quantity: 2500, location: 'A-12-3', weight: 2.5, hazmat: false, class: 'General', lastUpdated: '2026-02-10' },
  { id: 'INV-002', sku: 'WDG-1002', name: 'Industrial Widget B', quantity: 1800, location: 'A-12-4', weight: 3.2, hazmat: false, class: 'General', lastUpdated: '2026-02-10' },
  { id: 'INV-003', sku: 'CHM-2001', name: 'Chemical Compound X', quantity: 500, location: 'H-01-1', weight: 25.0, hazmat: true, class: 'Class 8', lastUpdated: '2026-02-09' },
  { id: 'INV-004', sku: 'ELC-3001', name: 'Electronic Component', quantity: 15000, location: 'B-05-2', weight: 0.1, hazmat: false, class: 'General', lastUpdated: '2026-02-10' },
  { id: 'INV-005', sku: 'MET-4001', name: 'Metal Brackets', quantity: 8000, location: 'C-08-1', weight: 0.5, hazmat: false, class: 'General', lastUpdated: '2026-02-08' },
  { id: 'INV-006', sku: 'FLM-5001', name: 'Flammable Solvent', quantity: 200, location: 'H-02-1', weight: 18.0, hazmat: true, class: 'Class 3', lastUpdated: '2026-02-10' },
]

const recentOrders = [
  { id: 'ORD-2024-0156', type: 'BOL', status: 'shipped', items: 3, date: '2026-02-09' },
  { id: 'ORD-2024-0155', type: 'PO', status: 'processing', items: 5, date: '2026-02-08' },
  { id: 'ORD-2024-0154', type: 'BOL', status: 'delivered', items: 2, date: '2026-02-07' },
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderType, setOrderType] = useState<'PO' | 'BOL'>('BOL')

  const filteredInventory = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredInventory.map(i => i.id))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">Clutch 3PL</h1>
                <p className="text-xs text-slate-500">Customer Portal</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/inventory" className="text-blue-600 font-medium">Inventory</Link>
              <Link href="/orders" className="text-slate-600 hover:text-slate-900">Orders</Link>
              <Link href="/shipments" className="text-slate-600 hover:text-slate-900">Shipments</Link>
              <Link href="/invoices" className="text-slate-600 hover:text-slate-900">Invoices</Link>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Box className="w-8 h-8 text-blue-500" />
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +12%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">28,300</div>
            <div className="text-sm text-slate-500">Total Units</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Layers className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">6</div>
            <div className="text-sm text-slate-500">SKUs in Stock</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Truck className="w-8 h-8 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <div className="text-sm text-slate-500">Pending Shipments</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <div className="text-sm text-slate-500">Orders This Month</div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-xl border border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Your Inventory</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => { setOrderType('BOL'); setShowOrderModal(true); }}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Create BOL
                </button>
                <button
                  onClick={() => { setOrderType('PO'); setShowOrderModal(true); }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  Create PO
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-sm text-slate-500">
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredInventory.length && filteredInventory.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Weight (lbs)</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{item.sku}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      {item.hazmat && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full mt-1">
                          <AlertCircle className="w-3 h-3" /> Hazmat
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{item.location}</td>
                    <td className="px-6 py-4 text-slate-600">{item.weight}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.class === 'General' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.class}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    order.type === 'BOL' ? 'bg-blue-100' : 'bg-emerald-100'
                  }`}>
                    {order.type === 'BOL' ? (
                      <Truck className={`w-5 h-5 ${order.type === 'BOL' ? 'text-blue-600' : 'text-emerald-600'}`} />
                    ) : (
                      <FileText className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{order.id}</div>
                    <div className="text-sm text-slate-500">{order.items} items • {order.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Order Modal */}
      {showOrderModal && (
        <CreateOrderModal 
          type={orderType}
          selectedItems={inventoryData.filter(i => selectedItems.includes(i.id))}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  )
}

// Order Creation Modal Component
function CreateOrderModal({ type, selectedItems, onClose }: { 
  type: 'PO' | 'BOL', 
  selectedItems: any[], 
  onClose: () => void 
}) {
  const [step, setStep] = useState(1)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(selectedItems.map(i => [i.id, Math.min(100, i.quantity)]))
  )
  const [formData, setFormData] = useState({
    shipToName: '',
    shipToAddress: '',
    shipToCity: '',
    shipToState: '',
    shipToZip: '',
    carrier: '',
    dotClass: '',
    hazmat: false,
    specialInstructions: '',
  })
  const [files, setFiles] = useState<File[]>([])

  const totalWeight = selectedItems.reduce((sum, item) => 
    sum + (item.weight * (quantities[item.id] || 0)), 0
  )

  const hasHazmat = selectedItems.some(i => i.hazmat)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create {type === 'BOL' ? 'Bill of Lading' : 'Purchase Order'}
            </h2>
            <p className="text-sm text-slate-500">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            ✕
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {['Items', 'Shipping Details', 'Documents'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > i + 1 ? 'bg-emerald-500 text-white' :
                  step === i + 1 ? 'bg-blue-600 text-white' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={step === i + 1 ? 'font-medium text-slate-900' : 'text-slate-500'}>
                  {label}
                </span>
                {i < 2 && <div className="w-12 h-0.5 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Items */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Confirm Items & Quantities</h3>
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-sm text-slate-500">SKU: {item.sku} • Available: {item.quantity.toLocaleString()}</div>
                    {item.hazmat && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full mt-1">
                        <AlertCircle className="w-3 h-3" /> Hazmat - {item.class}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-500">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={quantities[item.id]}
                      onChange={(e) => setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                </div>
              ))}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Weight:</span>
                  <span className="font-semibold text-slate-900">{totalWeight.toFixed(1)} lbs</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Shipping Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Ship To</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company/Name</label>
                    <input
                      type="text"
                      value={formData.shipToName}
                      onChange={(e) => setFormData({ ...formData, shipToName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="Recipient name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.shipToAddress}
                      onChange={(e) => setFormData({ ...formData, shipToAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.shipToCity}
                      onChange={(e) => setFormData({ ...formData, shipToCity: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.shipToState}
                        onChange={(e) => setFormData({ ...formData, shipToState: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ZIP</label>
                      <input
                        type="text"
                        value={formData.shipToZip}
                        onChange={(e) => setFormData({ ...formData, shipToZip: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-4">DOT Compliance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Carrier</label>
                    <select
                      value={formData.carrier}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">Select carrier</option>
                      <option value="fedex">FedEx Freight</option>
                      <option value="ups">UPS Freight</option>
                      <option value="xpo">XPO Logistics</option>
                      <option value="estes">Estes Express</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Freight Class</label>
                    <select
                      value={formData.dotClass}
                      onChange={(e) => setFormData({ ...formData, dotClass: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="">Select class</option>
                      <option value="50">Class 50</option>
                      <option value="55">Class 55</option>
                      <option value="60">Class 60</option>
                      <option value="65">Class 65</option>
                      <option value="70">Class 70</option>
                      <option value="77.5">Class 77.5</option>
                      <option value="85">Class 85</option>
                      <option value="92.5">Class 92.5</option>
                      <option value="100">Class 100</option>
                    </select>
                  </div>
                </div>

                {hasHazmat && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-800">Hazmat Shipment</div>
                        <p className="text-sm text-amber-700 mt-1">
                          This order contains hazardous materials. Proper DOT placards and documentation are required.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Special Instructions</label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg resize-none"
                    placeholder="Delivery instructions, handling notes, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Upload ASN Documents</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Upload any additional documents for this order (ASN, packing lists, customs forms, etc.)
                </p>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                  <div className="text-sm text-slate-600 mb-2">
                    Drag and drop files here, or click to browse
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700"
                  >
                    Select Files
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <span className="text-sm text-slate-700">{file.name}</span>
                        </div>
                        <button 
                          onClick={() => setFiles(files.filter((_, j) => j !== i))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Items:</span>
                    <span className="text-slate-900">{selectedItems.length} products</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Weight:</span>
                    <span className="text-slate-900">{totalWeight.toFixed(1)} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ship To:</span>
                    <span className="text-slate-900">{formData.shipToCity}, {formData.shipToState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Documents:</span>
                    <span className="text-slate-900">{files.length} file(s)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-between sticky bottom-0 bg-white">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          <button
            onClick={() => step < 3 ? setStep(step + 1) : onClose()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            {step < 3 ? 'Continue' : `Submit ${type}`}
          </button>
        </div>
      </div>
    </div>
  )
}
