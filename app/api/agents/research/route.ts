export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getResearchData } from '@/lib/research-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'research');
  try {
    const { data, error } = await supabase().from('agent_research_data').select('*').limit(100);
    if (error || !data?.length) {
      const d = await getResearchData('_default');
      return NextResponse.json({ ...d, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const d = await getResearchData('_default');
    return NextResponse.json({ ...d, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'research', 'action');
  const body = await request.json();
  const { action } = body;
  // Auth guard: AI actions require Bearer token (CRUD actions pass through)
  const AI_ACTIONS = ['analyze-competitor', 'market-report', 'trend-alert'];
  if (AI_ACTIONS.includes(action)) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required for AI actions' }, { status: 401 });
    }
  }
  switch (action) {
    case 'add-competitor': {
      const { competitorName, marketShare, revenueEstimate, threatLevel } = body;
      const { data, error } = await supabase().from('agent_research_data').insert({
        competitor_name: competitorName, market_share: marketShare,
        revenue_estimate: revenueEstimate, threat_level: threatLevel || 'low',
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Competitor added', data });
    }
    case 'analyze-competitor': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { competitorName, recentMoves, strengths, weaknesses } = body;
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a competitive intelligence AI for a warehouse systems integration company.' },
        { role: 'user', content: `SWOT analysis for ${competitorName}. Recent moves: ${recentMoves || 'N/A'}. Known strengths: ${JSON.stringify(strengths || [])}. Known weaknesses: ${JSON.stringify(weaknesses || [])}. Include: 1) Strengths (4-5), 2) Weaknesses we can exploit (4-5), 3) Opportunities to win (3-4), 4) Threats (3-4). End with strategic recommendation.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to analyze.' });
    }
    case 'market-report': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const competitors = JSON.stringify(body.competitors || []);
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a market research AI.' },
        { role: 'user', content: `Competitor data: ${competitors}\n\nGenerate WMS market overview: 1) Market size and growth, 2) Key players and share shifts, 3) Tech trends (AI, automation, robotics), 4) Customer segments, 5) Geographic opportunities, 6) Threats and disruptions, 7) Strategic positioning recommendations.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to generate report.' });
    }
    case 'trend-alert': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a market trends AI for the warehouse/logistics industry.' },
        { role: 'user', content: `Identify 5 emerging trends in warehouse management systems and logistics technology. For each: 1) Trend name, 2) Description, 3) Impact on our business, 4) Recommended action, 5) Timeline to impact.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to identify trends.' });
    }
    default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
