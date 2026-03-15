export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getSalesCoachData } from '@/lib/sales-coach-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'sales-coach');
  try {
    const { data, error } = await supabase().from('agent_sales_coach_data').select('*').order('actual', { ascending: false }).limit(100);
    if (error || !data?.length) {
      const demo = await getSalesCoachData('demo');
      return NextResponse.json({ ...demo, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demo = await getSalesCoachData('demo');
    return NextResponse.json({ ...demo, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'sales-coach', 'action');
  const body = await request.json();
  const { action } = body;

  // Auth guard: AI actions require Bearer token (CRUD actions pass through)
  const AI_ACTIONS = ['generate-coaching-plan', 'analyze-win-loss', 'generate-roleplay'];
  if (AI_ACTIONS.includes(action)) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required for AI actions' }, { status: 401 });
    }
  }

  try {
    switch (action) {
      case 'log-session': {
        const { repName, notes, actionItems } = body;
        await supabase().from('agent_sales_coach_data').update({ coaching_notes: notes }).eq('rep_name', repName);
        return NextResponse.json({ success: true });
      }
      case 'generate-coaching-plan': {
        const { repName, quota, actual, winRate, strengths, weaknesses } = body;
        const attainment = quota > 0 ? Math.round((actual / quota) * 100) : 0;
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 1200, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are a B2B sales coaching AI. Generate a structured 30-day coaching plan. Include: 1) Key focus area, 2) Weekly goals and exercises, 3) Specific roleplay scenarios, 4) Metrics to track, 5) Resources to review. Be specific and actionable for warehouse systems / 3PL sales.' },
            { role: 'user', content: `Create coaching plan for ${repName}.\nQuota attainment: ${attainment}%, Win rate: ${winRate}%\nStrengths: ${strengths}\nWeaknesses: ${weaknesses}` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to generate plan.' });
      }
      case 'analyze-win-loss': {
        const { reps } = body;
        const summary = (reps || []).map((r: any) => `${r.name}: quota ${r.attainment}%, win rate ${r.winRate}%, deals ${r.deals}`).join('\n');
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 1000, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are a sales analytics AI. Analyze win/loss patterns and provide: 1) Top reasons for wins, 2) Top reasons for losses, 3) Competitive patterns, 4) Stage where deals stall most, 5) Specific recommendations per rep.' },
            { role: 'user', content: `Analyze win/loss patterns for team:\n${summary}` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to analyze.' });
      }
      case 'generate-roleplay': {
        const { repName, weakness, dealType } = body;
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 1200, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are a sales training AI. Create a realistic roleplay scenario for a sales rep who struggles with the given weakness. Include: 1) Scene setting (prospect company, stakeholder, situation), 2) 3-4 objections to handle, 3) Scoring rubric, 4) Model responses. Make it specific to warehouse systems/3PL sales.' },
            { role: 'user', content: `Create roleplay for ${repName}.\nWeakness: ${weakness}\nDeal type: ${dealType || 'warehouse integration project'}` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to generate roleplay.' });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
