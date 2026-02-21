export interface PlanFeature {
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
