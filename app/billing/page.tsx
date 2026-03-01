'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface Sub { plan: string; status: string; current_period_end: string; stripe_customer_id: string; }

const PLAN_DISPLAY: Record<string, { name: string; price: number }> = {
  starter: { name: 'Starter', price: 499 },
  professional: { name: 'Professional', price: 1200 },
  enterprise: { name: 'Enterprise', price: 2499 },
};

export default function BillingPage() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) { setLoading(false); return; }
      setUserId(session.user.id);
      const { data } = await sb.from('subscriptions').select('*').eq('user_id', session.user.id).single();
      setSub(data);
      setLoading(false);
    };
    load();
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#F4F5F7]"><div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin"></div></div>;

  const plan = sub ? PLAN_DISPLAY[sub.plan] || { name: sub.plan, price: 0 } : null;

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Billing</h1>

        {!sub ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">{'\uD83D\uDCB3'}</div>
            <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
            <p className="text-sm text-[#6B7280] mb-6">Choose a plan to unlock your AI Employees.</p>
            <a href="/pricing" className="inline-block px-6 py-3 bg-[#1B2A4A] text-white rounded-xl font-semibold text-sm hover:bg-blue-500 transition">View Plans</a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{plan?.name} Plan</h2>
                  <p className="text-3xl font-bold mt-1">{'$' + (plan?.price || 0).toLocaleString()}<span className="text-sm text-[#9CA3AF] font-normal">/month</span></p>
                </div>
                <span className={'px-3 py-1 rounded-full text-xs font-medium ' + (sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : sub.status === 'past_due' ? 'bg-red-50 text-red-600' : 'bg-gray-500/10 text-[#6B7280]')}>{sub.status}</span>
              </div>
              {sub.current_period_end && <p className="text-xs text-[#9CA3AF] mt-3">Renews {new Date(sub.current_period_end).toLocaleDateString()}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={openPortal} disabled={portalLoading} className="flex-1 py-3 bg-white shadow-sm text-white rounded-xl font-semibold text-sm hover:bg-gray-100 transition">{portalLoading ? 'Opening...' : 'Manage Subscription'}</button>
              <a href="/pricing" className="flex-1 py-3 bg-[#1B2A4A] text-white rounded-xl font-semibold text-sm hover:bg-blue-500 transition text-center">Change Plan</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}