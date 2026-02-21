'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, TrendingUp, Users, Phone, Mail, Calendar, MapPin,
  BarChart3, Settings, Plus, Search, Filter, Download, Clock,
  Eye, Edit, Trash2, CheckCircle2, XCircle, AlertCircle, Star,
  FileText, MessageSquare, Video, Target, DollarSign, Building,
  Send, RefreshCw, X, Loader2, UserPlus, PhoneCall, Mic, Brain,
  Briefcase, Globe, Linkedin, Award, TrendingDown, ArrowUpRight,
  FolderOpen, Bot, Wand2, Share2, Upload
} from 'lucide-react'

const leadsData = [
  { id: 1, name: 'Sarah Chen', company: 'Pacific Logistics', title: 'VP Operations', value: 45000, stage: 'qualified', score: 92, lastContact: '2026-02-09', phone: '(415) 555-0123' },
  { id: 2, name: 'Marcus Johnson', company: 'TechFlow Solutions', title: 'CTO', value: 78000, stage: 'proposal', score: 85, lastContact: '2026-02-08', phone: '(512) 555-0456' },
  { id: 3, name: 'Jennifer Walsh', company: 'GrowthStack Inc', title: 'CEO', value: 120000, stage: 'negotiation', score: 78, lastContact: '2026-02-07', phone: '(212) 555-0789' },
  { id: 4, name: 'David Kim', company: 'Meridian Corp', title: 'Director of IT', value: 35000, stage: 'discovery', score: 65, lastContact: '2026-02-06', phone: '(310) 555-0321' },
  { id: 5, name: 'Emily Rodriguez', company: 'Atlas Industries', title: 'COO', value: 95000, stage: 'qualified', score: 88, lastContact: '2026-02-05', phone: '(713) 555-0654' },
]

const meetingsData = [
  { id: 1, title: 'Discovery Call - Pacific Logistics', time: '10:00 AM', date: '2026-02-10', type: 'call', contact: 'Sarah Chen' },
  { id: 2, title: 'Demo Presentation - TechFlow', time: '2:00 PM', date: '2026-02-10', type: 'video', contact: 'Marcus Johnson' },
  { id: 3, title: 'Contract Review - GrowthStack', time: '11:00 AM', date: '2026-02-11', type: 'call', contact: 'Jennifer Walsh' },
  { id: 4, title: 'Follow-up - Meridian Corp', time: '3:30 PM', date: '2026-02-12', type: 'call', contact: 'David Kim' },
]

const pipelineStages = [
  { name: 'Discovery', count: 12, value: 180000 },
  { name: 'Qualified', count: 8, value: 320000 },
  { name: 'Proposal', count: 5, value: 275000 },
  { name: 'Negotiation', count: 3, value: 195000 },
  { name: 'Closed Won', count: 7, value: 420000 },
]

export default function SalesAgentDemo() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [researching, setResearching] = useState(false)
  const [coaching, setCoaching] = useState(false)
  const [researchResult, setResearchResult] = useState<string | null>(null)

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handlePreCallResearch = async (lead: any) => {
    setSelectedLead(lead)
    setShowModal('research')
    setResearching(true)
    setResearchResult(null)
    await new Promise(r => setTimeout(r, 2500))
    setResearchResult(`
**Company Overview: ${lead.company}**
• Industry: Technology / Logistics
• Employees: 150-500
• Revenue: $25M - $50M (estimated)
• Recent News: Announced expansion into 3 new markets

**Key Insights:**
• Currently using legacy WMS system (5+ years old)
• Pain points: Manual billing, inventory discrepancies
• Recent hiring: Looking for Operations Manager
• Competitor: Using partial solution from CompetitorX

**${lead.name} - ${lead.title}:**
• LinkedIn: 500+ connections
• Background: 12 years in operations
• Education: MBA from Stanford
• Interests: Supply chain automation, AI

**Recommended Talking Points:**
1. Lead with ROI from similar-sized companies
2. Address integration concerns early
3. Offer pilot program for risk mitigation
4. Mention 24/7 support as differentiator
    `)
    setResearching(false)
  }

  const handleStartCoaching = async () => {
    setCoaching(true)
    await new Promise(r => setTimeout(r, 1500))
    setCoaching(false)
    setShowModal('coaching')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: Target },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'coaching', label: 'AI Coaching', icon: Brain },
    { id: 'docs', label: 'Knowledge Base', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const salesDocs = [
    { id: 1, name: 'Woulf Sales Materials', type: 'PDF', pages: 132, size: '10.2 MB', url: '/docs/woulf-sales-materials.pdf', category: 'Sales Playbook', uploaded: '2026-02-10' },
    { id: 2, name: 'Objection Handling Guide', type: 'PDF', pages: 28, size: '1.8 MB', url: '#', category: 'Training', uploaded: '2026-01-20' },
    { id: 3, name: 'Pricing & Discounting Policy', type: 'PDF', pages: 12, size: '0.8 MB', url: '#', category: 'Policies', uploaded: '2026-01-15' },
    { id: 4, name: 'Competitor Battle Cards', type: 'PDF', pages: 24, size: '2.2 MB', url: '#', category: 'Competitive Intel', uploaded: '2026-01-10' },
    { id: 5, name: 'ROI Calculator Guide', type: 'PDF', pages: 8, size: '0.5 MB', url: '#', category: 'Tools', uploaded: '2025-12-28' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          {notification}
        </div>
      )}

      <nav className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold">Sales Agent</h1>
                    <img src="/images/woulf-logo.png" alt="Woulf" className="w-5 h-5 rounded" title="Powered by Woulf" />
                  </div>
                  <p className="text-xs text-gray-400">AI-Powered Sales Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleStartCoaching} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-lg font-medium">
                <Brain className="w-4 h-4" />
                Start AI Coaching
              </button>
              <button onClick={() => setShowModal('addLead')} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium">
                <UserPlus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'text-white border-emerald-500' : 'text-gray-400 border-transparent hover:text-white'}`}>
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
                { label: 'Pipeline Value', value: '$1.39M', change: '+18%', icon: DollarSign, up: true },
                { label: 'Active Leads', value: '35', change: '+5 this week', icon: Users, up: true },
                { label: 'Meetings Today', value: '4', change: '2 calls, 2 demos', icon: Calendar, up: true },
                { label: 'Win Rate', value: '34%', change: '+8% MTD', icon: Target, up: true },
              ].map((kpi, i) => (
                <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <kpi.icon className="w-5 h-5 text-emerald-400" />
                    <span className={`text-xs ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>{kpi.change}</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                  <div className="text-sm text-gray-400">{kpi.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <button onClick={() => { setSelectedLead(leadsData[0]); handlePreCallResearch(leadsData[0]); }} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-emerald-500/50 transition-colors text-left group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-1">Pre-Call Research</h3>
                <p className="text-sm text-gray-400">Get AI-powered intel on your next prospect</p>
              </button>
              
              <button onClick={handleStartCoaching} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors text-left group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-1">Call Coaching</h3>
                <p className="text-sm text-gray-400">Real-time AI coaching during calls</p>
              </button>
              
              <button onClick={() => setShowModal('scheduleMeeting')} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-purple-500/50 transition-colors text-left group">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-1">Schedule Meeting</h3>
                <p className="text-sm text-gray-400">Book a call with smart scheduling</p>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Today&apos;s Meetings</h2>
                  <button onClick={() => setActiveTab('calendar')} className="text-sm text-emerald-400 hover:text-emerald-300">View All →</button>
                </div>
                <div className="space-y-3">
                  {meetingsData.slice(0, 3).map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer" onClick={() => { setSelectedLead(leadsData.find(l => l.name === meeting.contact)); setShowModal('meetingDetail'); }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meeting.type === 'call' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                          {meeting.type === 'call' ? <Phone className="w-5 h-5 text-blue-400" /> : <Video className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          <div className="text-xs text-gray-400">{meeting.contact}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{meeting.time}</div>
                        <div className="text-xs text-gray-400">{meeting.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Hot Leads</h2>
                  <button onClick={() => setActiveTab('leads')} className="text-sm text-emerald-400 hover:text-emerald-300">View All →</button>
                </div>
                <div className="space-y-3">
                  {leadsData.filter(l => l.score >= 80).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer" onClick={() => { setSelectedLead(lead); setShowModal('leadDetail'); }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-gray-400">{lead.company}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">${(lead.value / 1000).toFixed(0)}K</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs">{lead.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search leads..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500 focus:outline-none w-64" />
                </div>
                <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <option>All Stages</option>
                  <option>Discovery</option>
                  <option>Qualified</option>
                  <option>Proposal</option>
                  <option>Negotiation</option>
                </select>
              </div>
              <button onClick={() => setShowModal('addLead')} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium">
                <UserPlus className="w-4 h-4" /> Add Lead
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Value</th>
                    <th className="px-6 py-4 font-medium">Stage</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium">Last Contact</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsData.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-sm font-bold">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-xs text-gray-400">{lead.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{lead.company}</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">${lead.value.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          lead.stage === 'negotiation' ? 'bg-purple-500/10 text-purple-400' :
                          lead.stage === 'proposal' ? 'bg-blue-500/10 text-blue-400' :
                          lead.stage === 'qualified' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className={`w-4 h-4 ${lead.score >= 80 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                          <span className={lead.score >= 80 ? 'text-yellow-400' : ''}>{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{lead.lastContact}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handlePreCallResearch(lead)} className="p-2 hover:bg-white/10 rounded-lg" title="Research">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => showNotification(`Calling ${lead.name}...`)} className="p-2 hover:bg-white/10 rounded-lg" title="Call">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button onClick={() => showNotification('Email drafted')} className="p-2 hover:bg-white/10 rounded-lg" title="Email">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedLead(lead); setShowModal('leadDetail'); }} className="p-2 hover:bg-white/10 rounded-lg" title="View">
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

        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Sales Pipeline</h2>
            <div className="grid grid-cols-5 gap-4">
              {pipelineStages.map((stage, i) => (
                <div key={i} className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                  <div className="text-sm text-gray-400 mb-1">{stage.name}</div>
                  <div className="text-2xl font-bold">{stage.count}</div>
                  <div className="text-sm text-emerald-400">${(stage.value / 1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
              <h3 className="font-bold mb-4">Pipeline Visualization</h3>
              <div className="flex items-end justify-between gap-4 h-48">
                {pipelineStages.map((stage, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500/20 to-teal-500/20 rounded-t-lg border border-white/10 cursor-pointer hover:from-emerald-500/30 hover:to-teal-500/30 transition-colors"
                      style={{ height: `${(stage.value / 420000) * 100}%`, minHeight: '20px' }}
                      onClick={() => showNotification(`${stage.name}: ${stage.count} deals worth $${(stage.value / 1000).toFixed(0)}K`)}
                    />
                    <div className="mt-2 text-xs text-gray-400 text-center">{stage.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Calendar</h2>
              <button onClick={() => setShowModal('scheduleMeeting')} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> Schedule Meeting
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-bold mb-4">Upcoming Meetings</h3>
                <div className="space-y-3">
                  {meetingsData.map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer" onClick={() => setShowModal('meetingDetail')}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${meeting.type === 'call' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                          {meeting.type === 'call' ? <Phone className="w-6 h-6 text-blue-400" /> : <Video className="w-6 h-6 text-purple-400" />}
                        </div>
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          <div className="text-sm text-gray-400">{meeting.contact}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{meeting.time}</div>
                        <div className="text-sm text-gray-400">{meeting.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setShowModal('scheduleMeeting')} className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span>Schedule New Meeting</span>
                  </button>
                  <button onClick={() => showNotification('Calendar synced')} className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                    <span>Sync with Google Calendar</span>
                  </button>
                  <button onClick={() => showNotification('Availability updated')} className="w-full p-4 bg-white/5 rounded-lg hover:bg-white/10 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span>Set Availability</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coaching' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">AI Sales Coaching</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <button onClick={handleStartCoaching} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-emerald-500/50 transition-colors text-left">
                <Brain className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="font-bold mb-2">Live Call Coaching</h3>
                <p className="text-sm text-gray-400">Get real-time suggestions during your sales calls</p>
              </button>
              <button onClick={() => showNotification('Opening call recordings...')} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors text-left">
                <Mic className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-bold mb-2">Call Analysis</h3>
                <p className="text-sm text-gray-400">Review past calls with AI insights</p>
              </button>
              <button onClick={() => showNotification('Loading training modules...')} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl hover:border-purple-500/50 transition-colors text-left">
                <Award className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-bold mb-2">Skill Training</h3>
                <p className="text-sm text-gray-400">Practice objection handling and closing</p>
              </button>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
              <h3 className="font-bold mb-4">Your Performance</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Talk Ratio', value: '42%', target: '40%', status: 'good' },
                  { label: 'Question Rate', value: '8.2/call', target: '10+', status: 'improve' },
                  { label: 'Objection Handling', value: '85%', target: '80%', status: 'good' },
                  { label: 'Close Rate', value: '34%', target: '30%', status: 'good' },
                ].map((metric, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
                    <div className={`text-2xl font-bold ${metric.status === 'good' ? 'text-emerald-400' : 'text-yellow-400'}`}>{metric.value}</div>
                    <div className="text-xs text-gray-500">Target: {metric.target}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Sales Knowledge Base</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search documents..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg w-64" />
                </div>
                <button 
                  onClick={() => showNotification('Upload coming soon')}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium"
                >
                  <Upload className="w-4 h-4" /> Upload Document
                </button>
              </div>
            </div>

            {/* Document Categories */}
            <div className="grid grid-cols-5 gap-4">
              {['All', 'Sales Playbook', 'Training', 'Competitive Intel', 'Policies', 'Tools'].map((cat, i) => (
                <button key={cat} className={`p-3 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Documents List */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Pages</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Uploaded</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-xs text-gray-500">{doc.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-white/5 rounded text-xs">{doc.category}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{doc.pages}</td>
                      <td className="px-6 py-4 text-gray-400">{doc.size}</td>
                      <td className="px-6 py-4 text-gray-400">{doc.uploaded}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </a>
                          <button onClick={() => showNotification('Downloaded ' + doc.name)} className="p-2 hover:bg-white/10 rounded-lg">
                            <Download className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg">
                            <Share2 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Coaching Integration */}
            <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Coaching Knowledge</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    These documents are used by the AI Coaching feature to provide real-time sales guidance. The Woulf Sales Materials (132 pages) contains product details, pricing, and objection handling scripts that the AI references during calls.
                  </p>
                  <button onClick={() => showNotification('Training AI on documents...')} className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <Wand2 className="w-4 h-4" /> Update AI coaching knowledge
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Sales Agent Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-bold mb-4">CRM Integration</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Salesforce', connected: true },
                    { name: 'HubSpot', connected: false },
                    { name: 'Pipedrive', connected: false },
                  ].map((crm, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span>{crm.name}</span>
                      <button onClick={() => showNotification(crm.connected ? `Disconnected ${crm.name}` : `Connected ${crm.name}`)} className={`px-3 py-1 rounded-lg text-sm font-medium ${crm.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-gray-400'}`}>
                        {crm.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                <h3 className="font-bold mb-4">Coaching Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Coaching Style</label>
                    <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                      <option>Proactive (Suggest often)</option>
                      <option>Balanced</option>
                      <option>Minimal (Only when asked)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Focus Areas</label>
                    <div className="space-y-2">
                      {['Objection Handling', 'Closing Techniques', 'Discovery Questions', 'Rapport Building'].map((area, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={i < 2} className="rounded" />
                          <span className="text-sm">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => showNotification('Settings saved')} className="w-full py-2 bg-emerald-500 text-white rounded-lg font-medium">Save Settings</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {showModal === 'research' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Pre-Call Research</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                {researching ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-400" />
                    <p className="text-gray-400">Researching {selectedLead?.company}...</p>
                    <p className="text-sm text-gray-500 mt-2">Scanning LinkedIn, news, company website...</p>
                  </div>
                ) : researchResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">{researchResult}</pre>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => showNotification('Research saved to CRM')} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg font-medium">Save to CRM</button>
                      <button onClick={() => showNotification('Opening call...')} className="flex-1 py-2 bg-white/10 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" /> Start Call
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {showModal === 'coaching' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">AI Coaching Active</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="font-medium text-emerald-400">Listening...</span>
                    </div>
                    <p className="text-sm text-gray-300">AI coaching is ready. Start your call and I&apos;ll provide real-time suggestions.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Suggested opening:</div>
                    <p className="text-gray-200">&quot;Hi [Name], thanks for taking the time today. Before we dive in, I&apos;d love to understand more about your current challenges with [topic]...&quot;</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Key talking points:</div>
                    <ul className="space-y-1 text-sm">
                      <li>• Lead with ROI - mention 94% time savings</li>
                      <li>• Address integration concerns early</li>
                      <li>• Offer pilot program</li>
                    </ul>
                  </div>
                  <button onClick={() => { showNotification('Call ended - summary saved'); setShowModal(null); }} className="w-full py-3 bg-red-500 text-white rounded-lg font-medium">End Coaching Session</button>
                </div>
              </div>
            )}

            {showModal === 'addLead' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Add New Lead</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input type="text" placeholder="John" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input type="text" placeholder="Smith" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <input type="text" placeholder="Acme Corp" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input type="email" placeholder="john@acme.com" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input type="tel" placeholder="(555) 123-4567" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deal Value</label>
                    <input type="text" placeholder="$50,000" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                  </div>
                  <button onClick={() => { showNotification('Lead added successfully'); setShowModal(null); }} className="w-full py-3 bg-white text-black rounded-lg font-medium">Add Lead</button>
                </div>
              </div>
            )}

            {showModal === 'scheduleMeeting' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Schedule Meeting</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact</label>
                    <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                      {leadsData.map(l => <option key={l.id}>{l.name} - {l.company}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meeting Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="p-3 bg-blue-500 text-white rounded-lg">Call</button>
                      <button className="p-3 bg-white/5 rounded-lg">Video</button>
                      <button className="p-3 bg-white/5 rounded-lg">In-Person</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input type="date" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Time</label>
                      <input type="time" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meeting Title</label>
                    <input type="text" placeholder="Discovery Call" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg" />
                  </div>
                  <button onClick={() => { showNotification('Meeting scheduled'); setShowModal(null); }} className="w-full py-3 bg-white text-black rounded-lg font-medium">Schedule Meeting</button>
                </div>
              </div>
            )}

            {showModal === 'leadDetail' && selectedLead && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-xl font-bold">
                      {selectedLead.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedLead.name}</div>
                      <div className="text-gray-400">{selectedLead.title}</div>
                      <div className="text-sm text-gray-500">{selectedLead.company}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400">Deal Value</div>
                      <div className="font-bold text-emerald-400">${selectedLead.value.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-xs text-gray-400">Lead Score</div>
                      <div className="font-bold flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {selectedLead.score}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => showNotification(`Calling ${selectedLead.phone}...`)} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> Call
                    </button>
                    <button onClick={() => showNotification('Email drafted')} className="flex-1 py-2 bg-white/10 rounded-lg flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </button>
                    <button onClick={() => { setShowModal(null); handlePreCallResearch(selectedLead); }} className="flex-1 py-2 bg-white/10 rounded-lg flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Research
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
