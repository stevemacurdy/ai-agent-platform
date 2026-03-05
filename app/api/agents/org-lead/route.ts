export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getWmsData } from '@/lib/wms/wms-data';

function supabase() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); }

async function _GET(request: NextRequest) {
  trackUsage(request, 'org-lead');
  try {
    const { data, error } = await supabase().from('agent_org_lead_data').select('*').limit(100);
    if (error || !data?.length) {
      const d = getWmsData('_default');
      return NextResponse.json({ ...d, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const d = getWmsData('_default');
    return NextResponse.json({ ...d, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'org-lead', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'create-okr': {
      const { objective, keyResults, owner, department, dueDate } = body;
      const { data, error } = await supabase().from('agent_org_lead_data').insert({
        objective, key_results: keyResults || [], owner, department, due_date: dueDate, status: 'on-track',
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'OKR created', data });
    }
    case 'update-progress': {
      const { id, progress, status, notes } = body;
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (progress !== undefined) updates.progress = progress;
      if (status) updates.status = status;
      if (notes) updates.notes = notes;
      const { error } = await supabase().from('agent_org_lead_data').update(updates).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Progress updated' });
    }
    case 'board-report': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const okrs = JSON.stringify(body.okrs || []);
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are an executive AI assistant for a warehouse systems integration company. Tone: concise, data-driven, executive-level.' },
        { role: 'user', content: `OKR data: ${okrs}\n\nGenerate board report: 1) Overall OKR progress, 2) Key wins, 3) Items requiring attention (at-risk OKRs), 4) Team health summary, 5) Key decisions, 6) Resource requests, 7) 90-day outlook.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to generate report.' });
    }
    case 'team-health-survey': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const { department, healthScore } = body;
      const r = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [
        { role: 'system', content: 'You are an organizational health AI.' },
        { role: 'user', content: `${department || 'Engineering'} has health score ${healthScore || '6.2'}/10. Generate 8 targeted pulse check questions. Focus on: 1) Workload/burnout, 2) Management effectiveness, 3) Career growth, 4) Compensation fairness, 5) Team collaboration. Use Likert 1-5 scale plus 2 open-ended.` }
      ], max_tokens: 1000, temperature: 0.3 });
      return NextResponse.json({ result: r.choices[0]?.message?.content || 'Unable to generate survey.' });
    }
    case 'decision-log': {
      const { decision, context, alternatives, outcome } = body;
      return NextResponse.json({ result: `Decision logged: "${decision}". Context: ${context}. Alternatives: ${alternatives}. Outcome: ${outcome || 'pending'}.` });
    }
    default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
