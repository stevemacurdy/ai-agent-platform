'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in via Supabase browser client directly
      // This ensures getSession() works in AuthGuard, SidebarNav, and all components
      const sb = getSupabaseBrowser();
      const { data, error: authError } = await sb.auth.signInWithPassword({ email, password });

      if (authError || !data.session) {
        setError(authError?.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Store in localStorage for backward compat
      localStorage.setItem('woulfai_token', data.session.access_token);

      // Fetch role from server
      let role = 'free';
      try {
        const meRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + data.session.access_token },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          role = meData.user?.role || 'free';
          localStorage.setItem('woulfai_user', JSON.stringify({
            id: data.user.id, email: data.user.email, role,
            name: meData.user?.display_name || meData.user?.full_name || email.split('@')[0],
          }));
          if (meData.user?.must_reset_password) {
            window.location.href = '/reset-password';
            return;
          }
        }
      } catch { /* role fetch failed, default to free */ }

      // Redirect based on role
      if (role === 'super_admin' || role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = { background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#1A1A2E' };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F4F5F7', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`h1, h2, h3, h4 { font-family: 'Outfit', 'DM Sans', sans-serif; }`}</style>

      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={48} height={48}
              className="drop-shadow-lg group-hover:scale-105 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
                Woulf<span style={{ color: '#F5920B' }}>AI</span>
              </span>
              <span className="text-[9px] uppercase tracking-[2.5px] -mt-0.5" style={{ color: '#9CA3AF' }}>by Woulf Group</span>
            </div>
          </Link>
          <p className="mt-5 text-[15px] text-[#9CA3AF]">Sign in to manage your AI employees</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200/60" style={{ boxShadow: '0 4px 12px rgba(27,42,74,0.06)' }}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all"
                style={inputStyle} {...focusHandlers} autoFocus required />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-[15px] outline-none transition-all"
                  style={inputStyle}
                  {...focusHandlers}
                  required
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" tabIndex={-1}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(220,79,79,0.08)', color: '#DC4F4F', border: '1px solid rgba(220,79,79,0.15)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between">
            <Link href="/forgot-password" className="text-[13px] text-[#6B7280] hover:text-[#6B7280] transition-colors">
              Forgot password?
            </Link>
            <Link href="/register" className="text-[13px] font-bold transition-colors hover:underline" style={{ color: '#1B2A4A' }}>
              Create account &rarr;
            </Link>
          </div>

          {/* Dev quick fills — REMOVE BEFORE PRODUCTION */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-5 border-t" style={{ borderColor: '#E5E7EB' }}>
              <div className="text-[9px] text-[#6B7280] uppercase tracking-wider text-center mb-3">Dev Quick Login</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Steve (Admin)', email: 'steve@woulfgroup.com', pw: 'admin123' },
                  { label: 'Marcus (Employee)', email: 'marcus@woulfgroup.com', pw: 'bravo-delta-42' },
                  { label: 'Rachel (Org Lead)', email: 'paid@enterprise.com', pw: 'ridge-slate-19' },
                  { label: 'Sarah (Beta)', email: 'demo@client1.com', pw: 'nova-peak-55' },
                ].map(q => (
                  <button key={q.email} onClick={() => { setEmail(q.email); setPassword(q.pw); }}
                    className="px-3 py-2 rounded-lg text-[10px] text-[#6B7280] hover:text-[#6B7280] transition-all text-left border"
                    style={{ background: '#FAFBFC', borderColor: '#E5E7EB' }}>
                    <div className="font-medium">{q.label}</div>
                    <div className="text-[#6B7280] truncate">{q.email}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[13px] text-[#6B7280] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold hover:underline" style={{ color: '#1B2A4A' }}>Create your workspace</Link>
        </p>
        <p className="text-center text-[11px] text-[#6B7280] mt-6">© 2026 WoulfAI by Woulf Group</p>
      </div>
    </div>
  );
}
