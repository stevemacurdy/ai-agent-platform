'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';
import Image from 'next/image';

interface Agent {
  id: string;
  slug: string;
  display_name: string;
  short_description: string;
  icon: string;
  color: string;
}

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-10">
      {steps.map((label, i) => (
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
          {i < steps.length - 1 && (
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

function AgentPickerStep({ agents, selected, setSelected, maxPicks, onNext, onBack }: {
  agents: Agent[]; selected: string[]; setSelected: (v: string[]) => void;
  maxPicks: number; onNext: () => void; onBack: () => void;
}) {
  const toggleAgent = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < maxPicks) {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
        Choose Your AI Employees
      </h2>
      <p className="text-sm text-[#9CA3AF] mb-6">
        Select <strong className="text-[#1B2A4A]">{maxPicks}</strong> AI employees for your team.
        <span className="ml-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{
            background: selected.length === maxPicks ? 'rgba(42,157,143,0.1)' : 'rgba(245,146,11,0.1)',
            color: selected.length === maxPicks ? '#2A9D8F' : '#F5920B',
          }}
        >
          {selected.length}/{maxPicks} selected
        </span>
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {agents.map(agent => {
          const isSelected = selected.includes(agent.id);
          const isDisabled = !isSelected && selected.length >= maxPicks;
          return (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              disabled={isDisabled}
              className="relative p-4 rounded-xl border-2 text-left transition-all"
              style={{
                background: isSelected ? 'rgba(27,42,74,0.04)' : '#fff',
                borderColor: isSelected ? '#1B2A4A' : '#E5E7EB',
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#1B2A4A' }}>
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
              <span className="text-2xl block mb-2">{agent.icon}</span>
              <div className="text-sm font-semibold text-[#1B2A4A] leading-tight">{agent.display_name}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-1 leading-snug">{agent.short_description}</div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#6B7280] border-2 border-[#E5E7EB] hover:border-[#9CA3AF] transition">Back</button>
        <button
          onClick={onNext}
          disabled={selected.length !== maxPicks}
          className="flex-1 py-3 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0"
          style={{ background: '#1B2A4A' }}
        >
          Continue with {selected.length} employee{selected.length !== 1 ? 's' : ''} →
        </button>
      </div>
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
    { name: 'QuickBooks', icon: '📗', cat: 'Accounting' },
    { name: 'Xero', icon: '📘', cat: 'Accounting' },
    { name: 'Odoo', icon: '🟣', cat: 'ERP / Accounting' },
    { name: 'HubSpot', icon: '🟠', cat: 'CRM' },
    { name: 'Salesforce', icon: '☁️', cat: 'CRM' },
    { name: 'Shopify', icon: '🛒', cat: 'E-Commerce' },
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
              <div className="text-[10px] text-[#9CA3AF]">{int.cat}</div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-center text-[#9CA3AF] mt-4">🔒 Connections are encrypted and you can disconnect anytime.</p>

      <div className="flex gap-3 mt-10">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#6B7280] border-2 border-[#E5E7EB] hover:border-[#9CA3AF] transition">Back</button>
        <button onClick={onNext} className="flex-1 py-3 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px" style={{ background: '#1B2A4A' }}>Continue →</button>
      </div>
      <button onClick={onNext} className="block mx-auto mt-3 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition">Skip for now</button>
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
        <button onClick={addRow} className="mt-3 text-sm font-medium text-[#2A9D8F] hover:text-[#1B2A4A] transition">+ Add another</button>
      )}

      <div className="flex gap-3 mt-10">
        <button onClick={onBack} className="px-6 py-3 rounded-2xl text-sm font-semibold text-[#6B7280] border-2 border-[#E5E7EB] hover:border-[#9CA3AF] transition">Back</button>
        <button onClick={onNext} className="flex-1 py-3 rounded-2xl text-white font-bold text-[15px] transition-all hover:-translate-y-px" style={{ background: '#1B2A4A' }}>Continue →</button>
      </div>
      <button onClick={onNext} className="block mx-auto mt-3 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition">Skip for now</button>
    </div>
  );
}

function LaunchStep({ companyName }: { companyName: string }) {
  return (
    <div className="text-center max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(42,157,143,0.1)' }}>
        <span className="text-4xl">🚀</span>
      </div>
      <h1 className="text-3xl font-extrabold mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>You&apos;re All Set!</h1>
      <p className="text-[#6B7280] mb-8">
        <strong className="text-[#1B2A4A]">{companyName || 'Your company'}</strong> is ready to go. Your AI employees are standing by.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-10 max-w-sm mx-auto">
        <Link href="/dashboard" className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#1B2A4A] hover:shadow-md transition-all text-center">
          <span className="text-2xl block mb-2">📊</span>
          <span className="text-sm font-semibold text-[#1B2A4A]">Dashboard</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">See your overview</span>
        </Link>
        <Link href="/onboarding" className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#2A9D8F] hover:shadow-md transition-all text-center">
          <span className="text-2xl block mb-2">🤖</span>
          <span className="text-sm font-semibold text-[#1B2A4A]">AI Employees</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">Set up your team</span>
        </Link>
        <Link href="/settings" className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#6B7280] hover:shadow-md transition-all text-center">
          <span className="text-2xl block mb-2">⚙️</span>
          <span className="text-sm font-semibold text-[#1B2A4A]">Settings</span>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">Customize workspace</span>
        </Link>
        <Link href="/billing" className="p-5 bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#6B7280] hover:shadow-md transition-all text-center">
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

// ─── Main Wizard ────────────────────────────────────────
export default function PostPurchaseWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [step, setStep] = useState(0);
  const [bundleName, setBundleName] = useState('');
  const [bundleSlug, setBundleSlug] = useState('');
  const [isPickable, setIsPickable] = useState(false);
  const [maxPicks, setMaxPicks] = useState(3);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [invites, setInvites] = useState(['']);
  const [saving, setSaving] = useState(false);

  // Determine steps based on whether this is a pick-your-own bundle
  const STEPS = isPickable
    ? ['Welcome', 'Choose', 'Company', 'Connect', 'Team', 'Launch']
    : ['Welcome', 'Company', 'Connect', 'Team', 'Launch'];

  // Fetch session info + determine if pickable
  useEffect(() => {
    if (!sessionId) return;
    const init = async () => {
      try {
        const res = await fetch('/api/stripe/session?session_id=' + sessionId);
        if (res.ok) {
          const data = await res.json();
          setBundleName(data.bundleName || 'WoulfAI');
          setBundleSlug(data.bundleSlug || '');

          // Starter pack = pick your own agents
          if (data.bundleSlug === 'starter-pack') {
            setIsPickable(true);
            setMaxPicks(3);

            const sb = getSupabaseBrowser();
            const { data: agents } = await ((sb as any).from('agent_registry')
              .select('id,slug,display_name,short_description,icon,color')
              .eq('status', 'live')
              .order('display_order') as any);

            if (agents) setAllAgents(agents);
          }
        }
      } catch {
        setBundleName('WoulfAI');
      }
    };
    init();
  }, [sessionId]);

  // Save company details
  const saveCompanyDetails = async () => {
    if (!companyName.trim()) return;
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        const { data: sub } = await ((sb as any).from('subscriptions').select('company_id').eq('user_id', session.user.id).single() as any);
        if (sub?.company_id) {
          await ((sb as any).from('companies').update({
            name: companyName,
            metadata: { industry, company_size: companySize },
          }).eq('id', sub.company_id) as any);
        }
      }
    } catch (err) {
      console.error('Failed to save company:', err);
    }
    setSaving(false);
  };

  // Save agent picks for starter pack
  const saveAgentPicks = async () => {
    if (selectedAgents.length === 0) return;
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        const { data: sub } = await ((sb as any).from('subscriptions').select('company_id').eq('user_id', session.user.id).single() as any);
        if (sub?.company_id) {
          const { data: bundle } = await ((sb as any).from('agent_bundles').select('id').eq('slug', 'starter-pack').single() as any);
          if (bundle) {
            const accessRows = selectedAgents.map(agentId => ({
              company_id: sub.company_id,
              agent_id: agentId,
              bundle_id: bundle.id,
              granted_by: 'onboarding-picker',
              status: 'active',
            }));
            await ((sb as any).from('company_agent_access').upsert(accessRows, { onConflict: 'company_id,agent_id' }) as any);
          }
        }
      }
    } catch (err) {
      console.error('Failed to save agent picks:', err);
    }
    setSaving(false);
  };

  // Send team invites
  const sendInvites = async () => {
    const validEmails = invites.filter(e => e.includes('@'));
    if (validEmails.length === 0) return;
    try {
      await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: validEmails }),
      });
    } catch (err) {
      console.error('Failed to send invites:', err);
    }
  };

  const handleNext = async () => {
    const stepName = STEPS[step];
    if (stepName === 'Choose') await saveAgentPicks();
    if (stepName === 'Company') await saveCompanyDetails();
    if (stepName === 'Team') await sendInvites();
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  // If no session_id, redirect to regular onboarding hub
  if (!sessionId) {
    router.replace('/onboarding');
    return null;
  }

  const renderStep = () => {
    const stepName = STEPS[step];
    switch (stepName) {
      case 'Welcome': return <WelcomeStep bundleName={bundleName} onNext={handleNext} />;
      case 'Choose': return <AgentPickerStep agents={allAgents} selected={selectedAgents} setSelected={setSelectedAgents} maxPicks={maxPicks} onNext={handleNext} onBack={handleBack} />;
      case 'Company': return <CompanyStep companyName={companyName} setCompanyName={setCompanyName} industry={industry} setIndustry={setIndustry} size={companySize} setSize={setCompanySize} onNext={handleNext} onBack={handleBack} />;
      case 'Connect': return <ConnectStep onNext={handleNext} onBack={handleBack} />;
      case 'Team': return <TeamStep invites={invites} setInvites={setInvites} onNext={handleNext} onBack={handleBack} />;
      case 'Launch': return <LaunchStep companyName={companyName} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-4">
        <Image src="/woulf-badge.png" alt="WoulfAI" width={40} height={40} className="mx-auto mb-4" />
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-12 shadow-sm">
        {renderStep()}
      </div>

      {STEPS[step] !== 'Launch' && (
        <p className="text-center text-[10px] text-[#C4C9D2] mt-6">
          You can always change these settings later in your dashboard.
        </p>
      )}
    </div>
  );
}
