'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Search, FileText, Building2, Users, TrendingUp, Globe,
  Briefcase, DollarSign, MapPin, Calendar, ExternalLink, BookOpen,
  Newspaper, AlertCircle, CheckCircle2, Clock, Loader2, Sparkles,
  Download, Copy, Share2, Bookmark, Filter, ChevronDown, ChevronRight,
  Linkedin, Twitter, Mail, Phone, Star, Target, Zap, BarChart3,
  PieChart, Activity, Award, Shield, Lightbulb, MessageSquare
} from 'lucide-react'

const sampleCompanies = [
  { name: 'Acme Corporation', industry: 'Manufacturing', employees: '5,000-10,000', revenue: '$500M-$1B', founded: 2001, hq: 'Chicago, IL' },
  { name: 'TechFlow Solutions', industry: 'SaaS / Technology', employees: '200-500', revenue: '$50M-$100M', founded: 2015, hq: 'San Francisco, CA' },
  { name: 'Pacific Logistics', industry: '3PL / Supply Chain', employees: '1,000-5,000', revenue: '$100M-$500M', founded: 1998, hq: 'Los Angeles, CA' },
]

const researchResults = {
  company: {
    name: 'Pacific Logistics',
    logo: 'P',
    tagline: 'Nationwide 3PL and Supply Chain Solutions',
    website: 'pacificlogistics.com',
    founded: 1998,
    employees: '2,400',
    revenue: '$340M',
    hq: 'Los Angeles, CA',
    industry: '3PL / Warehousing / Supply Chain',
  },
  leadership: [
    { name: 'Michael Chen', title: 'CEO', linkedin: true, email: 'mchen@pacificlogistics.com', tenure: '8 years' },
    { name: 'Sarah Williams', title: 'COO', linkedin: true, email: 'swilliams@pacificlogistics.com', tenure: '5 years' },
    { name: 'David Martinez', title: 'VP Operations', linkedin: true, email: 'dmartinez@pacificlogistics.com', tenure: '3 years' },
    { name: 'Jennifer Lee', title: 'CFO', linkedin: true, email: 'jlee@pacificlogistics.com', tenure: '4 years' },
  ],
  financials: {
    revenue: [280, 295, 310, 325, 340],
    years: [2022, 2023, 2024, 2025, 2026],
    growth: '+12% YoY',
    funding: 'Private / PE-backed',
    valuation: 'Est. $800M-$1B',
  },
  news: [
    { title: 'Pacific Logistics Opens New 500K Sq Ft Distribution Center in Dallas', date: '2026-01-28', source: 'Supply Chain Dive', sentiment: 'positive' },
    { title: 'Company Announces $50M Investment in Automation Technology', date: '2026-01-15', source: 'Logistics Management', sentiment: 'positive' },
    { title: 'Pacific Logistics Named Top 3PL Provider by Industry Group', date: '2025-12-10', source: 'Transport Topics', sentiment: 'positive' },
    { title: 'Q4 2025 Results: Strong Growth Despite Labor Challenges', date: '2026-01-05', source: 'Company Press Release', sentiment: 'neutral' },
  ],
  competitors: [
    { name: 'XPO Logistics', overlap: 85, strength: 'National coverage' },
    { name: 'Ryder System', overlap: 72, strength: 'Fleet management' },
    { name: 'DHL Supply Chain', overlap: 68, strength: 'International reach' },
    { name: 'Kenco Group', overlap: 55, strength: 'Value pricing' },
  ],
  painPoints: [
    { issue: 'Manual billing processes causing revenue leakage', confidence: 95, source: 'Job postings, Industry reports' },
    { issue: 'Labor shortages in key markets', confidence: 88, source: 'News articles, Earnings calls' },
    { issue: 'Legacy WMS systems limiting automation', confidence: 82, source: 'Tech stack analysis, Job postings' },
    { issue: 'Customer portal lacking real-time visibility', confidence: 78, source: 'Customer reviews, Social media' },
  ],
  opportunities: [
    'WMS modernization project likely in planning',
    'Actively hiring for operations technology roles',
    'Recent expansion = growing pains with processes',
    'PE pressure for operational efficiency gains',
  ],
  talkingPoints: [
    'Reference their Dallas expansion and operational scaling challenges',
    'Highlight automation investment alignment with WMS Agent capabilities',
    'Mention similar 3PL client success stories with billing automation',
    'Ask about their current WMS pain points and modernization timeline',
  ],
}

export default function ResearchIntelPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [savedReports, setSavedReports] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setShowSuggestions(false)
    setTimeout(() => {
      setIsSearching(false)
      setHasResults(true)
    }, 2000)
  }

  const handleSaveReport = () => {
    if (!savedReports.includes(researchResults.company.name)) {
      setSavedReports([...savedReports, researchResults.company.name])
      showNotification('Report saved to library')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'leadership', label: 'Leadership', icon: Users },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'news', label: 'News & Updates', icon: Newspaper },
    { id: 'competitors', label: 'Competitors', icon: Target },
    { id: 'insights', label: 'Sales Insights', icon: Lightbulb },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          {notification}
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-lg">Research Agent</h1>
                    <img src="/images/woulf-logo.png" alt="Woulf" className="w-5 h-5 rounded" title="Powered by Woulf" />
                  </div>
                  <p className="text-xs text-gray-400">Company Intelligence & Pre-Call Research</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => showNotification(`You have ${savedReports.length} saved reports`)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <Bookmark className="w-4 h-4" />
                Saved ({savedReports.length})
              </button>
              <button onClick={() => showNotification('Search history opened')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                <Clock className="w-4 h-4" />
                History
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">Research Any Company Instantly</h2>
            <p className="text-gray-400">Get comprehensive intelligence for sales calls, competitive analysis, and market research</p>
          </div>

          <div className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(e.target.value.length > 0)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter company name, domain, or LinkedIn URL..."
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none text-lg"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden z-10">
                    {sampleCompanies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((company, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(company.name)
                          setShowSuggestions(false)
                        }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-gray-400">{company.industry} • {company.employees} employees</div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="w-full flex items-center gap-2 p-4 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Search for &quot;{searchQuery}&quot;
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Research
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => showNotification('Browse by industry coming soon')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Globe className="w-4 h-4" />
              Browse by Industry
            </button>
            <span className="text-gray-600">•</span>
            <button onClick={() => showNotification('Trending companies loading...')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
              Trending Companies
            </button>
            <span className="text-gray-600">•</span>
            <button onClick={() => showNotification('Loading target accounts...')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Target className="w-4 h-4" />
              My Target Accounts
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold">Gathering Intelligence...</h3>
                  <p className="text-sm text-gray-400">Analyzing multiple data sources</p>
                </div>
              </div>
              <div className="space-y-3">
                {['Scanning company database...', 'Finding leadership profiles...', 'Analyzing news & updates...', 'Identifying pain points...'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300">{step}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 text-sm">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-gray-400">Generating sales insights...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {hasResults && !isSearching && (
          <div className="space-y-6">
            {/* Company Header */}
            <div className="flex items-start justify-between p-6 bg-white/[0.02] border border-white/10 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                  {researchResults.company.logo}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{researchResults.company.name}</h2>
                  <p className="text-gray-400">{researchResults.company.tagline}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{researchResults.company.website}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{researchResults.company.hq}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{researchResults.company.employees} employees</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSaveReport} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <Bookmark className={`w-4 h-4 ${savedReports.includes(researchResults.company.name) ? 'fill-current text-yellow-400' : ''}`} />
                  {savedReports.includes(researchResults.company.name) ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => showNotification('Report exported as PDF')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button onClick={() => showNotification('Share link copied to clipboard')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {activeTab === 'overview' && (
                  <>
                    <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                      <h3 className="font-semibold mb-4">Company Overview</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { label: 'Industry', value: researchResults.company.industry, icon: Briefcase },
                          { label: 'Revenue', value: researchResults.company.revenue, icon: DollarSign },
                          { label: 'Employees', value: researchResults.company.employees, icon: Users },
                          { label: 'Founded', value: researchResults.company.founded, icon: Calendar },
                          { label: 'Headquarters', value: researchResults.company.hq, icon: MapPin },
                          { label: 'Website', value: researchResults.company.website, icon: Globe },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg">
                            <item.icon className="w-5 h-5 text-indigo-400" />
                            <div>
                              <div className="text-xs text-gray-500">{item.label}</div>
                              <div className="font-medium">{item.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                      <h3 className="font-semibold mb-4">Recent News</h3>
                      <div className="space-y-3">
                        {researchResults.news.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                            <div className={`w-2 h-2 mt-2 rounded-full ${item.sentiment === 'positive' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                            <div className="flex-1">
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-gray-400">{item.source} • {item.date}</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'leadership' && (
                  <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                    <h3 className="font-semibold mb-4">Key Decision Makers</h3>
                    <div className="space-y-4">
                      {researchResults.leadership.map((person, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                              {person.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium">{person.name}</div>
                              <div className="text-sm text-gray-400">{person.title} • {person.tenure}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => showNotification(`Opening ${person.name}'s LinkedIn profile`)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" title="LinkedIn">
                              <Linkedin className="w-4 h-4 text-blue-400" />
                            </button>
                            <button onClick={() => showNotification(`Composing email to ${person.email}`)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" title="Email">
                              <Mail className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => showNotification(`Copied ${person.email} to clipboard`)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" title="Copy Email">
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'financials' && (
                  <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                    <h3 className="font-semibold mb-4">Financial Overview</h3>
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-white/[0.02] rounded-lg text-center">
                        <div className="text-2xl font-bold text-emerald-400">{researchResults.financials.growth}</div>
                        <div className="text-sm text-gray-400">Revenue Growth</div>
                      </div>
                      <div className="p-4 bg-white/[0.02] rounded-lg text-center">
                        <div className="text-2xl font-bold">{researchResults.financials.funding}</div>
                        <div className="text-sm text-gray-400">Funding Status</div>
                      </div>
                      <div className="p-4 bg-white/[0.02] rounded-lg text-center">
                        <div className="text-2xl font-bold">{researchResults.financials.valuation}</div>
                        <div className="text-sm text-gray-400">Est. Valuation</div>
                      </div>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-2 p-4 bg-white/[0.02] rounded-lg">
                      {researchResults.financials.revenue.map((rev, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all"
                            style={{ height: `${(rev / 400) * 100}%` }}
                          />
                          <div className="text-xs text-gray-400">{researchResults.financials.years[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'news' && (
                  <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                    <h3 className="font-semibold mb-4">News & Updates</h3>
                    <div className="space-y-3">
                      {researchResults.news.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            item.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {item.sentiment}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium mb-1">{item.title}</div>
                            <div className="text-sm text-gray-400">{item.source} • {item.date}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'competitors' && (
                  <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                    <h3 className="font-semibold mb-4">Competitive Landscape</h3>
                    <div className="space-y-4">
                      {researchResults.competitors.map((comp, i) => (
                        <div key={i} className="p-4 bg-white/[0.02] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{comp.name}</div>
                            <div className="text-sm text-gray-400">{comp.overlap}% overlap</div>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${comp.overlap}%` }} />
                          </div>
                          <div className="text-sm text-gray-400">Strength: {comp.strength}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'insights' && (
                  <>
                    <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        Identified Pain Points
                      </h3>
                      <div className="space-y-3">
                        {researchResults.painPoints.map((point, i) => (
                          <div key={i} className="p-4 bg-white/[0.02] rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{point.issue}</div>
                              <div className="text-sm text-emerald-400">{point.confidence}% confidence</div>
                            </div>
                            <div className="text-sm text-gray-400">Source: {point.source}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        Opportunities
                      </h3>
                      <div className="space-y-2">
                        {researchResults.opportunities.map((opp, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span>{opp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    AI Talking Points
                  </h3>
                  <div className="space-y-3">
                    {researchResults.talkingPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{point}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => showNotification('Talking points copied')} className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </button>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => showNotification('Email draft generated')} className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <span>Draft Outreach Email</span>
                    </button>
                    <button onClick={() => showNotification('Call script ready')} className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <span>Generate Call Script</span>
                    </button>
                    <button onClick={() => showNotification('Added to CRM')} className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                      <Target className="w-5 h-5 text-emerald-400" />
                      <span>Add to CRM</span>
                    </button>
                    <button onClick={() => showNotification('Follow-up scheduled')} className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left">
                      <Calendar className="w-5 h-5 text-amber-400" />
                      <span>Schedule Follow-up</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasResults && !isSearching && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Building2, title: 'Company Research', desc: 'Deep-dive into any company with financials, leadership, and competitive analysis' },
                { icon: Lightbulb, title: 'Sales Intelligence', desc: 'AI-generated talking points, pain points, and opportunities for your sales calls' },
                { icon: Target, title: 'Competitive Analysis', desc: 'Understand market positioning and identify key differentiators' },
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
                  <feature.icon className="w-10 h-10 text-indigo-400 mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
