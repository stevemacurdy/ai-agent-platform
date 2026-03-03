'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { AgentDemoData, DemoRecommendation } from '@/lib/demo-registry';
import KpiCard from './KpiCard';
import DemoTable from './DemoTable';
import DemoChartComponent from './DemoChart';
import ActionModal from './ActionModal';
import DemoRecommendations from './DemoRecommendations';

interface DemoShellProps {
  data: AgentDemoData;
  allSlugs: { slug: string; name: string; icon: string }[];
}

export default function DemoShell({ data, allSlugs }: DemoShellProps) {
  const { meta, tabs } = data;
  const [activeTab, setActiveTab] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState({ label: '', description: '' });
  const [showSlideIn, setShowSlideIn] = useState(false);
  const [slideInDismissed, setSlideInDismissed] = useState(false);

  const tab = tabs[activeTab];

  // Tab switch with fade
  const switchTab = (i: number) => {
    if (i === activeTab) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveTab(i);
      setTransitioning(false);
    }, 200);
  };

  // Timed slide-in after 30s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!slideInDismissed) setShowSlideIn(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [slideInDismissed]);

  const openModal = (label: string, description: string) => {
    setModalAction({ label, description });
    setModalOpen(true);
  };

  const handleRecAction = (rec: DemoRecommendation) => {
    openModal(rec.action || 'Take Action', rec.description);
  };

  const handleRowAction = () => {
    openModal('Take Action', 'View full details and take action on this item.');
  };

  const otherAgents = allSlugs.filter(a => a.slug !== meta.slug).slice(0, 8);

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
            <Link href="/solutions" className="text-sm text-gray-400 hover:text-white transition-colors">Solutions</Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors">Case Studies</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90" style={{ background: '#F5920B' }}>Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Demo Mode Banner */}
      <div className="text-center py-2" style={{ background: meta.deptColor + '12', borderBottom: '1px solid ' + meta.deptColor + '25' }}>
        <p className="text-xs font-medium" style={{ color: meta.deptColor }}>
          Demo Mode — Showing sample data.{' '}
          <Link href="/register" className="underline font-bold">Sign up for live data</Link>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{meta.icon}</span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                    {meta.name} AI Employee
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: meta.deptColor }}>
                    {meta.dept}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{meta.valueProposition}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => openModal('Hire This Employee', meta.valueProposition)}
            className="text-sm font-bold text-white px-6 py-3 rounded-xl self-start transition-opacity hover:opacity-90"
            style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}
          >
            Hire This Employee
          </button>
        </div>

        {/* Timestamp + Alerts */}
        <div className="flex items-center gap-4 text-xs" style={{ color: '#9CA3AF' }}>
          <span>Last updated: 2 minutes ago</span>
          <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ background: '#DC2626' }}>
            3 new alerts
          </span>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: '#E5E7EB' }}>
          {tabs.map((t, i) => (
            <button
              key={t.id}
              onClick={() => switchTab(i)}
              className={"px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 " + (activeTab === i ? "font-bold" : "border-transparent hover:text-gray-600")}
              style={activeTab === i ? { color: meta.deptColor, borderColor: meta.deptColor } : { color: '#9CA3AF' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={"space-y-6 transition-opacity duration-200 " + (transitioning ? "opacity-0" : "opacity-100")}>
          {/* Shimmer skeleton during transition */}
          {transitioning ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
              <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tab.kpis.map((kpi, i) => (
                  <KpiCard key={tab.id + '-kpi-' + i} kpi={kpi} accentColor={meta.deptColor} />
                ))}
              </div>

              {/* Chart */}
              <DemoChartComponent chart={tab.chart} />

              {/* Table */}
              <DemoTable
                columns={tab.columns}
                rows={tab.rows}
                expandedFields={tab.expandedFields}
                onAction={handleRowAction}
                agentName={meta.name}
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {tab.actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => openModal(action.label, action.description)}
                    className="text-xs font-bold px-5 py-2.5 rounded-xl border transition-all hover:shadow-md"
                    style={{ borderColor: meta.deptColor, color: meta.deptColor }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Recommendations */}
              <DemoRecommendations recommendations={tab.recommendations} onAction={handleRecAction} />
            </>
          )}
        </div>

        {/* Upgrade Comparison */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6 text-center" style={{ background: '#1B2A4A' }}>
            <h2 className="text-xl font-extrabold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Demo vs Full Version
            </h2>
            <p className="text-sm text-white/60">See what you unlock with a WoulfAI account</p>
          </div>
          <div className="grid md:grid-cols-2 divide-x" style={{ background: 'white' }}>
            <div className="p-6">
              <h4 className="text-sm font-bold mb-3" style={{ color: '#9CA3AF' }}>DEMO</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#6B7280' }}>
                <li className="flex items-center gap-2"><span style={{ color: '#9CA3AF' }}>&#x2713;</span> Sample data only</li>
                <li className="flex items-center gap-2"><span style={{ color: '#9CA3AF' }}>&#x2713;</span> View dashboards and reports</li>
                <li className="flex items-center gap-2"><span style={{ color: '#9CA3AF' }}>&#x2713;</span> See AI recommendations</li>
                <li className="flex items-center gap-2"><span style={{ color: '#DC2626' }}>&#x2717;</span> No live data connection</li>
                <li className="flex items-center gap-2"><span style={{ color: '#DC2626' }}>&#x2717;</span> No action execution</li>
                <li className="flex items-center gap-2"><span style={{ color: '#DC2626' }}>&#x2717;</span> No integrations</li>
              </ul>
            </div>
            <div className="p-6">
              <h4 className="text-sm font-bold mb-3" style={{ color: '#F5920B' }}>FULL VERSION</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#4B5563' }}>
                <li className="flex items-center gap-2"><span style={{ color: '#059669' }}>&#x2713;</span> Your live business data</li>
                <li className="flex items-center gap-2"><span style={{ color: '#059669' }}>&#x2713;</span> Real-time dashboards</li>
                <li className="flex items-center gap-2"><span style={{ color: '#059669' }}>&#x2713;</span> AI recommendations for your data</li>
                <li className="flex items-center gap-2"><span style={{ color: '#059669' }}>&#x2713;</span> One-click action execution</li>
                <li className="flex items-center gap-2"><span style={{ color: '#059669' }}>&#x2713;</span> CRM, ERP, and tool integrations</li>
                <li className="flex items-center gap-2"><span style={{ color: '#059669' }}>&#x2713;</span> Custom reports and alerts</li>
              </ul>
              <Link
                href="/register"
                className="inline-block mt-4 text-sm font-bold text-white px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: '#F5920B' }}
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>
        </div>

        {/* Other Agents */}
        <div>
          <h3 className="text-sm font-bold mb-4" style={{ color: '#1B2A4A' }}>Explore Other AI Employees</h3>
          <div className="flex flex-wrap gap-2">
            {otherAgents.map(a => (
              <Link
                key={a.slug}
                href={'/demo/' + a.slug}
                className="text-xs px-3 py-1.5 rounded-lg border hover:border-orange-300 transition-colors"
                style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
              >
                {a.icon} {a.name}
              </Link>
            ))}
            <Link href="/#agents" className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ color: '#F5920B' }}>
              View all &rarr;
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="rounded-2xl p-8 mt-8" style={{ background: '#0f1b33' }}>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/woulf-badge.png" alt="WoulfAI" width={24} height={24} />
                <span className="text-sm font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Woulf<span style={{ color: '#F5920B' }}>AI</span></span>
              </div>
              <p className="text-xs text-white/40">AI employees that actually work. 24/7 operations for your business.</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3">Product</p>
              <div className="space-y-1.5">
                <Link href="/solutions" className="block text-xs text-white/60 hover:text-white transition-colors">Solutions</Link>
                <Link href="/pricing" className="block text-xs text-white/60 hover:text-white transition-colors">Pricing</Link>
                <Link href="/case-studies" className="block text-xs text-white/60 hover:text-white transition-colors">Case Studies</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3">Company</p>
              <div className="space-y-1.5">
                <Link href="/about" className="block text-xs text-white/60 hover:text-white transition-colors">About</Link>
                <Link href="/security" className="block text-xs text-white/60 hover:text-white transition-colors">Security</Link>
                <Link href="/privacy" className="block text-xs text-white/60 hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-3">Get Started</p>
              <div className="space-y-1.5">
                <Link href="/register" className="block text-xs text-white/60 hover:text-white transition-colors">Free Trial</Link>
                <Link href="/login" className="block text-xs text-white/60 hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-white/30">&copy; 2025 Woulf Group. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Action Modal */}
      <ActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        agentName={meta.name}
        actionLabel={modalAction.label}
        actionDescription={modalAction.description}
        accentColor={meta.deptColor}
      />

      {/* Timed Slide-In */}
      {showSlideIn && !slideInDismissed && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-xl p-5 max-w-xs border"
          style={{ borderColor: '#E5E7EB', animation: 'slideInRight 0.4s ease-out' }}
        >
          <button
            onClick={() => { setSlideInDismissed(true); setShowSlideIn(false); }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
          <p className="text-sm font-bold mb-1" style={{ color: '#1B2A4A' }}>Want to see your real data?</p>
          <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Connect your tools and get live AI insights in minutes.</p>
          <Link
            href="/register"
            className="inline-block text-xs font-bold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: '#F5920B' }}
          >
            Start Free Trial
          </Link>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
