'use client';
import { useState, useEffect } from 'react';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking';
import LMSDashboard from '@/components/lms/LMSDashboard';

const SECTIONS = [
  { id: 'hr', label: 'HR', icon: '\uD83D\uDC65', available: true },
  { id: 'training', label: 'HR Training', icon: '\uD83C\uDF93', available: true },
  { id: 'background', label: 'Background Research', icon: '\uD83D\uDD0D', available: false },
];

const badge = (s: string) => {
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600', open: 'bg-blue-50 text-blue-600', hired: 'bg-emerald-50 text-emerald-600',
    interviewing: 'bg-amber-50 text-amber-600', offer: 'bg-violet-50 text-violet-600', rejected: 'bg-rose-50 text-rose-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[s.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
};

export default function HRDepartment() {
  useTrackConsoleView('hr-dept');
  const [section, setSection] = useState('hr');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiTitle, setAiTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('woulfai_token') || '' : '';
  const hdrs: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  useEffect(() => {
    fetch('/api/agents/hr', { headers: hdrs }).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setAiTitle(action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())); setAiModal(true);
    try {
      const res = await fetch('/api/agents/hr', { method: 'POST', headers: hdrs, body: JSON.stringify({ action, ...payload }) });
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B2A4A] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold">H</div>
            <div><p className="text-sm font-bold text-[#1B2A4A]">People / HR</p><p className="text-[10px] text-[#9CA3AF]">Department Console</p></div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {SECTIONS.map(s => s.available ? (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${section === s.id ? 'bg-[#2A9D8F]/10 text-[#2A9D8F] font-medium' : 'text-[#6B7280] hover:bg-gray-50'}`}>
              <span className="text-base">{s.icon}</span><span>{s.label}</span>
            </button>
          ) : (
            <div key={s.id} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#D1D5DB] cursor-not-allowed">
              <span className="text-base opacity-40">{s.icon}</span><span>{s.label}</span>
              <span className="ml-auto text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Soon</span>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {section === 'hr' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDC65'} Human Resources</h1>
                <p className="text-sm text-[#9CA3AF]">Workforce management, hiring, retention, compensation</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${data?.source === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                {data?.source === 'live' ? 'Live' : 'Demo'}
              </span>
            </div>

            {loading ? <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div> : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Employees', value: data?.summary?.totalEmployees || 0 },
                    { label: 'Open Positions', value: data?.summary?.openPositions || 0, color: '#F5920B' },
                    { label: 'Retention Rate', value: (data?.summary?.retentionRate || 0) + '%', color: '#059669' },
                    { label: 'Avg Tenure', value: (data?.summary?.avgTenure || 0) + ' yrs' },
                  ].map((k, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: k.color || '#1B2A4A' }}>{k.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: 'generate-jd', label: 'Generate Job Description', icon: '\uD83D\uDCDD' },
                    { action: 'retention-analysis', label: 'Retention Analysis', icon: '\uD83D\uDCCA' },
                    { action: 'salary-benchmark', label: 'Salary Benchmark', icon: '\uD83D\uDCB0' },
                  ].map(a => (
                    <button key={a.action} onClick={() => handleAi(a.action)} disabled={aiLoading}
                      className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                      <span className="text-lg">{a.icon}</span>
                      <p className="text-xs font-bold text-white mt-2">{a.label}</p>
                    </button>
                  ))}
                </div>

                {(data?.hiring || []).length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E5E7EB]"><h3 className="text-sm font-bold text-[#1B2A4A]">Hiring Pipeline</h3></div>
                    <div className="divide-y divide-[#F4F5F7]">
                      {data.hiring.map((h: any, i: number) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <div><p className="text-xs font-medium text-[#1B2A4A]">{h.position || h.title}</p><p className="text-[10px] text-[#9CA3AF]">{h.department} | {h.applicants || 0} applicants</p></div>
                          {badge(h.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {section === 'training' && (
          <LMSDashboard department="hr" title="HR Training & Compliance" />
        )}

        {section === 'background' && (
          <div className="p-6"><div className="text-center py-12 text-[#9CA3AF]"><p className="text-lg">Employee Background Research</p><p className="text-sm mt-2">Coming in Phase 2</p></div></div>
        )}

        {aiModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAiModal(false)}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1B2A4A]">{aiTitle}</h3>
                <button onClick={() => setAiModal(false)} className="text-[#6B7280] hover:text-[#1B2A4A] text-lg">{'\u2715'}</button>
              </div>
              <div className="p-6">
                {aiLoading ? (
                  <div className="flex items-center gap-3 py-8 justify-center"><div className="w-5 h-5 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" /><span className="text-sm text-[#6B7280]">AI analyzing...</span></div>
                ) : <div className="whitespace-pre-wrap text-sm text-[#4B5563] leading-relaxed">{aiResult}</div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
