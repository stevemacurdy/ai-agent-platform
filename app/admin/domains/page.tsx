'use client';
import { useState, useEffect } from 'react';

interface Domain {
  id: string;
  domain: string;
  status: string;
  verified_at: string | null;
  created_at: string;
  company_id: string;
  companies: { name: string; slug: string } | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDomains();
    loadCompanies();
  }, []);

  async function loadDomains() {
    try {
      const res = await fetch('/api/admin/domains');
      const data = await res.json();
      setDomains(data.domains || []);
    } catch (e) {
      console.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const res = await fetch('/api/admin/companies');
      const data = await res.json();
      setCompanies(data.companies || data || []);
    } catch (e) {
      console.error('Failed to load companies');
    }
  }

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain || !selectedCompany) return;
    setAdding(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain, company_id: selectedCompany }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Added ${newDomain}. ${data.setup_instructions?.step_1 || ''}`);
        setNewDomain('');
        loadDomains();
      } else {
        setMessage(data.error || 'Failed to add domain');
      }
    } catch (e) {
      setMessage('Failed to add domain');
    } finally {
      setAdding(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/domains?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadDomains();
    } catch (e) {
      console.error('Failed to update domain');
    }
  }

  async function deleteDomain(id: string, domain: string) {
    if (!confirm(`Delete ${domain}? Make sure to also remove it from Vercel Dashboard.`)) return;
    try {
      const res = await fetch(`/api/admin/domains?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadDomains();
    } catch (e) {
      console.error('Failed to delete domain');
    }
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-600 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    verifying: 'bg-blue-100 text-blue-600 border-blue-500/30',
    failed: 'bg-red-500/20 text-red-600 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-[#06080D] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Custom Domains</h1>
        <p className="text-[#6B7280] mb-8">Assign custom domains to company portals for white-label access.</p>

        {/* Add Domain Form */}
        <div className="bg-[#0D1117] border border-[#E5E7EB] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Add Domain</h2>
          <form onSubmit={addDomain} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="app.clientname.com"
              className="flex-1 bg-[#161B22] border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:border-[#2A9D8F] focus:outline-none"
            />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-[#161B22] border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:border-[#2A9D8F] focus:outline-none"
            >
              <option value="">Select company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={adding || !newDomain || !selectedCompany}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              {adding ? 'Adding...' : 'Add Domain'}
            </button>
          </form>
          {message && (
            <p className="mt-3 text-sm text-[#4B5563] bg-[#161B22] p-3 rounded">{message}</p>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-[#0D1117] border border-[#E5E7EB] rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Setup Steps</h2>
          <ol className="text-sm text-[#6B7280] space-y-2 list-decimal list-inside">
            <li>Add the domain here and note the company assignment</li>
            <li>Go to <a href="https://vercel.com/steve-macurdys-projects/ai-agent-platform/settings/domains" target="_blank" className="text-blue-600 hover:underline">Vercel Dashboard → Domains</a> and add the same domain</li>
            <li>Configure DNS: create a <code className="bg-gray-100 px-1 rounded">CNAME</code> record pointing to <code className="bg-gray-100 px-1 rounded">cname.vercel-dns.com</code></li>
            <li>Wait for SSL certificate (usually &lt; 5 minutes)</li>
            <li>Set status to <strong>Active</strong> below</li>
          </ol>
        </div>

        {/* Domains Table */}
        <div className="bg-[#0D1117] border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#161B22] text-[#6B7280]">
              <tr>
                <th className="text-left p-3 font-medium">Domain</th>
                <th className="text-left p-3 font-medium">Company</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Added</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-[#9CA3AF]">Loading...</td></tr>
              ) : domains.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-[#9CA3AF]">No custom domains configured</td></tr>
              ) : domains.map((d) => (
                <tr key={d.id} className="border-t border-[#E5E7EB] hover:bg-[#161B22]">
                  <td className="p-3">
                    <a href={`https://${d.domain}`} target="_blank" className="text-blue-600 hover:underline">
                      {d.domain}
                    </a>
                  </td>
                  <td className="p-3 text-[#4B5563]">{d.companies?.name || '—'}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded border text-xs ${statusColors[d.status] || ''}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-[#9CA3AF]">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right space-x-2">
                    {d.status !== 'active' && (
                      <button onClick={() => updateStatus(d.id, 'active')} className="text-green-600 hover:underline text-xs">
                        Activate
                      </button>
                    )}
                    {d.status === 'active' && (
                      <button onClick={() => updateStatus(d.id, 'pending')} className="text-yellow-600 hover:underline text-xs">
                        Deactivate
                      </button>
                    )}
                    <button onClick={() => deleteDomain(d.id, d.domain)} className="text-red-600 hover:underline text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
