'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getSales } from '@/lib/tenant-data';

const TABS = [
  { id: 'pipeline', name: 'Pipeline', icon: '\uD83C\uDFAF' },
  { id: 'contacts', name: 'Contacts', icon: '\uD83D\uDC64' },
  { id: 'intel', name: 'Intelligence', icon: '\uD83E\uDDE0' },
  { id: 'activity', name: 'Activity', icon: '\uD83D\uDCDD' },
  { id: 'battlecards', name: 'Battle Cards', icon: '\u2694\uFE0F' },
  { id: 'forecasts', name: 'Forecasts', icon: '\uD83D\uDCC8' },
];

const ACTIVITIES = [
  { type: 'Call', contact: 'Contact 1', summary: 'Discussed timeline', time: '2h ago', icon: '\uD83D\uDCDE' },
  { type: 'Email', contact: 'Contact 2', summary: 'Sent revised proposal', time: '5h ago', icon: '\uD83D\uDCE7' },
  { type: 'Meeting', contact: 'Contact 3', summary: 'Product demo went well', time: '1d ago', icon: '\uD83D\uDCC5' },
];

const BATTLECARDS = [
  { competitor: 'Legacy ERP Co', weakness: 'Slow implementation (6-12 months)', ourEdge: 'Live in 10 minutes with AI', winRate: '73%' },
  { competitor: 'CloudOps Platform', weakness: 'No AI Employee architecture', ourEdge: '14 specialized AI Employees', winRate: '68%' },
  { competitor: 'DataForce Suite', weakness: 'Expensive per-seat pricing', ourEdge: 'Flat tier pricing, 20+ integrations', winRate: '81%' },
];

export default function SalesEmployeePage() {
  const { currentCompany, isLoading } = useTenant();
  const [activeTab, setActiveTab] = useState('pipeline');
  const sd = getSales(currentCompany?.name);

  const fmtK = (n: number) => '$' + (n / 1000).toFixed(0) + 'K';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{'\uD83C\uDFAF'}</div>
          <div>
            <h1 className="text-2xl font-bold">Sales Employee</h1>
            <p className="text-sm text-[#6B7280]">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm hover:bg-blue-500">+ New Deal</button>
          <button className="px-4 py-2 bg-white shadow-sm text-[#4B5563] rounded-lg text-sm hover:bg-gray-100">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { l: 'Pipeline Value', v: fmtK(sd.pipelineValue), c: '' },
          { l: 'Won This Month', v: fmtK(sd.wonThisMonth), c: 'text-emerald-600' },
          { l: 'Active Deals', v: String(sd.activeDeals), c: '' },
          { l: 'Win Rate', v: sd.winRate + '%', c: '' },
          { l: 'Avg Deal Size', v: fmtK(sd.avgDealSize), c: '' },
        ].map(k => (
          <div key={k.l} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[9px] text-[#9CA3AF] uppercase">{k.l}</div>
            <div className={'text-xl font-mono font-bold mt-1 ' + k.c}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-[#E5E7EB] pb-3">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (activeTab === tab.id ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>
            <span>{tab.icon}</span> {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-4 gap-4">
          {sd.stages.map(stage => (
            <div key={stage.name} className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-semibold text-[#6B7280]">{stage.name}</h3>
                <span className="text-[10px] text-[#6B7280]">{stage.deals.length} deals</span>
              </div>
              {stage.deals.map((deal, i) => (
                <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:border-blue-500/30 transition cursor-pointer">
                  <div className="font-medium text-sm text-white">{deal.company}</div>
                  <div className="text-lg font-mono font-bold text-blue-600 mt-1">{fmtK(deal.value)}</div>
                  <div className="flex justify-between mt-2 text-[10px]">
                    <span className="text-[#9CA3AF]">{deal.owner}</span>
                    <span className="text-[#6B7280]">{deal.age}</span>
                  </div>
                  <span className={'text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block ' + (deal.risk === 'high' ? 'bg-red-50 text-red-600' : deal.risk === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>{deal.risk} risk</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-[#E5E7EB]">
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Contact</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Company</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Role</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Sentiment</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Last Contact</th>
          </tr></thead><tbody>
            {sd.contacts.map((c, i) => (
              <tr key={i} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                <td className="px-4 py-3 text-sm text-white">{c.name}</td>
                <td className="px-4 py-3 text-sm text-[#4B5563]">{c.company}</td>
                <td className="px-4 py-3 text-sm text-[#6B7280]">{c.role}</td>
                <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded ' + (c.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' : c.sentiment === 'Cautious' ? 'bg-amber-50 text-amber-600' : 'bg-gray-500/10 text-[#6B7280]')}>{c.sentiment}</span></td>
                <td className="px-4 py-3 text-xs text-[#9CA3AF]">{c.lastContact}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {activeTab === 'intel' && (
        <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-3">{'\uD83E\uDDE0'} AI Insights</h3>
          <div className="space-y-3 text-sm text-[#4B5563]">
            {sd.stages.filter(s => s.name === 'Negotiation').flatMap(s => s.deals).map((d, i) => (
              <div key={i} className="flex items-start gap-2"><span className="text-amber-600">{'\u26A0\uFE0F'}</span> {d.company} deal ({fmtK(d.value)}) in Negotiation for {d.age}. Risk: {d.risk}.</div>
            ))}
            <div className="flex items-start gap-2"><span className="text-blue-600">{'\uD83D\uDCA1'}</span> Win rate: {sd.winRate}%. Avg deal: {fmtK(sd.avgDealSize)}.</div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="flex items-start gap-4 py-3 border-b border-white/[0.03] last:border-0">
              <div className="text-2xl">{a.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="text-sm text-white font-medium">{a.type} with {a.contact}</div>
                  <div className="text-[10px] text-[#6B7280]">{a.time}</div>
                </div>
                <div className="text-xs text-[#6B7280] mt-1">{a.summary}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'battlecards' && (
        <div className="grid grid-cols-3 gap-4">
          {BATTLECARDS.map((bc, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">vs {bc.competitor}</h3>
              <div><div className="text-[10px] text-red-600 uppercase font-medium">Their Weakness</div><div className="text-xs text-[#6B7280] mt-1">{bc.weakness}</div></div>
              <div><div className="text-[10px] text-emerald-600 uppercase font-medium">Our Edge</div><div className="text-xs text-[#4B5563] mt-1">{bc.ourEdge}</div></div>
              <div className="flex items-center gap-2"><span className="text-[10px] text-[#9CA3AF]">Win Rate:</span><span className="text-sm font-bold text-emerald-600">{bc.winRate}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'forecasts' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5"><div className="text-[9px] text-[#9CA3AF] uppercase">Weighted Pipeline</div><div className="text-2xl font-mono font-bold mt-1">{fmtK(Math.round(sd.pipelineValue * 0.6))}</div></div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5"><div className="text-[9px] text-[#9CA3AF] uppercase">Best Case</div><div className="text-2xl font-mono font-bold mt-1 text-emerald-600">{fmtK(sd.pipelineValue)}</div></div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5"><div className="text-[9px] text-[#9CA3AF] uppercase">Most Likely</div><div className="text-2xl font-mono font-bold mt-1 text-blue-600">{fmtK(Math.round(sd.pipelineValue * 0.66))}</div></div>
        </div>
      )}
    </div>
  );
}