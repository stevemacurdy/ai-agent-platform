'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign, TrendingUp, TrendingDown, FileText, Users, Clock,
  AlertTriangle, CheckCircle, RefreshCw, ChevronLeft, Brain,
  ArrowUpRight, ArrowDownRight, Loader2, PieChart, BarChart3,
  Send, CreditCard, Building2, Receipt
} from 'lucide-react'

interface DashboardData {
  accountsReceivable: { total: number; count: number; overdue: number };
  accountsPayable: { total: number; count: number; overdue: number };
  netPosition: number;
  bankAccounts: number;
}

interface Invoice {
  id: number;
  name: string;
  partner_id: [number, string];
  amount_total: number;
  amount_residual: number;
  invoice_date: string;
  invoice_date_due: string;
  payment_state: string;
}

interface AgingData {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
}

export default function CFOAgentPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'receivables' | 'payables' | 'analysis'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [bills, setBills] = useState<Invoice[]>([])
  const [aging, setAging] = useState<AgingData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [collectionStrategy, setCollectionStrategy] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, invRes, billRes, agingRes] = await Promise.all([
        fetch('/api/agents/cfo?action=dashboard'),
        fetch('/api/agents/cfo?action=invoices&status=unpaid'),
        fetch('/api/agents/cfo?action=bills&status=unpaid'),
        fetch('/api/agents/cfo?action=aging'),
      ])

      if (!dashRes.ok) throw new Error('Failed to load dashboard')
      
      const dashData = await dashRes.json()
      const invData = await invRes.json()
      const billData = await billRes.json()
      const agingData = await agingRes.json()

      setDashboard(dashData)
      setInvoices(invData.invoices || [])
      setBills(billData.bills || [])
      setAging(agingData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/agents/cfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' })
      })
      const data = await res.json()
      setAiAnalysis(data.analysis)
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getCollectionStrategy = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/agents/cfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'collection-strategy' })
      })
      const data = await res.json()
      setCollectionStrategy(data.strategy)
    } catch (err) {
      console.error('Strategy failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Connecting to Odoo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-emerald-500 rounded-lg text-white flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">CFO Agent</h1>
                  <p className="text-sm text-gray-400">Connected to Odoo</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 text-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Live Data
              </span>
              <button
                onClick={loadDashboard}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: PieChart },
              { id: 'receivables', label: 'Receivables', icon: ArrowDownRight },
              { id: 'payables', label: 'Payables', icon: ArrowUpRight },
              { id: 'analysis', label: 'AI Analysis', icon: Brain },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Accounts Receivable</span>
                  <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(dashboard.accountsReceivable.total)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {dashboard.accountsReceivable.count} invoices
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Accounts Payable</span>
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(dashboard.accountsPayable.total)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {dashboard.accountsPayable.count} bills
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Overdue AR</span>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(dashboard.accountsReceivable.overdue)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Needs attention</div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Net Position</span>
                  {dashboard.netPosition >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className={`text-2xl font-bold ${dashboard.netPosition >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(dashboard.netPosition)}
                </div>
                <div className="text-sm text-gray-500 mt-1">AR - AP</div>
              </div>
            </div>

            {/* Aging Report */}
            {aging && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  AR Aging Report
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { label: 'Current', value: aging.current, color: 'bg-emerald-500' },
                    { label: '1-30 Days', value: aging.days1to30, color: 'bg-yellow-500' },
                    { label: '31-60 Days', value: aging.days31to60, color: 'bg-orange-500' },
                    { label: '61-90 Days', value: aging.days61to90, color: 'bg-red-500' },
                    { label: '90+ Days', value: aging.over90, color: 'bg-red-700' },
                  ].map((bucket) => (
                    <div key={bucket.label} className="text-center">
                      <div className={`h-24 ${bucket.color} rounded-lg flex items-end justify-center mb-2`}
                        style={{ 
                          height: `${Math.max(20, Math.min(100, (bucket.value / (dashboard?.accountsReceivable.total || 1)) * 200))}px`
                        }}
                      >
                        <span className="text-white text-xs font-medium p-2">
                          {formatCurrency(bucket.value)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">{bucket.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Invoices */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Open Invoices
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                      <th className="pb-3">Invoice</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 10).map((inv) => {
                      const isOverdue = new Date(inv.invoice_date_due) < new Date()
                      return (
                        <tr key={inv.id} className="border-b border-white/5">
                          <td className="py-3 font-medium">{inv.name}</td>
                          <td className="py-3 text-gray-400">{inv.partner_id?.[1] || 'Unknown'}</td>
                          <td className="py-3">{formatCurrency(inv.amount_residual)}</td>
                          <td className="py-3">{formatDate(inv.invoice_date_due)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              isOverdue 
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Receivables Tab */}
        {activeTab === 'receivables' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Receivables</h2>
              <button
                onClick={getCollectionStrategy}
                disabled={analyzing}
                className="px-4 py-2 bg-emerald-500 rounded-lg flex items-center gap-2 hover:bg-emerald-600 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                AI Collection Strategy
              </button>
            </div>

            {collectionStrategy && (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  AI Collection Strategy
                </h3>
                <div className="text-gray-300 whitespace-pre-wrap">{collectionStrategy}</div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-white/10 bg-white/5">
                    <th className="p-4">Invoice</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Outstanding</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const isOverdue = new Date(inv.invoice_date_due) < new Date()
                    const daysOverdue = isOverdue 
                      ? Math.floor((Date.now() - new Date(inv.invoice_date_due).getTime()) / (1000 * 60 * 60 * 24))
                      : 0
                    return (
                      <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 font-medium">{inv.name}</td>
                        <td className="p-4 text-gray-400">{inv.partner_id?.[1] || 'Unknown'}</td>
                        <td className="p-4">{formatCurrency(inv.amount_total)}</td>
                        <td className="p-4 font-semibold text-emerald-400">{formatCurrency(inv.amount_residual)}</td>
                        <td className="p-4">{formatDate(inv.invoice_date_due)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isOverdue 
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {isOverdue ? `${daysOverdue}d overdue` : 'Current'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payables Tab */}
        {activeTab === 'payables' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">All Payables</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-white/10 bg-white/5">
                    <th className="p-4">Bill</th>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Outstanding</th>
                    <th className="p-4">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => {
                    const isOverdue = new Date(bill.invoice_date_due) < new Date()
                    return (
                      <tr key={bill.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 font-medium">{bill.name}</td>
                        <td className="p-4 text-gray-400">{bill.partner_id?.[1] || 'Unknown'}</td>
                        <td className="p-4 text-gray-500">{(bill as any).ref || '-'}</td>
                        <td className="p-4">{formatCurrency(bill.amount_total)}</td>
                        <td className="p-4 font-semibold text-red-400">{formatCurrency(bill.amount_residual)}</td>
                        <td className="p-4">
                          <span className={isOverdue ? 'text-red-400' : ''}>
                            {formatDate(bill.invoice_date_due)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Financial Analysis</h2>
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="px-4 py-2 bg-emerald-500 rounded-lg flex items-center gap-2 hover:bg-emerald-600 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Run Analysis
              </button>
            </div>

            {aiAnalysis ? (
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">CFO Agent Analysis</h3>
                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {aiAnalysis}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-white/5 border border-white/10 rounded-xl text-center">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Analysis Ready</h3>
                <p className="text-gray-400 mb-4">
                  Click "Run Analysis" to get AI-powered insights on your financial position,
                  cash flow recommendations, and action items.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={getCollectionStrategy}
                    className="w-full p-3 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 text-left"
                  >
                    <Send className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-medium">Generate Collection Strategy</div>
                      <div className="text-sm text-gray-400">AI recommendations for overdue accounts</div>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 text-left">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium">Cash Flow Forecast</div>
                      <div className="text-sm text-gray-400">30/60/90 day projections</div>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 text-left">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium">Vendor Analysis</div>
                      <div className="text-sm text-gray-400">Payment optimization recommendations</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-semibold mb-4">Financial Health Score</h3>
                {dashboard && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#1f2937" strokeWidth="12" />
                          <circle
                            cx="64" cy="64" r="56" fill="none"
                            stroke={dashboard.netPosition >= 0 ? '#10b981' : '#ef4444'}
                            strokeWidth="12"
                            strokeDasharray={`${Math.min(100, Math.max(0, 50 + (dashboard.netPosition / 10000))) * 3.51} 351`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {Math.min(100, Math.max(0, Math.round(50 + (dashboard.netPosition / 10000))))}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-gray-400 text-sm">
                      Based on AR/AP ratio and overdue amounts
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
