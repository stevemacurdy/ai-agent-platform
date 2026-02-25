// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

interface FeatureRequest {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  votes: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-600',
  reviewed: 'bg-blue-600',
  planned: 'bg-purple-600',
  building: 'bg-yellow-600',
  shipped: 'bg-green-600',
  declined: 'bg-red-600/50',
};

const CATEGORIES = ['general', 'agent', 'integration', 'ui', 'billing', 'other'];

export default function FeatureRequestWidget({ companyId }: { companyId: string }) {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/portal/feature-requests?company_id=${companyId}`)
      .then(r => r.json())
      .then(d => setRequests(d.requests || []))
      .catch(() => {});
  }, [companyId]);

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/portal/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, title, description, category }),
      });
      const data = await res.json();
      if (data.request) {
        setRequests(prev => [data.request, ...prev]);
        setTitle('');
        setDescription('');
        setCategory('general');
        setShowForm(false);
      }
    } catch {}
    setLoading(false);
  };

  const vote = async (id: string) => {
    try {
      const res = await fetch('/api/portal/feature-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, vote: 'up' }),
      });
      const data = await res.json();
      if (data.request) {
        setRequests(prev => prev.map(r => r.id === id ? data.request : r));
      }
    } catch {}
  };

  const visible = expanded ? requests : requests.slice(0, 3);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          Feature Requests
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {showForm ? 'Cancel' : '+ Request'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <input
            type="text"
            placeholder="What would you like to see?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
          />
          <textarea
            placeholder="Tell us more (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-gray-900">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={submit}
              disabled={loading || !title.trim()}
              className="ml-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm text-white font-medium transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-white/30 text-sm">No feature requests yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {visible.map(r => (
            <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <button
                onClick={() => vote(r.id)}
                className="flex flex-col items-center min-w-[40px] py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-xs text-white/60">▲</span>
                <span className="text-sm font-semibold text-white">{r.votes}</span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.title}</p>
                {r.description && (
                  <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{r.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full text-white/80 ${STATUS_COLORS[r.status] || 'bg-gray-600'}`}>
                    {r.status}
                  </span>
                  <span className="text-[10px] text-white/30">{r.category}</span>
                </div>
              </div>
            </div>
          ))}
          {requests.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-400 hover:text-blue-300 mt-2"
            >
              {expanded ? 'Show less' : `View all ${requests.length} requests`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
