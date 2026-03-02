export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/api-auth';

// GET /api/agents/audit — admin only (sensitive data)
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const sb = getSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const agentSlug = searchParams.get('agentSlug');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const changedBy = searchParams.get('changedBy');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    let resolvedAgentId = agentId;
    if (!resolvedAgentId && agentSlug) {
      const { data: agent } = await sb
        .from('agent_registry')
        .select('id')
        .eq('slug', agentSlug)
        .single();
      resolvedAgentId = (agent as any)?.id;
    }

    let query = sb
      .from('agent_audit_log')
      .select('*, profiles:changed_by(id, email, full_name)', { count: 'exact' })
      .order('changed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (resolvedAgentId) query = query.eq('agent_id', resolvedAgentId);
    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (changedBy) query = query.eq('changed_by', changedBy);

    const { data: entries, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      entries: entries || [],
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/agents/audit — admin only
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const sb = getSupabaseClient() as any;
    const body = await request.json();
    const { agentId, action, entityType, entityId, oldValue, newValue, description } = body;

    if (!action) return NextResponse.json({ error: 'action required' }, { status: 400 });

    const { data, error } = await sb
      .from('agent_audit_log')
      .insert({
        agent_id: agentId || null,
        action,
        entity_type: entityType || 'agent',
        entity_id: entityId || null,
        changed_by: auth.user.id,
        old_value: oldValue || null,
        new_value: newValue || null,
        description: description || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
