'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, ArrowLeft, BarChart3, Target, Palette, Calendar, Settings,
  TrendingUp, TrendingDown, DollarSign, Users, MousePointer, Mail,
  Facebook, Linkedin, Instagram, Twitter, Youtube, Globe, 
  Plus, Play, Pause, Edit, Trash2, Copy, Download, Upload, Eye, 
  CheckCircle2, XCircle, Clock, AlertCircle, Zap, Image, FileText,
  Send, RefreshCw, Filter, Search, MoreHorizontal, ExternalLink,
  PieChart, Activity, Megaphone, Hash, AtSign, Link2, ChevronDown,
  X, Check, Loader2, Wand2, Bot, MessageSquare, Share2, Building2, UserPlus, FolderOpen
} from 'lucide-react'

// Sample data
const campaignsData = [
  { id: 1, name: 'WMS Demo Launch', platform: 'Google Ads', status: 'active', spend: 2450, revenue: 12800, roas: 5.22, leads: 156, startDate: '2026-01-15' },
  { id: 2, name: 'AI Agent Awareness', platform: 'LinkedIn', status: 'active', spend: 3200, revenue: 18500, roas: 5.78, leads: 42, startDate: '2026-01-20' },
  { id: 3, name: 'ThankGodAI Launch', platform: 'Meta', status: 'paused', spend: 1800, revenue: 7200, roas: 4.0, leads: 89, startDate: '2026-02-01' },
  { id: 4, name: 'Logistics Retargeting', platform: 'Google Ads', status: 'active', spend: 890, revenue: 4200, roas: 4.72, leads: 28, startDate: '2026-02-05' },
]

const splitTestsData = [
  { id: 1, name: 'Homepage CTA Button', status: 'winner', variantA: 'Start Free Trial', variantB: 'Get Started Now', winner: 'B', lift: '+23%', confidence: 98 },
  { id: 2, name: 'Pricing Page Layout', status: 'running', variantA: 'Cards', variantB: 'Table', winner: null, lift: '+8%', confidence: 67, progress: 67 },
  { id: 3, name: 'Email Subject Line', status: 'winner', variantA: 'AI for Your Business', variantB: 'Stop Wasting Hours on Manual Work', winner: 'B', lift: '+45%', confidence: 99 },
  { id: 4, name: 'Landing Page Hero', status: 'running', variantA: 'Video Background', variantB: 'Static Image', winner: null, lift: '+12%', confidence: 54, progress: 42 },
]

const brandsData = [
  { id: 1, name: 'WoulfAI', domain: 'woulfai.com', color: '#3B82F6', status: 'active', trademark: 'registered' },
  { id: 2, name: 'ThankGodAI', domain: 'thankgodai.com', color: '#8B5CF6', status: 'active', trademark: 'filed' },
  { id: 3, name: 'Axiom AI Automations', domain: 'axiomaiautomations.com', color: '#10B981', status: 'active', trademark: 'pending' },
  { id: 4, name: 'Clutch 3PL', domain: 'clutch3pl.com', color: '#F59E0B', status: 'active', trademark: 'registered' },
]

const contentCalendar = [
  { id: 1, title: 'AI Trends 2026 Blog Post', type: 'blog', platform: 'Website', date: '2026-02-10', status: 'scheduled', author: 'AI Generated' },
  { id: 2, title: 'WMS Employee Demo Video', type: 'video', platform: 'YouTube', date: '2026-02-12', status: 'draft', author: 'Marketing Team' },
  { id: 3, title: 'Customer Success Story', type: 'social', platform: 'LinkedIn', date: '2026-02-14', status: 'scheduled', author: 'AI Generated' },
  { id: 4, title: 'Weekly Newsletter', type: 'email', platform: 'Mailchimp', date: '2026-02-15', status: 'draft', author: 'AI Generated' },
]

const funnelData = [
  { stage: 'Traffic', value: 125000, rate: null },
  { stage: 'Lead Magnet', value: 18750, rate: 15 },
  { stage: 'Tripwire', value: 3750, rate: 20 },
  { stage: 'Core Offer', value: 1125, rate: 30 },
  { stage: 'Profit Max', value: 225, rate: 20 },
]

export default function MarketingAgentDemo() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [contentType, setContentType] = useState('blog')
  const [contentTopic, setContentTopic] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [socialPost, setSocialPost] = useState('')
  const [notification, setNotification] = useState<string | null>(null)
  
  // HubSpot CRM State
  const [hubspotConnected, setHubspotConnected] = useState<boolean | null>(null)
  const [hubspotLoading, setHubspotLoading] = useState(true)
  const [hubspotContacts, setHubspotContacts] = useState<any[]>([])
  const [hubspotCompanies, setHubspotCompanies] = useState<any[]>([])
  const [hubspotDeals, setHubspotDeals] = useState<any[]>([])
  const [hubspotStats, setHubspotStats] = useState<any>(null)
  const [contactSearch, setContactSearch] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({ firstname: '', lastname: '', email: '', company: '' })

  // Test HubSpot connection and fetch data
  useEffect(() => {
    async function testHubSpotConnection() {
      try {
        const response = await fetch('/api/hubspot?action=test')
        const result = await response.json()
        setHubspotConnected(result.connected)
        
        if (result.connected) {
          // Fetch dashboard data
          const dashboardRes = await fetch('/api/hubspot?action=dashboard')
          const dashboard = await dashboardRes.json()
          
          setHubspotContacts(dashboard.contacts?.recent || [])
          setHubspotCompanies(dashboard.companies?.recent || [])
          setHubspotDeals(dashboard.deals?.recent || [])
          setHubspotStats({
            totalContacts: dashboard.contacts?.total || 0,
            totalCompanies: dashboard.companies?.total || 0,
            totalDeals: dashboard.deals?.total || 0,
            pipelineValue: dashboard.deals?.totalValue || 0,
            lifecycleStages: dashboard.lifecycleStages || {}
          })
        }
      } catch (error) {
        console.error('HubSpot connection error:', error)
        setHubspotConnected(false)
      } finally {
        setHubspotLoading(false)
      }
    }
    
    testHubSpotConnection()
  }, [])

  // Search HubSpot contacts
  const searchHubSpotContacts = async (query: string) => {
    if (!hubspotConnected || !query.trim()) {
      if (!query.trim()) {
        const response = await fetch('/api/hubspot?action=contacts&limit=20')
        const result = await response.json()
        setHubspotContacts(result.results || [])
      }
      return
    }
    
    try {
      const response = await fetch(`/api/hubspot?action=contacts&search=${encodeURIComponent(query)}`)
      const result = await response.json()
      setHubspotContacts(result.results || [])
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  // Create HubSpot contact
  const createHubSpotContact = async () => {
    if (!hubspotConnected) return
    
    try {
      const response = await fetch('/api/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createContact',
          properties: newContact
        })
      })
      
      if (response.ok) {
        showNotification('Contact created in HubSpot!')
        setShowAddContact(false)
        setNewContact({ firstname: '', lastname: '', email: '', company: '' })
        // Refresh contacts
        const contactsRes = await fetch('/api/hubspot?action=contacts&limit=20')
        const result = await contactsRes.json()
        setHubspotContacts(result.results || [])
      } else {
        const error = await response.json()
        showNotification(`Error: ${error.error}`)
      }
    } catch (error: any) {
      showNotification(`Error: ${error.message}`)
    }
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleGenerateContent = async () => {
    setGenerating(true)
    setGeneratedContent('')
    
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 2000))
    
    const templates: Record<string, string> = {
      blog: `# ${contentTopic || 'How AI is Transforming Business Operations'}

In today's fast-paced business environment, artificial intelligence isn't just a buzzword—it's a competitive necessity. Companies that embrace AI-powered automation are seeing dramatic improvements in efficiency, accuracy, and profitability.

## The Problem with Manual Operations

Most businesses still rely on manual processes for critical operations:
- **Warehouse management** takes hours of data entry
- **Sales teams** spend more time on admin than selling
- **Finance departments** chase payments manually
- **Customer support** can't scale without hiring

## Enter AI Employees

AI Employees are purpose-built digital employees that handle specific business functions 24/7. Unlike generic chatbots, these agents understand your industry, integrate with your tools, and deliver measurable ROI.

### Real Results from Real Businesses

- **Clutch 3PL** reduced billing time by 94%
- **TechFlow Solutions** increased close rates by 34%
- **GrowthStack Inc** improved cash visibility to 100%

## Getting Started

The best part? You can deploy an AI Employee in days, not months. Start with a 14-day free trial and see the difference for yourself.

[Start Free Trial →](https://woulfai.com/contact)`,
      social: `🚀 Stop wasting 8+ hours on manual billing every month.

Our WMS Employee automates:
✅ Photo-verified receiving
✅ Automatic invoice generation
✅ Real-time inventory tracking
✅ Customer portal access

One 3PL cut billing time by 94% in the first week.

Ready to transform your operations?
👉 Link in bio for free trial

#AI #Logistics #Automation #3PL #WarehouseManagement #BusinessGrowth`,
      email: `Subject: You're Still Doing This Manually?

Hi {{first_name}},

I noticed you downloaded our WMS Guide last week. Quick question:

How many hours does your team spend on billing each month?

Most warehouse operators tell us 6-10 hours. One of our customers was at 8+ hours—until they deployed our WMS Employee.

Now? **15 minutes.** Fully automated, photo-verified, zero errors.

Here's what changed:
• BOLs auto-extracted from emails
• Storage fees calculated automatically  
• Invoices generated and sent without manual input
• Customer portal for real-time inventory access

The ROI? They saved $15,000/month in labor costs alone.

Want to see how it works? I can show you in a 15-minute demo.

[Book Your Demo →]

Best,
The WoulfAI Team

P.S. — We offer a 14-day free trial. No credit card required.`,
      ad: `Headline: Stop Manual Billing Forever
Description: AI-powered warehouse management that pays for itself in Week 1. Auto-generate invoices from BOLs. Photo verification included. Start free trial.
CTA: Get Started Free
Target: Logistics managers, 3PL operators, warehouse owners
Budget Recommendation: $50-100/day for testing`
    }
    
    setGeneratedContent(templates[contentType] || templates.blog)
    setGenerating(false)
  }

  const handleCreateCampaign = () => {
    showNotification('Campaign created successfully!')
    setShowModal(null)
  }

  const handleSaveBrand = () => {
    showNotification('Brand settings saved!')
    setShowModal(null)
  }

  const handleScheduleContent = () => {
    showNotification('Content scheduled for publication!')
    setShowModal(null)
  }

  const handleFileTrademark = () => {
    showNotification('Trademark application initiated!')
    setShowModal(null)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'crm', label: 'CRM', icon: Users, badge: hubspotConnected ? '●' : null },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'brand', label: 'Brand', icon: Palette },
    { id: 'docs', label: 'Knowledge Base', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const knowledgeBaseDocs = [
    { id: 1, name: 'Woulf Sales Materials', type: 'PDF', pages: 132, size: '10.2 MB', url: '/docs/woulf-sales-materials.pdf', category: 'Sales Collateral', uploaded: '2026-02-10' },
    { id: 2, name: 'Brand Guidelines', type: 'PDF', pages: 24, size: '2.4 MB', url: '#', category: 'Brand Assets', uploaded: '2026-01-15' },
    { id: 3, name: 'Product Catalog 2026', type: 'PDF', pages: 48, size: '5.1 MB', url: '#', category: 'Product Info', uploaded: '2026-01-01' },
    { id: 4, name: 'Case Studies Collection', type: 'PDF', pages: 36, size: '3.8 MB', url: '#', category: 'Sales Collateral', uploaded: '2025-12-20' },
    { id: 5, name: 'Competitor Analysis', type: 'PDF', pages: 18, size: '1.2 MB', url: '#', category: 'Market Research', uploaded: '2025-12-15' },
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
              <Link href="/demo" className="flex items-center gap-2 text-[#6B7280] hover:text-[#1B2A4A] transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-100" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-400 rounded-xl flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold">Marketing Employee</h1>
                    <img src="/images/woulf-logo.png" alt="Woulf" className="w-5 h-5 rounded" title="Powered by Woulf" />
                  </div>
                  <p className="text-xs text-[#6B7280]">AI-Powered Campaign Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowModal('generate')}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Wand2 className="w-4 h-4" />
                AI Generate
              </button>
              <button 
                onClick={() => setShowModal('campaign')}
                className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e0850a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Campaign
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Ad Spend', value: '$8,340', change: '+12%', up: true, icon: DollarSign },
                { label: 'Total Revenue', value: '$42,700', change: '+34%', up: true, icon: TrendingUp },
                { label: 'ROAS', value: '5.12x', change: '+18%', up: true, icon: BarChart3 },
                { label: 'New Leads', value: '354', change: '+28%', up: true, icon: Users },
              ].map((kpi, i) => (
                <div key={i} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <kpi.icon className="w-5 h-5 text-[#6B7280]" />
                    <span className={`text-sm flex items-center gap-1 ${kpi.up ? 'text-emerald-600' : 'text-red-600'}`}>
                      {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {kpi.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                  <div className="text-sm text-[#6B7280]">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Marketing Funnel */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Marketing Funnel</h2>
                <button 
                  onClick={() => setShowModal('funnel')}
                  className="text-sm text-[#2A9D8F] hover:text-[#238577] flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" /> Configure
                </button>
              </div>
              <div className="flex items-end justify-between gap-4 h-64">
                {funnelData.map((stage, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-pink-500/20 to-purple-500/20 rounded-t-lg border border-[#E5E7EB] flex items-end justify-center relative group cursor-pointer hover:from-pink-500/30 hover:to-purple-500/30 transition-colors"
                      style={{ height: `${(stage.value / funnelData[0].value) * 100}%`, minHeight: '40px' }}
                    >
                      <div className="absolute -top-8 text-sm font-bold">{stage.value.toLocaleString()}</div>
                      {stage.rate && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-xs px-1.5 py-0.5 rounded font-medium">
                          {stage.rate}%
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-[#6B7280] text-center">{stage.stage}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowModal('generate')}
                className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold mb-1">Generate Content</h3>
                <p className="text-sm text-[#6B7280]">Use AI to create blog posts, social content, or emails</p>
              </button>
              
              <button 
                onClick={() => setShowModal('campaign')}
                className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Launch Campaign</h3>
                <p className="text-sm text-[#6B7280]">Create and launch a new marketing campaign</p>
              </button>
              
              <button 
                onClick={() => setShowModal('splitTest')}
                className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1">A/B Test</h3>
                <p className="text-sm text-[#6B7280]">Set up a new split test to optimize conversions</p>
              </button>
            </div>

            {/* Recent Campaigns */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Active Campaigns</h2>
                <button 
                  onClick={() => setActiveTab('campaigns')}
                  className="text-sm text-[#2A9D8F] hover:text-[#238577]"
                >
                  View All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB]">
                      <th className="pb-3 font-medium">Campaign</th>
                      <th className="pb-3 font-medium">Platform</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium text-right">Spend</th>
                      <th className="pb-3 font-medium text-right">Revenue</th>
                      <th className="pb-3 font-medium text-right">ROAS</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignsData.slice(0, 3).map((campaign) => (
                      <tr key={campaign.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                        <td className="py-4 font-medium">{campaign.name}</td>
                        <td className="py-4">
                          <span className="flex items-center gap-2">
                            {campaign.platform === 'Google Ads' && <Globe className="w-4 h-4 text-blue-600" />}
                            {campaign.platform === 'LinkedIn' && <Linkedin className="w-4 h-4 text-blue-500" />}
                            {campaign.platform === 'Meta' && <Facebook className="w-4 h-4 text-blue-600" />}
                            {campaign.platform}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">${campaign.spend.toLocaleString()}</td>
                        <td className="py-4 text-right text-emerald-600">${campaign.revenue.toLocaleString()}</td>
                        <td className="py-4 text-right font-medium">{campaign.roas}x</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => { setSelectedCampaign(campaign); setShowModal('editCampaign'); }}
                              className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => showNotification(`${campaign.status === 'active' ? 'Paused' : 'Resumed'} ${campaign.name}`)}
                              className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors"
                            >
                              {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Split Tests */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Split Tests</h2>
                <button 
                  onClick={() => setShowModal('splitTest')}
                  className="text-sm bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> New Test
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {splitTestsData.map((test) => (
                  <div key={test.id} className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{test.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        test.status === 'winner' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {test.status === 'winner' ? '✓ Winner' : 'Running'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className={`flex-1 p-2 rounded ${test.winner === 'A' ? 'bg-emerald-50 border border-emerald-500/30' : 'bg-[#F4F5F7]'}`}>
                        <div className="text-xs text-[#6B7280] mb-1">Variant A</div>
                        <div className="truncate">{test.variantA}</div>
                      </div>
                      <span className="text-[#9CA3AF]">vs</span>
                      <div className={`flex-1 p-2 rounded ${test.winner === 'B' ? 'bg-emerald-50 border border-emerald-500/30' : 'bg-[#F4F5F7]'}`}>
                        <div className="text-xs text-[#6B7280] mb-1">Variant B</div>
                        <div className="truncate">{test.variantB}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E7EB]">
                      <span className="text-sm text-emerald-600 font-medium">{test.lift} lift</span>
                      <span className="text-sm text-[#6B7280]">{test.confidence}% confidence</span>
                    </div>
                    {test.status === 'running' && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${test.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input 
                    type="text"
                    placeholder="Search campaigns..."
                    className="pl-10 pr-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none w-64"
                  />
                </div>
                <select className="px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none">
                  <option>All Platforms</option>
                  <option>Google Ads</option>
                  <option>LinkedIn</option>
                  <option>Meta</option>
                </select>
                <select className="px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Paused</option>
                  <option>Draft</option>
                </select>
              </div>
              <button 
                onClick={() => setShowModal('campaign')}
                className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e0850a] transition-colors"
              >
                <Plus className="w-4 h-4" /> New Campaign
              </button>
            </div>

            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">Campaign</th>
                    <th className="px-6 py-4 font-medium">Platform</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Spend</th>
                    <th className="px-6 py-4 font-medium text-right">Revenue</th>
                    <th className="px-6 py-4 font-medium text-right">ROAS</th>
                    <th className="px-6 py-4 font-medium text-right">Leads</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignsData.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4">
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-[#6B7280]">Started {campaign.startDate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          {campaign.platform === 'Google Ads' && <Globe className="w-4 h-4 text-blue-600" />}
                          {campaign.platform === 'LinkedIn' && <Linkedin className="w-4 h-4 text-blue-500" />}
                          {campaign.platform === 'Meta' && <Facebook className="w-4 h-4 text-blue-600" />}
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">${campaign.spend.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-emerald-600">${campaign.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-medium">{campaign.roas}x</td>
                      <td className="px-6 py-4 text-right">{campaign.leads}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setSelectedCampaign(campaign); setShowModal('editCampaign'); }}
                            className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => showNotification(`${campaign.status === 'active' ? 'Paused' : 'Resumed'} ${campaign.name}`)}
                            className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors"
                            title={campaign.status === 'active' ? 'Pause' : 'Resume'}
                          >
                            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => showNotification(`Campaign duplicated`)}
                            className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => showNotification(`Campaign deleted`)}
                            className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* CRM Tab - HubSpot Integration */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className={`p-4 rounded-xl border ${hubspotConnected ? 'bg-emerald-50 border-emerald-500/30' : hubspotLoading ? 'bg-yellow-50 border-yellow-500/30' : 'bg-red-50 border-red-500/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {hubspotLoading ? (
                    <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                  ) : hubspotConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <span className="font-medium">
                      {hubspotLoading ? 'Connecting to HubSpot...' : hubspotConnected ? 'Connected to HubSpot CRM' : 'HubSpot Not Connected'}
                    </span>
                    {hubspotConnected && hubspotStats && (
                      <span className="text-sm text-[#6B7280] ml-2">
                        {hubspotStats.totalContacts} contacts • {hubspotStats.totalCompanies} companies • {hubspotStats.totalDeals} deals
                      </span>
                    )}
                  </div>
                </div>
                {!hubspotConnected && !hubspotLoading && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Configure in Settings
                  </button>
                )}
              </div>
            </div>

            {hubspotConnected ? (
              <>
                {/* CRM Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                    <Users className="w-5 h-5 text-blue-600 mb-3" />
                    <div className="text-2xl font-bold">{hubspotStats?.totalContacts || 0}</div>
                    <div className="text-sm text-[#6B7280]">Total Contacts</div>
                  </div>
                  <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                    <Building2 className="w-5 h-5 text-purple-600 mb-3" />
                    <div className="text-2xl font-bold">{hubspotStats?.totalCompanies || 0}</div>
                    <div className="text-sm text-[#6B7280]">Companies</div>
                  </div>
                  <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                    <Target className="w-5 h-5 text-pink-600 mb-3" />
                    <div className="text-2xl font-bold">{hubspotStats?.totalDeals || 0}</div>
                    <div className="text-sm text-[#6B7280]">Active Deals</div>
                  </div>
                  <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                    <DollarSign className="w-5 h-5 text-emerald-600 mb-3" />
                    <div className="text-2xl font-bold">${(hubspotStats?.pipelineValue || 0).toLocaleString()}</div>
                    <div className="text-sm text-[#6B7280]">Pipeline Value</div>
                  </div>
                </div>

                {/* Contacts Section */}
                <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Contacts</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                        <input
                          type="text"
                          placeholder="Search contacts..."
                          value={contactSearch}
                          onChange={(e) => {
                            setContactSearch(e.target.value)
                            searchHubSpotContacts(e.target.value)
                          }}
                          className="pl-10 pr-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg text-sm focus:border-[#2A9D8F] focus:outline-none w-64"
                        />
                      </div>
                      <button
                        onClick={() => setShowAddContact(true)}
                        className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#e0850a]"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Contact
                      </button>
                    </div>
                  </div>

                  {/* Add Contact Form */}
                  {showAddContact && (
                    <div className="mb-6 p-4 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={newContact.firstname}
                          onChange={(e) => setNewContact({ ...newContact, firstname: e.target.value })}
                          className="px-3 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={newContact.lastname}
                          onChange={(e) => setNewContact({ ...newContact, lastname: e.target.value })}
                          className="px-3 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg text-sm"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          className="px-3 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={newContact.company}
                          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                          className="px-3 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowAddContact(false)}
                          className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#1B2A4A]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={createHubSpotContact}
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600"
                        >
                          Create Contact
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contacts Table */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Company</th>
                        <th className="pb-3">Lifecycle Stage</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hubspotContacts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                            {contactSearch ? 'No contacts found matching your search' : 'No contacts yet. Add your first contact!'}
                          </td>
                        </tr>
                      ) : (
                        hubspotContacts.map((contact) => (
                          <tr key={contact.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-medium">
                                  {(contact.properties?.firstname?.[0] || contact.properties?.email?.[0] || '?').toUpperCase()}
                                </div>
                                <span className="font-medium">
                                  {contact.properties?.firstname} {contact.properties?.lastname}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-[#6B7280]">{contact.properties?.email}</td>
                            <td className="py-4 text-[#6B7280]">{contact.properties?.company || '-'}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                contact.properties?.lifecyclestage === 'customer' ? 'bg-emerald-100 text-emerald-600' :
                                contact.properties?.lifecyclestage === 'lead' ? 'bg-blue-100 text-blue-600' :
                                contact.properties?.lifecyclestage === 'opportunity' ? 'bg-purple-500/20 text-purple-600' :
                                'bg-gray-500/20 text-[#6B7280]'
                              }`}>
                                {contact.properties?.lifecyclestage || 'subscriber'}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => showNotification(`Opening ${contact.properties?.email}`)}
                                  className="p-1.5 hover:bg-[#e0850a] rounded"
                                >
                                  <Mail className="w-4 h-4 text-[#6B7280]" />
                                </button>
                                <button 
                                  onClick={() => window.open(`https://app.hubspot.com/contacts/${contact.id}`, '_blank')}
                                  className="p-1.5 hover:bg-[#e0850a] rounded"
                                >
                                  <ExternalLink className="w-4 h-4 text-[#6B7280]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Deals Section */}
                {hubspotDeals.length > 0 && (
                  <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                    <h3 className="text-lg font-bold mb-6">Recent Deals</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {hubspotDeals.slice(0, 6).map((deal) => (
                        <div key={deal.id} className="p-4 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg hover:border-[#2A9D8F]/40 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium truncate">{deal.properties?.dealname}</span>
                            <span className="text-emerald-600 font-bold">
                              ${parseFloat(deal.properties?.amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <span className="px-2 py-0.5 bg-gray-100 rounded">{deal.properties?.dealstage || 'New'}</span>
                            {deal.properties?.closedate && (
                              <span>Close: {new Date(deal.properties.closedate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : !hubspotLoading && (
              /* Demo Mode - Not Connected */
              <div className="p-8 bg-white shadow-sm border border-[#E5E7EB] rounded-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Connect HubSpot CRM</h3>
                <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
                  Connect your HubSpot account to sync contacts, companies, and deals. 
                  Manage your entire sales pipeline from this dashboard.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-6 py-3 bg-[#F5920B] text-white rounded-lg font-medium hover:bg-[#e0850a]"
                  >
                    Configure HubSpot
                  </button>
                  <a 
                    href="https://www.hubspot.com/products/get-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 border border-[#E5E7EB] rounded-lg font-medium hover:bg-[#F4F5F7] flex items-center gap-2"
                  >
                    Get Free HubSpot <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Content Calendar</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowModal('generate')}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-lg font-medium"
                >
                  <Wand2 className="w-4 h-4" /> AI Generate
                </button>
                <button 
                  onClick={() => setShowModal('scheduleContent')}
                  className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4" /> Schedule Content
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Blog Posts', value: 12, icon: FileText, color: 'blue' },
                { label: 'Social Posts', value: 48, icon: Share2, color: 'pink' },
                { label: 'Email Campaigns', value: 8, icon: Mail, color: 'purple' },
                { label: 'Ad Creatives', value: 24, icon: Image, color: 'orange' },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400 mb-2`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-[#6B7280]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">Content</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Platform</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contentCalendar.map((content) => (
                    <tr key={content.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4">
                        <div className="font-medium">{content.title}</div>
                        <div className="text-sm text-[#6B7280]">By {content.author}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 capitalize">
                          {content.type === 'blog' && <FileText className="w-4 h-4 text-blue-600" />}
                          {content.type === 'video' && <Youtube className="w-4 h-4 text-red-600" />}
                          {content.type === 'social' && <Share2 className="w-4 h-4 text-pink-600" />}
                          {content.type === 'email' && <Mail className="w-4 h-4 text-purple-600" />}
                          {content.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{content.platform}</td>
                      <td className="px-6 py-4">{content.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          content.status === 'scheduled' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {content.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => showNotification('Opening editor...')}
                            className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => showNotification('Preview opened')}
                            className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => showNotification('Content deleted')}
                            className="p-2 hover:bg-[#e0850a] rounded-lg transition-colors text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Brand Management</h2>
              <button 
                onClick={() => { setSelectedBrand(null); setShowModal('addBrand'); }}
                className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium"
              >
                <Plus className="w-4 h-4" /> Add Brand
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {brandsData.map((brand) => (
                <div key={brand.id} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: brand.color }}
                      >
                        {brand.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{brand.name}</h3>
                        <a href={`https://${brand.domain}`} className="text-sm text-[#6B7280] hover:text-[#1B2A4A] flex items-center gap-1">
                          {brand.domain} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      brand.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-500/10 text-[#6B7280]'
                    }`}>
                      {brand.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280] mb-1">Brand Color</div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: brand.color }} />
                        <span className="font-mono text-sm">{brand.color}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280] mb-1">Trademark</div>
                      <span className={`text-sm font-medium ${
                        brand.trademark === 'registered' ? 'text-emerald-600' :
                        brand.trademark === 'filed' ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {brand.trademark === 'registered' ? '® Registered' :
                         brand.trademark === 'filed' ? '™ Filed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSelectedBrand(brand); setShowModal('editBrand'); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#F4F5F7] rounded-lg hover:bg-[#e0850a] transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => showNotification('Assets downloaded')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#F4F5F7] rounded-lg hover:bg-[#e0850a] transition-colors"
                    >
                      <Download className="w-4 h-4" /> Assets
                    </button>
                    <button 
                      onClick={() => setShowModal('trademark')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#F4F5F7] rounded-lg hover:bg-[#e0850a] transition-colors"
                    >
                      <Zap className="w-4 h-4" /> Trademark
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Knowledge Base</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="text" placeholder="Search documents..." className="pl-10 pr-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg w-64" />
                </div>
                <button 
                  onClick={() => showNotification('Upload coming soon')}
                  className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium"
                >
                  <Upload className="w-4 h-4" /> Upload Document
                </button>
              </div>
            </div>

            {/* Document Categories */}
            <div className="grid grid-cols-4 gap-4">
              {['All Documents', 'Sales Collateral', 'Brand Assets', 'Product Info', 'Market Research'].map((cat, i) => (
                <button key={cat} className={`p-3 rounded-lg text-sm font-medium transition-colors ${i === 0 ? 'bg-pink-500/20 text-pink-600 border border-pink-500/30' : 'bg-[#F4F5F7] text-[#6B7280] hover:bg-[#e0850a]'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Documents List */}
            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left text-sm text-[#6B7280]">
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Pages</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Uploaded</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {knowledgeBaseDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-xs text-[#9CA3AF]">{doc.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#F4F5F7] rounded text-xs">{doc.category}</span>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280]">{doc.pages}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{doc.size}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{doc.uploaded}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-[#e0850a] rounded-lg">
                            <Eye className="w-4 h-4 text-[#6B7280]" />
                          </a>
                          <button onClick={() => showNotification('Downloaded ' + doc.name)} className="p-2 hover:bg-[#e0850a] rounded-lg">
                            <Download className="w-4 h-4 text-[#6B7280]" />
                          </button>
                          <button className="p-2 hover:bg-[#e0850a] rounded-lg">
                            <Share2 className="w-4 h-4 text-[#6B7280]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Summary */}
            <div className="p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Document Analysis</h3>
                  <p className="text-sm text-[#6B7280] mb-3">
                    The Knowledge Base contains 5 documents with 258 total pages. The Woulf Sales Materials (132 pages) is your primary sales collateral with comprehensive product information, pricing guides, and case studies.
                  </p>
                  <button onClick={() => showNotification('Generating insights...')} className="text-sm text-[#2A9D8F] hover:text-[#238577] flex items-center gap-1">
                    <Wand2 className="w-4 h-4" /> Generate content from these documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Analytics Dashboard</h2>
              <div className="flex items-center gap-3">
                <select className="px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                </select>
                <button 
                  onClick={() => showNotification('Report exported')}
                  className="flex items-center gap-2 bg-[#F4F5F7] border border-[#E5E7EB] px-4 py-2 rounded-lg"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Website Visitors', value: '45.2K', change: '+12%' },
                { label: 'Page Views', value: '128K', change: '+8%' },
                { label: 'Bounce Rate', value: '42%', change: '-5%' },
                { label: 'Avg Session', value: '3:24', change: '+15%' },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                  <div className="text-sm text-[#6B7280] mb-1">{stat.label}</div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className={`text-sm ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Traffic Sources</h3>
                <div className="space-y-4">
                  {[
                    { source: 'Organic Search', value: 42, color: 'bg-blue-500' },
                    { source: 'Paid Ads', value: 28, color: 'bg-pink-500' },
                    { source: 'Social Media', value: 18, color: 'bg-purple-500' },
                    { source: 'Direct', value: 12, color: 'bg-orange-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{item.source}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Top Performing Content</h3>
                <div className="space-y-3">
                  {[
                    { title: 'How AI is Transforming 3PL', views: '8.2K', type: 'Blog' },
                    { title: 'WMS Demo Walkthrough', views: '5.4K', type: 'Video' },
                    { title: 'Customer Success Story', views: '3.1K', type: 'Case Study' },
                    { title: 'Pricing Comparison Guide', views: '2.8K', type: 'Guide' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-[#6B7280]">{item.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.views}</div>
                        <div className="text-xs text-[#6B7280]">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Marketing Employee Settings</h2>

            {/* HubSpot CRM Configuration */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold">H</span>
                  </div>
                  <div>
                    <h3 className="font-bold">HubSpot CRM</h3>
                    <p className="text-sm text-[#6B7280]">Manage contacts, companies, and deals</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${hubspotConnected ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {hubspotLoading ? (
                    <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                  ) : hubspotConnected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
              
              {hubspotConnected ? (
                <div className="grid grid-cols-3 gap-4 p-4 bg-[#F4F5F7] rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{hubspotStats?.totalContacts || 0}</div>
                    <div className="text-sm text-[#6B7280]">Contacts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{hubspotStats?.totalCompanies || 0}</div>
                    <div className="text-sm text-[#6B7280]">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{hubspotStats?.totalDeals || 0}</div>
                    <div className="text-sm text-[#6B7280]">Deals</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F4F5F7] rounded-lg">
                  <p className="text-sm text-[#6B7280] mb-3">
                    To connect HubSpot, add your Private App token to <code className="px-1 py-0.5 bg-gray-100 rounded">.env.local</code>:
                  </p>
                  <pre className="p-3 bg-[#1B2A4A]/30 rounded text-sm text-[#4B5563] overflow-x-auto">
                    HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                  </pre>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Connected Platforms</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Google Ads', icon: Globe, connected: true },
                    { name: 'Meta Ads', icon: Facebook, connected: true },
                    { name: 'LinkedIn Ads', icon: Linkedin, connected: false },
                    { name: 'Twitter/X', icon: Twitter, connected: false },
                    { name: 'Mailchimp', icon: Mail, connected: true },
                    { name: 'Buffer', icon: Share2, connected: false },
                  ].map((platform, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="flex items-center gap-3">
                        <platform.icon className="w-5 h-5" />
                        <span>{platform.name}</span>
                      </div>
                      <button 
                        onClick={() => showNotification(platform.connected ? `Disconnected ${platform.name}` : `Connected ${platform.name}`)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          platform.connected 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                        }`}
                      >
                        {platform.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">AI Content Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Tone</label>
                    <select className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Professional</option>
                      <option>Casual</option>
                      <option>Formal</option>
                      <option>Friendly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                    <select className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>B2B - Enterprise</option>
                      <option>B2B - SMB</option>
                      <option>B2C - Consumers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry Focus</label>
                    <select className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Logistics & 3PL</option>
                      <option>Manufacturing</option>
                      <option>E-Commerce</option>
                      <option>Professional Services</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => showNotification('Settings saved')}
                    className="w-full py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/40">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* AI Generate Modal */}
            {showModal === 'generate' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">AI Content Generator</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['blog', 'social', 'email', 'ad'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setContentType(type)}
                          className={`p-3 rounded-lg text-sm font-medium capitalize ${
                            contentType === type ? 'bg-pink-500 text-white' : 'bg-[#F4F5F7] hover:bg-[#e0850a]'
                          }`}
                        >
                          {type === 'ad' ? 'Ad Copy' : type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Topic / Theme</label>
                    <input
                      type="text"
                      value={contentTopic}
                      onChange={(e) => setContentTopic(e.target.value)}
                      placeholder="e.g., How AI is transforming warehouse operations..."
                      className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateContent}
                    disabled={generating}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Content
                      </>
                    )}
                  </button>

                  {generatedContent && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Generated Content</label>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { navigator.clipboard.writeText(generatedContent); showNotification('Copied!'); }}
                            className="p-2 hover:bg-[#e0850a] rounded-lg"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleGenerateContent}
                            className="p-2 hover:bg-[#e0850a] rounded-lg"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-[#F4F5F7] rounded-lg max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-[#4B5563] font-sans">{generatedContent}</pre>
                      </div>
                      <button
                        onClick={() => { handleScheduleContent(); setGeneratedContent(''); }}
                        className="w-full mt-4 py-2 bg-[#F5920B] text-white rounded-lg font-medium"
                      >
                        Schedule This Content
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Campaign Modal */}
            {showModal === 'campaign' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Create New Campaign</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Campaign Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Spring Product Launch"
                      className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Google Ads', icon: Globe },
                        { name: 'Meta', icon: Facebook },
                        { name: 'LinkedIn', icon: Linkedin },
                      ].map((platform) => (
                        <button
                          key={platform.name}
                          className="p-3 bg-[#F4F5F7] hover:bg-[#e0850a] rounded-lg flex items-center gap-2 justify-center"
                        >
                          <platform.icon className="w-4 h-4" />
                          {platform.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Daily Budget</label>
                      <input
                        type="text"
                        placeholder="$100"
                        className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                        <option>7 days</option>
                        <option>14 days</option>
                        <option>30 days</option>
                        <option>Ongoing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                    <textarea
                      placeholder="Describe your target audience..."
                      rows={3}
                      className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Campaign Goal</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Lead Generation', 'Brand Awareness', 'Conversions'].map((goal) => (
                        <button key={goal} className="p-3 bg-[#F4F5F7] hover:bg-[#e0850a] rounded-lg text-sm">
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(null)}
                      className="flex-1 py-3 border border-[#E5E7EB] rounded-lg font-medium hover:bg-[#F4F5F7]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      className="flex-1 py-3 bg-[#F5920B] text-white rounded-lg font-medium hover:bg-[#e0850a]"
                    >
                      Create Campaign
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Split Test Modal */}
            {showModal === 'splitTest' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Create A/B Test</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Homepage CTA Color"
                      className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Test Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Headlines', 'CTA Buttons', 'Page Layout', 'Email Subject', 'Ad Copy', 'Images'].map((type) => (
                        <button key={type} className="p-3 bg-[#F4F5F7] hover:bg-[#e0850a] rounded-lg text-sm">
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Variant A (Control)</label>
                      <textarea
                        placeholder="Enter control variant..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Variant B (Test)</label>
                      <textarea
                        placeholder="Enter test variant..."
                        rows={3}
                        className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Traffic Split</label>
                      <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                        <option>50/50</option>
                        <option>70/30</option>
                        <option>90/10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Minimum Sample Size</label>
                      <input
                        type="number"
                        placeholder="1000"
                        className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(null)}
                      className="flex-1 py-3 border border-[#E5E7EB] rounded-lg font-medium hover:bg-[#F4F5F7]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { showNotification('A/B Test created!'); setShowModal(null); }}
                      className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Trademark Modal */}
            {showModal === 'trademark' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">File Trademark</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-600">
                      This wizard will help you prepare your trademark application. Final filing will be done through the USPTO.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Trademark Name</label>
                    <input
                      type="text"
                      placeholder="Enter the name to trademark"
                      className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Trademark Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 bg-pink-500 text-white rounded-lg text-sm">Word Mark</button>
                      <button className="p-3 bg-[#F4F5F7] hover:bg-[#e0850a] rounded-lg text-sm">Logo/Design</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Goods/Services Category</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Class 9 - Software & Technology</option>
                      <option>Class 35 - Advertising & Business</option>
                      <option>Class 42 - Scientific & Tech Services</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(null)}
                      className="flex-1 py-3 border border-[#E5E7EB] rounded-lg font-medium hover:bg-[#F4F5F7]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFileTrademark}
                      className="flex-1 py-3 bg-[#F5920B] text-white rounded-lg font-medium hover:bg-[#e0850a]"
                    >
                      Prepare Application
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Brand Modal */}
            {showModal === 'addBrand' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Add New Brand</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g., My New Brand"
                      className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Domain</label>
                    <input
                      type="text"
                      placeholder="e.g., mynewbrand.com"
                      className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        defaultValue="#3B82F6"
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="#3B82F6"
                        className="flex-1 px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Logo Upload</label>
                    <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center hover:border-[#E5E7EB] transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[#6B7280]" />
                      <p className="text-sm text-[#6B7280]">Drag & drop or click to upload</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">PNG, SVG up to 5MB</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(null)}
                      className="flex-1 py-3 border border-[#E5E7EB] rounded-lg font-medium hover:bg-[#F4F5F7]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBrand}
                      className="flex-1 py-3 bg-[#F5920B] text-white rounded-lg font-medium hover:bg-[#e0850a]"
                    >
                      Add Brand
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
