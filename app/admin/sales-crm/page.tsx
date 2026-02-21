'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function getEmail() {
  try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' }
}

async function crmGet(action: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch('/api/crm?' + qs, { headers: { 'x-admin-email': getEmail() } });
  return res.json();
}

async function crmPost(data: any) {
  const res = await fetch('/api/crm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-email': getEmail() },
    body: JSON.stringify(data),
  });
  return res.json();
}

const STAGES = [
  { key: 'prospecting', label: 'Prospecting', color: '#6B7280' },
  { key: 'discovery', label: 'Discovery', color: '#3B82F6' },
  { key: 'proposal', label: 'Proposal', color: '#8B5CF6' },
  { key: 'negotiation', label: 'Negotiation', color: '#F59E0B' },
  { key: 'closed_won', label: 'Closed Won', color: '#10B981' },
  { key: 'closed_lost', label: 'Closed Lost', color: '#EF4444' },
];

const STAGE_NEXT: Record<string, string[]> = {
  prospecting: ['discovery'],
  discovery: ['proposal', 'closed_lost'],
  proposal: ['negotiation', 'closed_lost'],
  negotiation: ['closed_won', 'closed_lost'],
};

export default function SalesCRMPage() {
  const [view, setView] = useState<'pipeline' | 'contacts'>('pipeline')
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const load = async () => {
    setLoading(true);
    const data = await crmGet('all');
    setContacts(data.contacts || []);
    setDeals(data.deals || []);
    setLoading(false);
  };

  useEffect(() => { load() }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const moveDeal = async (dealId: string, stage: string) => {
    await crmPost({ action: 'move-deal', dealId, stage });
    showToast('Deal moved to ' + stage.replace('_', ' '));
    load();
  };

  const pipelineValue = deals.filter(d => !d.stage.startsWith('closed')).reduce((s: number, d: any) => s + d.value, 0);
  const weightedValue = deals.filter(d => !d.stage.startsWith('closed')).reduce((s: number, d: any) => s + (d.value * d.probability / 100), 0);
  const closedWon = deals.filter((d: any) => d.stage === 'closed_won').reduce((s: number, d: any) => s + d.value, 0);
  const closedDeals = deals.filter((d: any) => d.stage.startsWith('closed'));
  const winRate = closedDeals.length > 0
    ? Math.round(deals.filter((d: any) => d.stage === 'closed_won').length / closedDeals.length * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Sales CRM</h1>
          <p className="text-sm text-gray-500 mt-1">360-degree customer intelligence and deal pipeline</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('pipeline')}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (view === 'pipeline' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5')}>
            Pipeline
          </button>
          <button onClick={() => setView('contacts')}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' + (view === 'contacts' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5')}>
            Contacts
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Pipeline Value</div>
          <div className="text-2xl font-bold">${pipelineValue.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Weighted Value</div>
          <div className="text-2xl font-bold">${Math.round(weightedValue).toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Closed Won</div>
          <div className="text-2xl font-bold text-emerald-400">${closedWon.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-amber-400">{winRate}%</div>
        </div>
      </div>

      {/* PIPELINE VIEW */}
      {view === 'pipeline' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAGES.filter(s => s.key !== 'closed_lost').map(stage => {
            const stageDeals = deals.filter((d: any) => d.stage === stage.key);
            const stageTotal = stageDeals.reduce((s: number, d: any) => s + d.value, 0);
            return (
              <div key={stage.key} className="bg-[#0A0E15] border border-white/5 rounded-xl">
                <div className="p-3 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-xs font-semibold">{stage.label}</span>
                    <span className="text-[10px] text-gray-500 ml-auto">{stageDeals.length}</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">${stageTotal.toLocaleString()}</div>
                </div>
                <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                  {stageDeals.map((deal: any) => {
                    const contact = contacts.find((c: any) => c.id === deal.contactId);
                    const nextStages = STAGE_NEXT[deal.stage] || [];
                    return (
                      <Link key={deal.id} href={'/admin/sales-crm/' + deal.contactId}
                        className="block bg-white/[0.02] border border-white/5 rounded-lg p-2.5 hover:border-white/10 transition-all cursor-pointer">
                        <div className="text-xs font-medium truncate">{deal.title}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{contact?.name || 'Unknown'}</div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-mono font-bold">${deal.value.toLocaleString()}</span>
                          <span className="text-[10px] font-mono text-gray-500">{deal.probability}%</span>
                        </div>
                        {nextStages.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {nextStages.map((s: string) => {
                              const stg = STAGES.find(st => st.key === s);
                              return (
                                <button key={s} onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveDeal(deal.id, s); }}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                  {stg?.label || s}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-4 text-[10px] text-gray-600">No deals</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONTACTS VIEW */}
      {view === 'contacts' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-3 px-4">Contact</th>
                <th className="text-left py-3 px-4">Company</th>
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Lifetime Value</th>
                <th className="text-right py-3 px-4">Deals</th>
                <th className="text-right py-3 px-4">Profile</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c: any) => {
                const cDeals = deals.filter((d: any) => d.contactId === c.id);
                return (
                  <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{c.company}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{c.title}</td>
                    <td className="py-3 px-4 text-right font-mono">${c.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">${c.lifetimeValue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-400">{cDeals.length}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={'/admin/sales-crm/' + c.id} className="text-xs text-blue-400 hover:text-blue-300">
                        View 360
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
