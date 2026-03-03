// ─── Sales Intel Data Layer ───────────────────────────────
// Competitive intelligence, lead scoring, market signals,
// and account research. Uses CRM connection for live data.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getCRMConnection(companyId: string): Promise<string | null> {
  try {
    const sb = supabaseAdmin();
    const { data } = await (sb as any)
      .from('integration_connections')
      .select('connection_id')
      .eq('company_id', companyId)
      .eq('category', 'crm')
      .eq('status', 'active')
      .single();
    return data?.connection_id || null;
  } catch {
    return null;
  }
}

// ─── Types ──────────────────────────────────────────────

export interface LeadScore {
  id: string;
  company: string;
  contactName: string;
  contactEmail: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  signals: string[];
  industry: string;
  estimatedValue: number;
  source: string;
  lastActivity: string;
  nextAction: string;
}

export interface Competitor {
  id: string;
  name: string;
  strength: 'weak' | 'moderate' | 'strong';
  recentMoves: string[];
  winRate: number;
  avgDealSize: number;
  positioning: string;
}

export interface MarketSignal {
  id: string;
  type: 'expansion' | 'hiring' | 'funding' | 'contract' | 'tech-adoption' | 'leadership-change';
  company: string;
  headline: string;
  detail: string;
  relevance: 'high' | 'medium' | 'low';
  date: string;
  actionable: boolean;
  suggestedAction: string;
}

export interface SalesIntelData {
  source: 'live' | 'demo';
  provider?: string;
  leads: LeadScore[];
  competitors: Competitor[];
  signals: MarketSignal[];
  summary: {
    totalLeads: number;
    hotLeads: number;
    avgLeadScore: number;
    totalPipelineValue: number;
    competitorThreats: number;
    activeSignals: number;
    topIndustry: string;
    conversionRate: number;
  };
  recommendations: string[];
}

// ─── Main data fetcher ──────────────────────────────────

export async function getSalesIntelData(companyId: string): Promise<SalesIntelData> {
  const connId = await getCRMConnection(companyId);

  if (connId) {
    // Future: fetch from CRM via Unified.to
    // For now, return demo with live source marker
  }

  return getDemoSalesIntel();
}

function getDemoSalesIntel(): SalesIntelData {
  const leads: LeadScore[] = [
    { id: 'lead-1', company: 'FreshDirect Logistics', contactName: 'Sarah Kim', contactEmail: 'skim@freshdirect.com', score: 92, grade: 'A', signals: ['Expanding to 3 new warehouses', 'Posted WMS job listings', 'Current system is legacy AS/400'], industry: 'Food & Beverage', estimatedValue: 185000, source: 'Inbound — website demo request', lastActivity: '2026-02-28', nextAction: 'Schedule discovery call — high intent buyer' },
    { id: 'lead-2', company: 'Peak Performance 3PL', contactName: 'James Wheeler', contactEmail: 'jwheeler@peak3pl.com', score: 87, grade: 'A', signals: ['Lost major client due to fulfillment errors', 'CEO mentioned automation at conference', 'Budget approved for Q2'], industry: '3PL', estimatedValue: 240000, source: 'Referral — Cabelas contact', lastActivity: '2026-02-25', nextAction: 'Send ROI calculator + case study' },
    { id: 'lead-3', company: 'Intermountain Health Supply', contactName: 'Patricia Vega', contactEmail: 'pvega@imhealth.org', score: 74, grade: 'B', signals: ['Regulatory compliance deadline approaching', 'Current provider contract expires June'], industry: 'Healthcare', estimatedValue: 320000, source: 'Trade show — MODEX 2026', lastActivity: '2026-02-20', nextAction: 'Follow up on compliance requirements' },
    { id: 'lead-4', company: 'Summit Athletic', contactName: 'Derek Cole', contactEmail: 'dcole@summitath.com', score: 68, grade: 'B', signals: ['DTC shift increasing warehouse needs', 'Hired VP of Operations'], industry: 'Retail / DTC', estimatedValue: 95000, source: 'LinkedIn outbound', lastActivity: '2026-02-18', nextAction: 'Connect with new VP Ops on LinkedIn' },
    { id: 'lead-5', company: 'Great Basin Ag Co-op', contactName: 'Mike Hartley', contactEmail: 'mhartley@greatbasinag.com', score: 55, grade: 'C', signals: ['Seasonal peak approaching', 'Small operation — may not meet minimum'], industry: 'Agriculture', estimatedValue: 45000, source: 'Cold outbound', lastActivity: '2026-02-10', nextAction: 'Nurture sequence — not ready to buy' },
    { id: 'lead-6', company: 'Velocity Commerce', contactName: 'Anna Chen', contactEmail: 'achen@velocitycom.io', score: 81, grade: 'A', signals: ['Series B funded ($18M)', 'Tripled headcount in 6 months', 'Currently using spreadsheets for inventory'], industry: 'E-Commerce', estimatedValue: 156000, source: 'Inbound — blog content', lastActivity: '2026-02-27', nextAction: 'Demo scheduled March 5 — prepare custom deck' },
  ];

  const competitors: Competitor[] = [
    { id: 'comp-1', name: 'Körber Supply Chain', strength: 'strong', recentMoves: ['Acquired HighJump', 'Launched AI forecasting module', 'Won Walmart fresh division'], winRate: 35, avgDealSize: 450000, positioning: 'Enterprise-grade WMS with deep SAP integration' },
    { id: 'comp-2', name: 'Deposco', strength: 'moderate', recentMoves: ['New mid-market pricing tier', 'Partnership with Shopify'], winRate: 22, avgDealSize: 120000, positioning: 'Cloud-native, fast implementation for growing brands' },
    { id: 'comp-3', name: 'Logiwa', strength: 'moderate', recentMoves: ['Launched fulfillment network', 'Free tier for small 3PLs'], winRate: 18, avgDealSize: 65000, positioning: 'DTC/3PL focused, marketplace integrations' },
    { id: 'comp-4', name: 'Local integrators', strength: 'weak', recentMoves: ['Competing on price for small projects'], winRate: 12, avgDealSize: 35000, positioning: 'Low-cost, limited automation capability' },
  ];

  const signals: MarketSignal[] = [
    { id: 'sig-1', type: 'expansion', company: 'FreshDirect Logistics', headline: 'FreshDirect opening 3 new cold storage facilities in Mountain West', detail: 'Board approved $45M capex for regional expansion. Facilities expected online Q3 2026.', relevance: 'high', date: '2026-02-26', actionable: true, suggestedAction: 'Accelerate outreach — position as integration partner before RFP drops' },
    { id: 'sig-2', type: 'funding', company: 'Velocity Commerce', headline: 'Velocity Commerce closes $18M Series B', detail: 'Led by Andreessen Horowitz. Funds earmarked for operations infrastructure and hiring.', relevance: 'high', date: '2026-02-15', actionable: true, suggestedAction: 'They have budget now — push for demo this week' },
    { id: 'sig-3', type: 'hiring', company: 'Summit Athletic', headline: 'Summit Athletic hires VP of Operations from Nike', detail: 'Derek Cole joined from Nike distribution. Known for automation-first approach.', relevance: 'medium', date: '2026-02-12', actionable: true, suggestedAction: 'New VP will want to make changes — perfect timing for intro' },
    { id: 'sig-4', type: 'contract', company: 'Peak Performance 3PL', headline: 'Peak 3PL loses REI account after fulfillment issues', detail: 'REI moved to competitor after Q4 shipping delays. Peak looking to upgrade systems.', relevance: 'high', date: '2026-02-20', actionable: true, suggestedAction: 'Pain is fresh — lead with reliability messaging and SLA guarantees' },
    { id: 'sig-5', type: 'tech-adoption', company: 'Intermountain Health Supply', headline: 'Healthcare supply chains mandating DSCSA compliance by Nov 2026', detail: 'FDA Drug Supply Chain Security Act deadline. All pharma distributors must have track-and-trace.', relevance: 'medium', date: '2026-01-30', actionable: true, suggestedAction: 'Position compliance module as key differentiator' },
  ];

  const hotLeads = leads.filter(l => l.score >= 80);

  return {
    source: 'demo',
    leads,
    competitors,
    signals,
    summary: {
      totalLeads: leads.length,
      hotLeads: hotLeads.length,
      avgLeadScore: Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length),
      totalPipelineValue: leads.reduce((s, l) => s + l.estimatedValue, 0),
      competitorThreats: competitors.filter(c => c.strength === 'strong').length,
      activeSignals: signals.filter(s => s.actionable).length,
      topIndustry: '3PL',
      conversionRate: 28,
    },
    recommendations: [
      'FreshDirect and Velocity Commerce are highest-priority — both have budget and active buying signals',
      'Peak 3PL just lost a major client — lead with reliability and SLA messaging',
      'Körber is winning on enterprise deals — differentiate on implementation speed and AI capabilities',
      'Healthcare compliance deadline creates urgency for Intermountain — time-bound opportunity',
    ],
  };
}
