// ─── Sales Coach Data Layer ──────────────────────────────
// Deal-level coaching, rep performance analytics, pipeline
// health scoring, and next-best-action recommendations.

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

export interface DealCoaching {
  id: string;
  dealName: string;
  company: string;
  rep: string;
  value: number;
  stage: string;
  daysInStage: number;
  healthScore: number;
  risks: string[];
  coaching: string[];
  nextSteps: string[];
  winProbability: number;
}

export interface RepPerformance {
  id: string;
  name: string;
  email: string;
  activeDeals: number;
  pipelineValue: number;
  quota: number;
  quotaAttainment: number;
  avgDealCycle: number;
  winRate: number;
  activitiesThisWeek: number;
  strengths: string[];
  improvements: string[];
}

export interface PipelineHealth {
  stage: string;
  dealCount: number;
  totalValue: number;
  avgDaysInStage: number;
  conversionRate: number;
  stuckDeals: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface SalesCoachData {
  source: 'live' | 'demo';
  provider?: string;
  deals: DealCoaching[];
  reps: RepPerformance[];
  pipeline: PipelineHealth[];
  summary: {
    totalPipeline: number;
    weightedPipeline: number;
    avgWinRate: number;
    avgDealCycle: number;
    dealsAtRisk: number;
    stuckDeals: number;
    teamQuotaAttainment: number;
    forecastAccuracy: number;
  };
  recommendations: string[];
}

// ─── Main data fetcher ──────────────────────────────────

export async function getSalesCoachData(companyId: string): Promise<SalesCoachData> {
  const connId = await getCRMConnection(companyId);
  if (connId) { /* Future: live CRM data */ }
  return getDemoSalesCoach();
}

function getDemoSalesCoach(): SalesCoachData {
  const deals: DealCoaching[] = [
    {
      id: 'deal-1', dealName: 'FreshDirect — Cold Storage Automation', company: 'FreshDirect Logistics', rep: 'Steve Macurdy', value: 185000, stage: 'Discovery', daysInStage: 3, healthScore: 88, winProbability: 65,
      risks: ['No technical champion identified yet', 'Competitor Körber also in discussions'],
      coaching: ['Ask about their current cold chain process — find the pain points', 'Get a site visit scheduled within 2 weeks', 'Identify the technical decision maker (likely VP Ops or IT Director)'],
      nextSteps: ['Discovery call scheduled March 5', 'Prepare cold storage case study from Cabelas project', 'Research their current AS/400 system limitations'],
    },
    {
      id: 'deal-2', dealName: 'Peak 3PL — Full WMS Overhaul', company: 'Peak Performance 3PL', rep: 'Steve Macurdy', value: 240000, stage: 'Proposal', daysInStage: 8, healthScore: 72, winProbability: 45,
      risks: ['Budget may be constrained after losing REI account', 'Deal champion went on leave', 'Proposal has been with procurement for 8 days without response'],
      coaching: ['Follow up with CFO directly — the champion being out means you need another path', 'Offer phased implementation to reduce upfront cost', 'Reference the REI loss — they need to show board theyre investing in reliability'],
      nextSteps: ['Call CFO James Wheeler Monday AM', 'Prepare phased pricing option', 'Draft ROI doc showing error reduction metrics'],
    },
    {
      id: 'deal-3', dealName: 'Velocity Commerce — Inventory System', company: 'Velocity Commerce', rep: 'Steve Macurdy', value: 156000, stage: 'Demo', daysInStage: 2, healthScore: 91, winProbability: 70,
      risks: ['Fast-moving startup — could go with cheaper SaaS option', 'CTO prefers build-vs-buy'],
      coaching: ['Demo should focus on speed-to-value — they cant wait 6 months for custom build', 'Highlight API-first architecture — appeals to their engineering culture', 'Show the Shopify/Amazon integrations prominently'],
      nextSteps: ['Demo scheduled March 5 at 2pm', 'Prepare custom demo environment with e-commerce data', 'Send pre-demo questionnaire about their current stack'],
    },
    {
      id: 'deal-4', dealName: 'Intermountain Health — Compliance Module', company: 'Intermountain Health Supply', rep: 'Steve Macurdy', value: 320000, stage: 'Negotiation', daysInStage: 14, healthScore: 58, winProbability: 35,
      risks: ['Legal review has stalled for 2 weeks', 'Compliance deadline is Nov 2026 — they may wait', 'Procurement pushing for 25% discount'],
      coaching: ['Create urgency — implementation takes 4-5 months, they cant wait til summer', 'Get legal on a call to address specific concerns directly', 'Hold firm on pricing — offer extended payment terms instead of discount'],
      nextSteps: ['Schedule joint call with their legal + our compliance team', 'Prepare implementation timeline showing Nov deadline risk', 'Draft payment plan option: 40/30/30 over 90 days'],
    },
    {
      id: 'deal-5', dealName: 'Summit Athletic — Warehouse Setup', company: 'Summit Athletic', rep: 'Steve Macurdy', value: 95000, stage: 'Qualification', daysInStage: 12, healthScore: 45, winProbability: 20,
      risks: ['New VP just started — still learning the org', 'Budget not confirmed', 'Long sales cycle expected for retail'],
      coaching: ['This is a nurture deal, not a close-this-quarter deal', 'Focus on building relationship with new VP Derek Cole', 'Send thought leadership content, not sales materials'],
      nextSteps: ['LinkedIn connection request to Derek Cole', 'Add to monthly newsletter', 'Set 45-day follow-up reminder'],
    },
  ];

  const reps: RepPerformance[] = [
    {
      id: 'rep-1', name: 'Steve Macurdy', email: 'steve@woulfgroup.com',
      activeDeals: 5, pipelineValue: 996000, quota: 500000, quotaAttainment: 62,
      avgDealCycle: 45, winRate: 34, activitiesThisWeek: 18,
      strengths: ['Strong technical knowledge', 'Good at discovery calls', 'Fast proposal turnaround'],
      improvements: ['Follow up more consistently on stalled deals', 'Get multi-threaded in accounts — dont rely on single champion', 'Increase outbound activity to fill top of funnel'],
    },
  ];

  const pipeline: PipelineHealth[] = [
    { stage: 'Qualification', dealCount: 1, totalValue: 95000, avgDaysInStage: 12, conversionRate: 60, stuckDeals: 0, status: 'healthy' },
    { stage: 'Discovery', dealCount: 1, totalValue: 185000, avgDaysInStage: 3, conversionRate: 55, stuckDeals: 0, status: 'healthy' },
    { stage: 'Demo', dealCount: 1, totalValue: 156000, avgDaysInStage: 2, conversionRate: 50, stuckDeals: 0, status: 'healthy' },
    { stage: 'Proposal', dealCount: 1, totalValue: 240000, avgDaysInStage: 8, conversionRate: 40, stuckDeals: 1, status: 'warning' },
    { stage: 'Negotiation', dealCount: 1, totalValue: 320000, avgDaysInStage: 14, conversionRate: 65, stuckDeals: 1, status: 'critical' },
  ];

  const totalPipeline = deals.reduce((s, d) => s + d.value, 0);
  const weightedPipeline = deals.reduce((s, d) => s + d.value * (d.winProbability / 100), 0);

  return {
    source: 'demo',
    deals,
    reps,
    pipeline,
    summary: {
      totalPipeline,
      weightedPipeline: Math.round(weightedPipeline),
      avgWinRate: 34,
      avgDealCycle: 45,
      dealsAtRisk: deals.filter(d => d.healthScore < 60).length,
      stuckDeals: pipeline.reduce((s, p) => s + p.stuckDeals, 0),
      teamQuotaAttainment: 62,
      forecastAccuracy: 78,
    },
    recommendations: [
      'Velocity Commerce demo is your best near-term close — prepare thoroughly for March 5',
      'Intermountain negotiation is stalling — schedule legal call this week or risk losing momentum',
      'Peak 3PL champion is out — get multi-threaded immediately (CFO, VP Ops)',
      'Pipeline is top-heavy in negotiation stage — focus on moving Discovery/Demo deals forward',
      'Outbound activity is below target — block 2 hours daily for prospecting',
    ],
  };
}
