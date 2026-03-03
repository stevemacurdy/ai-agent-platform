'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: '👋' },
  { id: 'company', label: 'Company Info', icon: '🏢' },
  { id: 'integrations', label: 'Connect Tools', icon: '🔗' },
  { id: 'team', label: 'Invite Team', icon: '👥' },
  { id: 'agents', label: 'Pick Employees', icon: '🤖' },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '', industry: '', teamSize: '', website: '',
    integrations: [] as string[],
    teamEmails: [''],
    selectedAgents: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const INTEGRATIONS = [
    { id: 'quickbooks', name: 'QuickBooks', icon: '📗', category: 'Accounting' },
    { id: 'xero', name: 'Xero', icon: '📘', category: 'Accounting' },
    { id: 'hubspot', name: 'HubSpot', icon: '🟠', category: 'CRM' },
    { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'CRM' },
    { id: 'odoo', name: 'Odoo', icon: '🟣', category: 'ERP' },
    { id: 'slack', name: 'Slack', icon: '💬', category: 'Communication' },
  ];

  const DEPARTMENTS = [
    { name: 'Finance', agents: ['cfo', 'collections', 'finops', 'payables'] },
    { name: 'Sales', agents: ['sales', 'sales-intel', 'sales-coach', 'marketing', 'seo'] },
    { name: 'Operations', agents: ['warehouse', 'supply-chain', 'wms', 'operations'] },
    { name: 'People', agents: ['hr', 'support', 'training'] },
    { name: 'Legal & Strategy', agents: ['legal', 'compliance', 'research', 'org-lead', 'str'] },
  ];

  const handleNext = async () => {
    if (step === STEPS.length - 1) {
      setSaving(true);
      try {
        await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, sessionId }),
        });
        router.push('/dashboard?onboarded=true');
      } catch {
        router.push('/dashboard');
      }
      return;
    }
    setStep(s => s + 1);
  };

  const toggleIntegration = (id: string) => {
    setFormData(prev => ({
      ...prev,
      integrations: prev.integrations.includes(id)
        ? prev.integrations.filter(i => i !== id)
        : [...prev.integrations, id],
    }));
  };

  const toggleAgent = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(slug)
        ? prev.selectedAgents.filter(a => a !== slug)
        : [...prev.selectedAgents, slug],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#F4F5F7' }}>
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/woulf-badge.png" alt="WoulfAI" width={32} height={32} />
            <span className="text-lg font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1">
              <div className="h-1.5 rounded-full transition-all" style={{
                background: i <= step ? '#F5920B' : '#E5E7EB',
              }} />
              <p className="text-[10px] mt-1 font-medium text-center" style={{
                color: i <= step ? '#1B2A4A' : '#9CA3AF',
              }}>{s.icon} {s.label}</p>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {/* Step 1: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                Welcome to WoulfAI! 🎉
              </h2>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Let&apos;s get your AI workforce set up in under 5 minutes.
                We&apos;ll help you connect your tools, invite your team, and pick your AI Employees.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {['📊 Smart Analytics', '🤖 AI Employees', '🔗 Integrations'].map(f => (
                  <div key={f} className="p-3 rounded-xl text-center" style={{ background: '#F4F5F7' }}>
                    <p className="text-xs font-medium" style={{ color: '#1B2A4A' }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Company Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                🏢 Tell us about your company
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Company Name</label>
                  <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }} placeholder="Acme Warehouse Corp" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Industry</label>
                  <select value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }}>
                    <option value="">Select industry...</option>
                    <option value="3pl">3PL / Fulfillment</option>
                    <option value="warehousing">Warehousing</option>
                    <option value="distribution">Distribution</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="cold-chain">Cold Chain</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: '#6B7280' }}>Team Size</label>
                  <select value={formData.teamSize} onChange={e => setFormData({...formData, teamSize: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }}>
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200+">200+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Integrations */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                🔗 Connect your tools
              </h2>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Select the tools you use. You can connect them now or later from Settings.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {INTEGRATIONS.map(int => (
                  <button key={int.id} onClick={() => toggleIntegration(int.id)}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: formData.integrations.includes(int.id) ? '#F5920B' : '#E5E7EB',
                      background: formData.integrations.includes(int.id) ? 'rgba(245,146,11,0.04)' : '#fff',
                    }}>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{int.icon} {int.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>{int.category}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Invite Team */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                👥 Invite your team
              </h2>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Add team members by email. They&apos;ll get an invitation to join your workspace.
              </p>
              <div className="space-y-2">
                {formData.teamEmails.map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="email" value={email}
                      onChange={e => {
                        const emails = [...formData.teamEmails];
                        emails[i] = e.target.value;
                        setFormData({...formData, teamEmails: emails});
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E5E7EB' }}
                      placeholder="colleague@company.com" />
                    {i > 0 && (
                      <button onClick={() => {
                        const emails = formData.teamEmails.filter((_, idx) => idx !== i);
                        setFormData({...formData, teamEmails: emails});
                      }} className="text-red-400 px-2 text-sm">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setFormData({...formData, teamEmails: [...formData.teamEmails, '']})}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#F5920B' }}>
                  + Add another
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Pick Agents */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
                🤖 Choose your AI Employees
              </h2>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Select the AI Employees you want to activate. You can change this anytime.
              </p>
              <div className="space-y-4">
                {DEPARTMENTS.map(dept => (
                  <div key={dept.name}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>{dept.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {dept.agents.map(slug => (
                        <button key={slug} onClick={() => toggleAgent(slug)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                          style={{
                            borderColor: formData.selectedAgents.includes(slug) ? '#F5920B' : '#E5E7EB',
                            background: formData.selectedAgents.includes(slug) ? 'rgba(245,146,11,0.06)' : '#fff',
                            color: formData.selectedAgents.includes(slug) ? '#F5920B' : '#6B7280',
                          }}>
                          {slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: '#E5E7EB' }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: '#6B7280' }}>← Back</button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              {step < STEPS.length - 1 && (
                <button onClick={handleNext} className="text-xs text-gray-400">Skip</button>
              )}
              <button onClick={handleNext} disabled={saving}
                className="text-sm font-bold text-white px-6 py-2.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-50"
                style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
                {saving ? 'Setting up...' : step === STEPS.length - 1 ? 'Launch Dashboard 🚀' : 'Continue'}
              </button>
            </div>
          </div>
        </div>

        {/* Skip link */}
        <p className="text-center mt-4">
          <Link href="/dashboard" className="text-xs underline" style={{ color: '#9CA3AF' }}>
            Skip setup — go to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
