'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';
import Image from 'next/image';

const STEPS = ['Welcome', 'Company', 'Connect', 'Team', 'Launch'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              style={{
                background: i <= current ? '#1B2A4A' : '#E5E7EB',
                color: i <= current ? '#fff' : '#9CA3AF',
                boxShadow: i === current ? '0 0 0 3px rgba(27,42,74,0.15)' : 'none',
              }}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-[10px] mt-1.5 font-medium" style={{ color: i <= current ? '#1B2A4A' : '#9CA3AF' }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="w-10 h-[2px] mx-1 mt-[-14px]" style={{ background: i < current ? '#1B2A4A' : '#E5E7EB' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function WelcomeStep({ bundleName, onNext }: { bundleName: string; onNext: () => void }) {
  return (
    <div className="text-center max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(42,157,143,0.1)' }}>
        <span className="text-4xl">🎉</span>
      </div>
      <h1 className="text-3xl font-extrabold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
        Welcome to WoulfAI!
      </h1>
      <p className="text-[#6B7280] mb-2">
        Your <strong className="text-[#1B2A4A]">{bundleName}</strong> subscription is now active.
      </p>
      <p className="text-sm text-[#9CA3AF] mb-8">
        Let&apos;s get your workspace set up in just a few minutes. You can always come back and change these settings later.
      </p>
      <button
        onClick={onNext}
        className="px-8 py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px"
        style={{ background: '#1B2A4A', boxShadow: '0 4px 16px rgba(27,42,74,0.2)' }}
      >
        Let&apos;s Get Started →
      </button>
    </div>
  );
}

function CompanyStep({ companyName, setCompanyName, industry, setIndustry, size, setSize, onNext, onBack }: {
  companyName: string; setCompanyName: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  size: string; setSize: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const industries = ['Technology', 'E-Commerce', 'Logistics & Distribution', 'Manufacturing', 'Professional Services', 'Retail', 'Healthcare', 'Finance', 'Other'];
  const sizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Tell Us About Your Business</h2>
      <p className="text-sm text-[#9CA3AF] mb-8">This helps your AI employees understand your context.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">Company Name</label>
          <input
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1B2A4A] placeholder-[#C4C9D2] focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">Industry</label>
          <select
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1B2A4A] focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] transition appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%239CA3AF' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
          >
            <option value="">Select industry...</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">Company Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: size === s ? '#1B2A4A' : '#fff',
                  color: size === s ? '#fff' : '#6B7280',
                  border: size === s ? '2px solid #1B2A4A' : '2px solid #E5E7EB',
                }}
              >
                {s} people
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-10">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#6B7280] border-2 border-[#E5E7EB] hover:border-[#9CA3AF] transition">Back</button>
        <button
          onClick={onNext}
          disabled={!companyName.trim()}
          className="flex-1 py-3 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0"
          style={{ background: '#1B2A4A' }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function ConnectStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const integrations = [
    { name: 'QuickBooks', icon: '📗', category: 'Accounting', status: 'available' },
    { name: 'Xero', icon: '📘', category: 'Accounting', status: 'available' },
    { name: 'Odoo', icon: '🟣', category: 'ERP / Accounting', status: 'available' },
    { name: 'HubSpot', icon: '🟠', category: 'CRM', status: 'available' },
    { name: 'Salesforce', icon: '☁️', category: 'CRM', status: 'available' },
    { name: 'Shopify', icon: '🛒', category: 'E-Commerce', status: 'available' },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Connect Your Software</h2>
      <p className="text-sm text-[#9CA3AF] mb-8">Your AI employees work best when connected to your tools. You can always add more later.</p>

      <div className="grid grid-cols-2 gap-3">
        {integrations.map(int => (
          <button
            key={int.name}
            className="flex items-center gap-3 p-4 bg-white border-2 border-[#E5E7EB] rounded-xl text-left hover:border-[#2A9D8F] hover:shadow-md transition-all group"
          >
            <span className="text-2xl">{int.icon}</span>
            <div>
              <div className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#2A9D8F] transition">{int.name}</div>
              <div className="text-[10px] text-[#9CA3AF]">{int.category}</div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-center text-[#9CA3AF] mt-4">
        🔒 Connections are encrypted and you can disconnect anytime.
      </p>

      <div className="flex gap-3 mt-10">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#6B7280] border-2 border-[#E5E7EB] hover:border-[#9CA3AF] transition">Back</button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px"
          style={{ background: '#1B2A4A' }}
        >
          Continue →
        </button>
      </div>
      <button onClick={onNext} className="block mx-auto mt-3 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition">
        Skip for now
      </button>
    </div>
  );
}

function TeamStep({ invites, setInvites, onNext, onBack }: {
  invites: string[]; setInvites: (v: string[]) => void;
  onNext: () => void; onBack: () => void;
}) {
  const updateInvite = (i: number, val: string) => {
    const copy = [...invites];
    copy[i] = val;
    setInvites(copy);
  };
  const addRow = () => setInvites([...invites, '']);
  const removeRow = (i: number) => setInvites(invites.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>Invite Your Team</h2>
      <p className="text-sm text-[#9CA3AF] mb-8">Your team members will get access to the AI employees in your plan.</p>

      <div className="space-y-3">
        {invites.map((email, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={email}
              onChange={e => updateInvite(i, e.target.value)}
              placeholder="colleague@company.com"
              type="email"
              className="flex-1 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1B2A4A] placeholder-[#C4C9D2] focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] transition"
            />
            {invites.length > 1 && (
              <button onClick={() => removeRow(i)} className="w-10 h-10 my-auto rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition flex items-center justify-center text-lg">×</button>
            )}
          </div>
        ))}
      </div>

      {invites.length < 10 && (
        <button onClick={addRow} className="mt-3 text-sm font-medium text-[#2A9D8F] hover:text-[#1B2A4A] transition">
          + Add another
        </button>
      )}

      <div className="flex gap-3 mt-10">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#6B7280] border-2 border-[#E5E7EB] hover:border-[#9CA3AF] transition">Back</button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px"
          style={{ background: '#1B2A4A' }}
        >
          Continue →
        </button>
      </div>
      <button onClick={onNext} className="block mx-auto mt-3 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition">
        Skip for now
      </button>
    </div>
  );
}

function LaunchStep({ companyName }: { companyName: string }) {
  return (
    <div className="text-center max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(42,157,143,0.1)' }}>
        <span className="text-4xl">🚀</span>
      </div>
      <h1 className="text-3xl font-extrabold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
        You&apos;re All Set!
      </h1>
      <p className="text-[#6B7280] mb-8">
        <strong className="text-[#1B2A4A]">{companyName || 'Your company'}</strong> is ready to go.
        Your AI employees are standing by — let&apos;s put them to work.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-10 max-w-sm mx-auto">
        <Link
          href="/dashboard"
          className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#1B2A4A] hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-2">📊</span>
          <span className="text-sm font-semibold text-[#1B2A4A]">Dashboard</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">See your overview</span>
        </Link>
        <Link
          href="/onboarding"
          className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F] hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-2">🤖</span>
          <span className="text-sm font-semibold text-[#1B2A4A]">AI Employees</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">Set up your team</span>
        </Link>
        <Link
          href="/settings"
          className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#6B7280] hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-2">⚙️</span>
          <span className="text-sm font-semibold text-[#1B2A4A]">Settings</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">Customize workspace</span>
        </Link>
        <Link
          href="/billing"
          className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#6B7280] hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-2">💳</span>
          <span className="text-sm font-semibold text-[#1B2A4A]">Billing</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">Manage your plan</span>
        </Link>
      </div>

      <Link
        href="/dashboard"
        className="inline-block px-10 py-3.5 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px"
        style={{ background: '#1B2A4A', boxShadow: '0 4px 16px rgba(27,42,74,0.2)' }}
      >
        Go to Dashboard →
      </Link>
    </div>
  );
}

export default function PostPurchaseWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [step, setStep] = useState(0);
  const [bundleName, setBundleName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [invites, setInvites] = useState(['']);
  const [saving, setSaving] = useState(false);

  // Fetch bundle info from session
  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/stripe/session?session_id=' + sessionId);
        if (res.ok) {
          const data = await res.json();
          setBundleName(data.bundleName || 'WoulfAI');
        }
      } catch {
        setBundleName('WoulfAI');
      }
    };
    fetchSession();
  }, [sessionId]);

  // Save company details when moving past company step
  const saveCompanyDetails = async () => {
    if (!companyName.trim()) return;
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        // Update the auto-created company name
        const { data: sub } = await sb.from('subscriptions').select('company_id').eq('user_id', session.user.id).single();
        if (sub?.company_id) {
          await sb.from('companies').update({
            name: companyName,
            metadata: { industry, company_size: companySize },
          }).eq('id', sub.company_id);
        }
      }
    } catch (err) {
      console.error('Failed to save company:', err);
    }
    setSaving(false);
  };

  // Send team invites
  const sendInvites = async () => {
    const validEmails = invites.filter(e => e.includes('@'));
    if (validEmails.length === 0) return;
    setSaving(true);
    try {
      await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: validEmails }),
      });
    } catch (err) {
      console.error('Failed to send invites:', err);
    }
    setSaving(false);
  };

  const handleNext = async () => {
    if (step === 1) await saveCompanyDetails();
    if (step === 3) await sendInvites();
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  // If no session_id, show the original onboarding hub
  if (!sessionId) {
    router.replace('/onboarding');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-4">
        <Image src="/woulf-badge.png" alt="WoulfAI" width={40} height={40} className="mx-auto mb-4" />
      </div>

      <StepIndicator current={step} />

      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-12 shadow-sm">
        {step === 0 && <WelcomeStep bundleName={bundleName} onNext={handleNext} />}
        {step === 1 && <CompanyStep companyName={companyName} setCompanyName={setCompanyName} industry={industry} setIndustry={setIndustry} size={companySize} setSize={setCompanySize} onNext={handleNext} onBack={handleBack} />}
        {step === 2 && <ConnectStep onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <TeamStep invites={invites} setInvites={setInvites} onNext={handleNext} onBack={handleBack} />}
        {step === 4 && <LaunchStep companyName={companyName} />}
      </div>

      {step < 4 && (
        <p className="text-center text-[10px] text-[#C4C9D2] mt-6">
          You can always change these settings later in your dashboard.
        </p>
      )}
    </div>
  );
}
