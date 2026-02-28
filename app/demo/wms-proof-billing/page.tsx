'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Package, Truck, ClipboardList, Camera, DollarSign, 
  BarChart3, Settings, Plus, Search, Filter, Download, Upload,
  Eye, Edit, Trash2, CheckCircle2, XCircle, Clock, AlertCircle,
  FileText, Image, QrCode, Warehouse, Box, Scale, Calendar,
  Send, RefreshCw, MoreHorizontal, X, Check, Loader2, Printer,
  Mail, Phone, MapPin, User, Building, ChevronDown, ArrowUpRight
} from 'lucide-react'

const bolsData = [
  { id: 'BOL-2026-0892', customer: 'Kuehne + Nagel', type: 'Inbound', pallets: 48, status: 'received', date: '2026-02-09', hazmat: true, photos: 12 },
  { id: 'BOL-2026-0891', customer: 'Ignik Outdoors', type: 'Outbound', pallets: 24, status: 'shipped', date: '2026-02-09', hazmat: false, photos: 8 },
  { id: 'BOL-2026-0890', customer: 'microSURE', type: 'Inbound', pallets: 36, status: 'pending', date: '2026-02-08', hazmat: false, photos: 0 },
  { id: 'BOL-2026-0889', customer: 'Envirofluid', type: 'Outbound', pallets: 18, status: 'shipped', date: '2026-02-08', hazmat: true, photos: 6 },
  { id: 'BOL-2026-0888', customer: 'AUST Manufacturing', type: 'Inbound', pallets: 52, status: 'received', date: '2026-02-07', hazmat: false, photos: 14 },
]

const inventoryData = [
  { sku: 'SFC-FC001', product: 'SFC Energy Fuel Cell', customer: 'Kuehne + Nagel', pallets: 156, location: 'HAZ-A1-A12', hazmat: true, lastMove: '2026-02-09' },
  { sku: 'IGN-HTR-100', product: 'Ignik Heated Blanket', customer: 'Ignik Outdoors', pallets: 89, location: 'B1-B8', hazmat: false, lastMove: '2026-02-08' },
  { sku: 'MSR-CLN-500', product: 'microSURE Cleaner 5L', customer: 'microSURE', pallets: 234, location: 'C1-C18', hazmat: false, lastMove: '2026-02-07' },
  { sku: 'ENV-SOL-200', product: 'Envirofluid Solvent', customer: 'Envirofluid', pallets: 67, location: 'HAZ-B1-B6', hazmat: true, lastMove: '2026-02-06' },
  { sku: 'AUS-PRT-300', product: 'AUST Precision Parts', customer: 'AUST Manufacturing', pallets: 145, location: 'D1-D12', hazmat: false, lastMove: '2026-02-05' },
]

const invoicesData = [
  { id: 'INV-KWT-2026-02', customer: 'Keyword Trucking', amount: 3500, status: 'sent', date: '2026-02-09', dueDate: '2026-03-11' },
  { id: 'INV-KN-2026-02', customer: 'Kuehne + Nagel', amount: 12450, status: 'draft', date: '2026-02-09', dueDate: '2026-03-11' },
  { id: 'INV-IGN-2026-02', customer: 'Ignik Outdoors', amount: 4200, status: 'paid', date: '2026-02-01', dueDate: '2026-03-01' },
  { id: 'INV-MSR-2026-02', customer: 'microSURE', amount: 8900, status: 'sent', date: '2026-02-01', dueDate: '2026-02-15' },
]

export default function WMSAgentDemo() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [selectedBol, setSelectedBol] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [generating, setGenerating] = useState(false)

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleScanBOL = async () => {
    setScanning(true)
    await new Promise(r => setTimeout(r, 2000))
    setScanning(false)
    showNotification('BOL scanned and processed successfully!')
  }

  const handleGenerateInvoice = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2500))
    setGenerating(false)
    showNotification('Invoice generated and ready for review!')
    setShowModal(null)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'bols', label: 'BOLs', icon: ClipboardList },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'photos', label: 'Photo Proof', icon: Camera },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1B2A4A]">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          {notification}
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[rgba(27,42,74,0.97)] backdrop-blur-xl text-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="flex items-center gap-2 text-white/60 hover:text-[#1B2A4A] transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-100" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold">WMS Employee</h1>
                    <img src="/images/woulf-logo.png" alt="Woulf" className="w-5 h-5 rounded" title="Powered by Woulf" />
                  </div>
                  <p className="text-xs text-[#6B7280]">Warehouse Management System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowModal('scanBol')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <QrCode className="w-4 h-4" />
                Scan BOL
              </button>
              <button 
                onClick={() => setShowModal('newBol')}
                className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e0850a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New BOL
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id 
                    ? 'text-[#1B2A4A] border-[#2A9D8F] font-semibold' 
                    : 'text-[#6B7280] border-transparent hover:text-[#1B2A4A]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Pallets', value: '691', change: '+48 today', icon: Box, color: 'blue' },
                { label: 'Pending BOLs', value: '3', change: '2 urgent', icon: ClipboardList, color: 'yellow' },
                { label: 'Monthly Revenue', value: '$29,050', change: '+12% MTD', icon: DollarSign, color: 'emerald' },
                { label: 'Photo Proofs', value: '156', change: 'This month', icon: Camera, color: 'purple' },
              ].map((kpi, i) => (
                <div key={i} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <kpi.icon className={`w-5 h-5 text-${kpi.color}-400`} />
                    <span className="text-xs text-[#6B7280]">{kpi.change}</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                  <div className="text-sm text-[#6B7280]">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowModal('scanBol')}
                className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-1">Scan BOL</h3>
                <p className="text-sm text-[#6B7280]">Scan inbound/outbound BOL</p>
              </button>
              
              <button 
                onClick={() => setShowModal('takePhoto')}
                className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-1">Take Photo</h3>
                <p className="text-sm text-[#6B7280]">Document receiving/shipping</p>
              </button>
              
              <button 
                onClick={() => setShowModal('generateInvoice')}
                className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-1">Generate Invoice</h3>
                <p className="text-sm text-[#6B7280]">Create monthly billing</p>
              </button>
              
              <button 
                onClick={() => setShowModal('inventoryCount')}
                className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Scale className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-semibold mb-1">Cycle Count</h3>
                <p className="text-sm text-[#6B7280]">Start inventory count</p>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Recent BOLs</h2>
                  <button onClick={() => setActiveTab('bols')} className="text-sm text-[#2A9D8F] hover:text-[#238577]">View All →</button>
                </div>
                <div className="space-y-3">
                  {bolsData.slice(0, 4).map((bol) => (
                    <div key={bol.id} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg hover:bg-[#e0850a] cursor-pointer" onClick={() => { setSelectedBol(bol); setShowModal('bolDetail'); }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${bol.status === 'received' || bol.status === 'shipped' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                        <div>
                          <div className="font-medium">{bol.id}</div>
                          <div className="text-xs text-[#6B7280]">{bol.customer}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{bol.pallets} pallets</div>
                        <div className="text-xs text-[#6B7280]">{bol.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Pending Invoices</h2>
                  <button onClick={() => setActiveTab('billing')} className="text-sm text-[#2A9D8F] hover:text-[#238577]">View All →</button>
                </div>
                <div className="space-y-3">
                  {invoicesData.filter(inv => inv.status !== 'paid').map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg hover:bg-[#e0850a] cursor-pointer" onClick={() => { setSelectedInvoice(invoice); setShowModal('invoiceDetail'); }}>
                      <div>
                        <div className="font-medium">{invoice.customer}</div>
                        <div className="text-xs text-[#6B7280]">{invoice.id}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">${invoice.amount.toLocaleString()}</div>
                        <div className={`text-xs ${invoice.status === 'sent' ? 'text-blue-400' : 'text-yellow-400'}`}>{invoice.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory by Customer */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Inventory by Customer</h2>
                <button onClick={() => setActiveTab('inventory')} className="text-sm text-[#2A9D8F] hover:text-[#238577]">View Details →</button>
              </div>
              <div className="grid md:grid-cols-5 gap-4">
                {inventoryData.map((item) => (
                  <div key={item.sku} className="p-4 bg-[#F4F5F7] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${item.hazmat ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                      <span className="text-sm font-medium truncate">{item.customer}</span>
                    </div>
                    <div className="text-2xl font-bold">{item.pallets}</div>
                    <div className="text-xs text-[#6B7280]">pallets</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BOLs Tab */}
        {activeTab === 'bols' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="text" placeholder="Search BOLs..." className="pl-10 pr-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none w-64" />
                </div>
                <select className="px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                  <option>All Types</option>
                  <option>Inbound</option>
                  <option>Outbound</option>
                </select>
                <select className="px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Received</option>
                  <option>Shipped</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowModal('scanBol')} className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg font-medium">
                  <QrCode className="w-4 h-4" /> Scan
                </button>
                <button onClick={() => setShowModal('newBol')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                  <Plus className="w-4 h-4" /> New BOL
                </button>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">BOL #</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Pallets</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Photos</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bolsData.map((bol) => (
                    <tr key={bol.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bol.id}</span>
                          {bol.hazmat && <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded">HAZMAT</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">{bol.customer}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 ${bol.type === 'Inbound' ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {bol.type === 'Inbound' ? <Truck className="w-4 h-4 rotate-180" /> : <Truck className="w-4 h-4" />}
                          {bol.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{bol.pallets}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bol.status === 'received' ? 'bg-emerald-500/10 text-emerald-400' :
                          bol.status === 'shipped' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {bol.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1">
                          <Camera className="w-4 h-4 text-[#6B7280]" />
                          {bol.photos}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280]">{bol.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedBol(bol); setShowModal('bolDetail'); }} className="p-2 hover:bg-[#e0850a] rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedBol(bol); setShowModal('takePhoto'); }} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Add Photo">
                            <Camera className="w-4 h-4" />
                          </button>
                          <button onClick={() => showNotification('BOL printed')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Print">
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="text" placeholder="Search inventory..." className="pl-10 pr-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none w-64" />
                </div>
                <select className="px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                  <option>All Customers</option>
                  {inventoryData.map(i => <option key={i.customer}>{i.customer}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowModal('inventoryCount')} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg font-medium">
                  <Scale className="w-4 h-4" /> Cycle Count
                </button>
                <button onClick={() => showNotification('Inventory report downloaded')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Total Pallets</div>
                <div className="text-3xl font-bold">691</div>
              </div>
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Total SKUs</div>
                <div className="text-3xl font-bold">48</div>
              </div>
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Hazmat Pallets</div>
                <div className="text-3xl font-bold text-orange-400">223</div>
              </div>
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Available Space</div>
                <div className="text-3xl font-bold text-emerald-400">34%</div>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">SKU</th>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Pallets</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Last Move</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item) => (
                    <tr key={item.sku} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{item.sku}</span>
                          {item.hazmat && <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded">HAZMAT</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">{item.product}</td>
                      <td className="px-6 py-4">{item.customer}</td>
                      <td className="px-6 py-4 font-medium">{item.pallets}</td>
                      <td className="px-6 py-4 font-mono text-sm">{item.location}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{item.lastMove}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => showNotification('Inventory adjusted')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Adjust">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => showNotification('Move order created')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Move">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Billing & Invoices</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowModal('generateInvoice')} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-lg font-medium">
                  <DollarSign className="w-4 h-4" /> Generate Invoice
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">This Month</div>
                <div className="text-3xl font-bold text-emerald-400">$29,050</div>
              </div>
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Outstanding</div>
                <div className="text-3xl font-bold text-yellow-400">$12,400</div>
              </div>
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Overdue</div>
                <div className="text-3xl font-bold text-red-400">$0</div>
              </div>
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Collected</div>
                <div className="text-3xl font-bold">$16,650</div>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">Invoice #</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesData.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4 font-medium">{invoice.id}</td>
                      <td className="px-6 py-4">{invoice.customer}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">${invoice.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                          invoice.status === 'sent' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280]">{invoice.date}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{invoice.dueDate}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedInvoice(invoice); setShowModal('invoiceDetail'); }} className="p-2 hover:bg-[#e0850a] rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => showNotification('Invoice sent to customer')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Send">
                            <Send className="w-4 h-4" />
                          </button>
                          <button onClick={() => showNotification('Invoice downloaded')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Photo Proof Archive</h2>
              <button onClick={() => setShowModal('takePhoto')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                <Camera className="w-4 h-4" /> Take Photo
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-[#F4F5F7] border border-[#E5E7EB] rounded-xl flex items-center justify-center hover:border-[#E5E7EB] cursor-pointer transition-colors group" onClick={() => showNotification('Photo preview opened')}>
                  <div className="text-center">
                    <Image className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 group-hover:text-[#1B2A4A] transition-colors" />
                    <div className="text-xs text-[#6B7280]">BOL-{2026}-{String(892 - i).padStart(4, '0')}</div>
                    <div className="text-xs text-[#9CA3AF]">{12 - i} photos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">WMS Employee Settings</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Connected Systems</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Odoo ERP', connected: true },
                    { name: 'QuickBooks', connected: true },
                    { name: 'Gmail (BOL Scan)', connected: true },
                    { name: 'Google Drive', connected: false },
                  ].map((system, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg">
                      <span>{system.name}</span>
                      <button onClick={() => showNotification(system.connected ? `Disconnected ${system.name}` : `Connected ${system.name}`)} className={`px-3 py-1 rounded-lg text-sm font-medium ${system.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'}`}>
                        {system.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Billing Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Storage Rate</label>
                    <input type="text" defaultValue="$18.00" className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hazmat Surcharge</label>
                    <input type="text" defaultValue="$25.00" className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto-Generate Invoices</label>
                    <select className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>1st of month</option>
                      <option>15th of month</option>
                      <option>Manual only</option>
                    </select>
                  </div>
                  <button onClick={() => showNotification('Settings saved')} className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium">Save Settings</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/40">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {showModal === 'scanBol' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Scan BOL</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-xl flex items-center justify-center border-2 border-dashed border-[#E5E7EB]">
                    {scanning ? (
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-blue-400" />
                        <p className="text-[#6B7280]">Scanning...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-12 h-12 mx-auto mb-2 text-[#6B7280]" />
                        <p className="text-[#6B7280]">Position BOL in frame</p>
                      </div>
                    )}
                  </div>
                  <button onClick={handleScanBOL} disabled={scanning} className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {scanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</> : <><Camera className="w-5 h-5" /> Capture</>}
                  </button>
                  <p className="text-center text-sm text-[#6B7280]">Or upload a file</p>
                  <button onClick={() => { showNotification('BOL uploaded successfully'); setShowModal(null); }} className="w-full py-3 border border-[#E5E7EB] rounded-lg font-medium flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" /> Upload PDF/Image
                  </button>
                </div>
              </div>
            )}

            {showModal === 'newBol' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Create New BOL</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 bg-blue-500 text-white rounded-lg">Inbound</button>
                      <button className="p-3 bg-[#F4F5F7] rounded-lg">Outbound</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Select customer...</option>
                      {inventoryData.map(i => <option key={i.customer}>{i.customer}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pallets</label>
                      <input type="number" placeholder="0" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Carrier</label>
                      <input type="text" placeholder="Carrier name" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hazmat" className="rounded" />
                    <label htmlFor="hazmat" className="text-sm">Contains hazardous materials</label>
                  </div>
                  <button onClick={() => { showNotification('BOL created successfully'); setShowModal(null); }} className="w-full py-3 bg-[#F5920B] text-white rounded-lg font-medium">Create BOL</button>
                </div>
              </div>
            )}

            {showModal === 'takePhoto' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Take Photo Proof</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Link to BOL</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      {bolsData.map(b => <option key={b.id}>{b.id} - {b.customer}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Photo Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Receiving', 'Damage', 'Shipping'].map(type => (
                        <button key={type} className="p-2 bg-[#F4F5F7] rounded-lg text-sm hover:bg-[#e0850a]">{type}</button>
                      ))}
                    </div>
                  </div>
                  <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                    <Camera className="w-12 h-12 text-[#6B7280]" />
                  </div>
                  <button onClick={() => { showNotification('Photo saved'); setShowModal(null); }} className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" /> Capture Photo
                  </button>
                </div>
              </div>
            )}

            {showModal === 'generateInvoice' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Generate Invoice</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Select customer...</option>
                      {inventoryData.map(i => <option key={i.customer}>{i.customer}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Period Start</label>
                      <input type="date" defaultValue="2026-02-01" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Period End</label>
                      <input type="date" defaultValue="2026-02-28" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                    </div>
                  </div>
                  <div className="p-4 bg-[#F4F5F7] rounded-lg">
                    <div className="text-sm text-[#6B7280] mb-2">Calculated Charges</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Storage (156 pallets × 28 days)</span><span>$4,368.00</span></div>
                      <div className="flex justify-between"><span>Hazmat Surcharge</span><span>$3,900.00</span></div>
                      <div className="flex justify-between"><span>Handling (48 pallets)</span><span>$960.00</span></div>
                      <div className="flex justify-between font-bold pt-2 border-t border-[#E5E7EB]"><span>Total</span><span>$9,228.00</span></div>
                    </div>
                  </div>
                  <button onClick={handleGenerateInvoice} disabled={generating} className="w-full py-3 bg-emerald-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><DollarSign className="w-5 h-5" /> Generate Invoice</>}
                  </button>
                </div>
              </div>
            )}

            {showModal === 'inventoryCount' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Start Cycle Count</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Count Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 bg-blue-500 text-white rounded-lg">Full Count</button>
                      <button className="p-3 bg-[#F4F5F7] rounded-lg">Partial</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location/Zone</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>All Locations</option>
                      <option>HAZ-A (Hazmat)</option>
                      <option>HAZ-B (Hazmat)</option>
                      <option>Zone B</option>
                      <option>Zone C</option>
                      <option>Zone D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Assigned To</label>
                    <input type="text" placeholder="Employee name" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <button onClick={() => { showNotification('Cycle count started'); setShowModal(null); }} className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium">Start Count</button>
                </div>
              </div>
            )}

            {showModal === 'bolDetail' && selectedBol && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{selectedBol.id}</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Customer</div>
                      <div className="font-medium">{selectedBol.customer}</div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Type</div>
                      <div className="font-medium">{selectedBol.type}</div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Pallets</div>
                      <div className="font-medium">{selectedBol.pallets}</div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Status</div>
                      <div className="font-medium capitalize">{selectedBol.status}</div>
                    </div>
                  </div>
                  {selectedBol.hazmat && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Contains Hazardous Materials
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => showNotification('BOL printed')} className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button onClick={() => { setShowModal('takePhoto'); }} className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" /> Add Photo
                    </button>
                    <button onClick={() => showNotification('BOL emailed')} className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showModal === 'invoiceDetail' && selectedInvoice && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{selectedInvoice.id}</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Customer</div>
                      <div className="font-medium">{selectedInvoice.customer}</div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Amount</div>
                      <div className="font-medium text-emerald-400">${selectedInvoice.amount.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Status</div>
                      <div className="font-medium capitalize">{selectedInvoice.status}</div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Due Date</div>
                      <div className="font-medium">{selectedInvoice.dueDate}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => showNotification('Invoice sent')} className="flex-1 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Send
                    </button>
                    <button onClick={() => showNotification('Invoice downloaded')} className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={() => showNotification('Pushed to Odoo')} className="flex-1 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                      <ArrowUpRight className="w-4 h-4" /> Push to Odoo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
