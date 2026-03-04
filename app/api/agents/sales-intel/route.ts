export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getSalesIntelData } from '@/lib/sales-intel-data';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function _GET(request: NextRequest) {
  trackUsage(request, 'sales-intel');
  try {
    const { data, error } = await supabase.from('agent_sales_intel_data').select('*').order('lead_score', { ascending: false }).limit(200);
    if (error || !data?.length) {
      const demo = await getSalesIntelData('demo');
      return NextResponse.json({ ...demo, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demo = await getSalesIntelData('demo');
    return NextResponse.json({ ...demo, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'sales-intel', 'action');
  const body = await request.json();
  const { action } = body;
  try {
    switch (action) {
      case 'add-prospect': {
        const { prospectName, prospectCompany, industry, source: src } = body;
        const { error } = await supabase.from('agent_sales_intel_data').insert({ prospect_name: prospectName, prospect_company: prospectCompany, industry, source: src, lead_score: 50 });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }
      case 'enrich': {
        const { companyName, industry } = body;
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 1000, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are a B2B sales intelligence AI for a warehouse systems integration company. Generate a concise company profile including: 1) Estimated company size and revenue, 2) Likely decision makers and their titles, 3) Key pain points related to warehouse/logistics operations, 4) Current technology stack (if inferrable), 5) Recommended approach and talking points, 6) Potential deal size estimate.' },
            { role: 'user', content: `Generate intelligence brief for: ${companyName} in ${industry || 'unknown'} industry.` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to enrich.' });
      }
      case 'build-outreach': {
        const { prospects, count } = body;
        const summary = (prospects || []).slice(0, 10).map((p: any) => `${p.company}: score ${p.score}, industry ${p.industry}, signals: ${p.signals || 'none'}`).join('\n');
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 1200, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are a sales outreach strategist. From the following prospect list, select the top prospects most likely to convert based on lead scores and intent signals. For each selected prospect, write a personalized 3-sentence outreach message that references their specific intent signals and industry pain points. Format: Prospect Name | Score | Personalized Message.' },
            { role: 'user', content: `Select top ${count || 5} prospects and write outreach:\n${summary}` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to build outreach.' });
      }
      case 'score-lead': {
        const { companyName, industry, signals } = body;
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 500, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are a lead scoring AI. Score this prospect 0-100 for fit with a warehouse systems integration company. Explain your reasoning in 3-4 bullet points.' },
            { role: 'user', content: `Score: ${companyName}, Industry: ${industry}, Signals: ${signals || 'none'}` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to score.' });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
