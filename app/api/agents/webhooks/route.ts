export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyToken, verifyAdmin, unauthorized, getCompanyId } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();

  try {
    const sb = getSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || user.company_id;

    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    const { data: webhooks, error } = await sb
      .from('agent_webhooks')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhooks: webhooks || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const sb = getSupabaseClient() as any;
    const body = await request.json();
    const { companyId, agentId, url, secret, events, description } = body;

    if (!companyId || !url) {
      return NextResponse.json({ error: 'companyId and url required' }, { status: 400 });
    }

    const { data, error } = await sb
      .from('agent_webhooks')
      .insert({
        company_id: companyId,
        agent_id: agentId || null,
        url,
        secret: secret || null,
        events: events || [],
        description: description || null,
        is_active: true,
        created_by: auth.user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhook: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const sb = getSupabaseClient() as any;
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const safeFields: Record<string, any> = {};
    if (updates.url !== undefined) safeFields.url = updates.url;
    if (updates.secret !== undefined) safeFields.secret = updates.secret;
    if (updates.events !== undefined) safeFields.events = updates.events;
    if (updates.is_active !== undefined) safeFields.is_active = updates.is_active;
    if (updates.description !== undefined) safeFields.description = updates.description;
    if (updates.retry_count !== undefined) safeFields.retry_count = updates.retry_count;
    safeFields.updated_at = new Date().toISOString();

    const { data, error } = await sb.from('agent_webhooks').update(safeFields).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhook: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const sb = getSupabaseClient() as any;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await sb.from('agent_webhooks').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
