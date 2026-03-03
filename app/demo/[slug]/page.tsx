'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const AGENTS: Record<string, { name: string; icon: string; color: string; dept: string; desc: string }> = {
  'cfo': { name: 'CFO', icon: '💰', color: '#2A9D8F', dept: 'Finance', desc: 'Financial intelligence, cash flow analysis, AR/AP management, and AI-powered recommendations.' },
  'collections': { name: 'Collections', icon: '💳', color: '#DC2626', dept: 'Finance', desc: 'Automated AR tracking, aging analysis, follow-up scheduling, and collection optimization.' },
  'finops': { name: 'FinOps', icon: '📊', color: '#7C3AED', dept: 'Finance', desc: 'Budget vs actual tracking, financial forecasting, cost optimization, and operational finance.' },
  'payables': { name: 'Payables', icon: '🧾', color: '#0891B2', dept: 'Finance', desc: 'Invoice processing, payment scheduling, vendor management, and early payment discounts.' },
  'sales': { name: 'Sales Data', icon: '📈', color: '#F59E0B', dept: 'Sales', desc: 'Pipeline analytics, deal tracking, revenue forecasting, and performance dashboards.' },
  'sales-intel': { name: 'Sales Intel', icon: '🔍', color: '#2563EB', dept: 'Sales', desc: 'Prospect research, intent signals, competitive intelligence, and lead scoring.' },
  'sales-coach': { name: 'Sales Coach', icon: '🏆', color: '#059669', dept: 'Sales', desc: 'Rep performance, coaching plans, quota analysis, and skills development.' },
  'marketing': { name: 'Marketing', icon: '📣', color: '#DB2777', dept: 'Sales', desc: 'Campaign analytics, lead generation, content performance, and marketing ROI.' },
  'seo': { name: 'SEO', icon: '🔎', color: '#0D9488', dept: 'Sales', desc: 'Keyword rankings, organic traffic, technical SEO audits, and content optimization.' },
  'warehouse': { name: 'Warehouse', icon: '🏭', color: '#EA580C', dept: 'Operations', desc: 'Inventory management, order fulfillment, zone optimization, and warehouse KPIs.' },
  'supply-chain': { name: 'Supply Chain', icon: '🔗', color: '#7C3AED', dept: 'Operations', desc: 'Vendor performance, logistics tracking, lead times, and supply risk management.' },
  'wms': { name: 'WMS', icon: '📦', color: '#EA580C', dept: 'Operations', desc: 'Pick accuracy, orders per hour, space utilization, and operations optimization.' },
  'operations': { name: 'Operations', icon: '⚙', color: '#4F46E5', dept: 'Operations', desc: 'Project management, resource allocation, equipment uptime, and efficiency tracking.' },
  'hr': { name: 'HR', icon: '👥', color: '#9333EA', dept: 'People', desc: 'Hiring pipeline, retention analytics, employee satisfaction, and workforce planning.' },
  'support': { name: 'Support', icon: '🎧', color: '#0EA5E9', dept: 'People', desc: 'Ticket management, response times, CSAT scoring, and support optimization.' },
  'training': { name: 'Training', icon: '🎓', color: '#8B5CF6', dept: 'People', desc: 'Course management, compliance tracking, skill assessments, and learning analytics.' },
  'legal': { name: 'Legal', icon: '⚖', color: '#374151', dept: 'Legal', desc: 'Contract management, risk assessment, compliance monitoring, and legal automation.' },
  'compliance': { name: 'Compliance', icon: '🛡', color: '#0F766E', dept: 'Legal', desc: 'Regulatory tracking, audit preparation, policy management, and risk scoring.' },
  'research': { name: 'Research', icon: '🔬', color: '#6366F1', dept: 'Strategy', desc: 'Market analysis, competitive landscape, industry trends, and strategic insights.' },
  'org-lead': { name: 'Org Lead', icon: '🧭', color: '#B45309', dept: 'Strategy', desc: 'OKR tracking, team health, initiative management, and decision velocity.' },
  'str': { name: 'STR Analyst', icon: '🏠', color: '#BE185D', dept: 'Strategy', desc: 'Short-term rental analytics, occupancy optimization, and portfolio performance.' },
  'video-editor': { name: 'Video Editor', icon: '🎬', color: '#7C3AED', dept: 'Operations', desc: 'Upload videos and get AI-edited quote clips, marketing power clips, or professionally cleaned footage.' },
};

interface KPI { label: string; value: string | number; change?: string; trend?: string; icon?: string; }
interface Rec { priority: string; title: string; description: string; impact?: string; }

export default function DemoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const agent = AGENTS[slug];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/agents/${slug}?view=${tab}`)
      .then(r => r.json())
      .then(d => { setData(d.data || d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug, tab]);

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">404</p>
          <p className="text-gray-500 mb-4">Agent not found</p>
          <Link href="/" className="text-sm font-bold px-6 py-2.5 rounded-xl text-white" style={{ background: '#F5920B' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const kpis: KPI[] = data?.kpis || [
    { label: 'Primary Metric', value: '—', icon: agent.icon },
    { label: 'Secondary Metric', value: '—' },
    { label: 'Trend', value: '—' },
    { label: 'Score', value: '—' },
  ];

  const tableData = data?.tableData || data?.aging || data?.deals || data?.tickets || data?.contracts || [];
  const recommendations: Rec[] = data?.recommendations || [];

  const pColors: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: 'rgba(239,68,68,0.08)', text: '#DC2626', border: 'rgba(239,68,68,0.2)' },
    medium: { bg: 'rgba(245,146,11,0.08)', text: '#F5920B', border: 'rgba(245,146,11,0.2)' },
    low: { bg: 'rgba(42,157,143,0.08)', text: '#2A9D8F', border: 'rgba(42,157,143,0.2)' },
  };

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="WoulfAI" width={32} height={32} />
            <span className="text-lg font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Woulf<span style={{ color: '#F5920B' }}>AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/solutions" className="text-sm text-gray-400 hover:text-white">Solutions</Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white">Pricing</Link>
            <Link href="/case-studies" className="text-sm text-gray-400 hover:text-white">Case Studies</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-2">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl" style={{ background: '#F5920B' }}>Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Demo Banner */}
      <div className="text-center py-2" style={{ background: `${agent.color}12`, borderBottom: `1px solid ${agent.color}25` }}>
        <p className="text-xs font-medium" style={{ color: agent.color }}>
          Demo Mode — Showing sample data. <Link href="/register" className="underline font-bold">Sign up for live data</Link>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{agent.icon}</span>
              <div>
                <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>{agent.name} AI Employee</h1>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{agent.dept} Department</p>
              </div>
            </div>
            <p className="text-sm mt-2 max-w-xl" style={{ color: '#6B7280' }}>{agent.desc}</p>
          </div>
          <Link href="/register" className="text-sm font-bold text-white px-6 py-3 rounded-xl self-start" style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
            Hire This Employee
          </Link>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.slice(0, 4).map((kpi, i) => (
              <div key={i} className="p-4 rounded-xl border bg-white" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                  {kpi.icon && <span className="mr-1">{kpi.icon}</span>}{kpi.label}
                </p>
                <p className="text-2xl font-extrabold mt-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>{kpi.value}</p>
                {kpi.change && (
                  <p className="text-xs mt-1 font-medium" style={{ color: kpi.trend === 'up' ? '#2A9D8F' : kpi.trend === 'down' ? '#DC2626' : '#9CA3AF' }}>
                    {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} {kpi.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        {tableData.length > 0 && (
          <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: '#E5E7EB' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>Live Data Preview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {Object.keys(tableData[0]).slice(0, 5).map(k => (
                      <th key={k} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>
                        {k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(0, 6).map((row: any, i: number) => (
                    <tr key={i} className="border-t hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                      {Object.keys(row).slice(0, 5).map(k => (
                        <td key={k} className="px-4 py-3" style={{ color: '#4B5563' }}>
                          {typeof row[k] === 'number' ? row[k].toLocaleString() : String(row[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-xl border p-5 bg-white" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#1B2A4A' }}>
              🤖 AI Recommendations
            </h3>
            <div className="space-y-3">
              {recommendations.map((r, i) => {
                const pc = pColors[r.priority] || pColors.medium;
                return (
                  <div key={i} className="p-3 rounded-lg border" style={{ background: pc.bg, borderColor: pc.border }}>
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-0.5" style={{ background: pc.border, color: pc.text }}>{r.priority}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{r.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{r.description}</p>
                        {r.impact && <p className="text-xs mt-1 font-medium" style={{ color: pc.text }}>Impact: {r.impact}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: '#1B2A4A' }}>
          <h2 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Ready to put {agent.name} to work?
          </h2>
          <p className="text-white/60 text-sm mb-6">Start your 14-day free trial. No credit card required.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="text-sm font-bold text-white px-8 py-3 rounded-xl" style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
              Start Free Trial
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-white/60 hover:text-white px-4 py-3">
              View Pricing
            </Link>
          </div>
        </div>

        {/* Other Agents */}
        <div>
          <h3 className="text-sm font-bold mb-4" style={{ color: '#1B2A4A' }}>Explore Other AI Employees</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AGENTS).filter(([s]) => s !== slug).slice(0, 8).map(([s, a]) => (
              <Link key={s} href={`/demo/${s}`} className="text-xs px-3 py-1.5 rounded-lg border hover:border-orange-300 transition-colors" style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>
                {a.icon} {a.name}
              </Link>
            ))}
            <Link href="/#agents" className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ color: '#F5920B' }}>
              View all 21 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
