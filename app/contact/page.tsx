'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  const params = useSearchParams();
  const interest = params.get('interest') || '';
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '',
    interest: interest || 'general',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus('sent');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="WoulfAI" width={32} height={32} />
            <span className="text-lg font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </Link>
          <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">← Back to Pricing</Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-16">
        {status === 'sent' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
              Message Received!
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              Our team will reach out within 24 hours to discuss your needs.
            </p>
            <Link href="/" className="text-sm font-bold text-white px-6 py-2.5 rounded-xl inline-block"
              style={{ background: '#F5920B' }}>
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                {interest === 'enterprise' ? 'Enterprise Inquiry' : 'Get in Touch'}
              </h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {interest === 'enterprise'
                  ? 'Tell us about your organization and we\'ll create a custom plan.'
                  : 'Have questions? Our team is here to help.'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Company</label>
                  <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Interest</label>
                <select value={form.interest} onChange={e => setForm({...form, interest: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }}>
                  <option value="general">General Inquiry</option>
                  <option value="enterprise">Enterprise Plan</option>
                  <option value="demo">Request a Demo</option>
                  <option value="partnership">Partnership</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border text-sm h-28 resize-none" style={{ borderColor: '#E5E7EB' }}
                  placeholder="Tell us about your needs..." />
              </div>
              <button onClick={handleSubmit} disabled={status === 'sending' || !form.name || !form.email}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px disabled:opacity-50"
                style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'error' && (
                <p className="text-xs text-center" style={{ color: '#DC2626' }}>Something went wrong. Please try again.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
