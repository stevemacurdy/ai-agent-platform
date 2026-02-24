export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

const profiles: any[] = [
  {
    id: 'bp-1', name: 'Marcus Chen', company: 'Logicorp', title: 'VP Operations',
    style: 'Analytical', tone: 'Measured, data-driven', persona: 'The Numbers Cruncher',
    personaDesc: 'Makes decisions based on hard data and ROI projections. Distrusts qualitative claims.',
    realityScore: 78, engagement: 'high',
    triggers: ['3-year cost projections', 'ROI breakdowns', 'Industry benchmarks', 'Case studies with metrics'],
    bridge: 'Needs a detailed financial model showing payback period under 18 months',
    painPoints: ['Current system downtime costing $12K/month', 'Manual inventory counts', 'No real-time visibility'],
    dos: ['Lead with 3-year cost-savings projection', 'Bring printed ROI analysis', 'Reference Deloitte/McKinsey benchmarks', 'Let him drive the meeting pace', 'Follow up with spreadsheet summary'],
    donts: ['Lead with vision statements', 'Use superlatives without data', 'Rush the decision timeline', 'Skip the financial appendix', 'Name-drop without context'],
    negotiationTips: ['Will negotiate on payment terms, not price', 'Responds to volume discount structures', 'Wants penalty clauses that show confidence'],
    lastAnalyzed: '2026-02-10',
  },
  {
    id: 'bp-2', name: 'Sarah Kim', company: 'Pinnacle Group', title: 'CEO',
    style: 'Expressive', tone: 'Energetic, future-focused', persona: 'The Visionary',
    personaDesc: 'Gets excited by innovation and competitive advantage. Makes quick decisions when inspired.',
    realityScore: 85, engagement: 'very_high',
    triggers: ['Competitive edge stories', 'Innovation showcases', 'Speed to market', 'Press-worthy outcomes'],
    bridge: 'Show her how this positions Pinnacle as an industry leader — she wants the story, not just the tool',
    painPoints: ['Competitors adopting automation faster', 'Board pressure for modernization', 'Talent retention'],
    dos: ['Open with the big vision', 'Show the "future state" demo first', 'Mention press/PR potential', 'Match her energy level', 'Send a 1-page executive summary'],
    donts: ['Start with technical specifications', 'Send 40-page proposals', 'Focus on risk mitigation', 'Be overly conservative in estimates', 'Schedule 2-hour deep dives'],
    negotiationTips: ['Will pay premium for speed of delivery', 'Values exclusivity clauses', 'Wants executive sponsorship visibility'],
    lastAnalyzed: '2026-02-08',
  },
  {
    id: 'bp-3', name: 'Tom Bradley', company: 'GreenLeaf Supply', title: 'Director of Logistics',
    style: 'Relational', tone: 'Warm, consensus-seeking', persona: 'The Consensus Builder',
    personaDesc: 'Values relationships and team harmony. Won\'t commit without internal alignment.',
    realityScore: 52, engagement: 'medium',
    triggers: ['Team testimonials', 'Implementation support promises', 'Long-term partnership framing', 'Reference calls'],
    bridge: 'Needs to bring his team on board — offer a group demo and let his people ask questions directly',
    painPoints: ['Team resistant to change', 'Previous vendor burned them', 'Budget approval requires 3 signatures'],
    dos: ['Ask about his team first', 'Offer reference calls with similar companies', 'Frame as partnership not transaction', 'Be patient with timeline', 'Include his team in demos'],
    donts: ['Push for solo decision', 'Create artificial urgency', 'Dismiss his concerns about team readiness', 'Skip the relationship-building phase', 'Send contracts before he signals readiness'],
    negotiationTips: ['Values ongoing support over upfront discount', 'Wants named account manager', 'Will commit for longer terms if relationship feels right'],
    lastAnalyzed: '2026-02-05',
  },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const p = profiles.find(pr => pr.id === id);
    return p ? NextResponse.json({ profile: p }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ profiles: profiles.map(p => ({ id: p.id, name: p.name, company: p.company, style: p.style, persona: p.persona, realityScore: p.realityScore, engagement: p.engagement })), totalProfiles: profiles.length });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();
  if (body.action === 'analyze') {
    const notes = (body.notes || '').toLowerCase();
    // Rule-based personality detection (fallback if no OpenAI key)
    let style = 'Relational';
    if (notes.includes('roi') || notes.includes('data') || notes.includes('numbers') || notes.includes('spreadsheet')) style = 'Analytical';
    else if (notes.includes('vision') || notes.includes('excited') || notes.includes('innovative') || notes.includes('fast')) style = 'Expressive';
    else if (notes.includes('direct') || notes.includes('bottom line') || notes.includes('no nonsense')) style = 'Direct';

    const newProfile = {
      id: 'bp-' + Date.now(), name: body.name || 'Unknown', company: body.company || 'Unknown', title: body.title || '',
      style, tone: style === 'Analytical' ? 'Measured, data-driven' : style === 'Expressive' ? 'Energetic, future-focused' : style === 'Direct' ? 'Blunt, results-oriented' : 'Warm, consensus-seeking',
      persona: style === 'Analytical' ? 'The Numbers Cruncher' : style === 'Expressive' ? 'The Visionary' : style === 'Direct' ? 'The Decision Maker' : 'The Consensus Builder',
      personaDesc: 'Generated from meeting notes analysis.',
      realityScore: Math.floor(Math.random() * 40) + 40,
      engagement: 'medium',
      triggers: ['Follow up needed'], bridge: 'More interaction data needed',
      painPoints: ['TBD — schedule discovery call'],
      dos: ['Mirror their communication style', 'Follow up within 24 hours', 'Reference their specific pain points', 'Be prepared with relevant case studies', 'Confirm next steps in writing'],
      donts: ['Use generic pitches', 'Skip the research phase', 'Assume one meeting is enough', 'Ignore their preferred communication channel', 'Rush the close'],
      negotiationTips: ['Build rapport first', 'Listen more than talk'],
      lastAnalyzed: new Date().toISOString(),
    };
    profiles.push(newProfile);
    return NextResponse.json({ success: true, profile: newProfile, engine: 'rule-based-fallback' });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
