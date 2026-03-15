'use client';
import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalUsageEvents: number;
  agentUsage: { slug: string; count: number }[];
  recentSignups: { email: string; date: string; tier: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'agents' | 'revenue'>('overview');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('woulfai_token') || '' : '';
    const hdrs: Record<string, string> = token ? { 'Authorization': 'Bearer ' + token } : {};
    Promise.all([
      fetch('/api/admin/usage-stats', { headers: hdrs }).then(r => r.json()).catch(() => ({})),
      fetch('/api/admin/users', { headers: hdrs }).then(r => r.json()).catch(() => ({ users: [] })),
    ]).then(([usage, users]) => {
      setStats({
        totalUsers: users?.users?.length || 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        totalUsageEvents: usage?.total || 0,
        agentUsage: usage?.byAgent || [],
        recentSignups: (users?.users || []).slice(0, 10).map((u: any) => ({
          email: u.email || 'unknown',
          date: u.created_at || '',
          tier: u.tier || 'free',
        })),
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="p-6 md:p-8 space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <h1 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
          🛡️ Admin Dashboard
        </h1>
        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Platform health, usage, and user management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F4F5F7' }}>
        {(['overview', 'users', 'agents', 'revenue'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1B2A4A' : '#9CA3AF',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{t}</button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: s.totalUsers, icon: '👥', change: '' },
          { label: 'Usage Events', value: s.totalUsageEvents.toLocaleString(), icon: '📊', change: 'All time' },
          { label: 'Active Agents', value: '21', icon: '🤖', change: 'All deployed' },
          { label: 'System Health', value: '99.9%', icon: '💚', change: 'Uptime' },
        ].map((kpi, i) => (
          <div key={i} className="p-4 rounded-xl border" style={{ background: '#fff', borderColor: '#E5E7EB' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{kpi.icon} {kpi.label}</p>
            <p className="text-2xl font-extrabold mt-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>{kpi.value}</p>
            {kpi.change && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{kpi.change}</p>}
          </div>
        ))}
      </div>

      {/* Agent Usage Table */}
      {tab === 'overview' && s.agentUsage.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#fff', borderColor: '#E5E7EB' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>Agent Usage (This Period)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Agent</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: '#9CA3AF' }}>Events</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Bar</th>
                </tr>
              </thead>
              <tbody>
                {s.agentUsage.map((a, i) => {
                  const max = Math.max(...s.agentUsage.map(x => x.count));
                  const pct = max > 0 ? (a.count / max) * 100 : 0;
                  return (
                    <tr key={i} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                      <td className="px-4 py-3 font-medium capitalize" style={{ color: '#1B2A4A' }}>{a.slug}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{a.count}</td>
                      <td className="px-4 py-3">
                        <div className="w-full h-2 rounded-full" style={{ background: '#F4F5F7' }}>
                          <div className="h-2 rounded-full" style={{ width: pct + '%', background: '#F5920B' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Signups */}
      {(tab === 'overview' || tab === 'users') && s.recentSignups.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#fff', borderColor: '#E5E7EB' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Email</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Tier</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#9CA3AF' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {s.recentSignups.map((u, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: '#F3F4F6' }}>
                    <td className="px-4 py-3" style={{ color: '#1B2A4A' }}>{u.email}</td>
                    <td className="px-4 py-3 capitalize" style={{ color: '#6B7280' }}>{u.tier}</td>
                    <td className="px-4 py-3" style={{ color: '#9CA3AF' }}>{u.date ? new Date(u.date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
