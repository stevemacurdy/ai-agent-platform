'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  interest: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'qualified', label: 'Qualified', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const getAuthToken = async (): Promise<string | null> => {
    const sb = getSupabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token || null;
  };

  const loadLeads = async () => {
    const token = await getAuthToken();
    if (!token) return;

    const params = filter !== 'all' ? `?status=${filter}` : '';
    const res = await fetch('/api/leads' + params, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
      setNewCount(data.new_count || 0);
    }
    setLoading(false);
  };

  useEffect(() => { loadLeads(); }, [filter]);

  const updateStatus = async (leadId: string, newStatus: string) => {
    const token = await getAuthToken();
    if (!token) return;

    await fetch('/api/leads', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ id: leadId, status: newStatus }),
    });
    loadLeads();
  };

  const getStatusStyle = (status: string) => {
    const s = STATUS_OPTIONS.find(o => o.value === status);
    return s ? s.color : 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-gray-400 mt-1">Incoming leads from contact forms and demo requests</p>
        </div>
        <Link href="/admin/sales-crm" className="text-xs text-gray-500 hover:text-blue-400 transition">
          ← Back to Sales CRM
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Total Leads</div>
          <div className="text-2xl font-mono font-bold mt-1">{total}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">New</div>
          <div className="text-2xl font-mono font-bold text-blue-400 mt-1">{newCount}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Contacted</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {leads.filter(l => l.status === 'contacted').length}
          </div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[9px] text-gray-500 uppercase">Qualified</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            {leads.filter(l => l.status === 'qualified').length}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[{ value: 'all', label: 'All' }, ...STATUS_OPTIONS].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition border " +
              (filter === opt.value
                ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Lead cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">📬</div>
          <div className="text-sm text-gray-500">No leads yet. They will appear here when someone submits the contact form.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">{lead.name}</span>
                    <span className={"text-[10px] px-2 py-0.5 rounded border font-medium " + getStatusStyle(lead.status)}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] text-gray-600">{timeAgo(lead.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-400">{lead.email}</span>
                    {lead.company && <span className="text-xs text-gray-500">• {lead.company}</span>}
                    {lead.interest && <span className="text-xs text-gray-500">• Interested in: {lead.interest}</span>}
                    <span className="text-[10px] text-gray-600">via {lead.source?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    className="text-xs text-gray-500 hover:text-blue-400 transition"
                  >
                    {expandedLead === lead.id ? 'Collapse' : 'Details'}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedLead === lead.id && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Phone</div>
                      <div className="text-sm text-white">{lead.phone || '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Submitted</div>
                      <div className="text-sm text-white">{new Date(lead.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  {lead.message && (
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Message</div>
                      <div className="text-sm text-gray-300 bg-white/[0.02] border border-white/5 rounded-lg p-3 whitespace-pre-wrap">{lead.message}</div>
                    </div>
                  )}

                  {/* Status change buttons */}
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase mb-2">Update Status</div>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateStatus(lead.id, opt.value)}
                          className={"px-3 py-1.5 rounded-lg text-xs font-medium transition border " +
                            (lead.status === opt.value
                              ? opt.color + ' border-current'
                              : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10')}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
