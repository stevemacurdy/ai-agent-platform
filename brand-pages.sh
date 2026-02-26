#!/bin/bash
# WoulfAI Brand Redesign — Login, Register, Portal Dashboard
# Run from your ai-agent-platform root directory:
#   bash brand-pages.sh
# Then: npm run build && git add -A && git commit -m "Brand: Login, Register, Portal redesign" && vercel --prod && git push

set -e

# Also clean up the accidental mnt/ directory if it exists
if [ -d "mnt" ]; then
  rm -rf mnt/
  echo "✓ Cleaned up accidental mnt/ directory"
fi

echo "Writing app/login/page.tsx..."
cat > app/login/page.tsx << 'LOGINEOF'
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
      router.push(data.redirect || '/portal');
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
LOGINEOF
echo "✓ app/login/page.tsx written"


echo "Writing app/register/page.tsx..."
cat > app/register/page.tsx << 'REGISTEREOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength] || '';
  const strengthColor = ['#E5E7EB', '#DC4F4F', '#F5920B', '#2A9D8F', '#2A9D8F'][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, company_name: form.company, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      router.push('/login?registered=1');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const inputStyle = { background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#1A1A2E' };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; },
  };

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
          style={{ background: 'radial-gradient(circle, rgba(245,146,11,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(42,157,143,0.1) 0%, transparent 70%)' }} />

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
          <h1 className="text-[40px] font-black text-white leading-[1.1] tracking-tight">
            Build Your<br /><span style={{ color: '#F5920B' }}>AI Workforce</span>
          </h1>
          <p className="mt-5 text-white/45 leading-relaxed text-[15px]">
            Create your workspace and start hiring AI Employees in minutes. No consultants, no complex setup — just choose the roles you need and let them get to work.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: '🏢', text: 'Your own company workspace with team management' },
              { icon: '🤖', text: 'Access to 21+ AI Employees across every department' },
              { icon: '🔗', text: 'Integrations with QuickBooks, HubSpot, NetSuite & more' },
              { icon: '📊', text: 'Real-time performance tracking dashboard' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{item.icon}</span>
                <span className="text-[13px] text-white/50 leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Image src="/woulf-badge.png" alt="Woulf Group" width={28} height={28} className="opacity-40"
            style={{ animation: 'float 4s ease-in-out infinite' }} />
          <p className="text-[11px] text-white/20">Enterprise security · SOC 2 ready · Tenant isolated</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/woulf-badge.png" alt="Woulf Group" width={40} height={40} className="drop-shadow-lg" />
              <span className="text-xl font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
                Woulf<span style={{ color: '#F5920B' }}>AI</span>
              </span>
            </Link>
          </div>

          <h2 className="text-[28px] font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
            Start hiring AI Employees
          </h2>
          <p className="mt-1.5 text-[15px] text-gray-500">Create your workspace — it takes under 60 seconds</p>

          {error && (
            <div className="mt-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(220,79,79,0.08)', color: '#DC4F4F', border: '1px solid rgba(220,79,79,0.15)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Your Name</label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Steve" required autoFocus
                  className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all" style={inputStyle} {...focusHandlers} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Company</label>
                <input type="text" value={form.company} onChange={set('company')} placeholder="Acme Inc"
                  className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all" style={inputStyle} {...focusHandlers} />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Work Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required
                className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all" style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 8 characters" required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-[15px] outline-none transition-all" style={inputStyle} {...focusHandlers} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: i <= strength ? strengthColor : '#E5E7EB' }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Confirm Password</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" required
                className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all"
                style={{ ...inputStyle, borderColor: form.confirm && form.confirm !== form.password ? '#DC4F4F' : '#E5E7EB' }}
                {...focusHandlers} />
              {form.confirm && form.confirm !== form.password && (
                <p className="mt-1 text-[12px]" style={{ color: '#DC4F4F' }}>Passwords don&apos;t match</p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeLinecap="round" />
                  </svg>
                  Creating workspace...
                </span>
              ) : 'Create Your Workspace'}
            </button>
          </form>

          <p className="mt-4 text-center text-[12px] text-gray-400">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
          <div className="mt-6 text-center">
            <p className="text-[14px] text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold hover:underline" style={{ color: '#1B2A4A' }}>Sign in</Link>
            </p>
          </div>
          <p className="mt-10 text-center text-[11px] text-gray-400">© 2026 WoulfAI by Woulf Group · Grantsville, UT</p>
        </div>
      </div>
    </div>
  );
}
REGISTEREOF
echo "✓ app/register/page.tsx written"


echo "Writing app/portal/page.tsx..."
cat > app/portal/page.tsx << 'PORTALEOF'
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Agent { id: string; name: string; slug: string; description?: string; category?: string; icon?: string; status?: string; }
interface User { id: string; email: string; name?: string; role?: string; company_id?: string; }

const CAT_COLORS: Record<string, string> = { Finance: '#F5920B', Operations: '#2A9D8F', Revenue: '#1B2A4A', People: '#6366F1', Legal: '#8B5CF6', default: '#2A9D8F' };
const ICONS: Record<string, string> = { cfo: '💰', wms: '🏭', sales: '🎯', marketing: '📢', operations: '⚙️', hr: '👥', support: '🎧', training: '📚', seo: '🔍', compliance: '📋', legal: '⚖️', research: '🧪', str: '🏠', 'supply-chain': '🚛', 'org-lead': '🏢' };

export default function PortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const welcome = searchParams.get('welcome');

  useEffect(() => {
    async function load() {
      try {
        const [userRes, agentsRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/agents')]);
        if (!userRes.ok) { router.push('/login'); return; }
        const userData = await userRes.json();
        setUser(userData.user || userData);
        if (agentsRes.ok) { const d = await agentsRes.json(); setAgents(d.agents || d || []); }
      } catch { router.push('/login'); } finally { setLoading(false); }
    }
    load();
  }, [router]);

  const filtered = agents.filter((a) => a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.category?.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeCount = agents.filter((a) => a.status === 'active' || !a.status).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-[3px] mx-auto mb-4" style={{ borderColor: '#E5E7EB', borderTopColor: '#2A9D8F', animation: 'spin 0.8s linear infinite' }} />
        <p className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading your workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', color: '#1A1A2E', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
        h1, h2, h3, h4 { font-family: 'Outfit', 'DM Sans', sans-serif; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.1s; }
        .fade-up-3 { animation-delay: 0.15s; }
      `}</style>

      {/* TOPBAR */}
      <nav className="sticky top-0 z-50 px-6 sm:px-8"
        style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px) saturate(1.6)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={36} height={36} className="drop-shadow-lg group-hover:scale-105 transition-transform" />
            <span className="text-lg font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/billing" className="hidden sm:flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              Billing
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-all" onClick={() => router.push('/admin')}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: '#2A9D8F' }}>
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-[13px] text-white/70 font-medium max-w-[120px] truncate">{user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {welcome && (
          <div className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-3 fade-up"
            style={{ background: 'linear-gradient(135deg, rgba(42,157,143,0.06) 0%, rgba(245,146,11,0.04) 100%)', border: '1px solid rgba(42,157,143,0.12)' }}>
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-[15px] font-bold" style={{ color: '#1B2A4A' }}>Welcome to WoulfAI{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</p>
              <p className="text-[13px] text-gray-500">Your workspace is ready. Start by exploring your AI Employees below.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 fade-up">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>Your AI Team</h1>
            <p className="mt-1 text-[15px] text-gray-500">{activeCount} AI Employee{activeCount !== 1 ? 's' : ''} working for you</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search employees..."
                className="pl-10 pr-4 py-2.5 rounded-xl text-[14px] outline-none transition-all w-[200px] sm:w-[260px]"
                style={{ background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#1A1A2E' }}
                onFocus={(e) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
            </div>
            {user?.role === 'admin' && (
              <Link href="/admin" className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-px"
                style={{ background: '#1B2A4A', color: '#fff', boxShadow: '0 2px 8px rgba(27,42,74,0.15)' }}>
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 fade-up fade-up-1">
          {[
            { label: 'Active Employees', value: String(activeCount), icon: '🤖', accent: '#2A9D8F' },
            { label: 'Total Agents', value: String(agents.length), icon: '📊', accent: '#1B2A4A' },
            { label: 'Uptime', value: '99.9%', icon: '⚡', accent: '#2A9D8F' },
            { label: 'Team Status', value: 'Healthy', icon: '✅', accent: '#2A9D8F' },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-white border transition-all hover:-translate-y-px hover:shadow-lg"
              style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{stat.icon}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: stat.accent, animation: 'pulse-dot 2s infinite' }} />
              </div>
              <p className="text-2xl font-extrabold tracking-tight" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>{stat.value}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Agent grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-up fade-up-2">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-bold" style={{ color: '#1B2A4A' }}>{searchQuery ? 'No employees match your search' : 'No AI Employees yet'}</p>
              <p className="text-[14px] text-gray-500 mt-1.5">{searchQuery ? 'Try a different search term' : 'Contact your admin to enable AI Employees for your workspace'}</p>
            </div>
          ) : filtered.map((agent) => {
            const catColor = CAT_COLORS[agent.category || ''] || CAT_COLORS.default;
            const icon = agent.icon || ICONS[agent.slug] || '🤖';
            return (
              <Link key={agent.id || agent.slug} href={`/portal/agent/${agent.slug || agent.id}`}
                className="group p-6 rounded-2xl bg-white border transition-all duration-200 hover:-translate-y-[3px] hover:shadow-xl relative overflow-hidden"
                style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
                <div className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                  style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}88)` }} />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${catColor}10` }}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[15px] truncate" style={{ color: '#1B2A4A' }}>{agent.name}</h3>
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: agent.status === 'inactive' ? '#E5E7EB' : '#2A9D8F', animation: agent.status !== 'inactive' ? 'pulse-dot 2s infinite' : 'none' }} />
                    </div>
                    {agent.category && (
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: `${catColor}10`, color: catColor }}>{agent.category}</span>
                    )}
                    {agent.description && <p className="text-[12px] text-gray-500 mt-2 leading-relaxed line-clamp-2">{agent.description}</p>}
                  </div>
                </div>
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4 fade-up fade-up-3">
          {[
            { href: '/warehouse', icon: '🏭', label: 'Warehouse Portal', desc: 'Inventory, pallets, orders' },
            { href: '/agents/cfo/console', icon: '💰', label: 'Finance Console', desc: 'Cash flow, invoices, AP' },
            { href: '/agents/sales/coach', icon: '🎯', label: 'Sales Coach', desc: 'Pipeline & deal intelligence' },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border transition-all hover:-translate-y-px hover:shadow-lg"
              style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="font-bold text-[14px]" style={{ color: '#1B2A4A' }}>{link.label}</p>
                <p className="text-[12px] text-gray-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-12 py-6 px-6 sm:px-8 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={20} height={20} className="opacity-50" />
            <span className="text-[11px] text-gray-400">© 2026 WoulfAI by Woulf Group</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/security" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Security</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
PORTALEOF
echo "✓ app/portal/page.tsx written"

echo ""
echo "══════════════════════════════════════════════"
echo "  All 3 pages written. Now run:"
echo "  npm run build && git add -A && git commit -m \"Brand: Login, Register, Portal redesign\" && vercel --prod && git push"
echo "══════════════════════════════════════════════"
