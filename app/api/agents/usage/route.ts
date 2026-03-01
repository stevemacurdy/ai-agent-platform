export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const agentSlug = searchParams.get('agentSlug');
    const metric = searchParams.get('metric');
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    let resolvedAgentId = searchParams.get('agentId');
    if (!resolvedAgentId && agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single();
      resolvedAgentId = agent?.id || null;
    }

    let query = sb.from('agent_usage_metrics').select('*')
      .eq('company_id', companyId).order('period_start', { ascending: false });
    if (resolvedAgentId) query = query.eq('agent_id', resolvedAgentId);
    if (metric) query = query.eq('metric', metric);
    const from = searchParams.get('from'); const to = searchParams.get('to');
    if (from) query = query.gte('period_start', from);
    if (to) query = query.lte('period_end', to);

    const { data: usage, error } = await query.limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const summary = Object.values((usage || []).reduce((acc: any, u: any) => {
      const key = `${u.agent_id}:${u.metric}`;
      if (!acc[key]) acc[key] = { agent_id: u.agent_id, metric: u.metric, total: 0, periods: 0 };
      acc[key].total += Number(u.value); acc[key].periods += 1;
      return acc;
    }, {} as Record<string, any>));

    return NextResponse.json({ usage: usage || [], summary, total_records: (usage || []).length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { agentId, companyId, metric, value } = await request.json();
    if (!agentId || !companyId || !metric) return NextResponse.json({ error: 'agentId, companyId, metric required' }, { status: 400 });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: existing } = await sb.from('agent_usage_metrics').select('id, value')
      .eq('agent_id', agentId).eq('company_id', companyId).eq('metric', metric)
      .eq('period_start', periodStart).single();

    let data;
    if (existing) {
      const { data: updated, error } = await sb.from('agent_usage_metrics')
        .update({ value: Number(existing.value) + (value || 1), updated_at: new Date().toISOString() })
        .eq('id', existing.id).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      data = updated;
    } else {
      const { data: created, error } = await sb.from('agent_usage_metrics')
        .insert({ agent_id: agentId, company_id: companyId, metric, value: value || 1, period_start: periodStart, period_end: periodEnd })
        .select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      data = created;
    }
    return NextResponse.json({ usage: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
