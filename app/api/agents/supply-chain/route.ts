export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getWmsData } from '@/lib/wms/wms-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function _GET(request: NextRequest) {
  trackUsage(request, 'supply-chain');
  try {
    const { data, error } = await supabase.from('agent_supply_chain_data').select('*').limit(100);
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
  trackUsage(request, 'supply-chain', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'add-vendor': {
      const { vendorName, category, contactEmail } = body;
      const { data, error } = await supabase.from('agent_supply_chain_data').insert({ vendor_name: vendorName, category, contact_email: contactEmail, risk_level: 'low' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Vendor added', data });
    }
    case 'update-scorecard': {
      const { id, onTimeRate, qualityScore, riskLevel } = body;
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (onTimeRate !== undefined) updates.on_time_rate = onTimeRate;
      if (qualityScore !== undefined) updates.quality_score = qualityScore;
      if (riskLevel) updates.risk_level = riskLevel;
      const { error } = await supabase.from('agent_supply_chain_data').update(updates).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Scorecard updated' });
    }
    case 'find-alternatives': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { vendorName, category, reason } = body;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a supply chain intelligence AI for a warehouse systems integration company. Provide specific, actionable analysis.' },
          { role: 'user', content: `Vendor "${vendorName}" (category: ${category}) has ${reason}. Recommend 3 alternative suppliers. For each: 1) Company name and suitability, 2) Estimated lead time, 3) Pricing vs current, 4) Risk assessment, 5) Transition timeline. Focus on warehouse/industrial supply.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to find alternatives.' });
    }
    case 'risk-report': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const vendors = JSON.stringify(body.vendors || []);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a supply chain risk management AI for a warehouse systems integration company.' },
          { role: 'user', content: `Vendor portfolio: ${vendors}\n\nIdentify: 1) Single-source dependencies, 2) Geographic concentration risks, 3) Vendors with deteriorating performance, 4) Contract expirations needing attention, 5) Risk mitigations with priority ranking.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate risk report.' });
    }
    case 'generate-rfq': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { vendorName, items, specifications } = body;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a procurement specialist AI. Draft professional RFQ documents.' },
          { role: 'user', content: `Draft an RFQ for ${vendorName}. Items: ${items || 'warehouse equipment'}. Specifications: ${specifications || 'standard industrial grade'}. Include: 1) Professional header, 2) Scope of work, 3) Specifications table, 4) Delivery requirements, 5) Pricing format, 6) Evaluation criteria, 7) Response deadline.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate RFQ.' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
