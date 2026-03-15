'use client';
import { useState, useEffect } from 'react';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking';

const SECTIONS = [
  { id: 'marketing', label: 'Marketing', icon: '\uD83D\uDCE3', available: true },
  { id: 'seo', label: 'SEO', icon: '\uD83D\uDD0D', available: true },
  { id: 'video', label: 'Video Editor', icon: '\uD83C\uDFA5', available: true },
  { id: 'research', label: 'Market Research', icon: '\uD83D\uDCCA', available: true },
];

const badge = (s: string) => {
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-600', draft: 'bg-gray-100 text-gray-600', paused: 'bg-amber-50 text-amber-600',
    completed: 'bg-emerald-50 text-emerald-600', running: 'bg-blue-50 text-blue-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[s.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
};

export default function MarketingDepartment() {
  useTrackConsoleView('marketing-dept');
  const [section, setSection] = useState('marketing');
  const [mktData, setMktData] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [researchData, setResearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiTitle, setAiTitle] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('woulfai_token') || '' : '';
  const hdrs: Record<string, string> = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  useEffect(() => {
    Promise.all([
      fetch('/api/agents/marketing', { headers: hdrs }).then(r => r.json()).catch(() => null),
      fetch('/api/agents/seo', { headers: hdrs }).then(r => r.json()).catch(() => null),
      fetch('/api/agents/research', { headers: hdrs }).then(r => r.json()).catch(() => null),
    ]).then(([mkt, seo, res]) => { setMktData(mkt); setSeoData(seo); setResearchData(res); setLoading(false); });
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5920B] to-[#DC2626] flex items-center justify-center text-white text-sm font-bold">M</div>
            <div><p className="text-sm font-bold text-[#1B2A4A]">Marketing & Web</p><p className="text-[10px] text-[#9CA3AF]">Department Console</p></div>
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
        {section === 'marketing' && (
          <div className="p-6 space-y-5">
            <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCE3'} Marketing</h1>
            {loading ? <div className="h-20 bg-white rounded-xl animate-pulse" /> : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Campaigns', value: mktData?.summary?.activeCampaigns || 0 },
                    { label: 'Leads This Month', value: mktData?.summary?.leadsThisMonth || 0, color: '#2A9D8F' },
                    { label: 'Conversion Rate', value: (mktData?.summary?.conversionRate || 0) + '%' },
                    { label: 'Budget Spent', value: '$' + (mktData?.summary?.budgetSpent || 0).toLocaleString() },
                  ].map((k, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: k.color || '#1B2A4A' }}>{k.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: 'analyze-performance', label: 'Analyze Performance', icon: '\uD83D\uDCCA' },
                    { action: 'generate-copy', label: 'Generate Copy', icon: '\u270D\uFE0F' },
                    { action: 'ab-test-plan', label: 'A/B Test Plan', icon: '\uD83E\uDDEA' },
                  ].map(a => (
                    <button key={a.action} onClick={() => handleAi('/api/agents/marketing', a.action)} disabled={aiLoading}
                      className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                      <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {section === 'seo' && (
          <div className="p-6 space-y-5">
            <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDD0D'} SEO</h1>
            {loading ? <div className="h-20 bg-white rounded-xl animate-pulse" /> : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Tracked Keywords', value: seoData?.summary?.trackedKeywords || 0 },
                    { label: 'Avg Position', value: seoData?.summary?.avgPosition || 0 },
                    { label: 'Organic Traffic', value: (seoData?.summary?.organicTraffic || 0).toLocaleString(), color: '#2A9D8F' },
                    { label: 'Domain Authority', value: seoData?.summary?.domainAuthority || 0 },
                  ].map((k, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{k.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: k.color || '#1B2A4A' }}>{k.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: 'audit', label: 'Site Audit', icon: '\uD83D\uDCCB' },
                    { action: 'content-brief', label: 'Content Brief', icon: '\uD83D\uDCDD' },
                    { action: 'analyze-rankings', label: 'Analyze Rankings', icon: '\uD83D\uDCC8' },
                  ].map(a => (
                    <button key={a.action} onClick={() => handleAi('/api/agents/seo', a.action)} disabled={aiLoading}
                      className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                      <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {section === 'video' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83C\uDFA5'} Video Editor</h1>
              <a href="/agents/video-editor/console" className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-xs font-medium hover:bg-[#2A9D8F]/90">Full Console {'\u2192'}</a>
            </div>
            <p className="text-sm text-[#6B7280]">Quote clips, power clips, and video cleanup for testimonials and social media. Upload and process videos in the full console.</p>
            <div className="grid grid-cols-3 gap-4">
              {['Quote Clips', 'Power Clips', 'Video Cleanup'].map(mode => (
                <div key={mode} className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-center">
                  <p className="text-sm font-bold text-[#1B2A4A]">{mode}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{mode === 'Quote Clips' ? 'Extract key quotes from testimonials' : mode === 'Power Clips' ? 'Auto-generate highlight reels' : 'Clean audio, trim, enhance'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'research' && (
          <div className="p-6 space-y-5">
            <h1 className="text-xl font-bold text-[#1B2A4A]">{'\uD83D\uDCCA'} Market Research</h1>
            {loading ? <div className="h-20 bg-white rounded-xl animate-pulse" /> : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { action: 'analyze-competitor', label: 'Analyze Competitor', icon: '\uD83C\uDFAF' },
                    { action: 'market-report', label: 'Market Report', icon: '\uD83D\uDCCA' },
                    { action: 'trend-alert', label: 'Trend Alerts', icon: '\uD83D\uDD14' },
                  ].map(a => (
                    <button key={a.action} onClick={() => handleAi('/api/agents/research', a.action)} disabled={aiLoading}
                      className="bg-gradient-to-r from-[#1B2A4A] to-[#0f1b33] rounded-xl p-4 text-left hover:shadow-lg transition-all disabled:opacity-50">
                      <span className="text-lg">{a.icon}</span><p className="text-xs font-bold text-white mt-2">{a.label}</p>
                    </button>
                  ))}
                </div>
                {(researchData?.competitors || researchData?.items || []).length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E5E7EB]"><h3 className="text-sm font-bold text-[#1B2A4A]">Tracked Competitors</h3></div>
                    <div className="divide-y divide-[#F4F5F7]">
                      {(researchData?.competitors || researchData?.items || []).slice(0, 6).map((c: any, i: number) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <p className="text-xs font-medium text-[#1B2A4A]">{c.name || c.competitor}</p>
                          <p className="text-xs text-[#6B7280]">{c.threatLevel || c.threat || ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
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
