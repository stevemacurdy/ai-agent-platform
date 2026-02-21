'use client'
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
                    <span className="text-4xl font-bold font-mono">${price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">/mo</span>
                  </div>
                  {annual && <div className="text-xs text-emerald-400 mt-1">Billed annually (${(price * 12).toLocaleString()}/yr)</div>}
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
