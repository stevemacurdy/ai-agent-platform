export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getWmsData } from '@/lib/wms/wms-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'wms');
  try {
    const { data, error } = await supabase().from('wms_inventory').select('*').limit(100);
    if (error || !data?.length) {
      const demoData = getWmsData('_default');
      return NextResponse.json({ ...demoData, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demoData = getWmsData('_default');
    return NextResponse.json({ ...demoData, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'wms', 'action');
  const body = await request.json();
  const { action } = body;
  // Auth guard: AI actions require Bearer token (CRUD actions pass through)
  const AI_ACTIONS = ['slotting-optimization', 'analyze-throughput'];
  if (AI_ACTIONS.includes(action)) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required for AI actions' }, { status: 401 });
    }
  }
  switch (action) {
    case 'create-wave': {
      return NextResponse.json({ result: 'Pick wave created. Assigned to next available picker.' });
    }
    case 'cycle-count': {
      const { zone } = body;
      return NextResponse.json({ result: `Cycle count initiated for ${zone || 'Zone A'}. Estimated completion: 45 minutes.` });
    }
    case 'slotting-optimization': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const wmsData = JSON.stringify(body.zoneData || {});
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a warehouse slotting optimization AI for a warehouse systems integration company. Provide specific, actionable analysis.' },
          { role: 'user', content: `Zone data: ${wmsData}\n\nAnalyze current bin assignments vs pick frequency. Recommend: 1) SKUs that should move to faster-access bins, 2) Zone rebalancing (Zone C at 94% vs Zone A at 67%), 3) Specific bin-to-bin moves with time savings, 4) Pick route optimization. Minimize picker travel time while maintaining zone balance.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to optimize slotting.' });
    }
    case 'analyze-throughput': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const throughputData = JSON.stringify(body.throughputData || {});
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a warehouse operations analyst AI.' },
          { role: 'user', content: `Throughput data: ${throughputData}\n\nAnalyze: 1) Bottleneck hours and root causes, 2) Picker performance gaps, 3) Wave sizing recommendations, 4) Staffing adjustments by shift, 5) Projected throughput with recommendations applied.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to analyze throughput.' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
