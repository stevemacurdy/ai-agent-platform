'use client';
import { useState } from 'react';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '🎧' },
  { id: 'tickets', name: 'Tickets', icon: '🎫' },
  { id: 'kb', name: 'Knowledge Base', icon: '📖' },
  { id: 'ai', name: 'AI Responses', icon: '🤖' },
];

const TICKETS = [
  { id: 'T-1042', subject: 'Cannot access inventory dashboard', customer: 'Acme Logistics', priority: 'high', status: 'open', created: '2h ago', assignee: 'AI Auto-Respond' },
  { id: 'T-1041', subject: 'Billing discrepancy on February invoice', customer: 'Summit 3PL', priority: 'high', status: 'in_progress', created: '4h ago', assignee: 'Sarah Kim' },
  { id: 'T-1040', subject: 'How to set up barcode scanning integration', customer: 'Peak Fulfillment', priority: 'medium', status: 'open', created: '6h ago', assignee: 'AI Auto-Respond' },
  { id: 'T-1039', subject: 'Request for API documentation', customer: 'BlueRidge Dist.', priority: 'low', status: 'resolved', created: '1d ago', assignee: 'AI Auto-Respond' },
  { id: 'T-1038', subject: 'Pallet count mismatch in receiving', customer: 'Acme Logistics', priority: 'high', status: 'in_progress', created: '1d ago', assignee: 'Marcus Rivera' },
  { id: 'T-1037', subject: 'Export report to CSV not working', customer: 'Summit 3PL', priority: 'medium', status: 'resolved', created: '2d ago', assignee: 'AI Auto-Respond' },
  { id: 'T-1036', subject: 'Need help with BOL auto-fill setup', customer: 'Peak Fulfillment', priority: 'low', status: 'resolved', created: '3d ago', assignee: 'Sarah Kim' },
];

const KB_ARTICLES = [
  { title: 'Getting Started with WoulfAI', category: 'Onboarding', views: 342, helpful: 94, updated: '2026-02-15' },
  { title: 'How to Set Up Barcode Scanning', category: 'Integrations', views: 256, helpful: 91, updated: '2026-02-10' },
  { title: 'Understanding Your Invoice', category: 'Billing', views: 198, helpful: 88, updated: '2026-02-08' },
  { title: 'Inventory Dashboard Guide', category: 'Features', views: 187, helpful: 92, updated: '2026-02-05' },
  { title: 'API Documentation Overview', category: 'Developer', views: 156, helpful: 85, updated: '2026-01-28' },
  { title: 'BOL Auto-Fill Configuration', category: 'Features', views: 134, helpful: 90, updated: '2026-01-25' },
  { title: 'Troubleshooting Common Errors', category: 'Support', views: 289, helpful: 87, updated: '2026-01-20' },
];

const AI_RESPONSES = [
  { ticket: 'T-1042', question: 'I can\'t access the inventory dashboard since this morning', response: 'I\'ve checked your account and it appears the issue is related to a session timeout after our maintenance window last night. Please try clearing your browser cache and logging in again. If the issue persists, I\'ve escalated this to our technical team for immediate review.', confidence: 92, used: true },
  { ticket: 'T-1040', question: 'How do I connect my barcode scanner to the system?', response: 'Great question! WoulfAI supports USB and Bluetooth barcode scanners. Go to Settings > Integrations > Barcode Scanner and click "Add Device." Most scanners are auto-detected. I\'ve also attached our step-by-step guide: "How to Set Up Barcode Scanning" from our knowledge base.', confidence: 97, used: true },
  { ticket: 'T-1039', question: 'Where can I find the API docs?', response: 'Our API documentation is available at docs.woulfai.com/api. You\'ll find endpoints for inventory management, order processing, and reporting. I\'ve also included a quick-start guide with authentication setup and example requests.', confidence: 95, used: true },
  { ticket: 'T-1037', question: 'CSV export is giving me an error', response: 'This is a known issue with reports exceeding 10,000 rows. We\'ve implemented a fix that splits large exports into batched files. Please try the export again — it should now work. If your report has over 50,000 rows, use the "Scheduled Export" option for background processing.', confidence: 89, used: true },
];

const priorityColor = (p: string) => {
  switch (p) { case 'high': return 'text-rose-400 bg-rose-500/10'; case 'medium': return 'text-amber-600 bg-amber-50'; default: return 'text-[#6B7280] bg-gray-500/10'; }
};

const statusColor = (s: string) => {
  switch (s) { case 'open': return 'text-blue-600 bg-blue-50'; case 'in_progress': return 'text-amber-600 bg-amber-50'; case 'resolved': return 'text-emerald-600 bg-emerald-50'; default: return 'text-[#6B7280] bg-gray-500/10'; }
};

export default function SupportAgent() {
  const [tab, setTab] = useState('overview');

  const openTickets = TICKETS.filter(t => t.status === 'open').length;
  const inProgress = TICKETS.filter(t => t.status === 'in_progress').length;
  const resolved = TICKETS.filter(t => t.status === 'resolved').length;
  const aiHandled = TICKETS.filter(t => t.assignee === 'AI Auto-Respond').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">🎧</div>
        <div>
          <h1 className="text-2xl font-bold">Support Employee</h1>
          <p className="text-sm text-[#6B7280]">Customer support ticketing, knowledge base & AI responses</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Open Tickets</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{openTickets}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">In Progress</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{inProgress}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Resolved</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{resolved}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">AI Handled</div>
          <div className="text-2xl font-bold mt-1 text-purple-600">{Math.round((aiHandled / TICKETS.length) * 100)}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E5E7EB] pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Tickets</h3>
            <div className="space-y-2">
              {TICKETS.slice(0, 4).map(t => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm text-white">{t.subject}</div><div className="text-[10px] text-[#9CA3AF]">{t.id} · {t.customer} · {t.created}</div></div>
                  <span className={'text-[9px] px-2 py-0.5 rounded-full ' + statusColor(t.status)}>{t.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Top KB Articles</h3>
            <div className="space-y-2">
              {KB_ARTICLES.slice(0, 5).map(a => (
                <div key={a.title} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm text-white">{a.title}</div><div className="text-[10px] text-[#9CA3AF]">{a.category}</div></div>
                  <div className="text-right"><div className="text-xs font-mono">{a.views}</div><div className="text-[10px] text-[#9CA3AF]">views</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tickets */}
      {tab === 'tickets' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E5E7EB] text-[10px] text-[#9CA3AF] uppercase">
              <th className="text-left px-4 py-3">ID</th><th className="text-left px-4 py-3">Subject</th><th className="text-left px-4 py-3">Customer</th><th className="text-left px-4 py-3">Priority</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Assignee</th>
            </tr></thead>
            <tbody>
              {TICKETS.map(t => (
                <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                  <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">{t.id}</td>
                  <td className="px-4 py-3 font-medium">{t.subject}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{t.customer}</td>
                  <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded-full ' + priorityColor(t.priority)}>{t.priority}</span></td>
                  <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded-full ' + statusColor(t.status)}>{t.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{t.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Knowledge Base */}
      {tab === 'kb' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E5E7EB] text-[10px] text-[#9CA3AF] uppercase">
              <th className="text-left px-4 py-3">Article</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Views</th><th className="text-left px-4 py-3">Helpful %</th><th className="text-left px-4 py-3">Updated</th>
            </tr></thead>
            <tbody>
              {KB_ARTICLES.map(a => (
                <tr key={a.title} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{a.category}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.views}</td>
                  <td className="px-4 py-3"><span className="text-emerald-600 text-xs">{a.helpful}%</span></td>
                  <td className="px-4 py-3 text-xs text-[#9CA3AF]">{a.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Responses */}
      {tab === 'ai' && (
        <div className="space-y-3">
          {AI_RESPONSES.map(r => (
            <div key={r.ticket} className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#9CA3AF]">{r.ticket}</span>
                  <span className={'text-[9px] px-2 py-0.5 rounded-full ' + (r.used ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-500/10 text-[#6B7280]')}>
                    {r.used ? 'Sent to customer' : 'Draft'}
                  </span>
                </div>
                <span className="text-[10px] text-[#9CA3AF]">Confidence: <span className="text-white font-mono">{r.confidence}%</span></span>
              </div>
              <div className="bg-white shadow-sm rounded-lg p-3 mb-2">
                <div className="text-[10px] text-[#9CA3AF] mb-1">Customer asked:</div>
                <div className="text-sm text-[#4B5563]">{r.question}</div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                <div className="text-[10px] text-blue-600 mb-1">AI Response:</div>
                <div className="text-sm text-[#4B5563] leading-relaxed">{r.response}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
