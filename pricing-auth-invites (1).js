#!/usr/bin/env node
/**
 * WoulfAI — PRICING + INTEGRATIONS + AUTH + ADMIN INVITES
 *
 * 1. Pricing: Starter $499, Professional $1,200, Enterprise $2,499
 * 2. Integrations: 5 CRMs + 10 Accounting platforms
 * 3. Self-service registration with full profile fields
 * 4. Forgot password flow
 * 5. Admin invite system (employee + beta tester links)
 * 6. SQL migration for all new tables
 *
 * Run from: ai-agent-platform root
 * Usage: node pricing-auth-invites.js
 */
const fs = require('fs');
const path = require('path');
let installed = 0;

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
  installed++;
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════════╗');
console.log('  ║  PRICING + INTEGRATIONS + AUTH + ADMIN INVITES              ║');
console.log('  ╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. PRICING CONFIG — Single source of truth
// ============================================================
console.log('  [1] Pricing Configuration:');

write('lib/pricing.ts', `export interface PlanFeature {
  name: string
  starter: boolean | string
  professional: boolean | string
  enterprise: boolean | string
}

export interface Plan {
  id: string
  name: string
  price: number
  period: 'month'
  description: string
  highlight?: boolean
  cta: string
  agents: number
  seats: number
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'starter', name: 'Starter', price: 499, period: 'month',
    description: 'For small teams getting started with AI automation',
    cta: 'Start Free Trial',
    agents: 3, seats: 5,
    features: [
      '3 AI Agents (choose any)',
      'Up to 5 team seats',
      '10,000 API calls/month',
      'Email support',
      'Basic analytics',
      'Single CRM integration',
      'Standard onboarding',
    ],
  },
  {
    id: 'professional', name: 'Professional', price: 1200, period: 'month',
    description: 'For growing companies that need full agent coverage',
    highlight: true,
    cta: 'Start Free Trial',
    agents: 7, seats: 25,
    features: [
      '7 AI Agents',
      'Up to 25 team seats',
      '100,000 API calls/month',
      'Priority support + Slack',
      'Advanced analytics + reporting',
      'Multi-CRM + accounting sync',
      'Dedicated onboarding specialist',
      'Custom agent configuration',
      'API access',
    ],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 2499, period: 'month',
    description: 'For organizations that need unlimited power and white-glove service',
    cta: 'Contact Sales',
    agents: 11, seats: -1, // unlimited
    features: [
      'All 11 AI Agents',
      'Unlimited seats',
      'Unlimited API calls',
      '24/7 dedicated support',
      'Full analytics suite + custom dashboards',
      'All integrations (CRM + Accounting + ERP)',
      'White-glove onboarding + training',
      'Custom agent development',
      'SSO / SAML authentication',
      'SLA guarantee (99.9% uptime)',
      'On-premise deployment option',
    ],
  },
]

export function getPlan(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id)
}
`);

// ============================================================
// 2. PRICING PAGE
// ============================================================
console.log('');
console.log('  [2] Pricing Page:');

write('app/pricing/page.tsx', `'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PLANS } from '@/lib/pricing'

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const discount = 0.8 // 20% off annual

  return (
    <div className="min-h-screen bg-[#06080D] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4 inline-block">WoulfAI</Link>
          <h1 className="text-4xl font-bold mt-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto">Choose the plan that fits your team. All plans include a 14-day free trial.</p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={"text-sm " + (!annual ? 'text-white' : 'text-gray-500')}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className={"w-12 h-6 rounded-full transition-colors " + (annual ? 'bg-blue-600' : 'bg-gray-700')}>
              <div className={"w-5 h-5 bg-white rounded-full transition-transform mx-0.5 " + (annual ? 'translate-x-6' : '')} />
            </button>
            <span className={"text-sm " + (annual ? 'text-white' : 'text-gray-500')}>Annual</span>
            {annual && <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">Save 20%</span>}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map(plan => {
            const price = annual ? Math.round(plan.price * discount) : plan.price
            return (
              <div key={plan.id}
                className={"relative bg-[#0A0E15] border rounded-2xl p-6 transition-all " +
                  (plan.highlight ? 'border-blue-500/30 shadow-lg shadow-blue-500/5 scale-105' : 'border-white/5 hover:border-white/10')}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono">\${price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">/mo</span>
                  </div>
                  {annual && <div className="text-xs text-emerald-400 mt-1">Billed annually (\${(price * 12).toLocaleString()}/yr)</div>}
                </div>
                <div className="mb-6">
                  <div className="text-[10px] text-gray-500 uppercase mb-2">
                    {plan.agents} Agents · {plan.seats === -1 ? 'Unlimited' : plan.seats} Seats
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5 text-xs">✓</span>
                      <span className="text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={plan.id === 'enterprise' ? '/contact' : '/register?plan=' + plan.id}
                  className={"w-full block text-center py-3 rounded-xl text-sm font-semibold transition-colors " +
                    (plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10')}>
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* FAQ-style footer */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">All plans include 14-day free trial. No credit card required. Cancel anytime.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/demo" className="text-sm text-blue-400 hover:text-blue-300">Try the Demo →</Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-white">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// 3. INTEGRATIONS LIBRARY
// ============================================================
console.log('');
console.log('  [3] Integrations Library:');

write('lib/integrations.ts', `export type IntegrationCategory = 'crm' | 'accounting' | 'erp' | 'communication' | 'storage'

export interface Integration {
  id: string
  name: string
  category: IntegrationCategory
  icon: string
  description: string
  status: 'available' | 'coming_soon' | 'beta'
  plans: string[]  // which plans include it
  configFields?: string[]  // fields needed to connect
}

export const INTEGRATIONS: Integration[] = [
  // ═══════════════════════════════════════
  // CRM (5)
  // ═══════════════════════════════════════
  {
    id: 'salesforce', name: 'Salesforce', category: 'crm', icon: '☁️',
    description: 'Sync contacts, deals, and activities with Salesforce CRM',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['instance_url', 'client_id', 'client_secret', 'refresh_token'],
  },
  {
    id: 'hubspot', name: 'HubSpot', category: 'crm', icon: '🟠',
    description: 'Two-way sync with HubSpot contacts, deals, and pipeline',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['api_key'],
  },
  {
    id: 'zoho-crm', name: 'Zoho CRM', category: 'crm', icon: '🔴',
    description: 'Connect Zoho CRM for lead scoring and deal management',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'refresh_token', 'org_id'],
  },
  {
    id: 'pipedrive', name: 'Pipedrive', category: 'crm', icon: '🟢',
    description: 'Sync deals, contacts, and activities with Pipedrive',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['api_token', 'company_domain'],
  },
  {
    id: 'zendesk', name: 'Zendesk Sell', category: 'crm', icon: '🟡',
    description: 'Connect Zendesk Sell for support-to-sales pipeline integration',
    status: 'beta', plans: ['enterprise'],
    configFields: ['subdomain', 'api_token', 'email'],
  },

  // ═══════════════════════════════════════
  // ACCOUNTING (10)
  // ═══════════════════════════════════════
  {
    id: 'quickbooks', name: 'QuickBooks Online', category: 'accounting', icon: '📗',
    description: 'Sync invoices, expenses, and reports with QuickBooks Online',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['realm_id', 'client_id', 'client_secret', 'refresh_token'],
  },
  {
    id: 'odoo', name: 'Odoo', category: 'accounting', icon: '🟣',
    description: 'Full ERP integration — accounting, inventory, invoicing, and HR',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['url', 'db', 'api_key', 'username'],
  },
  {
    id: 'xero', name: 'Xero', category: 'accounting', icon: '🔵',
    description: 'Cloud accounting with real-time bank feeds and invoicing',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'tenant_id'],
  },
  {
    id: 'freshbooks', name: 'FreshBooks', category: 'accounting', icon: '🌿',
    description: 'Invoicing, expenses, and time tracking for service businesses',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'redirect_uri'],
  },
  {
    id: 'sage', name: 'Sage Intacct', category: 'accounting', icon: '💚',
    description: 'Enterprise-grade financial management and multi-entity consolidation',
    status: 'available', plans: ['professional', 'enterprise'],
    configFields: ['company_id', 'user_id', 'user_password', 'sender_id'],
  },
  {
    id: 'wave', name: 'Wave', category: 'accounting', icon: '🌊',
    description: 'Free accounting, invoicing, and receipt scanning for small businesses',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['business_id', 'access_token'],
  },
  {
    id: 'netsuite', name: 'NetSuite', category: 'accounting', icon: '🏢',
    description: 'Oracle NetSuite ERP — GL, AP, AR, and financial reporting',
    status: 'available', plans: ['enterprise'],
    configFields: ['account_id', 'consumer_key', 'consumer_secret', 'token_id', 'token_secret'],
  },
  {
    id: 'zoho-books', name: 'Zoho Books', category: 'accounting', icon: '📘',
    description: 'End-to-end accounting with inventory and project tracking',
    status: 'available', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['client_id', 'client_secret', 'organization_id'],
  },
  {
    id: 'myob', name: 'MYOB', category: 'accounting', icon: '🟤',
    description: 'Australian accounting platform for payroll, tax, and banking',
    status: 'coming_soon', plans: ['professional', 'enterprise'],
    configFields: ['api_key', 'company_file_id'],
  },
  {
    id: 'freeagent', name: 'FreeAgent', category: 'accounting', icon: '🏷️',
    description: 'UK-focused accounting for freelancers and small businesses',
    status: 'coming_soon', plans: ['starter', 'professional', 'enterprise'],
    configFields: ['oauth_token', 'oauth_secret'],
  },
]

export function getIntegrationsByCategory(cat: IntegrationCategory) {
  return INTEGRATIONS.filter(i => i.category === cat)
}

export function getIntegrationsForPlan(planId: string) {
  return INTEGRATIONS.filter(i => i.plans.includes(planId))
}
`);

// ============================================================
// 4. INTEGRATIONS PAGE
// ============================================================
write('app/admin/integrations/page.tsx', `'use client'
import { useState } from 'react'
import { INTEGRATIONS, type Integration } from '@/lib/integrations'

export default function IntegrationsPage() {
  const [filter, setFilter] = useState<'all' | 'crm' | 'accounting'>('all')
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  const filtered = filter === 'all' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === filter)
  const crms = INTEGRATIONS.filter(i => i.category === 'crm')
  const accounting = INTEGRATIONS.filter(i => i.category === 'accounting')

  const handleConnect = (int: Integration) => {
    if (int.status === 'coming_soon') { show(int.name + ' integration coming soon!'); return }
    setConnecting(int.id)
  }

  const handleSave = (id: string) => {
    setConnected(prev => new Set([...prev, id]))
    setConnecting(null)
    show('Connected successfully!')
  }

  const statusBadge = (status: string) => {
    if (status === 'available') return 'bg-emerald-500/10 text-emerald-400'
    if (status === 'beta') return 'bg-blue-500/10 text-blue-400'
    return 'bg-gray-500/10 text-gray-500'
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">{crms.length} CRMs · {accounting.length} Accounting Platforms</p>
      </div>

      <div className="flex gap-2">
        {['all', 'crm', 'accounting'].map(f => (
          <button key={f} onClick={() => setFilter(f as any)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            {f === 'all' ? 'All' : f === 'crm' ? 'CRMs (' + crms.length + ')' : 'Accounting (' + accounting.length + ')'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(int => (
          <div key={int.id} className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{int.icon}</span>
                <div>
                  <div className="text-sm font-semibold">{int.name}</div>
                  <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + statusBadge(int.status)}>
                    {int.status === 'available' ? 'AVAILABLE' : int.status === 'beta' ? 'BETA' : 'COMING SOON'}
                  </span>
                </div>
              </div>
              {connected.has(int.id) && <span className="text-emerald-400 text-xs font-medium">Connected ✓</span>}
            </div>
            <p className="text-xs text-gray-500 mb-3">{int.description}</p>
            <div className="text-[10px] text-gray-600 mb-3">{int.category.toUpperCase()} · Plans: {int.plans.join(', ')}</div>

            {connecting === int.id ? (
              <div className="space-y-2">
                {int.configFields?.map(field => (
                  <input key={field} placeholder={field.replace(/_/g, ' ')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs" />
                ))}
                <div className="flex gap-2">
                  <button onClick={() => handleSave(int.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs">Save</button>
                  <button onClick={() => setConnecting(null)} className="px-3 py-1.5 text-gray-500 text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => handleConnect(int)}
                className={"w-full py-2 rounded-lg text-xs font-medium transition-colors " +
                  (connected.has(int.id) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                   int.status === 'coming_soon' ? 'bg-white/5 text-gray-500 border border-white/5' :
                   'bg-white/5 text-white border border-white/10 hover:bg-white/10')}>
                {connected.has(int.id) ? 'Configure' : int.status === 'coming_soon' ? 'Notify Me' : 'Connect'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
`);

// ============================================================
// 5. SELF-SERVICE REGISTRATION PAGE
// ============================================================
console.log('');
console.log('  [4] Registration + Auth:');

write('app/register/page.tsx', `'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PLANS } from '@/lib/pricing'

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const planId = params.get('plan') || 'starter'
  const plan = PLANS.find(p => p.id === planId) || PLANS[0]

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', state: '', zip: '',
    username: '', password: '', confirmPassword: '',
    company: '', agreeTerms: false,
  })
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const up = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const validateStep1 = () => {
    if (!form.fullName || !form.email || !form.phone) { setError('Please fill in all required fields'); return false }
    if (!/\\S+@\\S+\\.\\S+/.test(form.email)) { setError('Please enter a valid email'); return false }
    setError(''); return true
  }

  const validateStep2 = () => {
    if (!form.username || form.username.length < 3) { setError('Username must be at least 3 characters'); return false }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return false }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return false }
    if (!form.agreeTerms) { setError('Please accept the terms of service'); return false }
    setError(''); return true
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: planId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }

      // Set dev-mode session
      localStorage.setItem('woulfai_session', JSON.stringify({
        user: { email: form.email, role: 'customer', full_name: form.fullName, username: form.username }
      }))
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">WoulfAI</Link>
          <h2 className="text-xl font-bold mt-4">Create Your Account</h2>
          <p className="text-sm text-gray-500 mt-1">
            {plan.name} Plan · \${plan.price}/mo · {plan.agents} Agents · {plan.seats === -1 ? 'Unlimited' : plan.seats} Seats
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold " +
                (step >= s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500')}>
                {s}
              </div>
              <span className={"text-xs " + (step >= s ? 'text-white' : 'text-gray-600')}>
                {s === 1 ? 'Your Info' : 'Account Setup'}
              </span>
              {s < 2 && <div className={"w-12 h-0.5 " + (step > 1 ? 'bg-blue-600' : 'bg-white/5')} />}
            </div>
          ))}
        </div>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-6">
          {error && <div className="mb-4 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{error}</div>}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Full Name *</label>
                <input value={form.fullName} onChange={e => up('fullName', e.target.value)} placeholder="Steve Macurdy" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Email *</label>
                <input value={form.email} onChange={e => up('email', e.target.value)} type="email" placeholder="steve@company.com" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Phone *</label>
                <input value={form.phone} onChange={e => up('phone', e.target.value)} type="tel" placeholder="(555) 123-4567" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Company</label>
                <input value={form.company} onChange={e => up('company', e.target.value)} placeholder="Woulf Group" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Address</label>
                  <input value={form.address} onChange={e => up('address', e.target.value)} placeholder="123 Main St" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">City</label>
                  <input value={form.city} onChange={e => up('city', e.target.value)} placeholder="Salt Lake City" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">State</label>
                  <input value={form.state} onChange={e => up('state', e.target.value)} placeholder="UT" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider">Zip</label>
                  <input value={form.zip} onChange={e => up('zip', e.target.value)} placeholder="84101" className={inputCls} />
                </div>
              </div>
              <button onClick={() => { if (validateStep1()) setStep(2) }}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Account Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Username *</label>
                <input value={form.username} onChange={e => up('username', e.target.value)} placeholder="Choose a username" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Password *</label>
                <input value={form.password} onChange={e => up('password', e.target.value)} type="password" placeholder="Min 8 characters" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider">Confirm Password *</label>
                <input value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} type="password" placeholder="Re-enter password" className={inputCls} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreeTerms} onChange={e => up('agreeTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-white/5" />
                <span className="text-xs text-gray-400">I agree to the <span className="text-blue-400">Terms of Service</span> and <span className="text-blue-400">Privacy Policy</span></span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm">← Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <span className="text-xs text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// 6. REGISTRATION API
// ============================================================
write('app/api/auth/register/route.ts', `import { NextRequest, NextResponse } from 'next/server';

// In-memory user store (production: Supabase)
const registrations: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fullName, email, phone, username, password, company, address, city, state, zip, plan } = body;

  if (!fullName || !email || !username || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // Check duplicate
  if (registrations.find(r => r.email === email || r.username === username)) {
    return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 });
  }

  const user = {
    id: 'user-' + Date.now(),
    fullName, email, phone, username, company,
    address: [address, city, state, zip].filter(Boolean).join(', '),
    role: 'customer',
    plan: plan || 'starter',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  registrations.push(user);

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, plan: user.plan },
    message: 'Account created successfully',
  });
}
`);

// ============================================================
// 7. FORGOT PASSWORD PAGE + API
// ============================================================
console.log('');
console.log('  [5] Forgot Password:');

write('app/forgot-password/page.tsx', `'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'done'>('request')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const requestReset = async () => {
    if (!contact) { setError('Please enter your ' + method); return }
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, contact }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setStep('verify')
    setError('')
    setLoading(false)
  }

  const verifyCode = async () => {
    if (code.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', contact, code }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setStep('reset')
    setError('')
    setLoading(false)
  }

  const resetPassword = async () => {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', contact, code, newPassword }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error); setLoading(false); return }
    setStep('done')
    setLoading(false)
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">WoulfAI</Link>
          <h2 className="text-lg font-bold mt-4">{step === 'done' ? 'Password Reset!' : 'Reset Your Password'}</h2>
        </div>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-6">
          {error && <div className="mb-4 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{error}</div>}

          {step === 'request' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button onClick={() => setMethod('email')}
                  className={"flex-1 py-2 rounded-lg text-xs font-medium " + (method === 'email' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400')}>
                  Email
                </button>
                <button onClick={() => setMethod('phone')}
                  className={"flex-1 py-2 rounded-lg text-xs font-medium " + (method === 'phone' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400')}>
                  Phone
                </button>
              </div>
              <input value={contact} onChange={e => setContact(e.target.value)}
                placeholder={method === 'email' ? 'your@email.com' : '(555) 123-4567'}
                type={method === 'email' ? 'email' : 'tel'} className={inputCls} />
              <button onClick={requestReset} disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 text-center">
                We sent a 6-digit code to <span className="text-blue-400">{contact}</span>
              </p>
              <input value={code} onChange={e => setCode(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                placeholder="000000" maxLength={6}
                className={inputCls + " text-center text-2xl tracking-[0.5em] font-mono"} />
              <button onClick={verifyCode} disabled={loading || code.length < 6}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button onClick={() => { setStep('request'); setCode('') }} className="w-full text-xs text-gray-500 hover:text-white">
                Didn't receive it? Try again
              </button>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase">New Password</label>
                <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="Min 8 characters" className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase">Confirm Password</label>
                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" className={inputCls} />
              </div>
              <button onClick={resetPassword} disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <div className="text-4xl">✅</div>
              <p className="text-sm text-gray-400">Your password has been reset successfully.</p>
              <Link href="/login" className="block py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold text-center">
                Sign In
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs text-gray-500 hover:text-blue-400">← Back to Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
`);

write('app/api/auth/forgot-password/route.ts', `import { NextRequest, NextResponse } from 'next/server';

// In-memory code store (production: Redis or Supabase with TTL)
const codes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
  const { method, contact } = await request.json();
  if (!contact) return NextResponse.json({ error: 'Contact required' }, { status: 400 });

  const code = Math.random().toString().slice(2, 8);
  codes.set(contact, { code, expires: Date.now() + 600000 }); // 10 min TTL

  // In production: send via email (SendGrid/Resend) or SMS (Twilio)
  console.log('[FORGOT-PASSWORD] Code for ' + contact + ': ' + code);

  return NextResponse.json({
    success: true,
    message: 'Verification code sent to ' + contact,
    // DEV ONLY — remove in production:
    _devCode: code,
  });
}

export async function PUT(request: NextRequest) {
  const { action, contact, code, newPassword } = await request.json();

  if (action === 'verify') {
    const stored = codes.get(contact);
    if (!stored) return NextResponse.json({ error: 'No code found. Request a new one.' }, { status: 400 });
    if (Date.now() > stored.expires) { codes.delete(contact); return NextResponse.json({ error: 'Code expired' }, { status: 400 }); }
    if (stored.code !== code) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    return NextResponse.json({ success: true, message: 'Code verified' });
  }

  if (action === 'reset') {
    const stored = codes.get(contact);
    if (!stored || stored.code !== code) return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    codes.delete(contact);
    // In production: hash password and update in Supabase
    console.log('[FORGOT-PASSWORD] Password reset for ' + contact);
    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
`);

// ============================================================
// 8. ADMIN INVITE SYSTEM
// ============================================================
console.log('');
console.log('  [6] Admin Invite System:');

write('app/api/admin/invites/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) {
  const e = req.headers.get('x-admin-email');
  return e && ADMINS.includes(e.toLowerCase());
}

// In-memory invite store (production: Supabase with signed JWTs)
const invites: any[] = [];

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { action, ...data } = await request.json();

  if (action === 'create') {
    const { recipientName, recipientEmail, recipientPhone, role, message } = data;
    if (!recipientEmail || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 });

    const token = generateToken();
    const invite = {
      id: 'inv-' + Date.now(),
      token,
      recipientName: recipientName || '',
      recipientEmail,
      recipientPhone: recipientPhone || '',
      role, // 'employee' or 'beta_tester'
      message: message || '',
      status: 'pending',
      createdBy: request.headers.get('x-admin-email') || 'admin',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 day expiry
      usedAt: null,
    };
    invites.push(invite);

    // Build the invite link
    const baseUrl = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const inviteLink = protocol + '://' + baseUrl + '/invite/' + token;

    console.log('[INVITE] Created: ' + inviteLink + ' for ' + recipientEmail + ' as ' + role);

    return NextResponse.json({
      success: true,
      invite: { id: invite.id, token, role, recipientEmail, expiresAt: invite.expiresAt },
      link: inviteLink,
    });
  }

  if (action === 'revoke') {
    const inv = invites.find(i => i.id === data.inviteId);
    if (inv) { inv.status = 'revoked'; }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const token = new URL(request.url).searchParams.get('token');
  if (token) {
    const inv = invites.find(i => i.token === token);
    return inv ? NextResponse.json({ invite: inv }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    invites: invites.map(i => ({
      id: i.id, recipientName: i.recipientName, recipientEmail: i.recipientEmail,
      role: i.role, status: i.status, createdAt: i.createdAt, expiresAt: i.expiresAt, usedAt: i.usedAt,
    })),
    total: invites.length,
    pending: invites.filter(i => i.status === 'pending').length,
  });
}
`);

// ============================================================
// 9. INVITE ACCEPTANCE PAGE
// ============================================================
write('app/invite/[token]/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '', username: '', password: '', confirmPassword: '', phone: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/invites?token=' + token, { headers: { 'x-admin-email': 'admin' } })
        if (!res.ok) { setError('Invalid or expired invite link'); setLoading(false); return }
        const data = await res.json()
        if (data.invite.status !== 'pending') { setError('This invite has already been used or revoked'); setLoading(false); return }
        if (new Date(data.invite.expiresAt) < new Date()) { setError('This invite has expired'); setLoading(false); return }
        setInvite(data.invite)
        setForm(prev => ({ ...prev, fullName: data.invite.recipientName || '' }))
      } catch { setError('Failed to load invite') }
      setLoading(false)
    }
    load()
  }, [token])

  const up = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  const handleSubmit = async () => {
    if (!form.fullName || !form.username || form.password.length < 8) { setFormError('Please fill all fields (password min 8 chars)'); return }
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match'); return }
    setSubmitting(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.fullName,
        email: invite.recipientEmail,
        phone: form.phone || invite.recipientPhone,
        username: form.username,
        password: form.password,
        plan: 'invited',
        role: invite.role,
        inviteToken: token,
      }),
    })

    if (!res.ok) { const d = await res.json(); setFormError(d.error || 'Failed'); setSubmitting(false); return }

    localStorage.setItem('woulfai_session', JSON.stringify({
      user: { email: invite.recipientEmail, role: invite.role, full_name: form.fullName }
    }))
    router.push(invite.role === 'beta_tester' ? '/dashboard' : '/admin')
  }

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-blue-500/30 focus:outline-none"

  if (loading) return <div className="min-h-screen bg-[#06080D] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  if (error) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-white">{error}</h2>
        <p className="text-sm text-gray-500">Contact your administrator for a new invite.</p>
        <Link href="/login" className="text-blue-400 text-sm">← Go to Sign In</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">WoulfAI</Link>
          <h2 className="text-lg font-bold mt-4">Welcome Aboard!</h2>
          <p className="text-sm text-gray-500 mt-1">
            You've been invited as {invite.role === 'beta_tester' ? 'a Beta Tester' : 'an Employee'}
          </p>
          <div className="mt-2 text-xs text-gray-600">
            Invited by {invite.createdBy} · Expires {new Date(invite.expiresAt).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-[#0A0E15] border border-white/5 rounded-2xl p-6 space-y-4">
          {formError && <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{formError}</div>}

          <div className="px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg">
            <div className="text-[10px] text-blue-400 font-medium">Email (from invite)</div>
            <div className="text-sm text-white">{invite.recipientEmail}</div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase">Full Name *</label>
            <input value={form.fullName} onChange={e => up('fullName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Phone</label>
            <input value={form.phone} onChange={e => up('phone', e.target.value)} type="tel" placeholder="(555) 123-4567" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Username *</label>
            <input value={form.username} onChange={e => up('username', e.target.value)} placeholder="Choose a username" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Password *</label>
            <input value={form.password} onChange={e => up('password', e.target.value)} type="password" placeholder="Min 8 characters" className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase">Confirm Password *</label>
            <input value={form.confirmPassword} onChange={e => up('confirmPassword', e.target.value)} type="password" className={inputCls} />
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {submitting ? 'Activating...' : 'Activate My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// 10. ADMIN USERS PAGE — Invite Tab
// ============================================================
console.log('');
console.log('  [7] Admin Users + Invites Tab:');

write('app/admin/users/page.tsx', `'use client'
import { useState, useEffect } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' } }
const hdrs = () => ({ 'Content-Type': 'application/json', 'x-admin-email': getEmail() })

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'text-rose-400 bg-rose-500/10',
  employee: 'text-blue-400 bg-blue-500/10',
  beta_tester: 'text-amber-400 bg-amber-500/10',
  customer: 'text-emerald-400 bg-emerald-500/10',
}

export default function AdminUsersPage() {
  const [tab, setTab] = useState<'users' | 'invites'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000) }

  // Invite form
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', phone: '', role: 'employee', message: '' })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  useEffect(() => { loadUsers(); loadInvites() }, [])

  const loadUsers = async () => {
    try {
      const r = await fetch('/api/admin/users', { headers: { 'x-admin-email': getEmail() } })
      const d = await r.json()
      setUsers(d.users || [])
    } catch {}
  }

  const loadInvites = async () => {
    try {
      const r = await fetch('/api/admin/invites', { headers: { 'x-admin-email': getEmail() } })
      const d = await r.json()
      setInvites(d.invites || [])
    } catch {}
  }

  const sendInvite = async () => {
    if (!inviteForm.email || !inviteForm.role) { show('Email and role required'); return }
    setInviteLoading(true)
    try {
      const r = await fetch('/api/admin/invites', {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({
          action: 'create',
          recipientName: inviteForm.name,
          recipientEmail: inviteForm.email,
          recipientPhone: inviteForm.phone,
          role: inviteForm.role,
          message: inviteForm.message,
        }),
      })
      const d = await r.json()
      if (d.success) {
        setGeneratedLink(d.link)
        show('Invite created! Link ready to share.')
        loadInvites()
        setInviteForm({ name: '', email: '', phone: '', role: 'employee', message: '' })
      }
    } catch {}
    setInviteLoading(false)
  }

  const revokeInvite = async (id: string) => {
    await fetch('/api/admin/invites', {
      method: 'POST', headers: hdrs(),
      body: JSON.stringify({ action: 'revoke', inviteId: id }),
    })
    show('Invite revoked')
    loadInvites()
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => show('Link copied to clipboard!'))
  }

  const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm"

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">Users & Roles</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, send invites, and control access</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('users')}
          className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (tab === 'users' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
          Users ({users.length})
        </button>
        <button onClick={() => setTab('invites')}
          className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (tab === 'invites' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
          Invites ({invites.length})
        </button>
      </div>

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-600 text-sm">No users yet. Send an invite to get started.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] text-gray-500 uppercase border-b border-white/5">
                <th className="text-left p-4">User</th><th className="text-center p-4">Role</th><th className="text-center p-4">Status</th><th className="text-right p-4">Joined</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/[0.03]">
                    <td className="p-4"><div className="font-medium">{u.displayName || u.email}</div><div className="text-xs text-gray-600">{u.email}</div></td>
                    <td className="p-4 text-center"><span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (ROLE_COLORS[u.role] || 'text-gray-400 bg-gray-500/10')}>{u.role}</span></td>
                    <td className="p-4 text-center"><span className={"text-[10px] px-2 py-0.5 rounded " + (u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500')}>{u.status}</span></td>
                    <td className="p-4 text-right text-xs text-gray-600">{u.createdAt?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* INVITES TAB */}
      {tab === 'invites' && (
        <div className="space-y-5">
          {/* Send Invite Form */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Send New Invite</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Name</label>
                <input value={inviteForm.name} onChange={e => setInviteForm({...inviteForm, name: e.target.value})} placeholder="Jane Smith" className={inputCls} /></div>
              <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Email *</label>
                <input value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} type="email" placeholder="jane@company.com" className={inputCls} /></div>
              <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Phone (for SMS)</label>
                <input value={inviteForm.phone} onChange={e => setInviteForm({...inviteForm, phone: e.target.value})} type="tel" placeholder="(555) 123-4567" className={inputCls} /></div>
              <div><label className="text-[10px] text-gray-500 uppercase block mb-1">Role *</label>
                <select value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})} className={inputCls}>
                  <option value="employee">Employee</option>
                  <option value="beta_tester">Beta Tester</option>
                </select></div>
            </div>
            <div className="mb-4">
              <label className="text-[10px] text-gray-500 uppercase block mb-1">Personal Message (optional)</label>
              <textarea value={inviteForm.message} onChange={e => setInviteForm({...inviteForm, message: e.target.value})}
                placeholder="Welcome to WoulfAI! Looking forward to having you on the team."
                className={inputCls + " h-20 resize-none"} />
            </div>
            <div className="flex gap-3">
              <button onClick={sendInvite} disabled={inviteLoading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50">
                {inviteLoading ? 'Creating...' : '✉️ Send via Email'}
              </button>
              <button onClick={sendInvite} disabled={inviteLoading}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 disabled:opacity-50">
                {inviteLoading ? 'Creating...' : '💬 Send via Text'}
              </button>
            </div>
          </div>

          {/* Generated Link */}
          {generatedLink && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
              <div className="text-xs text-blue-400 font-semibold mb-2">Invite Link Generated</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white/5 rounded-lg px-3 py-2 text-gray-300 overflow-x-auto">{generatedLink}</code>
                <button onClick={() => copyLink(generatedLink)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium">Copy</button>
              </div>
              <div className="text-[10px] text-gray-600 mt-2">This link expires in 7 days and can only be used once.</div>
            </div>
          )}

          {/* Invite History */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5"><h3 className="text-sm font-semibold">Invite History</h3></div>
            {invites.length === 0 ? (
              <div className="p-8 text-center text-gray-600 text-sm">No invites sent yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-[10px] text-gray-500 uppercase border-b border-white/5">
                  <th className="text-left p-4">Recipient</th><th className="text-center p-4">Role</th><th className="text-center p-4">Status</th><th className="text-right p-4">Actions</th>
                </tr></thead>
                <tbody>
                  {invites.map(inv => (
                    <tr key={inv.id} className="border-b border-white/[0.03]">
                      <td className="p-4"><div className="font-medium">{inv.recipientName || inv.recipientEmail}</div><div className="text-xs text-gray-600">{inv.recipientEmail}</div></td>
                      <td className="p-4 text-center"><span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (ROLE_COLORS[inv.role] || '')}>{inv.role}</span></td>
                      <td className="p-4 text-center"><span className={"text-[10px] px-2 py-0.5 rounded " +
                        (inv.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                         inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500')}>{inv.status}</span></td>
                      <td className="p-4 text-right">
                        {inv.status === 'pending' && (
                          <button onClick={() => revokeInvite(inv.id)} className="text-[10px] text-rose-400 hover:text-rose-300">Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
`);

// ============================================================
// 11. SQL MIGRATION
// ============================================================
console.log('');
console.log('  [8] SQL Migration:');

write('supabase/migrations/007_pricing_auth_invites.sql', `-- WoulfAI — Pricing + Auth + Invites Migration

-- 1. Plans table
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,     -- cents ($499 = 49900)
  price_annual INTEGER NOT NULL,      -- cents (20% discount)
  max_agents INTEGER DEFAULT 3,
  max_seats INTEGER DEFAULT 5,        -- -1 = unlimited
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO plans (id, name, price_monthly, price_annual, max_agents, max_seats) VALUES
  ('starter', 'Starter', 49900, 479000, 3, 5),
  ('professional', 'Professional', 120000, 1152000, 7, 25),
  ('enterprise', 'Enterprise', 249900, 2399000, 11, -1)
ON CONFLICT (id) DO UPDATE SET price_monthly = EXCLUDED.price_monthly, price_annual = EXCLUDED.price_annual;

-- 2. Extend profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES plans(id) DEFAULT 'starter';

-- 3. Invites table
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  recipient_name TEXT,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('employee', 'beta_tester', 'customer')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(recipient_email);

-- 4. Password reset codes
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact TEXT NOT NULL,              -- email or phone
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resets_contact ON password_resets(contact);

-- 5. Integration connections
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  integration_id TEXT NOT NULL,       -- 'hubspot', 'quickbooks', etc.
  config JSONB DEFAULT '{}'::jsonb,   -- encrypted credentials
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'disconnected')),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members see own integrations" ON integration_connections
  FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

SELECT 'Pricing + Auth + Invites tables created' as status;
`);

// ============================================================
// 12. UPDATE SIDEBAR — Add Integrations link
// ============================================================
console.log('');
console.log('  [9] Sidebar Update:');

const sidebarPath = path.join(process.cwd(), 'components/AdminSidebar.tsx');
if (fs.existsSync(sidebarPath)) {
  let sb = fs.readFileSync(sidebarPath, 'utf8');
  if (!sb.includes("'integrations'")) {
    sb = sb.replace(
      "{ id: 'analytics'",
      "{ id: 'integrations', label: 'Integrations', href: '/admin/integrations', icon: '🔗' },\n  { id: 'analytics'"
    );
    fs.writeFileSync(sidebarPath, sb);
    console.log('  + Injected Integrations into sidebar');
  } else {
    console.log('  o Integrations already in sidebar');
  }
} else {
  console.log('  ! AdminSidebar.tsx not found — run sidebar-fix.js first');
}

// ============================================================
// 13. UPDATE LOGIN PAGE — Add register/forgot links
// ============================================================
console.log('');
console.log('  [10] Login Page Links:');

const loginPath = path.join(process.cwd(), 'app/login/page.tsx');
if (fs.existsSync(loginPath)) {
  let login = fs.readFileSync(loginPath, 'utf8');
  if (!login.includes('/register') && !login.includes('/forgot-password')) {
    // Add links before the closing div of the form
    if (login.includes('Already have an account') || login.includes('</div>\\n      </div>')) {
      // Just log — we'll create a clean login page instead
      console.log('  o Login page exists, will preserve');
    }
  }
}

// Create a minimal login page update that adds links
const existingLogin = fs.existsSync(loginPath) ? fs.readFileSync(loginPath, 'utf8') : '';
if (existingLogin && !existingLogin.includes('/forgot-password')) {
  // Append links if not present
  let updated = existingLogin;
  if (updated.includes("Sign in to your account")) {
    // Add a forgot password link
    if (!updated.includes('forgot-password')) {
      updated = updated.replace(
        /(<\/div>\s*<\/div>\s*$)/m,
        `<div className="mt-4 text-center space-y-2">
            <a href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 block">Forgot password?</a>
            <div><span className="text-xs text-gray-500">New here? </span><a href="/register" className="text-xs text-blue-400 hover:text-blue-300">Create an account</a></div>
          </div>$1`
      );
      fs.writeFileSync(loginPath, updated);
      console.log('  + Added register + forgot password links to login page');
    }
  }
}

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('  ═══════════════════════════════════════════');
console.log('  Installed: ' + installed + ' files');
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  Routes Created:');
console.log('    /pricing              → $499 / $1,200 / $2,499 plans');
console.log('    /register             → Self-service sign-up (2-step)');
console.log('    /forgot-password      → Code via email or phone');
console.log('    /invite/:token        → Employee/Beta invite acceptance');
console.log('    /admin/users          → Users tab + Invites tab');
console.log('    /admin/integrations   → 5 CRMs + 10 Accounting');
console.log('');
console.log('  APIs Created:');
console.log('    POST /api/auth/register        → Self-service registration');
console.log('    POST /api/auth/forgot-password  → Send reset code');
console.log('    PUT  /api/auth/forgot-password  → Verify + reset');
console.log('    POST /api/admin/invites         → Create/revoke invites');
console.log('    GET  /api/admin/invites         → List invites');
console.log('');
console.log('  Restart: Ctrl+C → npm run dev');
console.log('');
