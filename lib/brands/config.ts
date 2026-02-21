export type BrandKey = 'woulfai' | 'axiom' | 'thankgodai' | 'default'
export interface Brand { key: BrandKey; name: string; tagline: string; description: string; colors: { primary: string; secondary: string; accent: string }; ctaText: string }
export const brands: Record<BrandKey, Brand> = {
  woulfai: { key: 'woulfai', name: 'WoulfAI', tagline: 'Warehouse Intelligence Made Simple', description: 'AI-powered systems that turn complexity into profit.', colors: { primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560' }, ctaText: 'Schedule a Systems Conversation' },
  axiom: { key: 'axiom', name: 'Axiom Automations', tagline: 'Enterprise AI. Elevated.', description: 'Next-generation AI agents for organizations that demand excellence.', colors: { primary: '#0f172a', secondary: '#334155', accent: '#6366f1' }, ctaText: 'Schedule a Consultation' },
  thankgodai: { key: 'thankgodai', name: 'ThankGodAI', tagline: "The Answer to Every Business Owner's Prayer", description: 'Finally! AI that works as hard as you do.', colors: { primary: '#18181b', secondary: '#27272a', accent: '#eab308' }, ctaText: 'Start Free Today' },
  default: { key: 'default', name: 'AI Agent Platform', tagline: 'Powerful AI Agents for Modern Business', description: 'Automate operations, boost productivity, and grow your business.', colors: { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' }, ctaText: 'Get Started Free' },
}
export function getBrandFromDomain(hostname: string): Brand {
  if (hostname.includes('woulfai') || hostname.includes('woulfgroup')) return brands.woulfai
  if (hostname.includes('axiom')) return brands.axiom
  if (hostname.includes('thankgod')) return brands.thankgodai
  return brands.default
}
