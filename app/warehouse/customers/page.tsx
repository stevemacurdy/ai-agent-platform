// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [form, setForm] = useState({ customer_name: '', customer_code: '', contact_name: '', contact_email: '', contact_phone: '', address: '', city: '', state: '', zip: '', order_email: '' });

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;

      const { data: memberships } = await sb
        .from('company_members')
        .select('company_id, companies(portal_type)')
        .eq('user_id', session.user.id);

      const wh = memberships?.find(
        (m: any) => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both'
      ) || memberships?.[0];

      if (!wh) return;
      setCompanyId(wh.company_id);

      const { data } = await sb
        .from('warehouse_customers')
        .select('*')
        .eq('company_id', wh.company_id)
        .order('customer_name');

      setCustomers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const addCustomer = async () => {
    if (!companyId || !form.customer_name || !form.customer_code) return;
    const sb = getSupabaseBrowser();
    const { data, error } = await sb
      .from('warehouse_customers')
      .insert({ company_id: companyId, ...form, is_active: true })
      .select()
      .single();

    if (data) {
      setCustomers(prev => [...prev, data].sort((a, b) => a.customer_name.localeCompare(b.customer_name)));
      setForm({ customer_name: '', customer_code: '', contact_name: '', contact_email: '', contact_phone: '', address: '', city: '', state: '', zip: '', order_email: '' });
      setShowAdd(false);
    }
    if (error) alert(error.message);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const sb = getSupabaseBrowser();
    await sb.from('warehouse_customers').update({ is_active: !current }).eq('id', id);
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-white/40 mt-1">{customers.filter(c => c.is_active).length} active customers</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors"
        >
          {showAdd ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">New Customer</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'customer_name', label: 'Company Name', required: true },
              { key: 'customer_code', label: 'Customer Code', required: true },
              { key: 'contact_name', label: 'Contact Name' },
              { key: 'contact_email', label: 'Contact Email' },
              { key: 'contact_phone', label: 'Phone' },
              { key: 'order_email', label: 'Order Notification Email' },
              { key: 'address', label: 'Address' },
              { key: 'city', label: 'City' },
              { key: 'state', label: 'State' },
              { key: 'zip', label: 'ZIP' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-white/50 mb-1">{f.label}{f.required && ' *'}</label>
                <input
                  type="text"
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <button
            onClick={addCustomer}
            disabled={!form.customer_name || !form.customer_code}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors"
          >
            Add Customer
          </button>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Code</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Contact</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Location</th>
              <th className="text-center px-4 py-3 text-xs text-white/40 font-medium uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No customers yet</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{c.customer_code}</td>
                  <td className="px-4 py-3 text-white font-medium">{c.customer_name}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">{c.contact_name || '—'}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{c.contact_email || '—'}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(c.id, c.is_active)}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-600/50 text-green-300' : 'bg-red-600/50 text-red-300'}`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
