'use client';
import { useState, useEffect } from 'react';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking';

const SECTIONS = [
  { id: 'cfo', label: 'CFO', icon: '\uD83D\uDCB0', available: true },
  { id: 'collections', label: 'Collections', icon: '\uD83D\uDCB3', available: true },
  { id: 'payables', label: 'Payables', icon: '\uD83D\uDCCB', available: true },
  { id: 'finops', label: 'FinOps', icon: '\uD83D\uDCC8', available: true },
  { id: 'research', label: 'Finance Research', icon: '\uD83D\uDD0D', available: false },
  { id: 'tax', label: 'Tax Preparation', icon: '\uD83D\uDCDD', available: false },
];

const fmt = (n: number) => '$' + n.toLocaleString();
const badge = (s: string) => {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-600', overdue: 'bg-rose-50 text-rose-600', pending: 'bg-amber-50 text-amber-600',
    current: 'bg-emerald-50 text-emerald-600', approved: 'bg-emerald-50 text-emerald-600', open: 'bg-blue-50 text-blue-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[s.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
};

export default function FinanceDepartment() {
  useTrackConsoleView('finance-dept');
  const [section, setSection] = useState('cfo');
  const [cfoData, setCfoData] = useState<any>(null);
  const [colData, setColData] = useState<any>(null);
  const [payData, setPayData] = useState<any>(null);
  const [finData, setFinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiTitle, setAiTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('woulfai_token') || '' : '';
  const hdrs: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  useEffect(() => {
    Promise.all([
      fetch('/api/cfo?view=dashboard').then(r => r.json()).catch(() => null),
      fetch('/api/agents/collections', { headers: hdrs }).then(r => r.json()).catch(() => null),
      fetch('/api/agents/payables', { headers: hdrs }).then(r => r.json()).catch(() => null),
      fetch('/api/agents/finops', { headers: hdrs }).then(r => r.json()).catch(() => null),
    ]).then(([cfo, col, pay, fin]) => { setCfoData(cfo); setColData(col); setPayData(pay); setFinData(fin); setLoading(false); });
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

  const availableSections = SECTIONS.filter(s => s.available);
  const futureSections = SECTIONS.filter(s => !s.available);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex">
      <aside className="w-56 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#2A9D8F] flex items-center justify-center text-white text-sm font-bold">F</div>
            <div><p className="text-sm font-bold text-[#1B2A4A]">Finance</p><p className="text-[10px] text-[#9CA3AF]">Department Console</p></div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {availableSections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === s.id ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-50'}`}>
              <span className="text-base">{s.icon}</span><span>{s.label}</span>
            </button>
          ))}
          {futureSections.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1"><p className="text-[9px] font-bold uppercase text-[#9CA3AF] tracking-wider">Coming Soon</p></div>
              {futureSections.map(s => (
                <div key={s.id} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#D1D5DB] cursor-not-allowed">
                  <span className="text-base opacity-40">{s.icon}</span><span>{s.label}</span>
                </div>
              ))}
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {section === 'cfo' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCB0'} CFO Dashboard</h1>
              <a href="/agents/cfo/console" className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-xs font-medium hover:bg-[#2A9D8F]/90">Full Console {'\u2192'}</a>
            </div>
            {loading ? <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div> : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Revenue MTD', value: fmt(cfoData?.revenue || cfoData?.summary?.revenue || 0), color: '#059669' },
                  { label: 'Cash Balance', value: fmt(cfoData?.cashBalance || cfoData?.summary?.cashBalance || 0) },
                  { label: 'AR Outstanding', value: fmt(cfoData?.arOutstanding || cfoData?.summary?.arOutstanding || 0), color: '#F5920B' },
                  { label: 'AP Due', value: fmt(cfoData?.apDue || cfoData?.summary?.apDue || 0), color: '#DC2626' },
                ].map((k, i) => (
                  <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: k.color || '#1B2A4A' }}>{k.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === 'collections' && (
          <div className="p-6 space-y-5">
            <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCB3'} Collections</h1>
            <div className="grid grid-cols-3 gap-3">
              {[
                { action: 'analyze', label: 'Analyze Portfolio', icon: '\uD83D\uDCCA' },
                { action: 'generate-letter', label: 'Collection Letter', icon: '\u2709\uFE0F' },
              ].map(a => (
                <button key={a.action} onClick={() => handleAi('/api/agents/collections', a.action)} disabled={aiLoading}
                  className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                  <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                </button>
              ))}
            </div>
            {(colData?.accounts || colData?.items || []).length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB]"><h3 className="text-sm font-bold text-[#1B2A4A]">Accounts</h3></div>
                <div className="divide-y divide-[#F4F5F7]">
                  {(colData?.accounts || colData?.items || []).slice(0, 8).map((a: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div><p className="text-xs font-medium text-[#1B2A4A]">{a.customer || a.name}</p><p className="text-[10px] text-[#9CA3AF]">{a.daysPastDue || a.daysOverdue || 0} days past due</p></div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#1B2A4A]">{fmt(a.balance || a.amount || 0)}</span>
                        {badge(a.status || 'open')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {section === 'payables' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCCB'} Payables</h1>
              <a href="/agents/payables/console" className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-xs font-medium hover:bg-[#2A9D8F]/90">Full Console {'\u2192'}</a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { action: 'analyze-discounts', label: 'Analyze Discounts', icon: '\uD83D\uDCB5' },
                { action: 'detect-duplicates', label: 'Detect Duplicates', icon: '\uD83D\uDD0D' },
              ].map(a => (
                <button key={a.action} onClick={() => handleAi('/api/agents/payables', a.action)} disabled={aiLoading}
                  className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                  <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {section === 'finops' && (
          <div className="p-6 space-y-5">
            <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCC8'} Financial Operations</h1>
            <div className="grid grid-cols-2 gap-3">
              {[
                { action: 'forecast', label: 'Spending Forecast', icon: '\uD83D\uDCCA' },
                { action: 'scenario', label: 'Scenario Analysis', icon: '\uD83E\uDDEA' },
              ].map(a => (
                <button key={a.action} onClick={() => handleAi('/api/agents/finops', a.action)} disabled={aiLoading}
                  className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                  <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {(section === 'research' || section === 'tax') && (
          <div className="p-6"><div className="text-center py-12 text-[#9CA3AF]">
            <p className="text-lg">{section === 'research' ? 'Finance Research' : 'Tax Preparation'}</p>
            <p className="text-sm mt-2">Coming in Phase 2</p>
          </div></div>
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
