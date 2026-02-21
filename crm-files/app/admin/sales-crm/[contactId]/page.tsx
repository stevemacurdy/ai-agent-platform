'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

const STAGE_COLORS: Record<string, string> = {
  prospecting: 'text-gray-400 bg-gray-500/10',
  discovery: 'text-blue-400 bg-blue-500/10',
  proposal: 'text-violet-400 bg-violet-500/10',
  negotiation: 'text-amber-400 bg-amber-500/10',
  closed_won: 'text-emerald-400 bg-emerald-500/10',
  closed_lost: 'text-rose-400 bg-rose-500/10',
};

const ACT_ICONS: Record<string, string> = {
  meeting: '\uD83E\uDD1D', call: '\uD83D\uDCDE', email: '\uD83D\uDCE7', note: '\uD83D\uDCDD',
  stage_change: '\u27A1\uFE0F', document: '\uD83D\uDCC4',
};

export default function ContactProfilePage() {
  const { contactId } = useParams() as { contactId: string }
  const [contact, setContact] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'deals' | 'activity' | 'edit'>('overview')
  const [toast, setToast] = useState<string | null>(null)
  const [newActivity, setNewActivity] = useState({ type: 'note', description: '', dealId: '' })

  const load = async () => {
    setLoading(true);
    const data = await crmGet('contact', { id: contactId });
    setContact(data.contact);
    setDeals(data.deals || []);
    setActivities(data.activities || []);
    setLoading(false);
  };

  useEffect(() => { load() }, [contactId])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const addActivity = async () => {
    if (!newActivity.description) return;
    await crmPost({ action: 'add-activity', contactId, ...newActivity });
    setNewActivity({ type: 'note', description: '', dealId: '' });
    showToast('Activity added');
    load();
  };

  const saveContact = async () => {
    const updates: any = {};
    ['name', 'email', 'phone', 'title', 'bioNotes'].forEach(f => {
      const el = document.getElementById('edit-' + f) as HTMLInputElement | HTMLTextAreaElement;
      if (el) updates[f] = el.value;
    });
    await crmPost({ action: 'update-contact', contactId, updates });
    showToast('Contact updated');
    setTab('overview'); load();
  };

  if (loading || !contact) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalDealValue = deals.reduce((s: number, d: any) => s + d.value, 0);
  const openDeals = deals.filter((d: any) => !d.stage.startsWith('closed'));
  const aiScore = Math.min(99, Math.round(
    (deals.filter((d: any) => d.stage === 'closed_won').length * 30) +
    (openDeals.reduce((s: number, d: any) => s + d.probability, 0) / Math.max(openDeals.length, 1)) * 0.5 +
    (activities.length * 3)
  ));

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>
      )}

      <Link href="/admin/sales-crm" className="text-sm text-gray-500 hover:text-white flex items-center gap-1">
        &larr; Back to CRM
      </Link>

      {/* Contact Header */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-xl font-bold text-blue-300 flex-shrink-0">
            {contact.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <p className="text-gray-400 mt-0.5">{contact.title} at {contact.company}</p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 font-mono">{contact.email}</span>
              <span className="text-xs text-gray-500">{contact.phone}</span>
              {contact.linkedinUrl && <a href={'https://' + contact.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300">LinkedIn</a>}
              {contact.twitterUrl && <span className="text-xs text-gray-500">{contact.twitterUrl}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-blue-400">{aiScore}</div>
            <div className="text-[10px] text-gray-500 font-mono">Reality Score</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">${totalDealValue.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 font-mono">Total Deal Value</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">${contact.totalRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 font-mono">Revenue Earned</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{deals.length}</div>
            <div className="text-[10px] text-gray-500 font-mono">Total Deals</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{activities.length}</div>
            <div className="text-[10px] text-gray-500 font-mono">Interactions</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'deals', 'activity', 'edit'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
              (tab === t ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5')}>
            {t === 'overview' ? 'Overview' : t === 'deals' ? 'Deals' : t === 'activity' ? 'Activity' : 'Edit'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bio */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Personality &amp; Bio Notes</h3>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{contact.bioNotes || 'No notes yet.'}</p>
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Source: <span className="text-gray-300">{contact.source}</span></span>
                <span>Since: <span className="text-gray-300">{contact.createdAt}</span></span>
              </div>
            </div>
          </div>

          {/* Deal Summary */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Deal Pipeline</h3>
            <div className="space-y-2">
              {deals.map((deal: any) => (
                <div key={deal.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{deal.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={'text-[10px] font-mono px-1.5 py-0.5 rounded ' + (STAGE_COLORS[deal.stage] || '')}>
                        {deal.stage.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-gray-500">{deal.assignedTo}</span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-mono font-bold">${deal.value.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{deal.probability}% likely</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
              <span className="text-gray-500">Lifetime Value Potential</span>
              <span className="font-mono font-bold text-emerald-400">${contact.lifetimeValue.toLocaleString()}</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activities.slice(0, 6).map((act: any) => (
                <div key={act.id} className="flex gap-3">
                  <div className="text-base mt-0.5">{ACT_ICONS[act.type] || '\uD83D\uDCCC'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-300">{act.description}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-500">{act.createdBy}</span>
                      <span className="text-[10px] text-gray-600 font-mono">{new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      {act.metadata?.duration && <span className="text-[10px] text-gray-600">{act.metadata.duration}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEALS TAB */}
      {tab === 'deals' && (
        <div className="space-y-3">
          {deals.map((deal: any) => {
            const dealActivities = activities.filter((a: any) => a.dealId === deal.id);
            return (
              <div key={deal.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{deal.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={'text-[10px] font-mono px-2 py-0.5 rounded ' + (STAGE_COLORS[deal.stage] || '')}>{deal.stage.replace('_', ' ')}</span>
                      <span className="text-xs text-gray-500">Assigned to {deal.assignedTo}</span>
                      <span className="text-xs text-gray-500">Expected close: {deal.expectedClose}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-bold">${deal.value.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{deal.probability}% probability</div>
                  </div>
                </div>
                {deal.notes && <p className="text-xs text-gray-400 mb-3 italic">{deal.notes}</p>}
                <div className="border-t border-white/5 pt-3">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Activity Timeline</div>
                  {dealActivities.length > 0 ? dealActivities.map((act: any) => (
                    <div key={act.id} className="flex items-start gap-2 py-1.5">
                      <span className="text-xs">{ACT_ICONS[act.type] || '\uD83D\uDCCC'}</span>
                      <span className="text-xs text-gray-400 flex-1">{act.description}</span>
                      <span className="text-[10px] text-gray-600 font-mono">{new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )) : <div className="text-xs text-gray-600">No activities recorded</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVITY TAB */}
      {tab === 'activity' && (
        <div className="space-y-4">
          {/* Add Activity */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Log Activity</h3>
            <div className="flex gap-3">
              <select value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm w-32">
                <option value="note">Note</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="document">Document</option>
              </select>
              <input value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})}
                placeholder="What happened?" className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              <button onClick={addActivity} disabled={!newActivity.description}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40">
                Log
              </button>
            </div>
          </div>

          {/* Full Timeline */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Complete Timeline</h3>
            <div className="space-y-3">
              {activities.map((act: any) => {
                const deal = deals.find((d: any) => d.id === act.dealId);
                return (
                  <div key={act.id} className="flex gap-3 py-2 border-b border-white/[0.03] last:border-0">
                    <div className="text-lg">{ACT_ICONS[act.type] || '\uD83D\uDCCC'}</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">{act.description}</div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] text-gray-500">{act.createdBy}</span>
                        {deal && <span className="text-[10px] text-blue-400 font-mono">{deal.title}</span>}
                        <span className="text-[10px] text-gray-600 font-mono">
                          {new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {act.metadata?.duration && <span className="text-[10px] text-gray-600">{act.metadata.duration}</span>}
                        {act.metadata?.location && <span className="text-[10px] text-gray-600">{act.metadata.location}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT TAB */}
      {tab === 'edit' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 max-w-2xl">
          <h3 className="font-semibold mb-4">Edit Contact</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Name</label>
                <input id="edit-name" defaultValue={contact.name} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Title</label>
                <input id="edit-title" defaultValue={contact.title} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email</label>
                <input id="edit-email" defaultValue={contact.email} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Phone</label>
                <input id="edit-phone" defaultValue={contact.phone} className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Bio / Personality Notes</label>
              <textarea id="edit-bioNotes" defaultValue={contact.bioNotes} rows={5}
                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-none" />
            </div>
            <button onClick={saveContact} className="w-full py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
