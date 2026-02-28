'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, CreditCard, 
  BarChart3, Settings, FileText, AlertTriangle, CheckCircle2,
  Clock, Calendar, Download, RefreshCw, Eye, Send, X, Loader2,
  Building, Users, ArrowUpRight, ArrowDownRight, Wallet, Receipt,
  PiggyBank, Target, Bell, Filter, Search, Plus, Banknote
} from 'lucide-react'

const cashFlowData = [
  { week: 'Week 1', inflow: 45000, outflow: 38000, balance: 127000 },
  { week: 'Week 2', inflow: 52000, outflow: 41000, balance: 138000 },
  { week: 'Week 3', inflow: 38000, outflow: 45000, balance: 131000 },
  { week: 'Week 4', inflow: 61000, outflow: 39000, balance: 153000 },
  { week: 'Week 5', inflow: 48000, outflow: 52000, balance: 149000 },
  { week: 'Week 6', inflow: 55000, outflow: 43000, balance: 161000 },
]

const invoicesAR = [
  { id: 'INV-001', customer: 'Pacific Logistics', amount: 12500, dueDate: '2026-02-15', status: 'current', daysOut: 5 },
  { id: 'INV-002', customer: 'TechFlow Solutions', amount: 8900, dueDate: '2026-02-10', status: 'overdue', daysOut: -1 },
  { id: 'INV-003', customer: 'GrowthStack Inc', amount: 24000, dueDate: '2026-02-20', status: 'current', daysOut: 10 },
  { id: 'INV-004', customer: 'Meridian Corp', amount: 6500, dueDate: '2026-02-05', status: 'overdue', daysOut: -6 },
  { id: 'INV-005', customer: 'Atlas Industries', amount: 18200, dueDate: '2026-02-28', status: 'current', daysOut: 18 },
]

const invoicesAP = [
  { id: 'BILL-001', vendor: 'AWS', amount: 4200, dueDate: '2026-02-12', status: 'pending', category: 'Software' },
  { id: 'BILL-002', vendor: 'Office Lease', amount: 8500, dueDate: '2026-02-01', status: 'paid', category: 'Rent' },
  { id: 'BILL-003', vendor: 'Insurance Co', amount: 2800, dueDate: '2026-02-15', status: 'pending', category: 'Insurance' },
  { id: 'BILL-004', vendor: 'Equipment Rental', amount: 3200, dueDate: '2026-02-18', status: 'pending', category: 'Equipment' },
]

const alerts = [
  { type: 'warning', message: 'Invoice INV-002 is 1 day overdue - $8,900 from TechFlow Solutions', action: 'Send Reminder' },
  { type: 'warning', message: 'Invoice INV-004 is 6 days overdue - $6,500 from Meridian Corp', action: 'Send Reminder' },
  { type: 'info', message: 'Cash balance projected to drop 15% in Week 5', action: 'View Forecast' },
  { type: 'success', message: 'Payment received: $18,500 from Atlas Industries', action: 'View' },
]

export default function CFOAgentDemo() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [forecasting, setForecasting] = useState(false)

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleRunForecast = async () => {
    setForecasting(true)
    await new Promise(r => setTimeout(r, 2000))
    setForecasting(false)
    showNotification('13-week forecast updated')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
    { id: 'ar', label: 'Receivables', icon: ArrowDownRight },
    { id: 'ap', label: 'Payables', icon: ArrowUpRight },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1B2A4A]">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          {notification}
        </div>
      )}

      <nav className="sticky top-0 z-40 bg-[rgba(27,42,74,0.97)] backdrop-blur-xl text-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-100" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold">CFO Employee</h1>
                    <img src="/images/woulf-logo.png" alt="Woulf" className="w-5 h-5 rounded" title="Powered by Woulf" />
                  </div>
                  <p className="text-xs text-white/60">Financial Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRunForecast} disabled={forecasting} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-lg font-medium disabled:opacity-50">
                {forecasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Update Forecast
              </button>
              <button onClick={() => setShowModal('recordPayment')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'text-[#1B2A4A] border-[#2A9D8F] font-semibold' : 'text-[#6B7280] border-transparent hover:text-[#1B2A4A]'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Cash Balance', value: '$153,000', change: '+$22K MTD', icon: Wallet, up: true },
                { label: 'AR Outstanding', value: '$70,100', change: '$15.4K overdue', icon: ArrowDownRight, up: false },
                { label: 'AP Due', value: '$18,700', change: 'Next 30 days', icon: ArrowUpRight, up: null },
                { label: 'Net Cash Flow', value: '+$14,200', change: 'This month', icon: TrendingUp, up: true },
              ].map((kpi, i) => (
                <div key={i} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <kpi.icon className={`w-5 h-5 ${kpi.up === true ? 'text-emerald-400' : kpi.up === false ? 'text-red-400' : 'text-amber-400'}`} />
                    <span className={`text-xs ${kpi.up === true ? 'text-emerald-400' : kpi.up === false ? 'text-red-400' : 'text-[#6B7280]'}`}>{kpi.change}</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                  <div className="text-sm text-[#6B7280]">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  Alerts & Actions
                </h2>
              </div>
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-lg ${
                    alert.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                    alert.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                    'bg-blue-500/10 border border-blue-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                      {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {alert.type === 'info' && <Clock className="w-5 h-5 text-blue-400" />}
                      <span className="text-sm">{alert.message}</span>
                    </div>
                    <button onClick={() => showNotification('Action completed')} className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
              <button onClick={() => setShowModal('sendReminder')} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <Send className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="font-semibold mb-1">Send AR Reminders</h3>
                <p className="text-sm text-[#6B7280]">Auto-send payment reminders</p>
              </button>
              <button onClick={() => setShowModal('recordPayment')} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <Banknote className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="font-semibold mb-1">Record Payment</h3>
                <p className="text-sm text-[#6B7280]">Log incoming/outgoing payment</p>
              </button>
              <button onClick={() => setActiveTab('cashflow')} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold mb-1">Cash Forecast</h3>
                <p className="text-sm text-[#6B7280]">View 13-week projection</p>
              </button>
              <button onClick={() => showNotification('Report generated')} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <FileText className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-semibold mb-1">Generate Report</h3>
                <p className="text-sm text-[#6B7280]">Create financial summary</p>
              </button>
            </div>

            {/* Mini Cash Flow Chart */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">6-Week Cash Flow</h2>
                <button onClick={() => setActiveTab('cashflow')} className="text-sm text-[#2A9D8F] hover:text-[#238577]">View Full Forecast →</button>
              </div>
              <div className="flex items-end justify-between gap-4 h-48">
                {cashFlowData.map((week, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-emerald-400 mb-1">${(week.balance / 1000).toFixed(0)}K</div>
                    <div className="w-full flex flex-col gap-1">
                      <div className="bg-emerald-500/30 rounded-t" style={{ height: `${(week.inflow / 70000) * 100}px` }} title={`Inflow: $${week.inflow.toLocaleString()}`} />
                      <div className="bg-red-500/30 rounded-b" style={{ height: `${(week.outflow / 70000) * 100}px` }} title={`Outflow: $${week.outflow.toLocaleString()}`} />
                    </div>
                    <div className="mt-2 text-xs text-[#6B7280]">{week.week}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/30 rounded" /><span className="text-xs text-[#6B7280]">Inflow</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/30 rounded" /><span className="text-xs text-[#6B7280]">Outflow</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">13-Week Cash Flow Forecast</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleRunForecast} className="flex items-center gap-2 bg-amber-500 px-4 py-2 rounded-lg font-medium">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button onClick={() => showNotification('Forecast exported')} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg font-medium">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB]">
                      <th className="pb-3 font-medium">Week</th>
                      <th className="pb-3 font-medium text-right">Opening</th>
                      <th className="pb-3 font-medium text-right text-emerald-400">Inflows</th>
                      <th className="pb-3 font-medium text-right text-red-400">Outflows</th>
                      <th className="pb-3 font-medium text-right">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowData.map((week, i) => (
                      <tr key={i} className="border-b border-[#E5E7EB]">
                        <td className="py-3">{week.week}</td>
                        <td className="py-3 text-right">${(week.balance - week.inflow + week.outflow).toLocaleString()}</td>
                        <td className="py-3 text-right text-emerald-400">+${week.inflow.toLocaleString()}</td>
                        <td className="py-3 text-right text-red-400">-${week.outflow.toLocaleString()}</td>
                        <td className="py-3 text-right font-bold">${week.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Accounts Receivable</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowModal('sendReminder')} className="flex items-center gap-2 bg-amber-500 px-4 py-2 rounded-lg font-medium">
                  <Send className="w-4 h-4" /> Send All Reminders
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Total Outstanding</div>
                <div className="text-2xl font-bold">$70,100</div>
              </div>
              <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <div className="text-sm text-[#6B7280] mb-1">Current</div>
                <div className="text-2xl font-bold text-emerald-400">$54,700</div>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="text-sm text-red-400 mb-1">Overdue</div>
                <div className="text-2xl font-bold text-red-400">$15,400</div>
              </div>
            </div>
            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">Invoice</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesAR.map((inv) => (
                    <tr key={inv.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4 font-medium">{inv.id}</td>
                      <td className="px-6 py-4">{inv.customer}</td>
                      <td className="px-6 py-4 font-bold">${inv.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">{inv.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'current' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {inv.status === 'overdue' ? `${Math.abs(inv.daysOut)} days overdue` : `Due in ${inv.daysOut} days`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => showNotification('Reminder sent')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Send Reminder">
                            <Send className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedInvoice(inv); setShowModal('recordPayment'); }} className="p-2 hover:bg-[#e0850a] rounded-lg" title="Record Payment">
                            <Banknote className="w-4 h-4" />
                          </button>
                          <button onClick={() => showNotification('Invoice viewed')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
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

        {activeTab === 'ap' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Accounts Payable</h2>
              <button onClick={() => setShowModal('addBill')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> Add Bill
              </button>
            </div>
            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">Bill</th>
                    <th className="px-6 py-4 font-medium">Vendor</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesAP.map((bill) => (
                    <tr key={bill.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4 font-medium">{bill.id}</td>
                      <td className="px-6 py-4">{bill.vendor}</td>
                      <td className="px-6 py-4">{bill.category}</td>
                      <td className="px-6 py-4 font-bold">${bill.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">{bill.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {bill.status === 'pending' && (
                            <button onClick={() => showNotification('Bill paid')} className="p-2 hover:bg-[#e0850a] rounded-lg text-emerald-400" title="Pay Now">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => showNotification('Bill viewed')} className="p-2 hover:bg-[#e0850a] rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
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

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Financial Reports</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Cash Flow Statement', period: 'Monthly', icon: TrendingUp },
                { name: 'AR Aging Report', period: 'Weekly', icon: Clock },
                { name: 'P&L Summary', period: 'Monthly', icon: BarChart3 },
                { name: 'Balance Sheet', period: 'Monthly', icon: Wallet },
                { name: 'AP Aging Report', period: 'Weekly', icon: Receipt },
                { name: 'Budget vs Actual', period: 'Monthly', icon: Target },
              ].map((report, i) => (
                <button key={i} onClick={() => showNotification(`${report.name} generated`)} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left">
                  <report.icon className="w-8 h-8 text-amber-400 mb-4" />
                  <h3 className="font-semibold mb-1">{report.name}</h3>
                  <p className="text-sm text-[#6B7280]">{report.period}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">CFO Employee Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Integrations</h3>
                <div className="space-y-3">
                  {[
                    { name: 'QuickBooks', connected: true },
                    { name: 'Xero', connected: false },
                    { name: 'Bank of America', connected: true },
                    { name: 'Stripe', connected: true },
                  ].map((int, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg">
                      <span>{int.name}</span>
                      <button onClick={() => showNotification(int.connected ? `Disconnected ${int.name}` : `Connected ${int.name}`)} className={`px-3 py-1 rounded-lg text-sm font-medium ${int.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-100 text-[#6B7280]'}`}>
                        {int.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Alert Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Overdue Alert Threshold</label>
                    <select className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Same day</option>
                      <option>1 day overdue</option>
                      <option>7 days overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Low Cash Alert</label>
                    <input type="text" defaultValue="$50,000" className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <button onClick={() => showNotification('Settings saved')} className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium">Save Settings</button>
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
            {showModal === 'recordPayment' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Record Payment</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 bg-emerald-500 text-white rounded-lg">Received</button>
                      <button className="p-3 bg-[#F4F5F7] rounded-lg">Sent</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer/Vendor</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Select...</option>
                      {invoicesAR.map(inv => <option key={inv.id}>{inv.customer}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <input type="text" placeholder="$0.00" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Invoice Reference</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Select invoice...</option>
                      {invoicesAR.map(inv => <option key={inv.id}>{inv.id} - ${inv.amount.toLocaleString()}</option>)}
                    </select>
                  </div>
                  <button onClick={() => { showNotification('Payment recorded'); setShowModal(null); }} className="w-full py-3 bg-[#F5920B] text-white rounded-lg font-medium">Record Payment</button>
                </div>
              </div>
            )}

            {showModal === 'sendReminder' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Send Payment Reminders</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm">This will send payment reminders to {invoicesAR.filter(i => i.status === 'overdue').length} overdue customers.</p>
                  </div>
                  <div className="space-y-2">
                    {invoicesAR.filter(i => i.status === 'overdue').map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg">
                        <div>
                          <div className="font-medium">{inv.customer}</div>
                          <div className="text-sm text-[#6B7280]">{inv.id} - ${inv.amount.toLocaleString()}</div>
                        </div>
                        <span className="text-red-400 text-sm">{Math.abs(inv.daysOut)} days overdue</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { showNotification('Reminders sent'); setShowModal(null); }} className="w-full py-3 bg-amber-500 text-white rounded-lg font-medium">Send Reminders</button>
                </div>
              </div>
            )}

            {showModal === 'addBill' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Add Bill</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vendor</label>
                    <input type="text" placeholder="Vendor name" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount</label>
                      <input type="text" placeholder="$0.00" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Due Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Software</option>
                      <option>Rent</option>
                      <option>Insurance</option>
                      <option>Equipment</option>
                      <option>Utilities</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <button onClick={() => { showNotification('Bill added'); setShowModal(null); }} className="w-full py-3 bg-[#F5920B] text-white rounded-lg font-medium">Add Bill</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
