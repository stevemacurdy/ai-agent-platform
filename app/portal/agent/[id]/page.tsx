'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TenantProvider, useTenant } from '@/lib/tenant-context'

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
// Registry Agent type
// ============================================================================
interface RegistryAgent {
  slug: string
  display_name: string
  description: string | null
  short_description: string | null
  icon: string
  color: string
  status: string
  modules: { id: string; slug: string; display_name: string; icon: string; display_order: number; is_default: boolean }[]
  categories: any[]
  tenant_config: any
}

// ============================================================================
// LIVE AGENT WORKSPACE COMPONENT
// ============================================================================
function LiveAgentWorkspace({ agentId, agent }: { agentId: string; agent: RegistryAgent }) {
  const { companyId, companyName, isGlobalAdmin, userName } = useTenant()
  const moduleNames = agent.modules.length > 0
    ? agent.modules.map(m => m.display_name)
    : ['Dashboard']
  const [activeModule, setActiveModule] = useState(moduleNames[0])
  const data = getTenantData(companyId, agentId)

  return (
    <div className="space-y-6">
      {/* Tenant scope indicator */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-[#6B7280]">
            Live Agent — Data scoped to <span className="text-white font-semibold">{companyName}</span>
          </span>
        </div>
        {isGlobalAdmin && (
          <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded">Global Admin — All Data Visible</span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.kpis.map((kpi, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[9px] text-[#9CA3AF] uppercase">{kpi.label}</div>
            <div className="text-xl font-mono font-bold mt-1">{kpi.value}</div>
            {kpi.trend && <div className={"text-[10px] mt-1 " + (kpi.trend.startsWith('+') ? 'text-emerald-600' : kpi.trend.startsWith('-') ? 'text-rose-400' : 'text-[#9CA3AF]')}>{kpi.trend}</div>}
          </div>
        ))}
      </div>

      {/* Module Tabs — from registry */}
      <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 overflow-x-auto">
        {moduleNames.map(mod => (
          <button
            key={mod}
            onClick={() => setActiveModule(mod)}
            className={"px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all " + (activeModule === mod ? 'bg-gray-100 text-white font-semibold' : 'text-[#9CA3AF] hover:text-[#4B5563] hover:bg-white shadow-sm')}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Module Content Area */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold">{activeModule}</h3>
          <span className="text-[9px] text-[#6B7280]">{companyName} | {new Date().toLocaleDateString()}</span>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3 mb-6">
          <div className="text-[10px] text-[#9CA3AF] uppercase">Recent Activity</div>
          {data.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
              <span className="text-sm text-[#4B5563]">{activity}</span>
              <span className="text-[10px] text-[#6B7280] ml-auto shrink-0">{i === 0 ? '2m ago' : i === 1 ? '1h ago' : i === 2 ? '3h ago' : 'Yesterday'}</span>
            </div>
          ))}
        </div>

        {/* AI Chat Interface placeholder */}
        <div className="border-t border-[#E5E7EB] pt-4 mt-4">
          <div className="text-[10px] text-[#9CA3AF] uppercase mb-3">AI Assistant</div>
          <div className="bg-black/20 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] shrink-0">{agent.icon}</div>
              <div className="text-sm text-[#4B5563]">
                Hello {userName.split(' ')[0]}! I am your {agent.display_name}. I have access to {companyName} data. Ask me anything about your {activeModule.toLowerCase()}.
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={"Ask about " + activeModule.toLowerCase() + "..."}
                className="flex-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm text-white placeholder-[#9CA3AF] focus:border-[#2A9D8F]/30 focus:outline-none"
              />
              <button className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-blue-500">
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
// AGENT PAGE — Fetches from registry, wraps workspace in TenantProvider
// ============================================================================
export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params?.id as string
  const [user, setUser] = useState<any>(null)
  const [agent, setAgent] = useState<RegistryAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        // Auth check
        const saved = localStorage.getItem('woulfai_session')
        if (!saved) { router.replace('/login'); return }
        const parsed = JSON.parse(saved)
        setUser(parsed)

        // Check agent access
        const isAdmin = parsed.role === 'super_admin' || parsed.role === 'admin'
        if (!isAdmin && parsed.agents?.length > 0 && !parsed.agents.includes(agentId)) {
          router.replace('/portal')
          return
        }

        // Fetch agent from registry
        const res = await fetch(`/api/agents/registry?slug=${agentId}`)
        if (!res.ok) {
          setError('Agent not found')
          return
        }
        const data = await res.json()
        setAgent(data.agent)
      } catch {
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [agentId, router])

  if (loading) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-[3px] mx-auto mb-4" style={{ borderColor: '#1a1a2e', borderTopColor: '#2A9D8F', animation: 'spin 0.8s linear infinite' }} />
        <p className="text-sm text-[#9CA3AF]">Loading agent...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  if (error || !agent) return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg font-bold mb-2">Agent not found</p>
        <p className="text-sm text-[#9CA3AF] mb-6">The agent &quot;{agentId}&quot; doesn&apos;t exist in the registry.</p>
        <button onClick={() => router.push('/portal')} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
          ← Back to Portal
        </button>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <TenantProvider user={user}>
      <div className="min-h-screen bg-[#F4F5F7] text-white">
        {/* Top bar */}
        <div className="border-b border-[#E5E7EB] bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/portal')}
                className="text-xs text-[#9CA3AF] hover:text-[#1B2A4A] transition-all">
                ← Portal
              </button>
              <span className="text-gray-700">|</span>
              <span className="text-xl">{agent.icon}</span>
              <span className="text-sm font-semibold">{agent.display_name}</span>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-medium uppercase">{agent.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#6B7280]">{user.companyName || ''}</span>
              <span className="text-xs text-[#6B7280]">{user.name}</span>
              <button onClick={() => { localStorage.removeItem('woulfai_session'); router.push('/login') }}
                className="text-xs text-[#6B7280] hover:text-rose-400 transition-all">Sign Out</button>
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
