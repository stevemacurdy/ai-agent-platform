export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getComplianceData } from '@/lib/compliance-data';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); return _supabase; }

async function _GET(request: NextRequest) {
  trackUsage(request, 'compliance');
  try {
    const { data, error } = await supabase().from('agent_compliance_data').select('*').limit(100);
    if (error || !data?.length) { const d = await getComplianceData('_default'); return NextResponse.json({ ...d, source: 'demo' }); }
    return NextResponse.json({ items: data, source: 'live' });
  } catch { const d = await getComplianceData('_default'); return NextResponse.json({ ...d, source: 'demo' }); }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'compliance', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'add-item': {
      const { regulation, category, owner, nextAuditDate } = body;
      const { data, error } = await supabase().from('agent_compliance_data').insert({ regulation, category, owner, next_audit_date: nextAuditDate, status: 'under-review' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Item added', data });
    }
    case 'update-status': {
      const { id, status, notes } = body;
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (notes) updates.notes = notes;
      const { error } = await supabase().from('agent_compliance_data').update(updates).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Status updated' });
    }
    case 'generate-checklist': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { regulation, scope } = body;
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a compliance audit AI for a warehouse systems integration company.' },
        { role: 'user', content: `Generate audit checklist for ${regulation} compliance. Scope: ${scope || 'full'}. Include: 1) Pre-audit prep, 2) Document requirements, 3) Interview questions, 4) Evidence to collect, 5) Common findings, 6) Pass/fail criteria. Format as numbered checklist.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to generate checklist.' });
    }
    case 'remediation-plan': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { finding, regulation, severity } = body;
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a compliance remediation AI.' },
        { role: 'user', content: `Create remediation plan. Finding: ${finding}, Regulation: ${regulation}, Severity: ${severity}. Include: 1) Root cause, 2) Immediate actions (48h), 3) Short-term fixes (30d), 4) Long-term changes, 5) Evidence to close, 6) Effort estimate.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to generate plan.' });
    }
    case 'policy-review': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const policies = JSON.stringify(body.policies || []);
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are a policy review AI for a warehouse systems integration company.' },
        { role: 'user', content: `Review policies: ${policies}\n\nIdentify: 1) Outdated policies, 2) Gaps vs current regulations, 3) Missing policies, 4) Conflicting requirements, 5) Priority updates needed.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to review policies.' });
    }
    default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
