export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getWmsData } from '@/lib/wms/wms-data';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function _GET(request: NextRequest) {
  trackUsage(request, 'warehouse');
  try {
    const { data, error } = await supabase.from('wms_inventory').select('*').limit(100);
    if (error || !data?.length) { const d = getWmsData('_default'); return NextResponse.json({ ...d, source: 'demo' }); }
    return NextResponse.json({ items: data, source: 'live' });
  } catch { const d = getWmsData('_default'); return NextResponse.json({ ...d, source: 'demo' }); }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'warehouse', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'optimize-routes': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const orders = JSON.stringify(body.orders || []);
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a warehouse operations AI. Optimize pick routes to minimize travel time.' },
        { role: 'user', content: `Orders: ${orders}\n\nOptimize pick routes: 1) Group by zone, 2) Sequence by location, 3) Estimate time savings, 4) Identify batch opportunities.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to optimize.' });
    }
    case 'zone-rebalance': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const zones = JSON.stringify(body.zones || []);
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a warehouse layout optimization AI.' },
        { role: 'user', content: `Zone data: ${zones}\n\nRecommend zone rebalancing: 1) Overloaded zones, 2) Underutilized zones, 3) SKU move recommendations, 4) Expected throughput improvement.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to rebalance.' });
    }
    case 'shift-report': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a warehouse shift supervisor AI.' },
        { role: 'user', content: `Generate end-of-shift report: 342 orders processed, 99.4% pick accuracy, 2847 units shipped, 78% space utilization. Include: 1) Shift summary, 2) Key achievements, 3) Issues encountered, 4) Handoff items for next shift, 5) Safety observations.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to generate report.' });
    }
    default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
