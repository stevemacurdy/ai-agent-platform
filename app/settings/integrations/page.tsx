'use client';
import { useState, useEffect } from 'react';

const INTEGRATIONS = [
  { id: 'quickbooks', name: 'QuickBooks', icon: '📗', category: 'Accounting', desc: 'Sync invoices, expenses, and financial data' },
  { id: 'xero', name: 'Xero', icon: '📘', category: 'Accounting', desc: 'Cloud accounting integration' },
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', category: 'CRM', desc: 'Contacts, deals, and pipeline sync' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'CRM', desc: 'Enterprise CRM integration' },
  { id: 'odoo', name: 'Odoo', icon: '🟣', category: 'ERP', desc: 'Full ERP with inventory and manufacturing' },
  { id: 'slack', name: 'Slack', icon: '💬', category: 'Communication', desc: 'Notifications and alerts' },
  { id: 'bamboohr', name: 'BambooHR', icon: '🌿', category: 'HRIS', desc: 'Employee records and HR management' },
  { id: 'zendesk', name: 'Zendesk', icon: '🎯', category: 'Support', desc: 'Ticket management and customer support' },
];

interface Connection { integration_id: string; status: string; last_sync?: string; error?: string; }

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations/list')
      .then(r => r.json())
      .then(d => { setConnections(d.connections || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getStatus = (id: string): Connection | undefined => connections.find(c => c.integration_id === id);

  const getHealth = (conn?: Connection) => {
    if (!conn || conn.status !== 'active') return { color: '#9CA3AF', label: 'Not connected', dot: '⚪' };
    if (conn.error) return { color: '#DC2626', label: 'Error', dot: '🔴' };
    if (conn.last_sync) {
      const mins = (Date.now() - new Date(conn.last_sync).getTime()) / 60000;
      if (mins < 60) return { color: '#2A9D8F', label: 'Healthy', dot: '🟢' };
      if (mins < 1440) return { color: '#F5920B', label: 'Stale', dot: '🟡' };
      return { color: '#DC2626', label: 'Stale (>24h)', dot: '🔴' };
    }
    return { color: '#2A9D8F', label: 'Connected', dot: '🟢' };
  };

  const handleConnect = async (id: string) => {
    setConnecting(id);
    try {
      const res = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Connection failed');
    } catch { alert('Failed to connect'); }
    finally { setConnecting(null); }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this integration? AI Employees using it will switch to demo data.')) return;
    try {
      await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: id }),
      });
      setConnections(prev => prev.filter(c => c.integration_id !== id));
    } catch { alert('Failed to disconnect'); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <h1 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Integrations</h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Connect your business tools to power your AI Employees with live data.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map(integ => {
            const conn = getStatus(integ.id);
            const health = getHealth(conn);
            const isConnected = conn?.status === 'active';
            return (
              <div key={integ.id} className="bg-white rounded-xl border p-5 flex flex-col justify-between" style={{ borderColor: isConnected ? '#2A9D8F40' : '#E5E7EB' }}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{integ.icon}</span>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{integ.name}</p>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{integ.category}</p>
                      </div>
                    </div>
                    <span className="text-xs flex items-center gap-1" style={{ color: health.color }}>
                      {health.dot} {health.label}
                    </span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: '#6B7280' }}>{integ.desc}</p>
                  {isConnected && conn?.last_sync && (
                    <p className="text-[10px] mb-3" style={{ color: '#9CA3AF' }}>
                      Last sync: {new Date(conn.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  {isConnected ? (
                    <button onClick={() => handleDisconnect(integ.id)}
                      className="w-full text-xs font-medium py-2 rounded-lg border hover:bg-red-50 transition-colors"
                      style={{ borderColor: '#FCA5A5', color: '#DC2626' }}>
                      Disconnect
                    </button>
                  ) : (
                    <button onClick={() => handleConnect(integ.id)} disabled={connecting === integ.id}
                      className="w-full text-xs font-bold text-white py-2 rounded-lg disabled:opacity-50"
                      style={{ background: '#2A9D8F' }}>
                      {connecting === integ.id ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-sm font-bold mb-1" style={{ color: '#1B2A4A' }}>Need a different integration?</p>
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          WoulfAI supports 200+ integrations via Unified.to. <a href="https://unified.to/integrations" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#F5920B' }}>Browse the catalog</a> or <a href="/contact" className="underline" style={{ color: '#F5920B' }}>contact us</a> for custom integrations.
        </p>
      </div>
    </div>
  );
}
