export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAILS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function getEmail(req: NextRequest) { return req.headers.get('x-admin-email') || ''; }
function isAuth(req: NextRequest) { return ADMIN_EMAILS.includes(getEmail(req).toLowerCase()); }

// ============================================================================
// In-Memory CRM Store (swap to Supabase when tables are live)
// ============================================================================

interface Contact {
  id: string; name: string; email: string; phone: string; company: string;
  title: string; linkedinUrl: string; twitterUrl: string; bioNotes: string;
  source: string; createdAt: string; totalRevenue: number; lifetimeValue: number;
}

interface Deal {
  id: string; contactId: string; title: string; value: number;
  stage: string; probability: number; assignedTo: string;
  expectedClose: string; notes: string; createdAt: string; closedAt: string | null;
}

interface Activity {
  id: string; dealId: string; contactId: string; type: string;
  description: string; metadata: any; createdBy: string; createdAt: string;
}

let contacts: Contact[] = [
  { id: 'c1', name: 'James Patterson', email: 'james@logicorp.com', phone: '(415) 555-0121', company: 'Logicorp', title: 'VP of Operations', linkedinUrl: 'linkedin.com/in/jpatterson', twitterUrl: '@jpatterson', bioNotes: 'Former supply chain director at Amazon. Marathon runner. Responds best to data-driven pitches. Has two kids, mentions them often. Decision maker but needs CFO sign-off for >$50K.', source: 'LinkedIn Outreach', createdAt: '2025-11-15', totalRevenue: 14970, lifetimeValue: 35900 },
  { id: 'c2', name: 'Lisa Chen', email: 'lchen@techforge.io', phone: '(650) 555-0198', company: 'TechForge Inc', title: 'CEO', linkedinUrl: 'linkedin.com/in/lisachen', twitterUrl: '@lisachen_tf', bioNotes: 'Serial entrepreneur, 3rd company. Very technical, built TechForge first product herself. Prefers Slack over email. Wine enthusiast. Fast decision maker, hates long sales cycles.', source: 'Conference - AI Summit 2025', createdAt: '2025-09-22', totalRevenue: 38970, lifetimeValue: 77940 },
  { id: 'c3', name: 'David Okafor', email: 'david@greenleaf.co', phone: '(312) 555-0145', company: 'GreenLeaf Supply', title: 'Head of Logistics', linkedinUrl: 'linkedin.com/in/dokafor', twitterUrl: '', bioNotes: 'Cautious buyer. Wants to see 3 months of ROI data before expanding. Currently evaluating competitors. His boss (CFO) is the real blocker. Plays golf, good meeting setting.', source: 'Referral from TechForge', createdAt: '2026-01-05', totalRevenue: 1490, lifetimeValue: 4470 },
  { id: 'c4', name: 'Maria Santos', email: 'msantos@pinnacle.com', phone: '(212) 555-0167', company: 'Pinnacle Group', title: 'Director of Digital Transformation', linkedinUrl: 'linkedin.com/in/msantos', twitterUrl: '@maria_pinnacle', bioNotes: 'Big budget, slow process. Needs executive summary format. Reports to a board. Interested in WMS + CFO agents as a bundle. Based in NYC, prefers in-person demos.', source: 'Inbound - Website Demo Request', createdAt: '2025-12-01', totalRevenue: 5990, lifetimeValue: 47920 },
  { id: 'c5', name: 'Ryan Kim', email: 'rkim@meridian.io', phone: '(206) 555-0133', company: 'Meridian', title: 'CTO', linkedinUrl: 'linkedin.com/in/ryankim', twitterUrl: '@rkim_dev', bioNotes: 'Technical evaluator. Wants API docs, integration specs, and a sandbox before committing. Open source contributor. Vegetarian, keep in mind for dinner meetings.', source: 'GitHub Stars', createdAt: '2026-01-20', totalRevenue: 0, lifetimeValue: 15580 },
];

let deals: Deal[] = [
  { id: 'd1', contactId: 'c1', title: 'Logicorp WMS Agent', value: 14970, stage: 'closed_won', probability: 100, assignedTo: 'Marcus Williams', expectedClose: '2026-01-15', notes: 'Annual contract. Upsell opportunity for CFO agent.', createdAt: '2025-11-20', closedAt: '2026-01-15' },
  { id: 'd2', contactId: 'c2', title: 'TechForge Enterprise Suite', value: 38970, stage: 'closed_won', probability: 100, assignedTo: 'Steve Macurdy', expectedClose: '2025-12-30', notes: 'Closed at conference. 3-year commitment.', createdAt: '2025-09-25', closedAt: '2025-12-30' },
  { id: 'd3', contactId: 'c2', title: 'TechForge Agent Creator Add-on', value: 12000, stage: 'proposal', probability: 75, assignedTo: 'Steve Macurdy', expectedClose: '2026-03-15', notes: 'Lisa wants custom agent building. High interest.', createdAt: '2026-02-01', closedAt: null },
  { id: 'd4', contactId: 'c3', title: 'GreenLeaf Starter Package', value: 1490, stage: 'negotiation', probability: 60, assignedTo: 'Marcus Williams', expectedClose: '2026-03-01', notes: 'CFO is the blocker. Need ROI deck.', createdAt: '2026-01-10', closedAt: null },
  { id: 'd5', contactId: 'c4', title: 'Pinnacle Full Platform', value: 47920, stage: 'discovery', probability: 35, assignedTo: 'Sarah Chen', expectedClose: '2026-06-01', notes: 'Board presentation needed. Big deal.', createdAt: '2025-12-05', closedAt: null },
  { id: 'd6', contactId: 'c5', title: 'Meridian Dev Pilot', value: 4990, stage: 'prospecting', probability: 20, assignedTo: 'Steve Macurdy', expectedClose: '2026-04-01', notes: 'Wants sandbox access first.', createdAt: '2026-01-25', closedAt: null },
  { id: 'd7', contactId: 'c4', title: 'Pinnacle CFO Agent POC', value: 5990, stage: 'proposal', probability: 55, assignedTo: 'Sarah Chen', expectedClose: '2026-04-15', notes: 'Proof of concept for board.', createdAt: '2026-01-15', closedAt: null },
  { id: 'd8', contactId: 'c1', title: 'Logicorp CFO Agent Expansion', value: 8990, stage: 'discovery', probability: 40, assignedTo: 'Marcus Williams', expectedClose: '2026-04-01', notes: 'James very interested after WMS success.', createdAt: '2026-02-10', closedAt: null },
];

let activities: Activity[] = [
  { id: 'a1', dealId: 'd1', contactId: 'c1', type: 'meeting', description: 'Initial demo of WMS Agent. James impressed with billing reconciliation feature.', metadata: { duration: '45 min' }, createdBy: 'Marcus Williams', createdAt: '2025-11-22T10:00:00Z' },
  { id: 'a2', dealId: 'd1', contactId: 'c1', type: 'email', description: 'Sent proposal with ROI projections. Projected $12K/yr savings.', metadata: {}, createdBy: 'Marcus Williams', createdAt: '2025-11-25T14:00:00Z' },
  { id: 'a3', dealId: 'd1', contactId: 'c1', type: 'call', description: 'CFO approved budget. James confirmed annual commitment.', metadata: { duration: '15 min' }, createdBy: 'Marcus Williams', createdAt: '2026-01-10T16:00:00Z' },
  { id: 'a4', dealId: 'd1', contactId: 'c1', type: 'stage_change', description: 'Deal moved to Closed-Won', metadata: { from: 'negotiation', to: 'closed_won' }, createdBy: 'System', createdAt: '2026-01-15T09:00:00Z' },
  { id: 'a5', dealId: 'd2', contactId: 'c2', type: 'meeting', description: 'Met Lisa at AI Summit. She demoed the platform on her laptop right there.', metadata: { duration: '30 min', location: 'AI Summit 2025' }, createdBy: 'Steve Macurdy', createdAt: '2025-09-22T15:00:00Z' },
  { id: 'a6', dealId: 'd2', contactId: 'c2', type: 'call', description: 'Follow-up. Lisa wants enterprise features. Negotiating 3-year term.', metadata: { duration: '25 min' }, createdBy: 'Steve Macurdy', createdAt: '2025-10-05T11:00:00Z' },
  { id: 'a7', dealId: 'd3', contactId: 'c2', type: 'email', description: 'Lisa requested Agent Creator pricing. Sent custom quote.', metadata: {}, createdBy: 'Steve Macurdy', createdAt: '2026-02-05T10:00:00Z' },
  { id: 'a8', dealId: 'd4', contactId: 'c3', type: 'meeting', description: 'Discovery call. David interested but needs CFO buy-in.', metadata: { duration: '40 min' }, createdBy: 'Marcus Williams', createdAt: '2026-01-12T14:00:00Z' },
  { id: 'a9', dealId: 'd4', contactId: 'c3', type: 'note', description: 'David mentioned his CFO plays golf at Pebble Beach. Potential angle for relationship building.', metadata: {}, createdBy: 'Marcus Williams', createdAt: '2026-01-15T09:00:00Z' },
  { id: 'a10', dealId: 'd5', contactId: 'c4', type: 'meeting', description: 'In-person demo at Pinnacle NYC office. Maria brought her CTO and CFO.', metadata: { duration: '90 min', location: 'Pinnacle HQ, NYC' }, createdBy: 'Sarah Chen', createdAt: '2026-01-08T10:00:00Z' },
  { id: 'a11', dealId: 'd5', contactId: 'c4', type: 'document', description: 'Sent executive summary and ROI projections to Maria for board review.', metadata: { document: 'Pinnacle_ROI_Summary_v2.pdf' }, createdBy: 'Sarah Chen', createdAt: '2026-01-20T16:00:00Z' },
  { id: 'a12', dealId: 'd8', contactId: 'c1', type: 'call', description: 'James reached out proactively asking about CFO agent after seeing Q4 billing savings.', metadata: { duration: '20 min' }, createdBy: 'Marcus Williams', createdAt: '2026-02-10T11:00:00Z' },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'all';

  switch (action) {
    case 'all':
      return NextResponse.json({ contacts, deals, activities });
    case 'contact': {
      const id = searchParams.get('id');
      const contact = contacts.find(c => c.id === id);
      if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const contactDeals = deals.filter(d => d.contactId === id);
      const contactActivities = activities.filter(a => a.contactId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return NextResponse.json({ contact, deals: contactDeals, activities: contactActivities });
    }
    case 'pipeline':
      return NextResponse.json({ deals, contacts });
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  switch (body.action) {
    case 'move-deal': {
      const idx = deals.findIndex(d => d.id === body.dealId);
      if (idx === -1) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      const oldStage = deals[idx].stage;
      deals[idx].stage = body.stage;
      if (body.stage === 'closed_won') deals[idx].closedAt = new Date().toISOString();
      deals[idx].probability = body.stage === 'closed_won' ? 100 : body.stage === 'closed_lost' ? 0 : deals[idx].probability;
      activities.push({ id: 'a' + Date.now(), dealId: body.dealId, contactId: deals[idx].contactId, type: 'stage_change', description: 'Deal moved from ' + oldStage.replace('_', ' ') + ' to ' + body.stage.replace('_', ' '), metadata: { from: oldStage, to: body.stage }, createdBy: 'Admin', createdAt: new Date().toISOString() });
      return NextResponse.json({ deal: deals[idx] });
    }
    case 'add-activity': {
      const act: Activity = { id: 'a' + Date.now(), dealId: body.dealId || '', contactId: body.contactId, type: body.type, description: body.description, metadata: body.metadata || {}, createdBy: body.createdBy || 'Admin', createdAt: new Date().toISOString() };
      activities.push(act);
      return NextResponse.json({ activity: act });
    }
    case 'update-contact': {
      const idx = contacts.findIndex(c => c.id === body.contactId);
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const allowed = ['name', 'email', 'phone', 'title', 'bioNotes', 'linkedinUrl', 'twitterUrl'];
      for (const [k, v] of Object.entries(body.updates || {})) { if (allowed.includes(k)) (contacts[idx] as any)[k] = v; }
      return NextResponse.json({ contact: contacts[idx] });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
