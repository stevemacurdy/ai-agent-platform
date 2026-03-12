export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getSTRData } from '@/lib/str-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'str');
  try {
    const { data, error } = await supabase().from('agent_str_data').select('*').limit(100);
    if (error || !data?.length) { const d = await getSTRData('_default'); return NextResponse.json({ ...d, source: 'demo' }); }
    return NextResponse.json({ items: data, source: 'live' });
  } catch { const d = await getSTRData('_default'); return NextResponse.json({ ...d, source: 'demo' }); }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'str', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'add-property': {
      const { propertyName, location, nightlyRate, platform } = body;
      const { data, error } = await supabase().from('agent_str_data').insert({ property_name: propertyName, location, nightly_rate: nightlyRate, platform, status: 'active' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Property added', data });
    }
    case 'update-rates': {
      const { id, nightlyRate, notes } = body;
      const { error } = await supabase().from('agent_str_data').update({ nightly_rate: nightlyRate, notes, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Rates updated' });
    }
    case 'pricing-optimization': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const properties = JSON.stringify(body.propertyData || []);
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a short-term rental pricing AI. Recommend rate changes per property considering occupancy vs 80% target, seasonal demand, events, guest ratings, and market rates.' },
        { role: 'user', content: `Properties: ${properties}\n\nProvide specific rate recommendations per property with reasoning and expected occupancy impact.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to optimize.' });
    }
    case 'review-analysis': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { propertyName, reviews } = body;
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a hospitality analytics AI for short-term rentals.' },
        { role: 'user', content: `Analyze reviews for ${propertyName}. Reviews: ${JSON.stringify(reviews || 'Mixed reviews with cleanliness concerns')}. Provide: 1) Sentiment summary, 2) Top 3 positives, 3) Top 3 negatives, 4) Action items, 5) Market comparison, 6) Estimated rating improvement.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to analyze.' });
    }
    case 'market-comparison': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { propertyName, location } = body;
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a short-term rental market analyst for Utah properties.' },
        { role: 'user', content: `Benchmark ${propertyName} in ${location} against market averages. Include: 1) Rate comparison, 2) Occupancy benchmark, 3) Rating benchmark, 4) Revenue per available night, 5) Competitive position, 6) Recommendations.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to compare.' });
    }
    default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
