import { createClient } from '@supabase/supabase-js';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const UNIFIED_API = 'https://api.unified.to';
const UNIFIED_KEY = process.env.UNIFIED_API_KEY || '';

// ============================================================
// CONNECTION LOOKUP
// ============================================================
export async function getCRMConnection(companyId?: string) {
  if (!companyId) return null;
  const { data } = await supabase()
    .from('integration_connections')
    .select('*')
    .eq('company_id', companyId)
    .eq('category', 'crm')
    .eq('status', 'active')
    .limit(1)
    .single();
  return data;
}

// ============================================================
// MAIN DATA FETCHER
// ============================================================
export async function getSalesData(companyId?: string) {
  const conn = await getCRMConnection(companyId);
  if (conn) {
    try {
      const [deals, contacts, companies, activities] = await Promise.all([
        fetchLiveDeals(conn.connection_id),
        fetchLiveContacts(conn.connection_id),
        fetchLiveCompanies(conn.connection_id),
        fetchLiveActivities(conn.connection_id),
      ]);
      const pipeline = analyzePipeline(deals);
      const velocity = calculateVelocity(deals);
      const leaderboard = buildLeaderboard(deals);
      const forecast = buildForecast(deals);
      const atRisk = identifyAtRiskDeals(deals);
      return {
        source: 'live',
        provider: conn.provider || 'CRM',
        deals, contacts, companies, activities,
        pipeline, velocity, leaderboard, forecast, atRisk,
        summary: buildSummary(deals, contacts, companies),
      };
    } catch (e) {
      console.error('Live CRM fetch failed, falling back to demo:', e);
    }
  }
  return getDemoData();
}

// ============================================================
// LIVE DATA FETCHERS
// ============================================================
async function unifiedGet(connectionId: string, path: string) {
  const res = await fetch(`${UNIFIED_API}${path}`, {
    headers: {
      'Authorization': `Bearer ${UNIFIED_KEY}`,
      'x-connection-id': connectionId,
    },
  });
  if (!res.ok) throw new Error(`Unified.to ${path}: ${res.status}`);
  return res.json();
}

async function fetchLiveDeals(connId: string) {
  const raw = await unifiedGet(connId, '/crm/deal');
  return (raw || []).map((d: any) => ({
    id: d.id,
    name: d.name || 'Untitled Deal',
    amount: d.amount || 0,
    stage: d.stage || 'unknown',
    probability: d.probability || 0,
    closeDate: d.close_date || null,
    createdAt: d.created_at || null,
    updatedAt: d.updated_at || null,
    ownerId: d.user_id || null,
    ownerName: d.user?.name || 'Unassigned',
    companyName: d.company?.name || '',
    contactName: d.contact?.name || '',
    source: d.source || '',
    lostReason: d.lost_reason || null,
    weightedValue: (d.amount || 0) * (d.probability || 0),
  }));
}

async function fetchLiveContacts(connId: string) {
  const raw = await unifiedGet(connId, '/crm/contact');
  return (raw || []).slice(0, 100).map((c: any) => ({
    id: c.id,
    name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
    email: c.emails?.[0]?.email || '',
    company: c.company?.name || '',
    createdAt: c.created_at,
  }));
}

async function fetchLiveCompanies(connId: string) {
  const raw = await unifiedGet(connId, '/crm/company');
  return (raw || []).slice(0, 50).map((c: any) => ({
    id: c.id,
    name: c.name || 'Unknown',
    industry: c.industry || '',
    employees: c.employees || 0,
    website: c.website || '',
  }));
}

async function fetchLiveActivities(connId: string) {
  try {
    const raw = await unifiedGet(connId, '/crm/event');
    return (raw || []).slice(0, 50).map((a: any) => ({
      id: a.id,
      type: a.type || 'note',
      subject: a.subject || a.name || '',
      date: a.created_at,
      dealId: a.deal_id || null,
      contactId: a.contact_id || null,
    }));
  } catch {
    return [];
  }
}

// ============================================================
// PIPELINE ANALYSIS
// ============================================================
function analyzePipeline(deals: any[]) {
  const stages: Record<string, { count: number; value: number; weighted: number; deals: any[] }> = {};
  const stageOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  for (const d of deals) {
    const s = (d.stage || 'unknown').toLowerCase().replace(/\s+/g, '_');
    if (!stages[s]) stages[s] = { count: 0, value: 0, weighted: 0, deals: [] };
    stages[s].count++;
    stages[s].value += d.amount;
    stages[s].weighted += d.weightedValue;
    stages[s].deals.push(d);
  }

  const openDeals = deals.filter(d => !d.stage?.toLowerCase().includes('closed'));
  const wonDeals = deals.filter(d => d.stage?.toLowerCase().includes('won'));
  const lostDeals = deals.filter(d => d.stage?.toLowerCase().includes('lost'));

  return {
    stages,
    stageOrder: stageOrder.filter(s => stages[s]),
    totalOpen: openDeals.length,
    totalOpenValue: openDeals.reduce((s, d) => s + d.amount, 0),
    totalWeighted: openDeals.reduce((s, d) => s + d.weightedValue, 0),
    wonCount: wonDeals.length,
    wonValue: wonDeals.reduce((s, d) => s + d.amount, 0),
    lostCount: lostDeals.length,
    lostValue: lostDeals.reduce((s, d) => s + d.amount, 0),
    winRate: wonDeals.length + lostDeals.length > 0
      ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
      : 0,
  };
}

// ============================================================
// VELOCITY METRICS
// ============================================================
function calculateVelocity(deals: any[]) {
  const wonDeals = deals.filter(d => d.stage?.toLowerCase().includes('won') && d.createdAt);
  const cycleTimes = wonDeals
    .map(d => {
      const created = new Date(d.createdAt).getTime();
      const closed = new Date(d.updatedAt || d.closeDate || Date.now()).getTime();
      return Math.max(1, Math.round((closed - created) / (1000 * 60 * 60 * 24)));
    })
    .filter(d => d > 0 && d < 365);

  const avgCycleTime = cycleTimes.length > 0
    ? Math.round(cycleTimes.reduce((s, t) => s + t, 0) / cycleTimes.length)
    : 0;

  const avgDealSize = wonDeals.length > 0
    ? Math.round(wonDeals.reduce((s, d) => s + d.amount, 0) / wonDeals.length)
    : 0;

  const openDeals = deals.filter(d => !d.stage?.toLowerCase().includes('closed'));
  const pipeline = analyzePipeline(deals);

  // Sales velocity = (# opportunities × avg deal size × win rate) / avg cycle time
  const velocity = avgCycleTime > 0
    ? Math.round((openDeals.length * avgDealSize * (pipeline.winRate / 100)) / avgCycleTime)
    : 0;

  return {
    avgCycleTime,
    avgDealSize,
    velocity,
    dealsPerMonth: wonDeals.length > 0 ? Math.round(wonDeals.length / Math.max(1, cycleTimes.length > 0 ? Math.round(Math.max(...cycleTimes) / 30) : 3)) : 0,
    conversionByStage: Object.entries(pipeline.stages).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value,
    })),
  };
}

// ============================================================
// REP LEADERBOARD
// ============================================================
function buildLeaderboard(deals: any[]) {
  const reps: Record<string, { name: string; won: number; wonValue: number; open: number; openValue: number; lost: number; total: number }> = {};

  for (const d of deals) {
    const name = d.ownerName || 'Unassigned';
    if (!reps[name]) reps[name] = { name, won: 0, wonValue: 0, open: 0, openValue: 0, lost: 0, total: 0 };
    reps[name].total++;
    if (d.stage?.toLowerCase().includes('won')) {
      reps[name].won++;
      reps[name].wonValue += d.amount;
    } else if (d.stage?.toLowerCase().includes('lost')) {
      reps[name].lost++;
    } else {
      reps[name].open++;
      reps[name].openValue += d.amount;
    }
  }

  return Object.values(reps)
    .map(r => ({
      ...r,
      winRate: r.won + r.lost > 0 ? Math.round((r.won / (r.won + r.lost)) * 100) : 0,
    }))
    .sort((a, b) => b.wonValue - a.wonValue);
}

// ============================================================
// FORECAST
// ============================================================
function buildForecast(deals: any[]) {
  const now = new Date();
  const windows = [
    { label: 'This Week', days: 7 },
    { label: 'This Month', days: 30 },
    { label: 'This Quarter', days: 90 },
    { label: 'Next Quarter', days: 180 },
  ];

  const openDeals = deals.filter(d => !d.stage?.toLowerCase().includes('closed'));

  return windows.map(w => {
    const cutoff = new Date(now.getTime() + w.days * 86400000);
    const inWindow = openDeals.filter(d => {
      if (!d.closeDate) return w.days >= 90; // unscheduled deals go in quarterly+
      return new Date(d.closeDate) <= cutoff;
    });
    const bestCase = inWindow.reduce((s, d) => s + d.amount, 0);
    const weighted = inWindow.reduce((s, d) => s + d.weightedValue, 0);
    const commit = inWindow.filter(d => (d.probability || 0) >= 0.7).reduce((s, d) => s + d.amount, 0);

    return {
      window: w.label,
      dealCount: inWindow.length,
      bestCase,
      weighted: Math.round(weighted),
      commit,
      deals: inWindow.slice(0, 5).map(d => ({ id: d.id, name: d.name, amount: d.amount, stage: d.stage, probability: d.probability, companyName: d.companyName })),
    };
  });
}

// ============================================================
// AT-RISK DEALS
// ============================================================
function identifyAtRiskDeals(deals: any[]) {
  const now = Date.now();
  const openDeals = deals.filter(d => !d.stage?.toLowerCase().includes('closed'));

  return openDeals
    .map(d => {
      const risks: string[] = [];
      let riskScore = 0;

      // Overdue close date
      if (d.closeDate && new Date(d.closeDate).getTime() < now) {
        risks.push('Past expected close date');
        riskScore += 30;
      }

      // Stale — no update in 14+ days
      if (d.updatedAt) {
        const daysSinceUpdate = Math.round((now - new Date(d.updatedAt).getTime()) / 86400000);
        if (daysSinceUpdate > 30) { risks.push(`No activity in ${daysSinceUpdate} days`); riskScore += 40; }
        else if (daysSinceUpdate > 14) { risks.push(`Stale — ${daysSinceUpdate} days since last update`); riskScore += 20; }
      }

      // Low probability in late stage
      if ((d.stage?.toLowerCase().includes('negotiation') || d.stage?.toLowerCase().includes('proposal')) && (d.probability || 0) < 0.5) {
        risks.push('Low probability for advanced stage');
        riskScore += 25;
      }

      // Large deal with no close date
      if (d.amount > 50000 && !d.closeDate) {
        risks.push('Large deal missing close date');
        riskScore += 15;
      }

      return { ...d, risks, riskScore };
    })
    .filter(d => d.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);
}

// ============================================================
// SUMMARY
// ============================================================
function buildSummary(deals: any[], contacts: any[], companies: any[]) {
  const pipeline = analyzePipeline(deals);
  return {
    totalDeals: deals.length,
    openDeals: pipeline.totalOpen,
    pipelineValue: pipeline.totalOpenValue,
    weightedPipeline: pipeline.totalWeighted,
    wonValue: pipeline.wonValue,
    wonCount: pipeline.wonCount,
    lostCount: pipeline.lostCount,
    winRate: pipeline.winRate,
    totalContacts: contacts.length,
    totalCompanies: companies.length,
  };
}

// ============================================================
// RECOMMENDATIONS
// ============================================================
export function generateRecommendations(data: any) {
  const recs: string[] = [];
  const { summary, velocity, atRisk } = data;

  if (summary.winRate < 25) recs.push('Win rate is below 25% — review qualification criteria and consider tightening your ICP definition.');
  else if (summary.winRate < 40) recs.push('Win rate is moderate at ' + summary.winRate + '% — analyze lost deals for common objections to address earlier in the cycle.');

  if (velocity.avgCycleTime > 60) recs.push('Average deal cycle is ' + velocity.avgCycleTime + ' days — look for bottlenecks between stages, especially proposal-to-negotiation.');
  else if (velocity.avgCycleTime > 30) recs.push('Deal cycle averaging ' + velocity.avgCycleTime + ' days — consider mutual action plans to keep momentum.');

  if (atRisk.length > 3) recs.push(atRisk.length + ' deals are at risk — prioritize outreach to stale and overdue opportunities this week.');

  if (summary.weightedPipeline < summary.wonValue * 3) recs.push('Weighted pipeline is less than 3x of closed-won — increase top-of-funnel prospecting to maintain growth.');

  const unassigned = data.deals?.filter((d: any) => d.ownerName === 'Unassigned').length || 0;
  if (unassigned > 0) recs.push(unassigned + ' deals have no assigned rep — assign owners to prevent deals from going stale.');

  if (recs.length === 0) recs.push('Pipeline looks healthy — keep up the momentum and focus on advancing deals in negotiation stage.');

  return recs;
}

// ============================================================
// DEMO DATA
// ============================================================
function getDemoData() {
  const deals = [
    { id: 'd1', name: 'Acme Corp - Warehouse Automation', amount: 125000, stage: 'Negotiation', probability: 0.75, closeDate: '2026-03-15', createdAt: '2026-01-10', updatedAt: '2026-02-28', ownerName: 'Jake Miller', companyName: 'Acme Corp', contactName: 'Sarah Chen', source: 'Inbound', lostReason: null, weightedValue: 93750 },
    { id: 'd2', name: 'TechFlow - Conveyor System', amount: 89000, stage: 'Proposal', probability: 0.5, closeDate: '2026-03-28', createdAt: '2026-01-22', updatedAt: '2026-02-25', ownerName: 'Jake Miller', companyName: 'TechFlow Inc', contactName: 'Mike Rodriguez', source: 'Referral', lostReason: null, weightedValue: 44500 },
    { id: 'd3', name: 'Global Logistics - Full WMS', amount: 340000, stage: 'Qualification', probability: 0.25, closeDate: '2026-05-01', createdAt: '2026-02-01', updatedAt: '2026-02-20', ownerName: 'Emma Davis', companyName: 'Global Logistics', contactName: 'James Wu', source: 'Cold Outreach', lostReason: null, weightedValue: 85000 },
    { id: 'd4', name: 'FreshFoods - Cold Storage Racking', amount: 67000, stage: 'Prospecting', probability: 0.1, closeDate: null, createdAt: '2026-02-15', updatedAt: '2026-02-27', ownerName: 'Emma Davis', companyName: 'FreshFoods LLC', contactName: 'Lisa Park', source: 'Trade Show', lostReason: null, weightedValue: 6700 },
    { id: 'd5', name: 'Summit Brands - Pick Module', amount: 210000, stage: 'Negotiation', probability: 0.8, closeDate: '2026-03-10', createdAt: '2025-12-05', updatedAt: '2026-02-26', ownerName: 'Jake Miller', companyName: 'Summit Brands', contactName: 'Tom Reyes', source: 'Existing Client', lostReason: null, weightedValue: 168000 },
    { id: 'd6', name: 'QuickShip - Sortation System', amount: 156000, stage: 'Closed Won', probability: 1.0, closeDate: '2026-02-20', createdAt: '2025-11-15', updatedAt: '2026-02-20', ownerName: 'Jake Miller', companyName: 'QuickShip', contactName: 'Amy Tran', source: 'Referral', lostReason: null, weightedValue: 156000 },
    { id: 'd7', name: 'RetailMax - Mezzanine Install', amount: 95000, stage: 'Closed Won', probability: 1.0, closeDate: '2026-02-10', createdAt: '2025-10-20', updatedAt: '2026-02-10', ownerName: 'Emma Davis', companyName: 'RetailMax', contactName: 'Dan O\'Brien', source: 'Inbound', lostReason: null, weightedValue: 95000 },
    { id: 'd8', name: 'Apex Distribution - Pallet Racking', amount: 43000, stage: 'Closed Lost', probability: 0, closeDate: '2026-02-18', createdAt: '2025-12-01', updatedAt: '2026-02-18', ownerName: 'Emma Davis', companyName: 'Apex Distribution', contactName: 'Karen Lee', source: 'Inbound', lostReason: 'Budget constraints', weightedValue: 0 },
    { id: 'd9', name: 'Pinnacle Freight - Dock Equipment', amount: 78000, stage: 'Proposal', probability: 0.4, closeDate: '2026-04-05', createdAt: '2026-01-30', updatedAt: '2026-02-12', ownerName: 'Jake Miller', companyName: 'Pinnacle Freight', contactName: 'Bob Martinez', source: 'Cold Outreach', lostReason: null, weightedValue: 31200 },
    { id: 'd10', name: 'Metro Warehousing - Shelving Upgrade', amount: 31000, stage: 'Closed Lost', probability: 0, closeDate: '2026-01-25', createdAt: '2025-11-10', updatedAt: '2026-01-25', ownerName: 'Jake Miller', companyName: 'Metro Warehousing', contactName: 'Steve Hall', source: 'Existing Client', lostReason: 'Went with competitor', weightedValue: 0 },
  ];

  const contacts = [
    { id: 'c1', name: 'Sarah Chen', email: 'sarah@acmecorp.com', company: 'Acme Corp', createdAt: '2025-11-01' },
    { id: 'c2', name: 'Mike Rodriguez', email: 'mike@techflow.io', company: 'TechFlow Inc', createdAt: '2025-12-15' },
    { id: 'c3', name: 'James Wu', email: 'jwu@globallogistics.com', company: 'Global Logistics', createdAt: '2026-01-20' },
    { id: 'c4', name: 'Lisa Park', email: 'lisa@freshfoods.com', company: 'FreshFoods LLC', createdAt: '2026-02-10' },
    { id: 'c5', name: 'Tom Reyes', email: 'treyes@summitbrands.com', company: 'Summit Brands', createdAt: '2025-10-05' },
  ];

  const companies = [
    { id: 'co1', name: 'Acme Corp', industry: 'Manufacturing', employees: 500, website: 'acmecorp.com' },
    { id: 'co2', name: 'TechFlow Inc', industry: 'Technology', employees: 120, website: 'techflow.io' },
    { id: 'co3', name: 'Global Logistics', industry: 'Logistics', employees: 2000, website: 'globallogistics.com' },
    { id: 'co4', name: 'Summit Brands', industry: 'Retail', employees: 350, website: 'summitbrands.com' },
  ];

  const activities: any[] = [];

  const pipeline = analyzePipeline(deals);
  const velocity = calculateVelocity(deals);
  const leaderboard = buildLeaderboard(deals);
  const forecast = buildForecast(deals);
  const atRisk = identifyAtRiskDeals(deals);

  return {
    source: 'demo',
    provider: null,
    deals, contacts, companies, activities,
    pipeline, velocity, leaderboard, forecast, atRisk,
    summary: buildSummary(deals, contacts, companies),
  };
}
