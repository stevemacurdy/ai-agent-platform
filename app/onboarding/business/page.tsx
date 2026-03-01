'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { useAgents } from '@/lib/hooks/useAgents';
import { ArrowRight, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';


const INDUSTRY_OPTIONS = [
  'Warehousing & Distribution',
  'Third-Party Logistics (3PL)',
  'Manufacturing',
  'Retail / E-commerce',
  'Construction',
  'Healthcare',
  'Professional Services',
  'Technology / SaaS',
  'Real Estate',
  'Other',
];

const EMPLOYEE_OPTIONS = [
  'Just me',
  '2-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

const BOTTLENECK_OPTIONS = [
  'Manual data entry & spreadsheets',
  'Inventory management',
  'Financial reporting & reconciliation',
  'Sales pipeline & CRM',
  'Customer communication',
  'Employee onboarding & HR',
  'Order fulfillment',
  'Compliance & legal',
  'Marketing & lead generation',
  'Supply chain visibility',
];

const TIMELINE_OPTIONS = [
  'Immediately — I need help now',
  'Within 1-3 months',
  '3-6 months',
  'Just exploring for now',
];

const STEPS = [
  { key: 'industry', label: 'What industry are you in?' },
  { key: 'employees', label: 'How many employees does your company have?' },
  { key: 'bottlenecks', label: 'What are your biggest operational bottlenecks?' },
  { key: 'automate', label: 'Which areas would you most like to automate?' },
  { key: 'tools', label: 'What tools or software do you currently use?' },
  { key: 'timeline', label: "What's your timeline for implementing AI solutions?" },
  { key: 'anything_else', label: "Anything else you'd like us to know?" },
];

export default function BusinessOnboarding() {
  const { agents: AGENTS, loading: agentsLoading } = useAgents();
  const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');
  const CATEGORIES = [...new Set(LIVE_AGENTS.map(a => a.category))];
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  const [answers, setAnswers] = useState({
    industry: '',
    industry_other: '',
    employees: '',
    bottlenecks: [] as string[],
    automate: [] as string[],
    tools: '',
    timeline: '',
    anything_else: '',
  });

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        setUserName(session.user.user_metadata?.full_name || '');
      }
    };
    load();
  }, []);

  const toggleMulti = (key: 'bottlenecks' | 'automate', value: string) => {
    setAnswers(a => ({
      ...a,
      [key]: a[key].includes(value) ? a[key].filter(v => v !== value) : [...a[key], value],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return answers.industry !== '';
      case 1: return answers.employees !== '';
      case 2: return answers.bottlenecks.length > 0;
      case 3: return answers.automate.length > 0;
      case 4: return answers.tools.trim().length > 0;
      case 5: return answers.timeline !== '';
      case 6: return true; // optional
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      const token = session?.access_token;

      const responses = {
        ...answers,
        industry: answers.industry === 'Other' ? answers.industry_other : answers.industry,
      };

      // Save onboarding record
      const onboardRes = await fetch('/api/onboarding/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({
          user_type: 'business_owner',
          responses,
          completed: true,
        }),
      });

      // Also create a lead
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          company: answers.industry === 'Other' ? answers.industry_other : answers.industry,
          source: 'registration',
          interest: answers.automate.join(', '),
          message: `Industry: ${responses.industry}. Employees: ${answers.employees}. Bottlenecks: ${answers.bottlenecks.join(', ')}. Timeline: ${answers.timeline}. Tools: ${answers.tools}. ${answers.anything_else}`,
        }),
      });

      router.push('/portal');
    } catch (err) {
      console.error('Onboarding save error:', err);
      router.push('/portal');
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-600 mb-4">
            <Building2 className="w-3 h-3" />
            Business Onboarding
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">
            Let&apos;s get to know your business
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Just a few questions so we can recommend the right AI Employees for you.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] text-[#6B7280] mb-1.5">
            <span>Question {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white shadow-sm rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: progress + '%' }} />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold text-white mb-6">{STEPS[step].label}</h2>

          {/* Step 0: Industry */}
          {step === 0 && (
            <div className="space-y-2">
              {INDUSTRY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers(a => ({ ...a, industry: opt }))}
                  className={"w-full text-left px-4 py-3 rounded-xl text-sm transition border " +
                    (answers.industry === opt
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white shadow-sm border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#1B2A4A]')}
                >
                  {opt}
                </button>
              ))}
              {answers.industry === 'Other' && (
                <input
                  type="text"
                  value={answers.industry_other}
                  onChange={e => setAnswers(a => ({ ...a, industry_other: e.target.value }))}
                  placeholder="Tell us your industry..."
                  className="w-full px-4 py-3 mt-2 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm text-[#1B2A4A] placeholder:text-[#6B7280] focus:border-[#2A9D8F] focus:outline-none"
                  autoFocus
                />
              )}
            </div>
          )}

          {/* Step 1: Employees */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {EMPLOYEE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers(a => ({ ...a, employees: opt }))}
                  className={"px-4 py-3 rounded-xl text-sm transition border " +
                    (answers.employees === opt
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white shadow-sm border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#1B2A4A]')}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Bottlenecks (multi-select) */}
          {step === 2 && (
            <div className="space-y-2">
              <p className="text-xs text-[#6B7280] mb-3">Select all that apply</p>
              {BOTTLENECK_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleMulti('bottlenecks', opt)}
                  className={"w-full text-left px-4 py-3 rounded-xl text-sm transition border flex items-center gap-3 " +
                    (answers.bottlenecks.includes(opt)
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white shadow-sm border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#1B2A4A]')}
                >
                  <span className={"w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center " +
                    (answers.bottlenecks.includes(opt) ? 'bg-blue-500 border-blue-500' : 'border-gray-600')}>
                    {answers.bottlenecks.includes(opt) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Automate (multi-select by category) */}
          {step === 3 && (
            <div className="space-y-2">
              <p className="text-xs text-[#6B7280] mb-3">Select the areas you&apos;d like to automate</p>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleMulti('automate', cat)}
                  className={"w-full text-left px-4 py-3 rounded-xl text-sm transition border flex items-center gap-3 " +
                    (answers.automate.includes(cat)
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white shadow-sm border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#1B2A4A]')}
                >
                  <span className={"w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center " +
                    (answers.automate.includes(cat) ? 'bg-blue-500 border-blue-500' : 'border-gray-600')}>
                    {answers.automate.includes(cat) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </span>
                  <span className="capitalize">{cat}</span>
                  <span className="text-[10px] text-[#6B7280] ml-auto">
                    {LIVE_AGENTS.filter(a => a.category === cat).map(a => a.icon).join(' ')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Tools (free text) */}
          {step === 4 && (
            <div>
              <p className="text-xs text-[#9CA3AF] mb-3">
                E.g., QuickBooks, Salesforce, SAP, Excel, Odoo, HubSpot, custom software...
              </p>
              <textarea
                value={answers.tools}
                onChange={e => setAnswers(a => ({ ...a, tools: e.target.value }))}
                placeholder="List the tools and software your team currently uses..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm text-[#1B2A4A] placeholder:text-[#6B7280] focus:border-[#2A9D8F] focus:outline-none resize-none"
                autoFocus
              />
            </div>
          )}

          {/* Step 5: Timeline */}
          {step === 5 && (
            <div className="space-y-2">
              {TIMELINE_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers(a => ({ ...a, timeline: opt }))}
                  className={"w-full text-left px-4 py-3 rounded-xl text-sm transition border " +
                    (answers.timeline === opt
                      ? 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white shadow-sm border-[#E5E7EB] text-[#6B7280] hover:border-[#E5E7EB] hover:text-[#1B2A4A]')}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Step 6: Anything else */}
          {step === 6 && (
            <div>
              <p className="text-xs text-[#9CA3AF] mb-3">
                This is optional — share anything that would help us serve you better.
              </p>
              <textarea
                value={answers.anything_else}
                onChange={e => setAnswers(a => ({ ...a, anything_else: e.target.value }))}
                placeholder="Any specific challenges, goals, or questions..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm text-[#1B2A4A] placeholder:text-[#6B7280] focus:border-[#2A9D8F] focus:outline-none resize-none"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#1B2A4A] transition disabled:opacity-30 disabled:hover:text-[#9CA3AF]"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition disabled:opacity-40 disabled:hover:bg-blue-600"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Complete Setup'} <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-6">
          <button onClick={() => router.push('/portal')} className="text-xs text-[#6B7280] hover:text-[#6B7280] transition">
            Skip for now — I&apos;ll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
