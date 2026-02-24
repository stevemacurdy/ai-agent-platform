'use client';
import { useState } from 'react';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '📡' },
  { id: 'market', name: 'Market Scanner', icon: '🔍' },
  { id: 'competitors', name: 'Competitive Intel', icon: '🎯' },
  { id: 'trends', name: 'Trend Reports', icon: '📈' },
];

const MARKET_ITEMS = [
  { title: '3PL Market Growth Accelerates', source: 'FreightWaves', date: '2026-02-20', sentiment: 'positive', summary: 'Third-party logistics market projected to reach $1.8T by 2028, driven by e-commerce and nearshoring trends.' },
  { title: 'AI Adoption in Warehouse Ops Hits 34%', source: 'Supply Chain Dive', date: '2026-02-19', sentiment: 'positive', summary: 'Survey finds 34% of warehouse operators now use AI for at least one core function, up from 18% in 2024.' },
  { title: 'Cold Chain Capacity Shortage Continues', source: 'Logistics Management', date: '2026-02-18', sentiment: 'negative', summary: 'Temperature-controlled storage demand outpacing supply by 12% in western US markets.' },
  { title: 'New OSHA Guidelines for Automated Warehouses', source: 'EHS Today', date: '2026-02-17', sentiment: 'neutral', summary: 'OSHA releases updated safety framework for facilities using autonomous mobile robots and automated storage systems.' },
  { title: 'Retail Returns Hit 17.6% of Sales', source: 'NRF', date: '2026-02-15', sentiment: 'negative', summary: 'Reverse logistics costs continue to climb as return rates increase across all retail categories.' },
];

const COMPETITORS = [
  { name: 'ShipBob', strengths: 'E-commerce fulfillment, fast integration', weaknesses: 'Limited cold chain, no WMS licensing', threat: 'medium' },
  { name: 'Deliverr (Shopify)', strengths: 'Shopify native, fast shipping', weaknesses: 'No 3PL services, limited customization', threat: 'low' },
  { name: 'Extensiv (3PL Central)', strengths: 'Established WMS, large network', weaknesses: 'Legacy UI, slow AI adoption', threat: 'high' },
  { name: 'Deposco', strengths: 'Modern WMS, good scalability', weaknesses: 'Smaller market presence, higher pricing', threat: 'medium' },
  { name: 'Logiwa', strengths: 'Cloud-native WMS, good D2C', weaknesses: 'Limited B2B features, newer player', threat: 'medium' },
];

const TRENDS = [
  { trend: 'AI-Powered Demand Forecasting', impact: 'high', timeframe: 'Now', description: 'Machine learning models predicting demand 2-4 weeks out with 85%+ accuracy, reducing overstock by 20-30%.' },
  { trend: 'Autonomous Mobile Robots (AMR)', impact: 'high', timeframe: '6-12 months', description: 'AMR adoption in mid-size warehouses becoming cost-effective at $15K-25K per unit with 18-month ROI.' },
  { trend: 'Micro-Fulfillment Centers', impact: 'medium', timeframe: '12-24 months', description: 'Urban micro-fulfillment growing as same-day delivery expectations expand beyond grocery.' },
  { trend: 'Digital Twin Warehouses', impact: 'medium', timeframe: '12-24 months', description: 'Virtual warehouse replicas enabling optimization testing before physical changes.' },
  { trend: 'Sustainable Packaging Mandates', impact: 'medium', timeframe: 'Now', description: 'New state regulations requiring recyclable/compostable packaging affecting fulfillment processes.' },
  { trend: 'Voice-Directed Picking', impact: 'low', timeframe: 'Now', description: 'Voice picking tech improving accuracy to 99.9% while increasing pick speed by 15%.' },
];

const sentimentColor = (s: string) => {
  switch (s) {
    case 'positive': return 'text-emerald-400 bg-emerald-500/10';
    case 'negative': return 'text-rose-400 bg-rose-500/10';
    default: return 'text-gray-400 bg-gray-500/10';
  }
};

const threatColor = (t: string) => {
  switch (t) {
    case 'high': return 'text-rose-400 bg-rose-500/10';
    case 'medium': return 'text-amber-400 bg-amber-500/10';
    default: return 'text-emerald-400 bg-emerald-500/10';
  }
};

const impactColor = (i: string) => {
  switch (i) {
    case 'high': return 'text-blue-400 bg-blue-500/10';
    case 'medium': return 'text-purple-400 bg-purple-500/10';
    default: return 'text-gray-400 bg-gray-500/10';
  }
};

export default function ResearchAgent() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">📡</div>
        <div>
          <h1 className="text-2xl font-bold">Research Agent</h1>
          <p className="text-sm text-gray-400">Market research, competitive intelligence & trend analysis</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Market Signals</div>
          <div className="text-2xl font-bold mt-1">{MARKET_ITEMS.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Competitors Tracked</div>
          <div className="text-2xl font-bold mt-1 text-blue-400">{COMPETITORS.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Trend Alerts</div>
          <div className="text-2xl font-bold mt-1 text-purple-400">{TRENDS.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">High Impact</div>
          <div className="text-2xl font-bold mt-1 text-amber-400">{TRENDS.filter(t => t.impact === 'high').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Latest Market Signals</h3>
            <div className="space-y-3">
              {MARKET_ITEMS.slice(0, 3).map(m => (
                <div key={m.title} className="pb-3 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium text-white">{m.title}</div>
                    <span className={'text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap ' + sentimentColor(m.sentiment)}>{m.sentiment}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">{m.source} · {m.date}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Top Threats</h3>
            <div className="space-y-3">
              {COMPETITORS.filter(c => c.threat === 'high').concat(COMPETITORS.filter(c => c.threat === 'medium')).slice(0, 4).map(c => (
                <div key={c.name} className="flex justify-between items-center pb-3 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm font-medium">{c.name}</div><div className="text-[10px] text-gray-500">{c.strengths}</div></div>
                  <span className={'text-[9px] px-2 py-0.5 rounded-full ' + threatColor(c.threat)}>{c.threat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Market Scanner */}
      {tab === 'market' && (
        <div className="space-y-3">
          {MARKET_ITEMS.map(m => (
            <div key={m.title} className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                <span className={'text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap ' + sentimentColor(m.sentiment)}>{m.sentiment}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">{m.summary}</p>
              <div className="text-[10px] text-gray-600">{m.source} · {m.date}</div>
            </div>
          ))}
        </div>
      )}

      {/* Competitive Intel */}
      {tab === 'competitors' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase">
              <th className="text-left px-4 py-3">Competitor</th><th className="text-left px-4 py-3">Strengths</th><th className="text-left px-4 py-3">Weaknesses</th><th className="text-left px-4 py-3">Threat</th>
            </tr></thead>
            <tbody>
              {COMPETITORS.map(c => (
                <tr key={c.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.strengths}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.weaknesses}</td>
                  <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded-full font-medium ' + threatColor(c.threat)}>{c.threat}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trends */}
      {tab === 'trends' && (
        <div className="space-y-3">
          {TRENDS.map(t => (
            <div key={t.trend} className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-semibold text-white">{t.trend}</h3>
                <div className="flex gap-2">
                  <span className={'text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap ' + impactColor(t.impact)}>{t.impact} impact</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{t.timeframe}</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
