export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getFinOpsData } from '@/lib/finops-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'finops');
  try {
    const { data, error } = await supabase()
      .from('agent_finops_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data?.length) {
      const demo = await getFinOpsData('demo');
      return NextResponse.json({ ...demo, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demo = await getFinOpsData('demo');
    return NextResponse.json({ ...demo, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'finops', 'action');
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case 'create-entry': {
        const { department, category, period, budgetAmount, actualAmount, companyId } = body;
        const { error } = await supabase().from('agent_finops_data').insert({
          company_id: companyId || null, department, category, period,
          budget_amount: budgetAmount, actual_amount: actualAmount,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'adjust-budget': {
        const { id, newAmount, reason } = body;
        const { error } = await supabase().from('agent_finops_data')
          .update({ budget_amount: newAmount, notes: reason })
          .eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'forecast': {
        const { costs } = body;
        const summary = (costs || []).map((c: any) =>
          `${c.name}: Budget $${c.budgeted?.toLocaleString()}, Actual $${c.actual?.toLocaleString()}, Variance ${c.variancePercent}%`
        ).join('\n');
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a financial planning and analysis AI for a warehouse systems company with $5.1M in reserves and $284K monthly burn. Analyze the department spending trends and provide: 1) 3-month projected spend by department, 2) Key variance drivers, 3) Risk areas where overspend is likely to continue, 4) Specific cost reduction opportunities. Format with clear sections and specific dollar amounts.' },
            { role: 'user', content: `Current department spending:\n${summary}\n\nGenerate a 3-month spending forecast with analysis.` }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to generate forecast.' });
      }

      case 'scenario': {
        const { question } = body;
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a financial modeling AI. Given current burn rate of $284K/mo, revenue of $412K/mo, and $5.1M reserves, model the following scenario and provide: 1) Impact on monthly burn rate, 2) Impact on runway, 3) Impact on gross margin, 4) Department-level effects, 5) Recommendation with timeline. Use specific dollar amounts.' },
            { role: 'user', content: `Model this scenario: ${question}` }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to model scenario.' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
