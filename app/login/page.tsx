'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registered = searchParams.get('registered');
  const reset = searchParams.get('reset');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid email or password'); setLoading(false); return; }
      if (data.must_reset_password) { router.push('/reset-password'); return; }
      localStorage.setItem("woulfai_token", data.session.access_token);
      router.push(data.redirect || "/portal");
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F5F7', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
        h1, h2, h3, h4 { font-family: 'Outfit', 'DM Sans', sans-serif; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.5s ease-out both; }
      `}</style>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(165deg, #132038 0%, #1B2A4A 40%, #233756 100%)' }}>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L46.2 13.8L60 20L46.2 26.2L40 40L33.8 26.2L20 20L33.8 13.8L40 0z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")` }} />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(42,157,143,0.1) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,146,11,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={48} height={48}
              className="drop-shadow-lg group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Woulf<span style={{ color: '#F5920B' }}>AI</span>
              </span>
              <span className="text-[9px] text-white/35 uppercase tracking-[2.5px] -mt-0.5">by Woulf Group</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(42,157,143,0.12)', color: '#3BB5A6', border: '1px solid rgba(42,157,143,0.25)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#2A9D8F', animation: 'pulse-dot 2s infinite' }} />
            21 AI Employees Ready
          </div>
          <h1 className="text-[40px] font-black text-white leading-[1.1] tracking-tight">
            Your AI Team is<br /><span style={{ color: '#F5920B' }}>Waiting for You</span>
          </h1>
          <p className="mt-5 text-white/45 leading-relaxed text-[15px]">
            Sign in to manage your AI Employees, track their performance, and scale your operations — all from one unified dashboard.
          </p>
          <div className="mt-10 flex flex-wrap gap-5">
            {[{ icon: '🛡️', label: 'SOC 2 Ready' }, { icon: '🔒', label: 'Encrypted' }, { icon: '⚡', label: 'Always On' }].map((b) => (
              <div key={b.label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm">{b.icon}</span>
                <span className="text-[11px] text-white/50 font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Image src="/woulf-badge.png" alt="Woulf Group" width={28} height={28} className="opacity-40"
            style={{ animation: 'float 4s ease-in-out infinite' }} />
          <p className="text-[11px] text-white/20">1,200+ projects · 4M+ sq ft · 6 countries</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/woulf-badge.png" alt="Woulf Group" width={40} height={40} className="drop-shadow-lg" />
              <span className="text-xl font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
                Woulf<span style={{ color: '#F5920B' }}>AI</span>
              </span>
            </Link>
          </div>

          <h2 className="text-[28px] font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
            Welcome back
          </h2>
          <p className="mt-1.5 text-[15px] text-gray-500">Sign in to your WoulfAI workspace</p>

          {registered && (
            <div className="mt-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(42,157,143,0.08)', color: '#2A9D8F', border: '1px solid rgba(42,157,143,0.15)' }}>
              Account created — sign in to get started.
            </div>
          )}
          {reset && (
            <div className="mt-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(42,157,143,0.08)', color: '#2A9D8F', border: '1px solid rgba(42,157,143,0.15)' }}>
              Password reset — you can now sign in.
            </div>
          )}
          {error && (
            <div className="mt-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(220,79,79,0.08)', color: '#DC4F4F', border: '1px solid rgba(220,79,79,0.15)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" required autoFocus
                className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all"
                style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#1A1A2E' }}
                onFocus={(e) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold" style={{ color: '#1B2A4A' }}>Password</label>
                <Link href="/forgot-password" className="text-[12px] font-medium hover:underline" style={{ color: '#2A9D8F' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-[15px] outline-none transition-all"
                  style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#1A1A2E' }}
                  onFocus={(e) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[14px] text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold hover:underline" style={{ color: '#F5920B' }}>Hire your AI Team</Link>
            </p>
          </div>
          <p className="mt-12 text-center text-[11px] text-gray-400">© 2026 WoulfAI by Woulf Group · Grantsville, UT</p>
        </div>
      </div>
    </div>
  );
}
