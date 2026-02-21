/**
 * ============================================================
 *  WoulfAI — FINAL ASSEMBLY
 * ============================================================
 *  "Master Assembly" script that unifies the platform:
 *
 *  1. Persistent Sidebar — PlatformShell wraps all /agents, /admin, /portal routes
 *  2. Dynamic Agent Counter — reads LIVE agents from registry, no hardcoded "10"
 *  3. Customer Portal in sidebar — links to 3PL portal
 *  4. Demo routes rewritten — mirror live agent data instead of hardcoded pages
 *  5. TenantProvider hardened — auto-selects company, graceful fallback
 *  6. Tenant context bridge — compatible with all legacy imports
 *
 *  Run:
 *    cd /c/Users/steve/Desktop/ai-ecosystem/ai-agent-platform
 *    node final-assembly.js
 *    npm run build
 *    vercel --prod
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
let created = 0;

// ============================================================
// HELPERS
// ============================================================
function write(filePath, content) {
  const fullPath = path.join(ROOT, filePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(fullPath)) {
    const backupDir = path.join(ROOT, '.backups', 'final-assembly');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, filePath.replace(/\//g, '__'));
    fs.copyFileSync(fullPath, backupPath);
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  created++;
  console.log('  \u2713 ' + filePath);
}

function exists(filePath) {
  return fs.existsSync(path.join(ROOT, filePath));
}

// ============================================================
// BANNER
// ============================================================
console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 FINAL ASSEMBLY                       \u2551');
console.log('  \u2551  Persistent Nav \u00B7 Dynamic Counts \u00B7 Unified       \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

if (!exists('package.json')) {
  console.error('  \u2717 No package.json found. Run this from your project root.');
  process.exit(1);
}

const APP_PREFIX = exists('src/app') ? 'src/' : '';
console.log('  \u2192 App directory: ' + APP_PREFIX + 'app/');
console.log('');

// ============================================================
// FILE 1: PlatformShell
// ============================================================
console.log('  [1/10] Platform Shell (persistent sidebar wrapper)');

write(APP_PREFIX + 'components/layout/PlatformShell.tsx', [
  "'use client';",
  "import React from 'react';",
  "import SidebarNav from '@/components/dashboard/sidebar-nav';",
  "",
  "export default function PlatformShell({ children }: { children: React.ReactNode }) {",
  "  return (",
  "    <div className=\"flex min-h-screen bg-[#060910]\">",
  "      <SidebarNav />",
  "      <main className=\"flex-1 overflow-y-auto\">",
  "        {children}",
  "      </main>",
  "    </div>",
  "  );",
  "}",
].join('\n'));

// ============================================================
// FILE 2: Enhanced Sidebar Navigation
// ============================================================
console.log('  [2/10] Enhanced Sidebar Navigation');

write(APP_PREFIX + 'components/dashboard/sidebar-nav.tsx', [
  "'use client';",
  "import React, { useState } from 'react';",
  "import Link from 'next/link';",
  "import { usePathname } from 'next/navigation';",
  "import { useTenant } from '@/lib/providers/tenant-provider';",
  "import { AGENTS, CATEGORY_LABELS, CATEGORY_ORDER, type AgentCategory } from '@/lib/agents/agent-registry';",
  "",
  "// Dynamic counts",
  "const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');",
  "const LIVE_COUNT = LIVE_AGENTS.length;",
  "",
  "export default function SidebarNav() {",
  "  const pathname = usePathname();",
  "  const { currentCompany, companies, switchCompany, isLoading } = useTenant();",
  "  const [switcherOpen, setSwitcherOpen] = useState(false);",
  "  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});",
  "",
  "  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {",
  "    const agents = AGENTS.filter(a => a.category === cat && a.status === 'live');",
  "    if (agents.length > 0) acc[cat] = agents;",
  "    return acc;",
  "  }, {} as Record<AgentCategory, typeof AGENTS>);",
  "",
  "  const toggleCat = (cat: string) => setCollapsed(p => ({ ...p, [cat]: !p[cat] }));",
  "",
  "  return (",
  "    <aside className=\"w-64 bg-[#0A0E15] border-r border-white/5 text-gray-100 min-h-screen flex flex-col flex-shrink-0\">",
  "      {/* Logo */}",
  "      <div className=\"px-4 py-5 border-b border-white/5\">",
  "        <Link href=\"/\" className=\"text-xl font-bold text-white tracking-tight\">",
  "          Woulf<span className=\"text-blue-400\">AI</span>",
  "        </Link>",
  "        <div className=\"text-[10px] text-gray-500 mt-1\">{LIVE_COUNT} Live Agents</div>",
  "      </div>",
  "",
  "      {/* Business Switcher */}",
  "      <div className=\"px-3 py-3 border-b border-white/5 relative\">",
  "        <button onClick={() => setSwitcherOpen(!switcherOpen)} className=\"w-full flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-sm\">",
  "          <span className=\"truncate\">{isLoading ? 'Loading...' : currentCompany?.name || 'Select Company'}</span>",
  "          <svg className={`w-4 h-4 flex-shrink-0 ml-2 transition ${switcherOpen ? 'rotate-180' : ''}`} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">",
  "            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 9l-7 7-7-7\" />",
  "          </svg>",
  "        </button>",
  "        {switcherOpen && companies.length > 0 && (",
  "          <div className=\"absolute left-3 right-3 top-full mt-1 bg-[#111827] rounded-lg shadow-xl border border-white/10 z-50 max-h-60 overflow-y-auto\">",
  "            {companies.map((c) => (",
  "              <button key={c.id} onClick={() => { switchCompany(c.id); setSwitcherOpen(false); }} className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition ${c.id === currentCompany?.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'}`}>",
  "                {c.name}",
  "              </button>",
  "            ))}",
  "          </div>",
  "        )}",
  "      </div>",
  "",
  "      {/* Quick Links */}",
  "      <div className=\"px-3 py-3 border-b border-white/5 space-y-1\">",
  "        {[",
  "          { href: '/portal', icon: '\uD83D\uDCCB', label: 'Customer Portal' },",
  "          { href: '/onboarding', icon: '\uD83D\uDE80', label: 'Onboarding' },",
  "        ].map(link => (",
  "          <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${pathname?.startsWith(link.href) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>",
  "            <span className=\"text-lg\">{link.icon}</span><span>{link.label}</span>",
  "          </Link>",
  "        ))}",
  "      </div>",
  "",
  "      {/* Agent Navigation */}",
  "      <nav className=\"flex-1 overflow-y-auto px-3 py-4 space-y-4\">",
  "        {Object.entries(grouped).map(([cat, agents]) => (",
  "          <div key={cat}>",
  "            <button onClick={() => toggleCat(cat)} className=\"w-full flex items-center justify-between px-3 mb-1\">",
  "              <h3 className=\"text-[10px] font-semibold text-gray-500 uppercase tracking-wider\">{CATEGORY_LABELS[cat as AgentCategory]} ({agents.length})</h3>",
  "              <svg className={`w-3 h-3 text-gray-600 transition ${collapsed[cat] ? '-rotate-90' : ''}`} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">",
  "                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 9l-7 7-7-7\" />",
  "              </svg>",
  "            </button>",
  "            {!collapsed[cat] && (",
  "              <ul className=\"space-y-0.5\">",
  "                {agents.map((agent) => {",
  "                  const active = pathname?.startsWith(agent.liveRoute);",
  "                  return (",
  "                    <li key={agent.slug}>",
  "                      <Link href={agent.liveRoute} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>",
  "                        <span className=\"text-base\">{agent.icon}</span>",
  "                        <span className=\"truncate text-xs\">{agent.name}</span>",
  "                      </Link>",
  "                    </li>",
  "                  );",
  "                })}",
  "              </ul>",
  "            )}",
  "          </div>",
  "        ))}",
  "      </nav>",
  "",
  "      {/* Bottom Links */}",
  "      <div className=\"px-3 py-3 border-t border-white/5 space-y-1\">",
  "        {[",
  "          { href: '/admin', icon: '\u26A1', label: 'Admin Dashboard' },",
  "          { href: '/demo', icon: '\uD83C\uDFAE', label: 'Demo Hub' },",
  "        ].map(link => (",
  "          <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${pathname?.startsWith(link.href) ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>",
  "            <span className=\"text-lg\">{link.icon}</span><span>{link.label}</span>",
  "          </Link>",
  "        ))}",
  "      </div>",
  "    </aside>",
  "  );",
  "}",
].join('\n'));

// ============================================================
// FILE 3-6: Layout files for persistent sidebar
// ============================================================
console.log('  [3/10] Agents layout');
write(APP_PREFIX + 'app/agents/layout.tsx', [
  "import PlatformShell from '@/components/layout/PlatformShell';",
  "export default function AgentsLayout({ children }: { children: React.ReactNode }) {",
  "  return <PlatformShell>{children}</PlatformShell>;",
  "}",
].join('\n'));

console.log('  [4/10] Admin layout');
write(APP_PREFIX + 'app/admin/layout.tsx', [
  "import PlatformShell from '@/components/layout/PlatformShell';",
  "export default function AdminLayout({ children }: { children: React.ReactNode }) {",
  "  return <PlatformShell>{children}</PlatformShell>;",
  "}",
].join('\n'));

console.log('  [5/10] Portal layout');
write(APP_PREFIX + 'app/portal/layout.tsx', [
  "import PlatformShell from '@/components/layout/PlatformShell';",
  "export default function PortalLayout({ children }: { children: React.ReactNode }) {",
  "  return <PlatformShell>{children}</PlatformShell>;",
  "}",
].join('\n'));

console.log('  [6/10] Demo layout');
write(APP_PREFIX + 'app/demo/layout.tsx', [
  "import PlatformShell from '@/components/layout/PlatformShell';",
  "export default function DemoLayout({ children }: { children: React.ReactNode }) {",
  "  return <PlatformShell>{children}</PlatformShell>;",
  "}",
].join('\n'));

// ============================================================
// FILE 7: Dynamic Demo [slug] page
// ============================================================
console.log('  [7/10] Dynamic Demo [slug] page');

write(APP_PREFIX + 'app/demo/[slug]/page.tsx', `'use client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';

const DEMO_KPIS: Record<string, { label: string; value: string; trend?: string }[]> = {
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
  'org-lead': [
    { label: 'Total Revenue', value: '$1.2M', trend: '+8%' },
    { label: 'Active Employees', value: '34', trend: '+2' },
    { label: 'Open Projects', value: '12' },
    { label: 'Efficiency', value: '87%', trend: '+3%' },
  ],
  seo: [
    { label: 'Domain Authority', value: '42', trend: '+3' },
    { label: 'Keywords Tracked', value: '156', trend: '+24' },
    { label: 'Organic Traffic', value: '4,200/mo', trend: '+15%' },
    { label: 'Backlinks', value: '312', trend: '+18' },
  ],
  marketing: [
    { label: 'Active Campaigns', value: '6', trend: '+1' },
    { label: 'Total Reach', value: '45K', trend: '+22%' },
    { label: 'Leads Generated', value: '89', trend: '+14' },
    { label: 'Conv. Rate', value: '3.2%', trend: '+0.4%' },
  ],
  wms: [
    { label: 'Total SKUs', value: '1,247', trend: '+52' },
    { label: 'Low Stock', value: '8 items', trend: '-2' },
    { label: 'Inbound ASNs', value: '3 pending' },
    { label: 'Accuracy', value: '99.2%', trend: '+0.1%' },
  ],
  hr: [
    { label: 'Headcount', value: '34', trend: '+2' },
    { label: 'Open Positions', value: '5' },
    { label: 'PTO Utilization', value: '72%', trend: '+5%' },
    { label: 'Compliance', value: '96%', trend: '+1%' },
  ],
  finops: [
    { label: 'Monthly Expenses', value: '$105,240', trend: '-3%' },
    { label: 'Total Debt', value: '$729,000', trend: '-$12K' },
    { label: 'Equipment Value', value: '$214,000' },
    { label: 'Burn Rate', value: '$109,630/mo' },
  ],
  payables: [
    { label: 'Pending Review', value: '2 invoices' },
    { label: 'Unreconciled', value: '10 txns' },
    { label: 'Monthly Outflow', value: '$105,240' },
    { label: 'Payment Methods', value: '4 active' },
  ],
  collections: [
    { label: 'Overdue Total', value: '$77,700' },
    { label: 'Debtors', value: '3 accounts' },
    { label: 'Gentle Stage', value: '1' },
    { label: 'Firm Stage', value: '2' },
  ],
  operations: [
    { label: 'Active Projects', value: '8', trend: '+1' },
    { label: 'On-Time Rate', value: '91%', trend: '+2%' },
    { label: 'Crew Members', value: '24' },
    { label: 'Budget Variance', value: '-2.1%' },
  ],
  legal: [
    { label: 'Active Contracts', value: '23', trend: '+3' },
    { label: 'Pending Review', value: '4', trend: '-1' },
    { label: 'Risk Score', value: 'Low' },
    { label: 'Compliance', value: '98%', trend: '+1%' },
  ],
  compliance: [
    { label: 'Policies Active', value: '18' },
    { label: 'Audits Due', value: '2' },
    { label: 'Violations', value: '0' },
    { label: 'Score', value: '97/100', trend: '+2' },
  ],
  'supply-chain': [
    { label: 'Active Vendors', value: '42', trend: '+3' },
    { label: 'Pending Orders', value: '7' },
    { label: 'Avg Lead Time', value: '6.2 days', trend: '-0.4' },
    { label: 'Cost Savings', value: '$12,400', trend: '+$2.1K' },
  ],
};

export default function DemoAgentPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const agent = AGENTS.find(a => a.slug === slug);

  if (!agent) return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <div className="text-4xl">\\u{1F916}</div>
      <div className="text-lg font-semibold">Agent not found</div>
      <Link href="/demo" className="text-blue-400 text-sm">\\u2190 Back to all agents</Link>
    </div>
  );

  const kpis = DEMO_KPIS[slug] || [
    { label: 'Status', value: agent.status.toUpperCase() },
    { label: 'Completion', value: agent.completionPct + '%' },
    { label: 'Category', value: agent.category },
    { label: 'Features', value: String(agent.features.length) },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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
        <button onClick={() => agent.status === 'live' ? router.push(agent.liveRoute) : router.push('/onboarding?agent=' + agent.slug)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
          {agent.status === 'live' ? 'Go to Live Agent \\u2192' : 'Start Onboarding'}
        </button>
      </div>

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

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-emerald-400 mb-3">Features ({agent.features.length})</h3>
        <div className="grid grid-cols-2 gap-2">
          {agent.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 text-xs">
              <span className="text-emerald-400">\\u2713</span>
              <span className="text-gray-300">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold mb-2">{agent.status === 'live' ? 'Ready to go live?' : 'Interested in this agent?'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          {agent.status === 'live' ? 'Connect your real business data and start using ' + agent.name + ' today.' : 'Start onboarding to get ' + agent.name + ' set up for your organization.'}
        </p>
        <button onClick={() => agent.status === 'live' ? router.push(agent.liveRoute) : router.push('/onboarding?agent=' + agent.slug)} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          {agent.status === 'live' ? 'Go to Live Agent' : 'Start Onboarding'}
        </button>
      </div>
    </div>
  );
}
`);

// ============================================================
// FILE 8: Demo Hub — dynamic agent grid
// ============================================================
console.log('  [8/10] Demo Hub (dynamic grid)');

write(APP_PREFIX + 'app/demo/page.tsx', `'use client';
import Link from 'next/link';
import { AGENTS, CATEGORY_LABELS, CATEGORY_ORDER, type AgentCategory } from '@/lib/agents/agent-registry';

const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');

export default function DemoHub() {
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const agents = LIVE_AGENTS.filter(a => a.category === cat);
    if (agents.length > 0) acc[cat] = agents;
    return acc;
  }, {} as Record<AgentCategory, typeof LIVE_AGENTS>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Demo Hub</h1>
        <p className="text-gray-400 mt-1">Preview all {LIVE_AGENTS.length} live agents with sample data. Each demo mirrors the production agent.</p>
      </div>
      {Object.entries(grouped).map(([cat, agents]) => (
        <div key={cat}>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{CATEGORY_LABELS[cat as AgentCategory]} ({agents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Link key={agent.slug} href={'/demo/' + agent.slug} className="group bg-[#0A0E15] border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <div className="font-semibold text-white group-hover:text-blue-400 transition">{agent.name}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">{agent.completionPct}% Complete</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/5 rounded-full h-1"><div className="bg-blue-500 h-1 rounded-full" style={{ width: agent.completionPct + '%' }} /></div>
                  <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition">Preview \\u2192</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
`);

// ============================================================
// FILE 9: Hardened TenantProvider
// ============================================================
console.log('  [9/10] Hardened TenantProvider');

write(APP_PREFIX + 'lib/providers/tenant-provider.tsx', `'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export interface Company {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  odoo_url?: string;
  odoo_db?: string;
  hubspot_api_key?: string;
}

export interface TenantContextType {
  companyId: string | null;
  currentCompany: Company | null;
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  switchCompany: (id: string) => void;
}

const TenantContext = createContext<TenantContextType>({
  companyId: null,
  currentCompany: null,
  companies: [],
  isLoading: true,
  error: null,
  switchCompany: () => {},
});

export function useTenant() {
  return useContext(TenantContext);
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=' + encodeURIComponent(value) + ';path=/;max-age=' + (days * 86400) + ';SameSite=Lax';
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/tenant/companies');
        if (!res.ok) {
          console.warn('TenantProvider: companies API returned ' + res.status);
          if (mounted) { setError('Could not load companies'); setIsLoading(false); }
          return;
        }
        const data = await res.json();
        const list: Company[] = data.companies || data || [];
        if (!mounted) return;
        setCompanies(list);

        const savedId = getCookie('woulfai-company');
        const saved = list.find(c => c.id === savedId);
        if (saved) {
          setCompanyId(savedId);
        } else if (list.length > 0) {
          setCompanyId(list[0].id);
          setCookie('woulfai-company', list[0].id);
        }
        setIsLoading(false);
      } catch (err) {
        console.warn('TenantProvider: network error', err);
        if (mounted) { setError('Network error'); setIsLoading(false); }
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const switchCompany = useCallback((id: string) => {
    setCompanyId(id);
    setCookie('woulfai-company', id);
    fetch('/api/tenant/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: id }),
    }).catch(() => {});
  }, []);

  const currentCompany = companies.find(c => c.id === companyId) || null;

  return (
    <TenantContext.Provider value={{ companyId, currentCompany, companies, isLoading, error, switchCompany }}>
      {children}
    </TenantContext.Provider>
  );
}

export default TenantProvider;
export type Props = { children: ReactNode };
`);

// ============================================================
// FILE 10: Tenant context bridge
// ============================================================
console.log('  [10/10] Tenant context bridge');

write(APP_PREFIX + 'lib/tenant-context.ts', `'use client';
import { useTenant as useRealTenant } from '@/lib/providers/tenant-provider';
import { TenantProvider as RealProvider } from '@/lib/providers/tenant-provider';
import React, { type ReactNode } from 'react';

export function TenantProvider({ children, user }: { children: ReactNode; user?: any }) {
  return React.createElement(RealProvider, null, children);
}

export function useTenant() {
  const ctx = useRealTenant();
  return {
    ...ctx,
    companyId: ctx.companyId || '',
    companyName: ctx.currentCompany?.name || '',
    userName: '',
    isGlobalAdmin: true,
  };
}
`);

// ============================================================
// SUMMARY
// ============================================================
console.log('');
console.log('  ======================================================');
console.log('  \u2713 Created/Updated ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  What changed:');
console.log('    1. PlatformShell \u2192 persistent sidebar on /agents, /admin, /portal, /demo');
console.log('    2. SidebarNav \u2192 dynamic agent count, Customer Portal link, collapsible categories');
console.log('    3. Demo Hub + Demo [slug] \u2192 reads from agent-registry (no more hardcoded demos)');
console.log('    4. TenantProvider \u2192 auto-selects first company, graceful error handling');
console.log('    5. Tenant context bridge \u2192 compatible with all legacy imports');
console.log('');
console.log('  Next steps:');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
console.log('  Backups saved to: .backups/final-assembly/');
console.log('');
