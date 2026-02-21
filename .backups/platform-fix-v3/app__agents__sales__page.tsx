'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, TrendingUp, DollarSign, Target, Phone, Mail,
  Building2, ChevronLeft, Brain, RefreshCw, Loader2,
  AlertTriangle, Search, Plus, BarChart3, PieChart,
  ArrowRight, Calendar, CheckCircle, Clock, User,
  MessageSquare, Sparkles, Filter
} from 'lucide-react'

interface DashboardData {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  pipelineValue: number;
  wonDeals: number;
  wonValue: number;
  dealsByStage: Record<string, { count: number; value: number }>;
}

interface Contact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    company?: string;
    lifecyclestage?: string;
    hs_lead_status?: string;
    createdate?: string;
  };
}

interface Deal {
  id: string;
  properties: {
    dealname?: string;
    amount?: string;
    dealstage?: string;
    closedate?: string;
    pipeline?: string;
  };
}

const STAGE_LABELS: Record<string, string> = {
  appointmentscheduled: 'Appointment Scheduled',
  qualifiedtobuy: 'Qualified to Buy',
  presentationscheduled: 'Presentation Scheduled',
  decisionmakerboughtin: 'Decision Maker Bought-In',
  contractsent: 'Contract Sent',
  closedwon: 'Closed Won',
  closedlost: 'Closed Lost',
}

const STAGE_COLORS: Record<string, string> = {
  appointmentscheduled: 'bg-blue-500',
  qualifiedtobuy: 'bg-cyan-500',
  presentationscheduled: 'bg-purple-500',
  decisionmakerboughtin: 'bg-pink-500',
  contractsent: 'bg-orange-500',
  closedwon: 'bg-emerald-500',
  closedlost: 'bg-red-500',
}

export default function SalesAgentPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'deals' | 'ai'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [searching, setSearching] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [callPrep, setCallPrep] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, contactsRes, dealsRes] = await Promise.all([
        fetch('/api/agents/sales?action=dashboard'),
        fetch('/api/agents/sales?action=contacts&limit=50'),
        fetch('/api/agents/sales?action=deals&limit=50'),
      ])

      if (!dashRes.ok) throw new Error('Failed to load dashboard')

      const dashData = await dashRes.json()
      const contactsData = await contactsRes.json()
      const dealsData = await dealsRes.json()

      setDashboard(dashData)
      setContacts(contactsData.results || [])
      setDeals(dealsData.results || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const searchContacts = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/agents/sales?action=search&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearching(false)
    }
  }

  const runPipelineAnalysis = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/agents/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze-pipeline' })
      })
      const data = await res.json()
      setAiAnalysis(data.analysis)
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const generateCallPrep = async (contact: Contact) => {
    setSelectedContact(contact)
    setAnalyzing(true)
    try {
      const res = await fetch('/api/agents/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call-prep', contactId: contact.id })
      })
      const data = await res.json()
      setCallPrep(data.brief)
    } catch (err) {
      console.error('Call prep failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Connecting to HubSpot...</p>
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
            className="px-4 py-2 bg-blue-500 rounded-lg text-white flex items-center gap-2 mx-auto"
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Sales Agent</h1>
                  <p className="text-sm text-gray-400">Connected to HubSpot</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-lg text-blue-400 text-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Live CRM
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
              { id: 'dashboard', label: 'Pipeline', icon: BarChart3 },
              { id: 'contacts', label: 'Contacts', icon: Users },
              { id: 'deals', label: 'Deals', icon: Target },
              { id: 'ai', label: 'AI Coach', icon: Brain },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
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
                  <span className="text-gray-400 text-sm">Total Contacts</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold">{dashboard.totalContacts.toLocaleString()}</div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Companies</span>
                  <Building2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold">{dashboard.totalCompanies.toLocaleString()}</div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Pipeline Value</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(dashboard.pipelineValue)}
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Won This Period</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(dashboard.wonValue)}
                </div>
                <div className="text-sm text-gray-500">{dashboard.wonDeals} deals</div>
              </div>
            </div>

            {/* Pipeline Funnel */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                Pipeline by Stage
              </h3>
              <div className="space-y-3">
                {Object.entries(dashboard.dealsByStage)
                  .filter(([stage]) => stage !== 'closedlost')
                  .map(([stage, data]) => (
                    <div key={stage} className="flex items-center gap-4">
                      <div className="w-40 text-sm text-gray-400">
                        {STAGE_LABELS[stage] || stage}
                      </div>
                      <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${STAGE_COLORS[stage] || 'bg-gray-500'} flex items-center justify-end px-3`}
                          style={{
                            width: `${Math.max(10, (data.value / dashboard.pipelineValue) * 100)}%`
                          }}
                        >
                          <span className="text-xs font-medium text-white">
                            {formatCurrency(data.value)}
                          </span>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm text-gray-400">
                        {data.count} deals
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Deals */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Active Deals
              </h3>
              <div className="space-y-3">
                {deals.slice(0, 8).map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[deal.properties.dealstage || ''] || 'bg-gray-500'}`} />
                      <div>
                        <div className="font-medium">{deal.properties.dealname}</div>
                        <div className="text-sm text-gray-400">
                          {STAGE_LABELS[deal.properties.dealstage || ''] || deal.properties.dealstage}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-400">
                        {formatCurrency(deal.properties.amount || '0')}
                      </div>
                      {deal.properties.closedate && (
                        <div className="text-sm text-gray-400">
                          Close: {new Date(deal.properties.closedate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchContacts()}
                  placeholder="Search contacts by name, email, or company..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={searchContacts}
                disabled={searching}
                className="px-6 py-3 bg-blue-500 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h3 className="font-semibold mb-3">Search Results ({searchResults.length})</h3>
                <div className="space-y-2">
                  {searchResults.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {contact.properties.firstname} {contact.properties.lastname}
                          </div>
                          <div className="text-sm text-gray-400">{contact.properties.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => generateCallPrep(contact)}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact List */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-white/10 bg-white/5">
                    <th className="p-4">Contact</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {contact.properties.firstname} {contact.properties.lastname}
                            </div>
                            <div className="text-sm text-gray-400">{contact.properties.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400">{contact.properties.company || '-'}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">
                          {contact.properties.lifecyclestage || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => generateCallPrep(contact)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"
                            title="Call Prep"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <a
                            href={`mailto:${contact.properties.email}`}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"
                            title="Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-white/10 bg-white/5">
                    <th className="p-4">Deal</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4">Value</th>
                    <th className="p-4">Close Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 font-medium">{deal.properties.dealname}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          deal.properties.dealstage === 'closedwon' 
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : deal.properties.dealstage === 'closedlost'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {STAGE_LABELS[deal.properties.dealstage || ''] || deal.properties.dealstage}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-emerald-400">
                        {formatCurrency(deal.properties.amount || '0')}
                      </td>
                      <td className="p-4 text-gray-400">
                        {deal.properties.closedate 
                          ? new Date(deal.properties.closedate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Coach Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Sales Coach</h2>
              <button
                onClick={runPipelineAnalysis}
                disabled={analyzing}
                className="px-4 py-2 bg-blue-500 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Analyze Pipeline
              </button>
            </div>

            {/* Call Prep Result */}
            {callPrep && selectedContact && (
              <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-400" />
                  Call Prep: {selectedContact.properties.firstname} {selectedContact.properties.lastname}
                </h3>
                <div className="text-gray-300 whitespace-pre-wrap">{callPrep}</div>
              </div>
            )}

            {/* Pipeline Analysis */}
            {aiAnalysis && (
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Pipeline Analysis</h3>
                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {aiAnalysis}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!aiAnalysis && !callPrep && (
              <div className="p-12 bg-white/5 border border-white/10 rounded-xl text-center">
                <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Sales Coach Ready</h3>
                <p className="text-gray-400 mb-4">
                  Get AI-powered insights on your pipeline, call preparation, and deal strategies.
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={runPipelineAnalysis}
                    className="w-full p-3 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 text-left"
                  >
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium">Pipeline Health Check</div>
                      <div className="text-sm text-gray-400">AI analysis of your sales funnel</div>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 text-left">
                    <Target className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium">Deal Prioritization</div>
                      <div className="text-sm text-gray-400">Focus on highest-probability deals</div>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 text-left">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-medium">Follow-up Suggestions</div>
                      <div className="text-sm text-gray-400">Recommended outreach for stale leads</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="font-semibold mb-4">Top Contacts for Outreach</h3>
                <div className="space-y-3">
                  {contacts.slice(0, 4).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {contact.properties.firstname} {contact.properties.lastname}
                          </div>
                          <div className="text-xs text-gray-400">{contact.properties.company || 'No company'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => generateCallPrep(contact)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
                      >
                        Prep Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
