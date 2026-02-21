import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// ====== BEHAVIORAL PROFILES ======
let profiles: Record<string, any> = {
  'contact-1': {
    contactId: 'contact-1', contactName: 'Marcus Chen', company: 'Logicorp',
    communicationStyle: 'Analytical',
    tonePace: 'Prefers deep-dive technical details. Asks follow-up questions. Wants data before decisions.',
    buyerPersona: 'The Numbers Cruncher',
    personaDescription: 'Marcus makes decisions based on spreadsheets, not gut feelings. He wants to see 3-year projections, ROI breakdowns, and competitive benchmarks before he even considers a meeting.',
    realityPotentialScore: 78,
    buyingTriggers: ['ROI', 'Efficiency', 'Scalability', 'Data-Driven'],
    buyingBridge: 'Show him a side-by-side comparison of current warehouse throughput vs. projected throughput with our automation — he needs to see the delta in hard numbers.',
    engagementLevel: 'high',
    painPoints: ['Manual inventory counts costing 40+ hours/month', 'Picking errors above 2%', 'Scaling concerns with Q4 volume'],
    doList: [
      'Lead with 3-year cost-savings projection',
      'Bring case study from similar-sized warehouse (250K+ sqft)',
      'Reference our 1,200+ project portfolio and 4M sqft track record',
      'Prepare equipment ROI breakdown per-unit',
      'Ask about their current WMS integration pain points',
    ],
    dontList: [
      'Do NOT lead with vision statements — he wants numbers first',
      'Avoid vague timeline estimates — he will pin you down',
      'Do not rush the technical Q&A — let him exhaust his questions',
      'Skip the golf/sports small talk — he prefers to get to business',
      'Never quote a range — give a single number with assumptions listed',
    ],
    negotiationTips: [
      'He will ask for a discount — counter with extended warranty or service agreement',
      'Decision timeline: 2-3 weeks after receiving final proposal',
      'His CFO (Dana Park) is the final approver — prepare a separate one-pager for her',
    ],
    lastAnalyzed: '2026-02-14T10:00:00Z',
    analysisSource: 'meeting_notes',
    meetingNotes: 'Marcus spent 45 min asking about conveyor throughput rates. Very focused on picking accuracy metrics. Mentioned their current system has 2.3% error rate and they need sub-1%. Asked for references from warehouse operations over 200K sqft. Did not engage with company culture discussion. Requested full technical spec sheet.',
  },
  'contact-2': {
    contactId: 'contact-2', contactName: 'Sarah Kim', company: 'Pinnacle Group',
    communicationStyle: 'Expressive',
    tonePace: 'High-energy, vision-oriented. Loves hearing about what is possible. Talks fast, decides fast.',
    buyerPersona: 'The Visionary',
    personaDescription: 'Sarah is building Pinnacle into a market leader and sees automation as the key differentiator. She thinks in terms of "what could be" and gets excited about cutting-edge solutions.',
    realityPotentialScore: 85,
    buyingTriggers: ['Innovation', 'Competitive Edge', 'Speed to Market', 'Scale'],
    buyingBridge: 'Paint the picture of what their operation looks like 18 months from now with full automation. She needs to see herself presenting this to her board as "the play that changed everything."',
    engagementLevel: 'very_high',
    painPoints: ['Losing contracts to competitors with faster fulfillment', 'Board pressure to modernize', 'Talent shortage in manual operations'],
    doList: [
      'Open with the $300M flagship project — it excites her',
      'Use phrases: "market-leading," "first-mover advantage," "operational transformation"',
      'Show the before/after visualization of automated vs manual ops',
      'Name-drop Fortune 500 clients we have worked with',
      'Propose a phased rollout so she can show quick wins to her board',
    ],
    dontList: [
      'Do NOT bog down in technical specifications — save for her ops team',
      'Avoid conservative language like "incremental improvement"',
      'Do not present only one option — give her a Good/Better/Best menu',
      'Never say "it depends" — she wants confident directional answers',
      'Skip the detailed ROI spreadsheet in the first meeting — save for follow-up',
    ],
    negotiationTips: [
      'She responds to urgency — "This quarter\'s pricing reflects..."',
      'Decision speed: Can get verbal yes in 1 meeting if vision aligns',
      'Her COO (James Wright) handles operational diligence — expect a second meeting',
    ],
    lastAnalyzed: '2026-02-15T14:00:00Z',
    analysisSource: 'transcript',
    meetingNotes: 'Sarah opened by asking what our biggest project is. Lit up when we mentioned the $300M project. She kept saying "this is exactly what we need." Talked about wanting to leapfrog their competition. Very little interest in specifics — wanted to know about timeline and impact. Used words like "transform," "game-changer," "dominate." Set up follow-up for next week.',
  },
  'contact-3': {
    contactId: 'contact-3', contactName: 'Tom Bradley', company: 'GreenLeaf Supply',
    communicationStyle: 'Relational',
    tonePace: 'Warm and people-focused. Builds trust through personal connection. Slow, methodical decision process.',
    buyerPersona: 'The Consensus Builder',
    personaDescription: 'Tom will not make a decision until his entire team is comfortable. He values relationships over transactions and needs to trust you personally before trusting your product.',
    realityPotentialScore: 52,
    buyingTriggers: ['Trust', 'Safety', 'Team Approval', 'Long-term Partnership'],
    buyingBridge: 'Arrange a site visit to one of our active projects so his team can meet our crew. He needs to feel like this is a partnership, not a purchase.',
    engagementLevel: 'medium',
    painPoints: ['Team morale issues from overwork', 'Safety incidents in manual handling', 'High employee turnover'],
    doList: [
      'Ask about his team — he will light up talking about his people',
      'Share stories about how automation improved worker safety at other sites',
      'Offer to include his ops manager in the next call',
      'Emphasize our post-installation support and training programs',
      'Send a handwritten thank-you note after the meeting',
    ],
    dontList: [
      'Do NOT push for a fast close — he will retreat',
      'Avoid aggressive sales tactics or "limited time" pressure',
      'Do not skip the relationship-building phase — it is essential',
      'Never dismiss his team concerns as "we will handle that later"',
      'Do not present without asking who else should be in the room',
    ],
    negotiationTips: [
      'Patience is key — expect 6-8 week sales cycle minimum',
      'He will consult 3-4 people before deciding',
      'A site visit or customer reference call will accelerate trust by 2-3 weeks',
    ],
    lastAnalyzed: '2026-02-12T11:00:00Z',
    analysisSource: 'meeting_notes',
    meetingNotes: 'Tom started with 10 min of personal conversation. Asked about our company culture and how we treat our warehouse crews. Very concerned about safety record. Mentioned two incidents last year from manual pallet handling. Wants to bring his operations manager and safety officer to the next meeting. Did not discuss pricing at all.',
  },
};

// AI Analysis Engine
async function analyzeNotes(contactName: string, company: string, notes: string): Promise<any> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_KEY) {
    // Rule-based fallback
    const lower = notes.toLowerCase();
    const style = lower.includes('data') || lower.includes('numbers') || lower.includes('roi') ? 'Analytical'
      : lower.includes('vision') || lower.includes('transform') || lower.includes('game') ? 'Expressive'
      : lower.includes('team') || lower.includes('people') || lower.includes('trust') ? 'Relational'
      : 'Direct';

    const persona = style === 'Analytical' ? 'The Numbers Cruncher'
      : style === 'Expressive' ? 'The Visionary'
      : style === 'Relational' ? 'The Consensus Builder' : 'The Decider';

    return {
      communicationStyle: style,
      tonePace: `Based on notes, ${contactName} appears to be ${style.toLowerCase()}-oriented.`,
      buyerPersona: persona,
      personaDescription: `${contactName} from ${company} shows ${style.toLowerCase()} tendencies in communication.`,
      realityPotentialScore: Math.floor(Math.random() * 30) + 50,
      buyingTriggers: style === 'Analytical' ? ['ROI', 'Data', 'Efficiency'] : style === 'Expressive' ? ['Innovation', 'Vision', 'Scale'] : ['Trust', 'Safety', 'Partnership'],
      buyingBridge: `Focus on ${style === 'Analytical' ? 'concrete data and projections' : style === 'Expressive' ? 'big-picture impact and transformation' : 'relationship building and team inclusion'}.`,
      doList: ['Prepare thoroughly', 'Follow up promptly', 'Address their specific pain points', 'Bring relevant case studies', 'Listen more than you talk'],
      dontList: ['Do not wing it', 'Avoid generic pitches', 'Do not ignore their communication style', 'Never oversell or overpromise', 'Do not skip follow-up'],
    };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: `Analyze these meeting notes for behavioral profiling. Contact: ${contactName} at ${company}.

Notes: "${notes}"

Return ONLY JSON:
{
  "communicationStyle": "Direct|Analytical|Relational|Expressive",
  "tonePace": "brief description of their preferred communication depth and speed",
  "buyerPersona": "catchy 2-3 word persona name like 'The Skeptic' or 'The Visionary'",
  "personaDescription": "2-3 sentence description of how they make buying decisions",
  "realityPotentialScore": 0-100,
  "buyingTriggers": ["keyword1", "keyword2", "keyword3"],
  "buyingBridge": "the one thing they need to see/hear to advance",
  "painPoints": ["pain1", "pain2", "pain3"],
  "doList": ["5 specific DO actions for the next meeting"],
  "dontList": ["5 specific DO NOT pitfalls to avoid"],
  "negotiationTips": ["3 negotiation-specific tips"]
}` }],
        temperature: 0.5, max_tokens: 1000,
      }),
    });
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content?.replace(/```json|```/g, '').trim());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get('contactId');

  if (contactId) {
    const profile = profiles[contactId];
    if (!profile) return NextResponse.json({ error: 'No profile yet. Submit meeting notes to generate.' }, { status: 404 });
    return NextResponse.json({ profile });
  }

  // List all profiles
  return NextResponse.json({
    profiles: Object.values(profiles),
    totalProfiles: Object.keys(profiles).length,
    avgRealityScore: Math.round(Object.values(profiles).reduce((s: number, p: any) => s + p.realityPotentialScore, 0) / Math.max(1, Object.keys(profiles).length)),
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  switch (body.action) {
    case 'analyze': {
      if (!body.contactId || !body.contactName || !body.notes) {
        return NextResponse.json({ error: 'contactId, contactName, and notes required' }, { status: 400 });
      }

      const analysis = await analyzeNotes(body.contactName, body.company || '', body.notes);
      if (!analysis) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });

      const profile = {
        contactId: body.contactId,
        contactName: body.contactName,
        company: body.company || '',
        ...analysis,
        engagementLevel: analysis.realityPotentialScore >= 70 ? 'high' : analysis.realityPotentialScore >= 40 ? 'medium' : 'low',
        lastAnalyzed: new Date().toISOString(),
        analysisSource: body.source || 'meeting_notes',
        meetingNotes: body.notes,
      };

      profiles[body.contactId] = profile;
      return NextResponse.json({ profile });
    }

    case 'update-notes': {
      if (!body.contactId || !body.notes) return NextResponse.json({ error: 'contactId and notes required' }, { status: 400 });
      const existing = profiles[body.contactId];
      if (!existing) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

      // Re-analyze with updated notes
      const combined = existing.meetingNotes + '\n\n--- New Notes ---\n' + body.notes;
      const analysis = await analyzeNotes(existing.contactName, existing.company, combined);
      if (analysis) {
        Object.assign(existing, analysis);
        existing.meetingNotes = combined;
        existing.lastAnalyzed = new Date().toISOString();
      }
      return NextResponse.json({ profile: existing });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
