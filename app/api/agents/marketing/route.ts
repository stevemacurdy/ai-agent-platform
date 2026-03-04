export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getMarketingData } from '@/lib/marketing/marketing-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function _GET(request: NextRequest) {
  trackUsage(request, 'marketing');
  try {
    const { data, error } = await supabase.from('agent_marketing_data').select('*').limit(100);
    if (error || !data?.length) {
      const demoData = getMarketingData('_default');
      return NextResponse.json({ ...demoData, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demoData = getMarketingData('_default');
    return NextResponse.json({ ...demoData, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'marketing', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'create-campaign': {
      const { campaignName, channel, spend, startDate } = body;
      const { data, error } = await supabase.from('agent_marketing_data').insert({ campaign_name: campaignName, channel, spend, start_date: startDate, status: 'draft' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Campaign created', data });
    }
    case 'update-campaign': {
      const { id, status, spend: s, notes } = body;
      const updates: Record<string, unknown> = {};
      if (status) updates.status = status;
      if (s !== undefined) updates.spend = s;
      if (notes) updates.notes = notes;
      const { error } = await supabase.from('agent_marketing_data').update(updates).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Campaign updated' });
    }
    case 'analyze-performance': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const campaigns = JSON.stringify(body.campaigns || []);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a marketing budget optimization AI for a warehouse systems integration company. Provide specific, actionable analysis.' },
          { role: 'user', content: `Campaign data: ${campaigns}\n\nTotal monthly budget: $23,200. Recommend: 1) Specific dollar amounts to shift between channels, 2) Which campaigns to pause, 3) New campaign types to test, 4) Projected impact on total leads and CPL. Base recommendations on ROI data.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate analysis.' });
    }
    case 'generate-copy': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { campaignName: cn, channel: ch, tone, audience } = body;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a B2B marketing copywriter for a warehouse systems company.' },
          { role: 'user', content: `Write 3 ad copy variants for ${ch} targeting ${audience || 'warehouse managers'}. Campaign: ${cn}. Tone: ${tone || 'professional'}. Each variant: headline (max 60 chars), body (max 150 chars), CTA. Variant 1: benefit-focused, Variant 2: pain-point focused, Variant 3: social-proof focused.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate copy.' });
    }
    case 'ab-test-plan': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { campaignName: cn2, element } = body;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a marketing experimentation specialist.' },
          { role: 'user', content: `Design an A/B test for campaign "${cn2}" testing "${element || 'headline'}". Include: 1) What to test with 2 variants, 2) Sample size calculation, 3) Test duration, 4) Primary and secondary metrics, 5) Expected lift range.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate test plan.' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
