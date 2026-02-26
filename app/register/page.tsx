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
