export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getSeoData } from '@/lib/seo/seo-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'seo');
  try {
    const { data, error } = await supabase().from('agent_seo_data').select('*').limit(100);
    if (error || !data?.length) {
      const demoData = getSeoData('_default');
      return NextResponse.json({ ...demoData, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demoData = getSeoData('_default');
    return NextResponse.json({ ...demoData, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'seo', 'action');
  const body = await request.json();
  const { action } = body;
  // Auth guard: AI actions require Bearer token (CRUD actions pass through)
  const AI_ACTIONS = ['audit', 'content-brief', 'analyze-rankings'];
  if (AI_ACTIONS.includes(action)) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required for AI actions' }, { status: 401 });
    }
  }
  switch (action) {
    case 'add-keyword': {
      const { keywords } = body;
      const rows = (keywords || []).map((k: string) => ({ keyword: k, current_position: null, search_volume: null, difficulty: null }));
      const { error } = await supabase().from('agent_seo_data').insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: `Added ${rows.length} keywords` });
    }
    case 'audit': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const siteData = JSON.stringify(body.siteData || {});
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a technical SEO auditor for a warehouse systems integration company. Provide specific, actionable analysis.' },
          { role: 'user', content: `Site data: ${siteData}\n\nProvide: 1) Critical issues to fix immediately (broken links, missing meta), 2) Performance optimizations (Core Web Vitals), 3) Mobile usability issues, 4) Schema markup recommendations, 5) Priority-ordered action plan with estimated traffic impact.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate audit.' });
    }
    case 'content-brief': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { keyword, searchVolume, difficulty } = body;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SEO content strategist for a warehouse systems integration company.' },
          { role: 'user', content: `Generate a comprehensive content brief for "${keyword}" (search volume: ${searchVolume || 'N/A'}, difficulty: ${difficulty || 'N/A'}). Include: 1) Target word count, 2) H2/H3 outline with 8-12 sections, 3) Key topics to cover, 4) Internal linking suggestions, 5) Featured snippet opportunity, 6) Competitor content analysis (what top 3 results cover), 7) Unique angle recommendation.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate brief.' });
    }
    case 'analyze-rankings': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const rankings = JSON.stringify(body.rankings || []);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an SEO ranking analyst for a warehouse systems integration company.' },
          { role: 'user', content: `Ranking data: ${rankings}\n\nAnalyze: 1) Keywords with significant drops and why, 2) Keywords gaining momentum, 3) Quick wins (close to page 1), 4) Keywords to deprioritize, 5) Content refresh recommendations for dropped keywords.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to analyze rankings.' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
