'use client';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { window.location.href = '/login?redirect=/settings/billing'; return; }
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Could not open billing portal');
    } catch { alert('Failed to open billing portal'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <h1 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Billing & Subscription</h1>
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
          Manage your subscription, update payment methods, view invoices, and change your plan through our secure billing portal powered by Stripe.
        </p>
        <button onClick={openPortal} disabled={loading}
          className="text-sm font-bold text-white px-6 py-2.5 rounded-xl disabled:opacity-50"
          style={{ background: '#F5920B' }}>
          {loading ? 'Opening...' : 'Open Billing Portal'}
        </button>
      </div>
    </div>
  );
}
