'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Headphones, Phone, MessageSquare, Mail, Users,
  BarChart3, Settings, Clock, CheckCircle2, XCircle, AlertCircle,
  Search, Filter, Plus, Bot, PhoneCall, PhoneOff, Volume2,
  Mic, MicOff, User, Building, Tag, Star, Send, X, Loader2,
  FileText, HelpCircle, BookOpen, Zap, TrendingUp, ArrowUpRight
} from 'lucide-react'

const ticketsData = [
  { id: 'TKT-001', subject: 'Billing question about February invoice', customer: 'Pacific Logistics', priority: 'high', status: 'open', channel: 'phone', agent: 'AI', time: '5 min ago' },
  { id: 'TKT-002', subject: 'How to access customer portal?', customer: 'TechFlow Solutions', priority: 'medium', status: 'open', channel: 'chat', agent: 'AI', time: '12 min ago' },
  { id: 'TKT-003', subject: 'Request for inventory report', customer: 'GrowthStack Inc', priority: 'low', status: 'pending', channel: 'email', agent: 'Unassigned', time: '1 hour ago' },
  { id: 'TKT-004', subject: 'Shipping delay inquiry', customer: 'Meridian Corp', priority: 'high', status: 'resolved', channel: 'phone', agent: 'AI', time: '2 hours ago' },
  { id: 'TKT-005', subject: 'API integration help', customer: 'Atlas Industries', priority: 'medium', status: 'open', channel: 'chat', agent: 'Sarah', time: '3 hours ago' },
]

const callsData = [
  { id: 1, caller: 'Sarah Chen', company: 'Pacific Logistics', duration: '4:32', status: 'completed', outcome: 'resolved', time: '10:15 AM' },
  { id: 2, caller: 'Unknown', company: 'New Lead', duration: '1:45', status: 'completed', outcome: 'transferred', time: '10:02 AM' },
  { id: 3, caller: 'Marcus Johnson', company: 'TechFlow Solutions', duration: '0:00', status: 'missed', outcome: null, time: '9:45 AM' },
  { id: 4, caller: 'Jennifer Walsh', company: 'GrowthStack Inc', duration: '6:18', status: 'completed', outcome: 'resolved', time: '9:30 AM' },
]

const knowledgeBase = [
  { id: 1, title: 'How to access the customer portal', category: 'Portal', views: 234 },
  { id: 2, title: 'Understanding your monthly invoice', category: 'Billing', views: 189 },
  { id: 3, title: 'Requesting a BOL', category: 'Operations', views: 156 },
  { id: 4, title: 'Hazmat storage requirements', category: 'Compliance', views: 142 },
  { id: 5, title: 'API documentation overview', category: 'Technical', views: 98 },
]

export default function SupportAgentDemo() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [inCall, setInCall] = useState(false)
  const [muted, setMuted] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'customer', text: 'Hi, I need help with my invoice' },
    { role: 'ai', text: 'Hello! I\'d be happy to help you with your invoice. Could you please provide your account number or company name?' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setChatMessages([...chatMessages, { role: 'agent', text: newMessage }])
    setNewMessage('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'I\'ve found your account. Your February invoice shows a total of $3,500 for parking services. Would you like me to email you a detailed breakdown?' }])
    }, 1500)
  }

  const handleStartCall = () => {
    setInCall(true)
    setShowModal('activeCall')
  }

  const handleEndCall = () => {
    setInCall(false)
    setShowModal(null)
    showNotification('Call ended - summary saved')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'chat', label: 'Live Chat', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
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
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-400 rounded-xl flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold">Support Employee</h1>
                    <img src="/images/woulf-logo.png" alt="Woulf" className="w-5 h-5 rounded" title="Powered by Woulf" />
                  </div>
                  <p className="text-xs text-white/60">AI-Powered Customer Service</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {inCall ? (
                <button onClick={handleEndCall} className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-lg font-medium animate-pulse">
                  <PhoneOff className="w-4 h-4" />
                  End Call
                </button>
              ) : (
                <button onClick={handleStartCall} className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 rounded-lg font-medium">
                  <Phone className="w-4 h-4" />
                  Test AI Phone
                </button>
              )}
              <button onClick={() => setShowModal('newTicket')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" />
                New Ticket
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
                { label: 'Open Tickets', value: '12', change: '3 high priority', icon: MessageSquare, color: 'violet' },
                { label: 'Avg Response', value: '< 30s', change: 'AI-powered', icon: Clock, color: 'emerald' },
                { label: 'Resolution Rate', value: '78%', change: 'First contact', icon: CheckCircle2, color: 'blue' },
                { label: 'CSAT Score', value: '4.8/5', change: '+0.3 this month', icon: Star, color: 'yellow' },
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

            {/* AI Status */}
            <div className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Employee Status</h3>
                    <p className="text-sm text-[#6B7280]">Handling phone calls, chat, and email automatically</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">Active</div>
                    <div className="text-sm text-[#6B7280]">24/7 Coverage</div>
                  </div>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-4 gap-4">
              <button onClick={handleStartCall} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <Phone className="w-8 h-8 text-violet-400 mb-4" />
                <h3 className="font-semibold mb-1">Test AI Phone</h3>
                <p className="text-sm text-[#6B7280]">Simulate an incoming call</p>
              </button>
              <button onClick={() => setActiveTab('chat')} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <MessageSquare className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-[#6B7280]">View active chat sessions</p>
              </button>
              <button onClick={() => setActiveTab('knowledge')} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <BookOpen className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="font-semibold mb-1">Knowledge Base</h3>
                <p className="text-sm text-[#6B7280]">Manage AI responses</p>
              </button>
              <button onClick={() => showNotification('Routing rules opened')} className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 transition-colors text-left group">
                <Zap className="w-8 h-8 text-orange-400 mb-4" />
                <h3 className="font-semibold mb-1">Call Routing</h3>
                <p className="text-sm text-[#6B7280]">Configure AI routing</p>
              </button>
            </div>

            {/* Recent Tickets */}
            <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recent Tickets</h2>
                <button onClick={() => setActiveTab('tickets')} className="text-sm text-[#2A9D8F] hover:text-[#238577]">View All →</button>
              </div>
              <div className="space-y-3">
                {ticketsData.slice(0, 4).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-[#F4F5F7] rounded-lg hover:bg-[#e0850a] cursor-pointer" onClick={() => { setSelectedTicket(ticket); setShowModal('ticketDetail'); }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-red-400' : ticket.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                      <div>
                        <div className="font-medium">{ticket.subject}</div>
                        <div className="text-xs text-[#6B7280]">{ticket.customer} • {ticket.channel}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                        ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {ticket.status}
                      </span>
                      <div className="text-xs text-[#9CA3AF] mt-1">{ticket.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="text" placeholder="Search tickets..." className="pl-10 pr-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none w-64" />
                </div>
                <select className="px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                  <option>All Status</option>
                  <option>Open</option>
                  <option>Pending</option>
                  <option>Resolved</option>
                </select>
              </div>
              <button onClick={() => setShowModal('newTicket')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> New Ticket
              </button>
            </div>

            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">Ticket</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Channel</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Agent</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsData.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4">
                        <div className="font-medium">{ticket.id}</div>
                        <div className="text-sm text-[#6B7280] truncate max-w-xs">{ticket.subject}</div>
                      </td>
                      <td className="px-6 py-4">{ticket.customer}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 capitalize">
                          {ticket.channel === 'phone' && <Phone className="w-4 h-4" />}
                          {ticket.channel === 'chat' && <MessageSquare className="w-4 h-4" />}
                          {ticket.channel === 'email' && <Mail className="w-4 h-4" />}
                          {ticket.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          ticket.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                          ticket.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400' :
                          ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={ticket.agent === 'AI' ? 'text-violet-400' : ''}>{ticket.agent}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedTicket(ticket); setShowModal('ticketDetail'); }} className="p-2 hover:bg-[#e0850a] rounded-lg">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Call History</h2>
              <button onClick={handleStartCall} className="flex items-center gap-2 bg-violet-500 px-4 py-2 rounded-lg font-medium">
                <Phone className="w-4 h-4" /> Test AI Phone
              </button>
            </div>
            <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[#6B7280] border-b border-[#E5E7EB] bg-white shadow-sm">
                    <th className="px-6 py-4 font-medium">Caller</th>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Outcome</th>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {callsData.map((call) => (
                    <tr key={call.id} className="border-b border-[#E5E7EB] hover:bg-white shadow-sm">
                      <td className="px-6 py-4 font-medium">{call.caller}</td>
                      <td className="px-6 py-4">{call.company}</td>
                      <td className="px-6 py-4">{call.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          call.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize">{call.outcome || '-'}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{call.time}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => showNotification('Playing recording...')} className="p-2 hover:bg-[#e0850a] rounded-lg">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
              <h3 className="font-bold mb-4">Active Chats</h3>
              <div className="space-y-2">
                {['Pacific Logistics', 'TechFlow Solutions', 'New Visitor'].map((chat, i) => (
                  <button key={i} className={`w-full p-3 rounded-lg text-left flex items-center gap-3 ${i === 0 ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-[#F4F5F7] hover:bg-[#e0850a]'}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {chat.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{chat}</div>
                      <div className="text-xs text-[#6B7280]">{i === 0 ? 'Active now' : i === 1 ? '2 min ago' : 'Just joined'}</div>
                    </div>
                    {i === 2 && <div className="w-2 h-2 bg-emerald-400 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl flex flex-col h-[500px]">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center font-bold">P</div>
                  <div>
                    <div className="font-medium">Pacific Logistics</div>
                    <div className="text-xs text-emerald-400">Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-full flex items-center gap-1">
                    <Bot className="w-3 h-3" /> AI Handling
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === 'customer' ? 'bg-gray-100' :
                      msg.role === 'ai' ? 'bg-violet-500/20 border border-violet-500/30' :
                      'bg-blue-500/20'
                    }`}>
                      {msg.role === 'ai' && <div className="text-xs text-violet-400 mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> AI Employee</div>}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg focus:border-[#2A9D8F] focus:outline-none"
                  />
                  <button onClick={handleSendMessage} className="p-2 bg-violet-500 rounded-lg">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Knowledge Base</h2>
              <button onClick={() => setShowModal('addArticle')} className="flex items-center gap-2 bg-[#F5920B] text-white px-4 py-2 rounded-lg font-medium">
                <Plus className="w-4 h-4" /> Add Article
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {knowledgeBase.map((article) => (
                <div key={article.id} className="p-4 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F]/40 cursor-pointer" onClick={() => showNotification('Article opened')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-xs rounded">{article.category}</span>
                    <span className="text-xs text-[#6B7280]">{article.views} views</span>
                  </div>
                  <h3 className="font-medium mb-2">{article.title}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); showNotification('Article edited'); }} className="text-xs text-[#6B7280] hover:text-[#1B2A4A]">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); showNotification('Article deleted'); }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Support Employee Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">AI Phone Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Greeting Message</label>
                    <textarea defaultValue="Thank you for calling WoulfAI. How can I help you today?" className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg resize-none" rows={3} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Transfer Keywords</label>
                    <input type="text" defaultValue="human, agent, representative, manager" className="w-full px-4 py-2 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <button onClick={() => showNotification('Settings saved')} className="w-full py-2 bg-violet-500 text-white rounded-lg font-medium">Save Settings</button>
                </div>
              </div>
              <div className="p-6 bg-white shadow-sm border border-[#E5E7EB] rounded-xl">
                <h3 className="font-bold mb-4">Integrations</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Twilio', connected: true },
                    { name: 'Intercom', connected: false },
                    { name: 'Zendesk', connected: false },
                    { name: 'Slack', connected: true },
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
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/40">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {showModal === 'activeCall' && (
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Phone className="w-10 h-10 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI Call Active</h2>
                  <p className="text-[#6B7280] mb-6">Simulating incoming customer call...</p>
                  <div className="p-4 bg-[#F4F5F7] rounded-lg mb-6 text-left">
                    <div className="text-sm text-[#6B7280] mb-2">AI is saying:</div>
                    <p className="text-sm">&quot;Thank you for calling WoulfAI support. I&apos;m your AI assistant. How can I help you today?&quot;</p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setMuted(!muted)} className={`p-4 rounded-full ${muted ? 'bg-red-500' : 'bg-gray-100'}`}>
                      {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button onClick={handleEndCall} className="p-4 bg-red-500 rounded-full">
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showModal === 'newTicket' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Create Ticket</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer</label>
                    <input type="text" placeholder="Customer name" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input type="text" placeholder="Brief description" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30">High</button>
                      <button className="p-2 bg-[#F4F5F7] rounded-lg">Medium</button>
                      <button className="p-2 bg-[#F4F5F7] rounded-lg">Low</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea rows={4} placeholder="Detailed description..." className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg resize-none" />
                  </div>
                  <button onClick={() => { showNotification('Ticket created'); setShowModal(null); }} className="w-full py-3 bg-[#F5920B] text-white rounded-lg font-medium">Create Ticket</button>
                </div>
              </div>
            )}

            {showModal === 'ticketDetail' && selectedTicket && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{selectedTicket.id}</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-[#F4F5F7] rounded-lg">
                    <div className="text-sm text-[#6B7280] mb-1">Subject</div>
                    <div className="font-medium">{selectedTicket.subject}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Customer</div>
                      <div className="font-medium">{selectedTicket.customer}</div>
                    </div>
                    <div className="p-3 bg-[#F4F5F7] rounded-lg">
                      <div className="text-xs text-[#6B7280]">Status</div>
                      <div className="font-medium capitalize">{selectedTicket.status}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { showNotification('Ticket resolved'); setShowModal(null); }} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg">Resolve</button>
                    <button onClick={() => showNotification('Assigned to agent')} className="flex-1 py-2 bg-gray-100 rounded-lg">Assign</button>
                    <button onClick={() => showNotification('Reply sent')} className="flex-1 py-2 bg-gray-100 rounded-lg">Reply</button>
                  </div>
                </div>
              </div>
            )}

            {showModal === 'addArticle' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Add Knowledge Article</h2>
                  <button onClick={() => setShowModal(null)} className="p-2 hover:bg-[#e0850a] rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input type="text" placeholder="Article title" className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg">
                      <option>Billing</option>
                      <option>Portal</option>
                      <option>Operations</option>
                      <option>Technical</option>
                      <option>Compliance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea rows={6} placeholder="Article content..." className="w-full px-4 py-3 bg-[#F4F5F7] border border-[#E5E7EB] rounded-lg resize-none" />
                  </div>
                  <button onClick={() => { showNotification('Article created'); setShowModal(null); }} className="w-full py-3 bg-[#F5920B] text-white rounded-lg font-medium">Create Article</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
