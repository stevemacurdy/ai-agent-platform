'use client';
import { useState, useEffect } from 'react';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking';

const SECTIONS = [
  { id: 'sales', label: 'Sales', icon: '\uD83D\uDCC8', available: true },
  { id: 'intel', label: 'Sales Intel', icon: '\uD83C\uDFAF', available: true },
  { id: 'coach', label: 'Sales Coach', icon: '\uD83C\uDFC6', available: true },
];

const fmt = (n: number) => '$' + n.toLocaleString();
const badge = (s: string) => {
  const styles: Record<string, string> = {
    won: 'bg-emerald-50 text-emerald-600', lost: 'bg-rose-50 text-rose-600', open: 'bg-blue-50 text-blue-600',
    qualified: 'bg-emerald-50 text-emerald-600', prospecting: 'bg-blue-50 text-blue-600', negotiation: 'bg-amber-50 text-amber-600',
    proposal: 'bg-violet-50 text-violet-600', hot: 'bg-rose-50 text-rose-600', warm: 'bg-amber-50 text-amber-600', cold: 'bg-blue-50 text-blue-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[s.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
};

export default function SalesDepartment() {
  useTrackConsoleView('sales-dept');
  const [section, setSection] = useState('sales');
  const [salesData, setSalesData] = useState<any>(null);
  const [intelData, setIntelData] = useState<any>(null);
  const [coachData, setCoachData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiTitle, setAiTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('woulfai_token') || '' : '';
  const hdrs: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  useEffect(() => {
    Promise.all([
      fetch('/api/sales-data?view=dashboard').then(r => r.json()).catch(() => null),
      fetch('/api/agents/sales-intel', { headers: hdrs }).then(r => r.json()).catch(() => null),
      fetch('/api/agents/sales-coach', { headers: hdrs }).then(r => r.json()).catch(() => null),
    ]).then(([sales, intel, coach]) => { setSalesData(sales); setIntelData(intel); setCoachData(coach); setLoading(false); });
  }, []);

  const handleAi = async (endpoint: string, action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setAiTitle(action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())); setAiModal(true);
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: hdrs, body: JSON.stringify({ action, ...payload }) });
      const result = await res.json();
      setAiResult(result.result || result.error || JSON.stringify(result, null, 2));
    } catch (e: any) { setAiResult('Error: ' + e.message); }
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex">
      <aside className="w-56 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5920B] to-[#EF4444] flex items-center justify-center text-white text-sm font-bold">S</div>
            <div><p className="text-sm font-bold text-[#1B2A4A]">Sales</p><p className="text-[10px] text-[#9CA3AF]">Department Console</p></div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === s.id ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-50'}`}>
              <span className="text-base">{s.icon}</span><span>{s.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {section === 'sales' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCC8'} Sales Pipeline</h1>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${salesData?.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                {salesData?.source === 'live' ? 'Live' : 'Demo'}
              </span>
            </div>
            {loading ? <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div> : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Pipeline Value', value: fmt(salesData?.summary?.pipelineValue || 0), color: '#2A9D8F' },
                    { label: 'Deals Open', value: salesData?.summary?.dealsOpen || salesData?.summary?.openDeals || 0 },
                    { label: 'Won This Month', value: fmt(salesData?.summary?.wonThisMonth || 0), color: '#059669' },
                    { label: 'Win Rate', value: (salesData?.summary?.winRate || 0) + '%' },
                  ].map((k, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: k.color || '#1B2A4A' }}>{k.value}</p>
                    </div>
                  ))}
                </div>
                {(salesData?.pipeline || salesData?.deals || []).length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E5E7EB]"><h3 className="text-sm font-bold text-[#1B2A4A]">Active Deals</h3></div>
                    <div className="divide-y divide-[#F4F5F7]">
                      {(salesData?.pipeline || salesData?.deals || []).slice(0, 8).map((d: any, i: number) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <div><p className="text-xs font-medium text-[#1B2A4A]">{d.company || d.name || d.dealName}</p><p className="text-[10px] text-[#9CA3AF]">{d.contact || d.owner || ''}</p></div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#1B2A4A]">{fmt(d.value || d.amount || 0)}</span>
                            {badge(d.stage || d.status || 'open')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {section === 'intel' && (
          <div className="p-6 space-y-5">
            <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83C\uDFAF'} Sales Intel</h1>
            <div className="grid grid-cols-3 gap-3">
              {[
                { action: 'enrich', label: 'Enrich Prospect', icon: '\uD83D\uDD0D' },
                { action: 'build-outreach', label: 'Build Outreach', icon: '\u2709\uFE0F' },
                { action: 'score-lead', label: 'Score Lead', icon: '\uD83C\uDFAF' },
              ].map(a => (
                <button key={a.action} onClick={() => handleAi('/api/agents/sales-intel', a.action)} disabled={aiLoading}
                  className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                  <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                </button>
              ))}
            </div>
            {(intelData?.prospects || intelData?.items || []).length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB]"><h3 className="text-sm font-bold text-[#1B2A4A]">Prospects</h3></div>
                <div className="divide-y divide-[#F4F5F7]">
                  {(intelData?.prospects || intelData?.items || []).slice(0, 8).map((p: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div><p className="text-xs font-medium text-[#1B2A4A]">{p.company || p.name}</p><p className="text-[10px] text-[#9CA3AF]">{p.industry || ''} | {p.source || ''}</p></div>
                      <div className="flex items-center gap-2">
                        {p.score && <span className="text-xs font-mono font-bold text-[#2A9D8F]">{p.score}</span>}
                        {badge(p.status || p.temperature || 'new')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {section === 'coach' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83C\uDFC6'} Sales Coach</h1>
              <a href="/agents/sales/coach" className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-xs font-medium hover:bg-[#2A9D8F]/90">Open Chat {'\u2192'}</a>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { action: 'generate-coaching-plan', label: 'Coaching Plan', icon: '\uD83D\uDCCB' },
                { action: 'generate-roleplay', label: 'Roleplay Scenario', icon: '\uD83C\uDFAD' },
                { action: 'analyze-win-loss', label: 'Win/Loss Analysis', icon: '\uD83D\uDCCA' },
              ].map(a => (
                <button key={a.action} onClick={() => handleAi('/api/agents/sales-coach', a.action)} disabled={aiLoading}
                  className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                  <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#9CA3AF]">For interactive coaching conversations, use the dedicated chat at /agents/sales/coach.</p>
          </div>
        )}

        {aiModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAiModal(false)}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1B2A4A]">{aiTitle}</h3>
                <button onClick={() => setAiModal(false)} className="text-[#6B7280] hover:text-[#1B2A4A] text-lg">{'\u2715'}</button>
              </div>
              <div className="p-6">
                {aiLoading ? <div className="flex items-center gap-3 py-8 justify-center"><div className="w-5 h-5 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" /><span className="text-sm text-[#6B7280]">AI analyzing...</span></div>
                : <div className="whitespace-pre-wrap text-sm text-[#4B5563] leading-relaxed">{aiResult}</div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
