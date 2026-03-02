export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET /api/agents/usage?companyId=xxx — usage for a company
// GET /api/agents/usage?agentId=xxx&companyId=xxx — usage for specific agent
// GET /api/agents/usage?agentSlug=cfo&companyId=xxx — usage by slug
// POST /api/agents/usage — record usage event (increment)
export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const agentId = searchParams.get('agentId');
    const agentSlug = searchParams.get('agentSlug');
    const metric = searchParams.get('metric');
    const periodStart = searchParams.get('from');
    const periodEnd = searchParams.get('to');

    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    // Resolve slug
    let resolvedAgentId = agentId;
    if (!resolvedAgentId && agentSlug) {
      const { data: agent } = await sb
        .from('agent_registry')
        .select('id')
        .eq('slug', agentSlug)
        .single();
      resolvedAgentId = agent?.id;
    }

    let query = sb
      .from('agent_usage_metrics')
      .select('*')
      .eq('company_id', companyId)
      .order('period_start', { ascending: false });

    if (resolvedAgentId) query = query.eq('agent_id', resolvedAgentId);
    if (metric) query = query.eq('metric', metric);
    if (periodStart) query = query.gte('period_start', periodStart);
    if (periodEnd) query = query.lte('period_end', periodEnd);

    const { data: usage, error } = await query.limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Summary
    const summary = (usage || []).reduce((acc: any, u: any) => {
      const key = `${u.agent_id}:${u.metric}`;
      if (!acc[key]) acc[key] = { agent_id: u.agent_id, metric: u.metric, total: 0, periods: 0 };
      acc[key].total += Number(u.value);
      acc[key].periods += 1;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      usage: usage || [],
      summary: Object.values(summary),
      total_records: (usage || []).length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const body = await request.json();
    const { agentId, companyId, metric, value } = body;

    if (!agentId || !companyId || !metric) {
      return NextResponse.json({ error: 'agentId, companyId, and metric required' }, { status: 400 });
    }

    // Current month period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Upsert — increment value
    const { data: existing } = await sb
      .from('agent_usage_metrics')
      .select('id, value')
      .eq('agent_id', agentId)
      .eq('company_id', companyId)
      .eq('metric', metric)
      .eq('period_start', periodStart)
      .single();

    let data;
    if (existing) {
      const { data: updated, error } = await sb
        .from('agent_usage_metrics')
        .update({
          value: Number(existing.value) + (value || 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      data = updated;
    } else {
      const { data: created, error } = await sb
        .from('agent_usage_metrics')
        .insert({
          agent_id: agentId,
          company_id: companyId,
          metric,
          value: value || 1,
          period_start: periodStart,
          period_end: periodEnd,
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      data = created;
    }

    return NextResponse.json({ usage: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
