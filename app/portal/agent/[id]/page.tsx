'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TenantProvider, useTenant } from '@/lib/tenant-context'

// ============================================================================
// AGENT DEFINITIONS
// ============================================================================
const AGENTS: Record<string, { name: string; icon: string; color: string; modules: string[] }> = {
  cfo: { name: 'CFO Agent', icon: '📈', color: 'emerald', modules: ['P&L Dashboard', 'Cash Flow Forecast', 'AR/AP Overview', 'Budget vs Actual', 'Financial Health Score'] },
  sales: { name: 'Sales Agent', icon: '💼', color: 'blue', modules: ['Pipeline Kanban', 'Deal Intelligence', 'Sales Intel', 'Commissions', 'CRM Sync'] },
  finops: { name: 'FinOps Agent', icon: '💰', color: 'amber', modules: ['Expense Dashboard', 'Cost Optimization', 'Vendor Analysis', 'Budget Tracking', 'Spend Alerts'] },
  payables: { name: 'Payables Agent', icon: '🧾', color: 'orange', modules: ['Invoice Queue', 'Payment Scheduling', 'Vendor Management', 'Approval Workflows', 'OCR Scanner'] },
  collections: { name: 'Collections Agent', icon: '📬', color: 'rose', modules: ['Overdue Dashboard', 'Collection Queue', 'Auto-Reminders', 'Payment Plans', 'Aging Report'] },
  hr: { name: 'HR Agent', icon: '👥', color: 'violet', modules: ['Employee Directory', 'Time Tracking', 'PTO Management', 'Onboarding', 'Compliance'] },
  operations: { name: 'Operations Agent', icon: '⚙️', color: 'slate', modules: ['Project Tracker', 'Resource Allocation', 'Milestone Dashboard', 'Field Reports', 'Equipment Status'] },
  legal: { name: 'Legal Agent', icon: '⚖️', color: 'cyan', modules: ['Contract Review', 'Clause Library', 'Compliance Monitor', 'Risk Assessment', 'Document Vault'] },
  marketing: { name: 'Marketing Agent', icon: '📣', color: 'pink', modules: ['Campaign Dashboard', 'Lead Tracking', 'Content Calendar', 'ROI Analysis', 'Market Intel'] },
  wms: { name: 'WMS Agent', icon: '🏭', color: 'teal', modules: ['Inventory Dashboard', 'Inbound/Outbound', 'Pick & Pack', 'Location Management', 'Cycle Counts'] },
  compliance: { name: 'Compliance Agent', icon: '🛡️', color: 'indigo', modules: ['Regulation Tracker', 'Audit Log', 'Policy Manager', 'Risk Dashboard', 'Certificate Tracking'] },
}

// ============================================================================
// SAMPLE TENANT-SCOPED DATA (in production, fetched from API with companyId filter)
// ============================================================================
const TENANT_DATA: Record<string, Record<string, { kpis: { label: string; value: string; trend: string }[]; recentActivity: string[] }>> = {
  woulf: {
    cfo: { kpis: [{ label: 'Revenue MTD', value: '$1.2M', trend: '+18%' }, { label: 'Cash Balance', value: '$340K', trend: '+$45K' }, { label: 'AR Outstanding', value: '$124K', trend: '-12%' }, { label: 'Burn Rate', value: '$89K/mo', trend: '-3%' }], recentActivity: ['Invoice #4521 paid by Metro Construction — $45,200', 'New PO received from Apex Logistics — $67,800', 'Payroll processed — $156,400', 'Quarterly tax estimate filed — $28,900'] },
    sales: { kpis: [{ label: 'Pipeline', value: '$2.4M', trend: '+22%' }, { label: 'Won MTD', value: '$485K', trend: '+3 deals' }, { label: 'Win Rate', value: '67%', trend: '+5%' }, { label: 'Avg Deal', value: '$72K', trend: '+$8K' }], recentActivity: ['Apex Logistics moved to Negotiation — $180K', 'Demo scheduled with Harbor Freight — Wednesday', 'Proposal sent to National Grid — $92K', 'Call with Metro Construction — renewal discussion'] },
    default: { kpis: [{ label: 'Active Items', value: '24', trend: '+3' }, { label: 'Completed', value: '156', trend: '+12' }, { label: 'Pending', value: '8', trend: '-2' }, { label: 'Efficiency', value: '94%', trend: '+1%' }], recentActivity: ['System initialized', 'Ready for data connection'] },
  },
  client1: {
    cfo: { kpis: [{ label: 'Revenue MTD', value: '$680K', trend: '+9%' }, { label: 'Cash Balance', value: '$190K', trend: '+$12K' }, { label: 'AR Outstanding', value: '$67K', trend: '-8%' }, { label: 'Burn Rate', value: '$52K/mo', trend: '-1%' }], recentActivity: ['Monthly close completed', 'AR aging report generated', 'Budget review scheduled for Friday'] },
    sales: { kpis: [{ label: 'Pipeline', value: '$890K', trend: '+15%' }, { label: 'Won MTD', value: '$210K', trend: '+2 deals' }, { label: 'Win Rate', value: '58%', trend: '+3%' }, { label: 'Avg Deal', value: '$45K', trend: '+$2K' }], recentActivity: ['New lead from trade show — Chen Industries', 'Follow-up call with Pacific Imports'] },
    default: { kpis: [{ label: 'Active Items', value: '12', trend: '+1' }, { label: 'Completed', value: '89', trend: '+5' }, { label: 'Pending', value: '4', trend: '-1' }, { label: 'Efficiency', value: '91%', trend: '+2%' }], recentActivity: ['System initialized for Chen Logistics'] },
  },
  _default: {
    default: { kpis: [{ label: 'Active Items', value: '—', trend: '' }, { label: 'Completed', value: '—', trend: '' }, { label: 'Pending', value: '—', trend: '' }, { label: 'Efficiency', value: '—', trend: '' }], recentActivity: ['Connect your data sources to activate this agent'] },
  }
}

function getTenantData(companyId: string, agentId: string) {
  const company = TENANT_DATA[companyId] || TENANT_DATA._default
  return company[agentId] || company.default || TENANT_DATA._default.default
}

// ============================================================================
// LIVE AGENT WORKSPACE COMPONENT
// ============================================================================
function LiveAgentWorkspace({ agentId, agent }: { agentId: string; agent: typeof AGENTS[string] }) {
  const { companyId, companyName, isGlobalAdmin, userName } = useTenant()
  const [activeModule, setActiveModule] = useState(agent.modules[0])
  const data = getTenantData(companyId, agentId)

  return (
    <div className="space-y-6">
      {/* Tenant scope indicator */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">
            Live Agent — Data scoped to <span className="text-white font-semibold">{companyName}</span>
          </span>
        </div>
        {isGlobalAdmin && (
          <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded">Global Admin — All Data Visible</span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {data.kpis.map((kpi, i) => (
          <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{kpi.label}</div>
            <div className="text-xl font-mono font-bold mt-1">{kpi.value}</div>
            {kpi.trend && <div className={"text-[10px] mt-1 " + (kpi.trend.startsWith('+') ? 'text-emerald-400' : kpi.trend.startsWith('-') ? 'text-rose-400' : 'text-gray-500')}>{kpi.trend}</div>}
          </div>
        ))}
      </div>

      {/* Module Tabs */}
      <div className="flex gap-1 bg-[#0A0E15] border border-white/5 rounded-xl p-1">
        {agent.modules.map(mod => (
          <button
            key={mod}
            onClick={() => setActiveModule(mod)}
            className={"px-4 py-2 rounded-lg text-xs transition-all " + (activeModule === mod ? 'bg-white/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5')}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Module Content Area */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold">{activeModule}</h3>
          <span className="text-[9px] text-gray-600">{companyName} | {new Date().toLocaleDateString()}</span>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3 mb-6">
          <div className="text-[10px] text-gray-500 uppercase">Recent Activity</div>
          {data.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
              <span className="text-sm text-gray-300">{activity}</span>
              <span className="text-[10px] text-gray-600 ml-auto shrink-0">{i === 0 ? '2m ago' : i === 1 ? '1h ago' : i === 2 ? '3h ago' : 'Yesterday'}</span>
            </div>
          ))}
        </div>

        {/* AI Chat Interface placeholder */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="text-[10px] text-gray-500 uppercase mb-3">AI Assistant</div>
          <div className="bg-black/20 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-[10px] shrink-0">{agent.icon}</div>
              <div className="text-sm text-gray-300">
                Hello {userName.split(' ')[0]}! I am your {agent.name}. I have access to {companyName} data. Ask me anything about your {activeModule.toLowerCase()}.
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={"Ask about " + activeModule.toLowerCase() + "..."}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// AGENT PAGE — Wraps workspace in TenantProvider
// ============================================================================
export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params?.id as string
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (!saved) { router.replace('/login'); return }
      const parsed = JSON.parse(saved)
      setUser(parsed)

      // Check agent access
      const isAdmin = parsed.role === 'super_admin' || parsed.role === 'admin'
      if (!isAdmin && !parsed.agents.includes(agentId)) {
        router.replace('/portal')
      }
    } catch { router.replace('/login') }
  }, [agentId, router])

  const agent = AGENTS[agentId]
  if (!agent || !user) return null

  return (
    <TenantProvider user={user}>
      <div className="min-h-screen bg-[#060910] text-white">
        {/* Top bar */}
        <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/portal')}
                className="text-xs text-gray-500 hover:text-white transition-all">
                ← Portal
              </button>
              <span className="text-gray-700">|</span>
              <span className="text-xl">{agent.icon}</span>
              <span className="text-sm font-semibold">{agent.name}</span>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-600">{user.companyName || ''}</span>
              <span className="text-xs text-gray-600">{user.name}</span>
              <button onClick={() => { localStorage.removeItem('woulfai_session'); router.push('/login') }}
                className="text-xs text-gray-600 hover:text-rose-400 transition-all">Sign Out</button>
            </div>
          </div>
        </div>

        {/* Live Agent Workspace */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <LiveAgentWorkspace agentId={agentId} agent={agent} />
        </div>
      </div>
    </TenantProvider>
  )
}
