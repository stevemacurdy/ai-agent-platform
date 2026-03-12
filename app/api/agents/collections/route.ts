export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getCollectionsData } from '@/lib/collections-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'collections');
  try {
    const { data, error } = await supabase()
      .from('agent_collections_data')
      .select('*')
      .order('days_overdue', { ascending: false })
      .limit(100);
    if (error || !data?.length) {
      const demo = await getCollectionsData('demo');
      return NextResponse.json({ ...demo, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demo = await getCollectionsData('demo');
    return NextResponse.json({ ...demo, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'collections', 'action');
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case 'log-contact': {
        const { id, notes, outcome } = body;
        await supabase()
          .from('agent_collections_data')
          .update({ notes, next_action: outcome, last_contact_date: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', id);
        return NextResponse.json({ success: true });
      }

      case 'update-status': {
        const { id: sid, status } = body;
        await supabase()
          .from('agent_collections_data')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', sid);
        return NextResponse.json({ success: true });
      }

      case 'analyze': {
        const { accounts } = body;
        const summary = (accounts || []).map((a: any) =>
          `${a.client || a.customer_name}: $${(a.totalOwed || a.amount || 0).toLocaleString()}, ${a.oldestOverdueDays || a.days_overdue || 0} days overdue, risk ${a.riskTier || a.risk_score || 'unknown'}`
        ).join('\n');
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a collections strategy AI for a B2B warehouse systems company. Analyze the accounts receivable data and provide: 1) Prioritized list of accounts to focus on this week, 2) Specific recommended actions for each account, 3) Estimated recovery amounts if actions are taken, 4) Accounts to consider for write-off. Use clear formatting with sections.' },
            { role: 'user', content: `Current overdue accounts:\n${summary}\n\nProvide a prioritized collection strategy.` }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to generate analysis.' });
      }

      case 'generate-letter': {
        const { customerName, amount, daysOverdue, previousContacts } = body;
        const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional business correspondence writer. Draft a firm but professional collection letter. Include: the specific amount owed, number of days overdue, reference to previous contact attempts, a clear deadline for payment, and consequences of non-payment. Maintain a respectful tone.' },
            { role: 'user', content: `Draft a collection letter for:\nCustomer: ${customerName}\nAmount: $${amount}\nDays overdue: ${daysOverdue}\nPrevious contacts: ${previousContacts || 'None on record'}` }
          ],
          max_tokens: 800,
          temperature: 0.3,
        });
        return NextResponse.json({ result: resp.choices[0]?.message?.content || 'Unable to generate letter.' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}
