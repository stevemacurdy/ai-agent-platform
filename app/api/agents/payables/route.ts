export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getPayablesData } from '@/lib/payables-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'payables');
  try {
    const { data, error } = await supabase().from('agent_payables_data').select('*').order('due_date', { ascending: true }).limit(200);
    if (error || !data?.length) {
      const demo = await getPayablesData('demo');
      return NextResponse.json({ ...demo, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demo = await getPayablesData('demo');
    return NextResponse.json({ ...demo, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'payables', 'action');
  const body = await request.json();
  const { action } = body;

  // Auth guard: AI actions require Bearer token (CRUD actions pass through)
  const AI_ACTIONS = ['analyze-discounts', 'detect-duplicates'];
  if (AI_ACTIONS.includes(action)) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required for AI actions' }, { status: 401 });
    }
  }

  try {
    switch (action) {
      case 'approve': {
        const { id, approvedBy } = body;
        await supabase().from('agent_payables_data').update({ status: 'approved', approved_by: approvedBy }).eq('id', id);
        return NextResponse.json({ success: true });
      }
      case 'schedule-payment': {
        const { id, paymentDate, method } = body;
        await supabase().from('agent_payables_data').update({ status: 'scheduled', payment_method: method, notes: `Scheduled for ${paymentDate}` }).eq('id', id);
        return NextResponse.json({ success: true });
      }
      case 'batch-approve': {
        const { ids } = body;
        for (const id of ids || []) { await supabase().from('agent_payables_data').update({ status: 'approved' }).eq('id', id); }
        return NextResponse.json({ success: true, count: (ids || []).length });
      }
      case 'analyze-discounts': {
        const { invoices } = body;
        const summary = (invoices || []).map((i: any) => `${i.vendor}: $${i.amount}, discount ${i.discount}%, deadline ${i.discountDeadline || 'N/A'}`).join('\n');
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 1000, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are an AP optimization AI for a warehouse systems company with $5.1M in cash reserves and $423K in total payables. Analyze available early-pay discounts and provide: 1) Which discounts to capture (ranked by ROI), 2) Total savings if all recommended discounts are captured, 3) Impact on cash flow timing, 4) Vendors where negotiating better discount terms would be valuable.' },
            { role: 'user', content: `Current invoices with discounts:\n${summary}\n\nRecommend which discounts to capture.` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to analyze.' });
      }
      case 'detect-duplicates': {
        const { invoices } = body;
        const summary = (invoices || []).map((i: any) => `${i.vendor}, Invoice #${i.invoiceNumber}, $${i.amount}, ${i.dueDate}`).join('\n');
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini', max_tokens: 1000, temperature: 0.3,
          messages: [
            { role: 'system', content: 'You are a financial fraud and error detection AI. Scan the following invoice data for: 1) Duplicate invoices (same vendor + similar amount + close dates), 2) Suspicious patterns (round numbers, sequential invoice numbers with gaps), 3) Invoices that may be double-billed under different invoice numbers. Flag each finding with confidence level and recommended action.' },
            { role: 'user', content: `Invoices to scan:\n${summary}` }
          ],
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to detect.' });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
