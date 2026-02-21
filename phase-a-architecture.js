#!/usr/bin/env node
/**
 * WoulfAI PHASE A — Four-Layer Architecture
 * Agent Registry + Click Tracking + Lead Capture + Demo Framework + Analytics
 *
 * Run from: ai-agent-platform root
 * Usage: node phase-a-architecture.js
 */
const fs = require('fs');
const path = require('path');
let installed = 0;

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
  installed++;
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║  PHASE A — Four-Layer Architecture                       ║');
console.log('  ║  Agent Registry · Click Tracking · Lead Capture · Demo   ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. AGENT REGISTRY — Single source of truth for all 11 agents
// ============================================================
console.log('  [1] Agent Registry:');

write('lib/agents.ts', `// Central registry for all 11 WoulfAI agents
// This is the SINGLE SOURCE OF TRUTH — landing page, demo, admin all read from here

export type AgentStatus = 'live' | 'dev' | 'beta'
export type FeatureStatus = 'done' | 'backlog' | 'debt'

export interface AgentFeature {
  name: string
  status: FeatureStatus
}

export interface Agent {
  slug: string
  name: string
  description: string
  icon: string
  status: AgentStatus
  completionPct: number
  category: 'finance' | 'sales' | 'operations' | 'compliance' | 'people'
  liveRoute: string | null
  demoRoute: string
  features: AgentFeature[]
  sortOrder: number
}

export const AGENTS: Agent[] = [
  {
    slug: 'cfo', name: 'CFO Agent', icon: '📈', status: 'live', completionPct: 92,
    description: 'Financial intelligence, invoices, collections, health monitoring, and refinance alerts',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/cfo', sortOrder: 1,
    features: [
      { name: 'Invoice CRUD + Line Item Editing', status: 'done' },
      { name: 'Audit Log with Odoo Write-back', status: 'done' },
      { name: 'AI Collections (4-tier strategy)', status: 'done' },
      { name: 'Financial Health Score', status: 'done' },
      { name: '90-Day Cashflow Forecast', status: 'done' },
      { name: 'Refinance Alert Monitor', status: 'done' },
      { name: 'PDF Invoice Export', status: 'backlog' },
      { name: 'Plaid Live Bank Feed', status: 'backlog' },
    ]
  },
  {
    slug: 'sales', name: 'Sales Agent', icon: '💼', status: 'live', completionPct: 90,
    description: 'CRM pipeline, behavioral profiling, battle cards, and deal intelligence',
    category: 'sales', liveRoute: '/admin/sales-reps', demoRoute: '/demo/sales', sortOrder: 2,
    features: [
      { name: 'Sales Rep Management', status: 'done' },
      { name: 'CRM Pipeline + Contacts', status: 'done' },
      { name: 'Behavioral Profiling (4 personas)', status: 'done' },
      { name: 'DO/DONT Battle Cards', status: 'done' },
      { name: 'Reality Potential Score', status: 'done' },
      { name: 'Multi-CRM Sync (HubSpot/SF/NetSuite)', status: 'done' },
      { name: 'AI Meeting Prep Generator', status: 'backlog' },
      { name: 'Deal Probability Forecasting', status: 'backlog' },
    ]
  },
  {
    slug: 'finops', name: 'FinOps Agent', icon: '💰', status: 'live', completionPct: 88,
    description: 'AP engine, debt management, labor tracking, forecasting, and business sandbox',
    category: 'finance', liveRoute: '/agents/cfo/finops', demoRoute: '/demo/finops', sortOrder: 3,
    features: [
      { name: 'AP Engine (19 categories)', status: 'done' },
      { name: 'Cash/Accrual Toggle', status: 'done' },
      { name: 'Debt + Equipment Ledger', status: 'done' },
      { name: 'Labor Tracking', status: 'done' },
      { name: '30/60/90 + 12/24mo Forecast', status: 'done' },
      { name: 'Business Idea Sandbox', status: 'done' },
      { name: 'Tax Reserve Automation', status: 'done' },
      { name: 'Vendor Scoring + Early Pay', status: 'done' },
      { name: 'Lending Packet Assembly', status: 'done' },
      { name: 'Anomaly Detection', status: 'done' },
      { name: 'PDF Lending Packet Export', status: 'backlog' },
    ]
  },
  {
    slug: 'payables', name: 'Payables Agent', icon: '🧾', status: 'live', completionPct: 85,
    description: 'Invoice capture, OCR extraction, payment execution, and bank reconciliation',
    category: 'finance', liveRoute: '/agents/cfo/payables', demoRoute: '/demo/payables', sortOrder: 4,
    features: [
      { name: 'Invoice Capture + OCR', status: 'done' },
      { name: 'Pending Review Queue', status: 'done' },
      { name: 'Payment Execution (4 methods)', status: 'done' },
      { name: 'Bank Reconciliation', status: 'done' },
      { name: 'Auto-Match Engine', status: 'done' },
      { name: 'Mobile Camera Capture', status: 'done' },
      { name: 'AI-Powered OCR (OpenAI)', status: 'debt' },
    ]
  },
  {
    slug: 'collections', name: 'Collections Agent', icon: '📬', status: 'live', completionPct: 80,
    description: 'AI-driven collection strategies with vendor reliability adjustment',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/collections', sortOrder: 5,
    features: [
      { name: '4-Tier Strategy Engine', status: 'done' },
      { name: 'Vendor Reliability Weighting', status: 'done' },
      { name: 'Email Template Generator', status: 'done' },
      { name: 'Early-Pay Discount Logic', status: 'done' },
      { name: 'Auto-Send Integration', status: 'backlog' },
      { name: 'Payment Plan Builder', status: 'backlog' },
    ]
  },
  {
    slug: 'hr', name: 'HR Agent', icon: '👥', status: 'dev', completionPct: 25,
    description: 'Employee onboarding, PTO tracking, performance reviews, and compliance',
    category: 'people', liveRoute: null, demoRoute: '/demo/hr', sortOrder: 6,
    features: [
      { name: 'Employee Directory', status: 'done' },
      { name: 'Onboarding Checklists', status: 'backlog' },
      { name: 'PTO Calendar + Approvals', status: 'backlog' },
      { name: 'Performance Review Cycles', status: 'backlog' },
      { name: 'Benefits Administration', status: 'backlog' },
    ]
  },
  {
    slug: 'operations', name: 'Operations Agent', icon: '⚙️', status: 'dev', completionPct: 30,
    description: 'Warehouse automation, equipment scheduling, and logistics optimization',
    category: 'operations', liveRoute: null, demoRoute: '/demo/operations', sortOrder: 7,
    features: [
      { name: 'Equipment Ledger', status: 'done' },
      { name: 'Project Allocation', status: 'done' },
      { name: 'WMS Integration', status: 'backlog' },
      { name: 'Route Optimization', status: 'backlog' },
      { name: 'Preventive Maintenance', status: 'backlog' },
    ]
  },
  {
    slug: 'legal', name: 'Legal Agent', icon: '⚖️', status: 'dev', completionPct: 20,
    description: 'Contract analysis, clause extraction, and compliance monitoring',
    category: 'compliance', liveRoute: null, demoRoute: '/demo/legal', sortOrder: 8,
    features: [
      { name: 'Contract Scanning (Trump Rule)', status: 'done' },
      { name: 'Payment Term Extraction', status: 'done' },
      { name: 'Auto-Clause Library', status: 'backlog' },
      { name: 'Risk Scoring', status: 'backlog' },
      { name: 'Compliance Calendar', status: 'backlog' },
    ]
  },
  {
    slug: 'marketing', name: 'Marketing Agent', icon: '📣', status: 'dev', completionPct: 15,
    description: 'Campaign management, content strategy, and marketing analytics',
    category: 'sales', liveRoute: null, demoRoute: '/demo/marketing', sortOrder: 9,
    features: [
      { name: 'Campaign Planner', status: 'backlog' },
      { name: 'Content Calendar', status: 'backlog' },
      { name: 'Email Builder', status: 'backlog' },
      { name: 'Analytics Dashboard', status: 'backlog' },
    ]
  },
  {
    slug: 'wms', name: 'WMS Agent', icon: '🏭', status: 'dev', completionPct: 10,
    description: 'Warehouse management, inventory control, and pick/pack/ship operations',
    category: 'operations', liveRoute: null, demoRoute: '/demo/wms', sortOrder: 10,
    features: [
      { name: 'Inventory Management', status: 'backlog' },
      { name: 'Inbound ASN Processing', status: 'backlog' },
      { name: 'Pick/Pack/Ship', status: 'backlog' },
      { name: 'Zone Configuration', status: 'backlog' },
    ]
  },
  {
    slug: 'compliance', name: 'Compliance Agent', icon: '🛡️', status: 'dev', completionPct: 10,
    description: 'Regulatory monitoring, audit preparation, and policy enforcement',
    category: 'compliance', liveRoute: null, demoRoute: '/demo/compliance', sortOrder: 11,
    features: [
      { name: 'Audit Trail Viewer', status: 'backlog' },
      { name: 'Policy Library', status: 'backlog' },
      { name: 'Regulatory Calendar', status: 'backlog' },
      { name: 'Risk Assessment', status: 'backlog' },
    ]
  },
]

export function getAgent(slug: string): Agent | undefined {
  return AGENTS.find(a => a.slug === slug)
}

export function getLiveAgents(): Agent[] {
  return AGENTS.filter(a => a.status === 'live')
}

export function getDevAgents(): Agent[] {
  return AGENTS.filter(a => a.status !== 'live')
}
`);

// ============================================================
// 2. CLICK TRACKING — Fire-and-forget client + API
// ============================================================
console.log('');
console.log('  [2] Click Tracking:');

write('lib/track.ts', `// Fire-and-forget click tracker — never blocks UI, never throws
export function trackClick(agentSlug: string, source: string) {
  try {
    fetch('/api/agents/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_slug: agentSlug,
        source,
        session_id: getSessionId(),
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  } catch {}
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = sessionStorage.getItem('woulfai_sid')
  if (!id) {
    id = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('woulfai_sid', id)
  }
  return id
}
`);

write('app/api/agents/click/route.ts', `import { NextRequest, NextResponse } from 'next/server';

// In-memory store (production: Supabase insert)
const clicks: any[] = [];
const rateLimiter = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_slug, source, session_id } = body;
    if (!agent_slug) return NextResponse.json({ error: 'Missing agent_slug' }, { status: 400 });

    // Rate limit: max 10 clicks per session per minute
    const key = session_id || 'anon';
    const now = Date.now();
    const recent = (rateLimiter.get(key) || []).filter(t => now - t < 60000);
    if (recent.length >= 10) return new NextResponse(null, { status: 204 });
    recent.push(now);
    rateLimiter.set(key, recent);

    clicks.push({
      id: 'click-' + Date.now(),
      agent_slug,
      source: source || 'unknown',
      session_id: session_id || null,
      user_agent: request.headers.get('user-agent')?.slice(0, 100) || null,
      created_at: new Date().toISOString(),
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

// Admin: get click analytics
export async function GET(request: NextRequest) {
  const email = request.headers.get('x-admin-email');
  const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
  if (!email || !ADMINS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const now = Date.now();
  const day = 86400000;
  const byAgent: Record<string, { total: number; last24h: number; last7d: number; uniqueSessions: Set<string> }> = {};

  for (const c of clicks) {
    if (!byAgent[c.agent_slug]) byAgent[c.agent_slug] = { total: 0, last24h: 0, last7d: 0, uniqueSessions: new Set() };
    const entry = byAgent[c.agent_slug];
    entry.total++;
    const age = now - new Date(c.created_at).getTime();
    if (age < day) entry.last24h++;
    if (age < 7 * day) entry.last7d++;
    if (c.session_id) entry.uniqueSessions.add(c.session_id);
  }

  const analytics = Object.entries(byAgent).map(([slug, data]) => ({
    agent_slug: slug,
    total_clicks: data.total,
    clicks_24h: data.last24h,
    clicks_7d: data.last7d,
    unique_sessions: data.uniqueSessions.size,
  })).sort((a, b) => b.total_clicks - a.total_clicks);

  return NextResponse.json({ analytics, totalClicks: clicks.length, since: clicks[0]?.created_at || null });
}
`);

// ============================================================
// 3. AGENT REGISTRY API
// ============================================================
console.log('');
console.log('  [3] Agent Registry API:');

write('app/api/agents/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { AGENTS, getAgent, getLiveAgents, getDevAgents } from '@/lib/agents';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const filter = searchParams.get('filter'); // 'live', 'dev', or null for all

  if (slug) {
    const agent = getAgent(slug);
    return agent ? NextResponse.json({ agent }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let agents = AGENTS;
  if (filter === 'live') agents = getLiveAgents();
  else if (filter === 'dev') agents = getDevAgents();

  return NextResponse.json({
    agents: agents.map(a => ({
      slug: a.slug, name: a.name, description: a.description, icon: a.icon,
      status: a.status, completionPct: a.completionPct, category: a.category,
      liveRoute: a.liveRoute, demoRoute: a.demoRoute,
      featuresDone: a.features.filter(f => f.status === 'done').length,
      featuresTotal: a.features.length,
    })),
    totalAgents: agents.length,
    liveCount: agents.filter(a => a.status === 'live').length,
    devCount: agents.filter(a => a.status !== 'live').length,
  });
}
`);

// ============================================================
// 4. LEAD CAPTURE API
// ============================================================
console.log('');
console.log('  [4] Lead Capture:');

write('app/api/leads/route.ts', `import { NextRequest, NextResponse } from 'next/server';

const leads: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, agent_slug, source } = body;

  if (!name || !email || !agent_slug) {
    return NextResponse.json({ error: 'Name, email, and agent_slug required' }, { status: 400 });
  }

  const lead = {
    id: 'lead-' + Date.now(),
    name, email, agent_slug,
    source: source || 'demo',
    status: 'new',
    created_at: new Date().toISOString(),
  };
  leads.push(lead);

  return NextResponse.json({
    success: true,
    message: "This agent is receiving a serious upgrade. We've saved your interest and will notify you when it's ready.",
    lead: { id: lead.id, agent_slug: lead.agent_slug },
  });
}

export async function GET(request: NextRequest) {
  const email = request.headers.get('x-admin-email');
  const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
  if (!email || !ADMINS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const byAgent: Record<string, number> = {};
  for (const l of leads) byAgent[l.agent_slug] = (byAgent[l.agent_slug] || 0) + 1;

  return NextResponse.json({ leads, totalLeads: leads.length, byAgent });
}
`);

// ============================================================
// 5. LEAD CAPTURE MODAL COMPONENT
// ============================================================
write('components/LeadCaptureModal.tsx', `'use client'
import { useState } from 'react'

interface Props {
  agentSlug: string
  agentName: string
  onClose: () => void
}

export default function LeadCaptureModal({ agentSlug, agentName, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!name || !email) return
    setLoading(true)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, agent_slug: agentSlug, source: 'demo' }),
    }).catch(() => {})
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="text-4xl">🚀</div>
            <h3 className="text-lg font-bold">You're On the List!</h3>
            <p className="text-sm text-gray-400">
              The <span className="text-blue-400 font-semibold">{agentName}</span> is receiving a serious upgrade.
              We've saved your interest and will notify you when it's ready.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium mt-4">
              Back to Demo
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1">Get Early Access</h3>
            <p className="text-sm text-gray-400 mb-5">
              Be first to know when the <span className="text-blue-400">{agentName}</span> launches.
            </p>
            <div className="space-y-3 mb-5">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={submit} disabled={loading || !name || !email}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-500 transition-colors">
                {loading ? 'Saving...' : 'Notify Me'}
              </button>
              <button onClick={onClose} className="px-4 py-3 text-gray-500 hover:text-white text-sm transition-colors">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
`);

// ============================================================
// 6. DEMO LAYOUT WRAPPER
// ============================================================
console.log('');
console.log('  [5] Demo Framework:');

write('app/demo/layout.tsx', `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const slug = pathname.split('/')[2] || ''

  return (
    <div className="min-h-screen bg-[#06080D] text-white">
      {/* Demo Mode Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Demo Mode</span>
          <span className="text-amber-400/60 text-xs">— Using sample data</span>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">← All Agents</Link>
          <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign Up for Live Access →</Link>
        </div>
      </div>
      {children}
    </div>
  )
}
`);

// Demo index page — shows available demo agents
write('app/demo/page.tsx', `'use client'
import Link from 'next/link'
import { AGENTS } from '@/lib/agents'
import { trackClick } from '@/lib/track'

export default function DemoIndex() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demo Environment</h1>
        <p className="text-sm text-gray-500 mt-1">Explore our AI agents with sample data — no sign-up required</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENTS.map(agent => (
          <Link key={agent.slug} href={agent.demoRoute}
            onClick={() => trackClick(agent.slug, 'demo-index')}
            className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-blue-500/20 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{agent.icon}</div>
              <div>
                <div className="text-sm font-semibold group-hover:text-blue-400">{agent.name}</div>
                <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + (agent.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                  {agent.status === 'live' ? 'LIVE' : 'IN DEVELOPMENT'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: agent.completionPct + '%' }} />
            </div>
            <div className="text-[10px] text-gray-600 mt-1">{agent.completionPct}% complete</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
`);

// Demo page for each agent — Layer 1 Dashboard
write('app/demo/[slug]/page.tsx', `'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { AGENTS, getAgent } from '@/lib/agents'
import { trackClick } from '@/lib/track'
import LeadCaptureModal from '@/components/LeadCaptureModal'
import Link from 'next/link'

// Mock KPI data for demo dashboards
const MOCK_KPIS: Record<string, { label: string; value: string; trend?: string }[]> = {
  cfo: [
    { label: 'Total AR', value: '$124,600', trend: '+12%' },
    { label: 'Overdue', value: '$77,700', trend: '-5%' },
    { label: 'Health Score', value: '65/100', trend: '+3' },
    { label: 'Cash Runway', value: '0.4 months', trend: '-0.1' },
  ],
  sales: [
    { label: 'Pipeline Value', value: '$485,000', trend: '+18%' },
    { label: 'Won Deals', value: '8', trend: '+2' },
    { label: 'Win Rate', value: '67%', trend: '+5%' },
    { label: 'Avg Deal Size', value: '$39,000', trend: '+$4K' },
  ],
  finops: [
    { label: 'Monthly Expenses', value: '$105,240', trend: '-3%' },
    { label: 'Total Debt', value: '$729,000', trend: '-$12K' },
    { label: 'Equipment Value', value: '$214,000', trend: '' },
    { label: 'Burn Rate', value: '$109,630/mo', trend: '' },
  ],
  payables: [
    { label: 'Pending Review', value: '2 invoices', trend: '' },
    { label: 'Unreconciled', value: '10 txns', trend: '' },
    { label: 'Monthly Outflow', value: '$105,240', trend: '' },
    { label: 'Payment Methods', value: '4 active', trend: '' },
  ],
  collections: [
    { label: 'Overdue Total', value: '$77,700', trend: '' },
    { label: 'Debtors', value: '3 accounts', trend: '' },
    { label: 'Gentle', value: '1', trend: '' },
    { label: 'Firm', value: '2', trend: '' },
  ],
}

const DEFAULT_KPIS = [
  { label: 'Features Built', value: '—' },
  { label: 'Completion', value: '—' },
  { label: 'Status', value: '—' },
  { label: 'Category', value: '—' },
]

export default function DemoAgentPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const agent = getAgent(slug)
  const [showLead, setShowLead] = useState(false)

  if (!agent) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">🤖</div>
      <div className="text-lg font-semibold">Agent not found</div>
      <Link href="/demo" className="text-blue-400 text-sm">← Back to all agents</Link>
    </div>
  )

  const kpis = MOCK_KPIS[slug] || DEFAULT_KPIS
  const doneFeat = agent.features.filter(f => f.status === 'done')
  const backlog = agent.features.filter(f => f.status !== 'done')

  const handleGetStarted = () => {
    trackClick(slug, 'demo-cta')
    if (agent.status === 'live' && agent.liveRoute) {
      router.push('/login')
    } else {
      setShowLead(true)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {showLead && <LeadCaptureModal agentSlug={slug} agentName={agent.name} onClose={() => setShowLead(false)} />}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{agent.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={"text-[10px] px-2 py-0.5 rounded font-semibold " + (agent.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                {agent.status === 'live' ? 'LIVE' : 'IN DEVELOPMENT'}
              </span>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 bg-white/5 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: agent.completionPct + '%' }} /></div>
                <span className="text-[10px] text-gray-500">{agent.completionPct}%</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleGetStarted}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
          {agent.status === 'live' ? 'Get Started →' : 'Order This Agent'}
        </button>
      </div>

      {/* KPI Cards — Layer 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{kpi.label}</div>
            <div className="text-xl font-mono font-bold mt-1">{kpi.value}</div>
            {kpi.trend && <div className="text-[10px] text-emerald-400 mt-1">{kpi.trend}</div>}
            <div className="text-[9px] text-amber-400/50 mt-1 italic">sample data</div>
          </div>
        ))}
      </div>

      {/* Features Built */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3">Completed Features ({doneFeat.length})</h3>
          {doneFeat.map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-xs border-b border-white/[0.03] last:border-0">
              <span className="text-emerald-400">✓</span><span className="text-gray-300">{f.name}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-400 mb-3">Backlog ({backlog.length})</h3>
          {backlog.map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-xs border-b border-white/[0.03] last:border-0">
              <span className="text-amber-400/50">{f.status === 'debt' ? '⚠' : '○'}</span>
              <span className="text-gray-500">{f.name}</span>
              {f.status === 'debt' && <span className="text-[9px] text-rose-400/50 ml-auto">tech debt</span>}
            </div>
          ))}
          {backlog.length === 0 && <div className="text-xs text-gray-600">All features complete!</div>}
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold mb-2">{agent.status === 'live' ? 'Ready to go live?' : 'Interested in this agent?'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          {agent.status === 'live'
            ? 'Sign up to connect your real business data and start using ' + agent.name + ' today.'
            : 'Leave your details and we\'ll notify you the moment ' + agent.name + ' is ready.'}
        </p>
        <button onClick={handleGetStarted}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          {agent.status === 'live' ? 'Sign Up Now' : 'Join the Waitlist'}
        </button>
      </div>
    </div>
  )
}
`);

// ============================================================
// 7. ADMIN ANALYTICS PAGE
// ============================================================
console.log('');
console.log('  [6] Admin Analytics:');

write('app/admin/analytics/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { AGENTS } from '@/lib/agents'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }

export default function AnalyticsPage() {
  const [clickData, setClickData] = useState<any[]>([])
  const [leadData, setLeadData] = useState<any>({ totalLeads: 0, byAgent: {} })
  const [loading, setLoading] = useState(true)
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [clicks, leads] = await Promise.all([
        fetch('/api/agents/click', { headers: { 'x-admin-email': getEmail() } }).then(r => r.json()).catch(() => ({ analytics: [] })),
        fetch('/api/leads', { headers: { 'x-admin-email': getEmail() } }).then(r => r.json()).catch(() => ({ totalLeads: 0, byAgent: {} })),
      ])
      setClickData(clicks.analytics || [])
      setLeadData(leads)
      setLoading(false)
    }
    load()
  }, [])

  const getClicks = (slug: string) => clickData.find(c => c.agent_slug === slug) || { total_clicks: 0, clicks_24h: 0, clicks_7d: 0, unique_sessions: 0 }
  const getLeads = (slug: string) => leadData.byAgent?.[slug] || 0

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Agent Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Click tracking, market interest, and build status for all 11 agents</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total Agents</div><div className="text-2xl font-mono font-bold mt-1">11</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Live</div><div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{AGENTS.filter(a => a.status === 'live').length}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total Clicks</div><div className="text-2xl font-mono font-bold text-blue-400 mt-1">{clickData.reduce((s, c) => s + c.total_clicks, 0)}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Leads Captured</div><div className="text-2xl font-mono font-bold text-amber-400 mt-1">{leadData.totalLeads}</div></div>
      </div>

      {/* Agent Table */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase border-b border-white/5">
              <th className="text-left p-4">Agent</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Progress</th>
              <th className="text-center p-4">Clicks</th>
              <th className="text-center p-4">24h</th>
              <th className="text-center p-4">7d</th>
              <th className="text-center p-4">Leads</th>
            </tr>
          </thead>
          <tbody>
            {AGENTS.map(agent => {
              const c = getClicks(agent.slug)
              const leads = getLeads(agent.slug)
              const isExpanded = expandedAgent === agent.slug
              return (
                <>
                  <tr key={agent.slug}
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.slug)}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{agent.icon}</span>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-[10px] text-gray-600">{agent.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={"text-[10px] px-2 py-0.5 rounded font-semibold " + (agent.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>
                        {agent.status === 'live' ? 'LIVE' : 'DEV'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 bg-white/5 rounded-full h-2"><div className={"h-2 rounded-full " + (agent.completionPct >= 80 ? 'bg-emerald-500' : agent.completionPct >= 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: agent.completionPct + '%' }} /></div>
                        <span className="text-xs font-mono text-gray-400 w-8">{agent.completionPct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono">{c.total_clicks}</td>
                    <td className="p-4 text-center font-mono text-xs text-gray-500">{c.clicks_24h}</td>
                    <td className="p-4 text-center font-mono text-xs text-gray-500">{c.clicks_7d}</td>
                    <td className="p-4 text-center font-mono">{leads > 0 ? <span className="text-amber-400">{leads}</span> : <span className="text-gray-600">0</span>}</td>
                  </tr>
                  {isExpanded && (
                    <tr key={agent.slug + '-detail'}>
                      <td colSpan={7} className="p-4 bg-white/[0.01]">
                        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <div>
                            <div className="text-xs font-semibold text-emerald-400 mb-2">Completed ({agent.features.filter(f => f.status === 'done').length})</div>
                            {agent.features.filter(f => f.status === 'done').map((f, i) => (
                              <div key={i} className="text-xs text-gray-400 py-0.5">✓ {f.name}</div>
                            ))}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-amber-400 mb-2">Backlog / Debt ({agent.features.filter(f => f.status !== 'done').length})</div>
                            {agent.features.filter(f => f.status !== 'done').map((f, i) => (
                              <div key={i} className="text-xs text-gray-600 py-0.5">
                                {f.status === 'debt' ? '⚠' : '○'} {f.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
`);

// ============================================================
// 8. SQL MIGRATION FOR NEW TABLES
// ============================================================
console.log('');
console.log('  [7] SQL Migration:');

write('supabase/migrations/006_four_layer_architecture.sql', `-- WoulfAI Four-Layer Architecture Tables
-- Run in Supabase SQL Editor

-- 1. Agent Registry
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  status TEXT NOT NULL DEFAULT 'dev' CHECK (status IN ('live', 'dev', 'beta')),
  completion_pct INTEGER DEFAULT 0 CHECK (completion_pct >= 0 AND completion_pct <= 100),
  category TEXT,
  live_route TEXT,
  demo_route TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed the 11 agents
INSERT INTO agents (slug, name, icon, status, completion_pct, category, live_route, demo_route, sort_order) VALUES
  ('cfo', 'CFO Agent', '📈', 'live', 92, 'finance', '/agents/cfo/console', '/demo/cfo', 1),
  ('sales', 'Sales Agent', '💼', 'live', 90, 'sales', '/admin/sales-reps', '/demo/sales', 2),
  ('finops', 'FinOps Agent', '💰', 'live', 88, 'finance', '/agents/cfo/finops', '/demo/finops', 3),
  ('payables', 'Payables Agent', '🧾', 'live', 85, 'finance', '/agents/cfo/payables', '/demo/payables', 4),
  ('collections', 'Collections Agent', '📬', 'live', 80, 'finance', '/agents/cfo/console', '/demo/collections', 5),
  ('hr', 'HR Agent', '👥', 'dev', 25, 'people', NULL, '/demo/hr', 6),
  ('operations', 'Operations Agent', '⚙️', 'dev', 30, 'operations', NULL, '/demo/operations', 7),
  ('legal', 'Legal Agent', '⚖️', 'dev', 20, 'compliance', NULL, '/demo/legal', 8),
  ('marketing', 'Marketing Agent', '📣', 'dev', 15, 'sales', NULL, '/demo/marketing', 9),
  ('wms', 'WMS Agent', '🏭', 'dev', 10, 'operations', NULL, '/demo/wms', 10),
  ('compliance', 'Compliance Agent', '🛡️', 'dev', 10, 'compliance', NULL, '/demo/compliance', 11)
ON CONFLICT (slug) DO UPDATE SET
  completion_pct = EXCLUDED.completion_pct,
  status = EXCLUDED.status,
  live_route = EXCLUDED.live_route;

-- 2. Click Tracking
CREATE TABLE IF NOT EXISTS agent_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  source TEXT NOT NULL DEFAULT 'unknown',
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_clicks_slug ON agent_clicks(agent_slug);
CREATE INDEX IF NOT EXISTS idx_agent_clicks_date ON agent_clicks(created_at);

-- 3. Lead Capture
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  source TEXT DEFAULT 'demo',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_agent ON leads(agent_slug);

-- 4. User-Agent Permissions (multi-tenant)
CREATE TABLE IF NOT EXISTS user_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  onboarded_at TIMESTAMPTZ DEFAULT now(),
  config JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, agent_slug)
);

ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own agents" ON user_agents
  FOR SELECT USING (user_id = auth.uid());

-- Done
SELECT 'Four-layer architecture tables created' as status;
`);

// ============================================================
// 9. ADD ANALYTICS TO SIDEBAR
// ============================================================
console.log('');
console.log('  [8] Sidebar Update:');

const layoutPath = path.join(process.cwd(), 'app/admin/layout.tsx');
if (fs.existsSync(layoutPath)) {
  let layout = fs.readFileSync(layoutPath, 'utf8');
  if (!layout.includes('/admin/analytics')) {
    // Add analytics link before bug-bash
    layout = layout.replace(
      "{ id: 'bug-bash'",
      "{ id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: '📊' },\n  { id: 'bug-bash'"
    );
    fs.writeFileSync(layoutPath, layout);
    console.log('  + Injected Analytics into sidebar');
  } else {
    console.log('  o Analytics already in sidebar');
  }
} else {
  console.log('  ! app/admin/layout.tsx not found');
}

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('  ═══════════════════════════════════════════');
console.log('  Installed: ' + installed + ' files');
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  Next steps:');
console.log('    1. Restart: Ctrl+C → npm run dev');
console.log('    2. Browse agents: http://localhost:3000/demo');
console.log('    3. Try a demo: http://localhost:3000/demo/cfo');
console.log('    4. Admin analytics: http://localhost:3000/admin/analytics');
console.log('    5. API check: curl -s http://localhost:3000/api/agents | head -c 200');
console.log('    6. Run SQL: paste 006_four_layer_architecture.sql in Supabase');
console.log('');
