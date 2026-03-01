export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient() as any;
    const companyId = new URL(request.url).searchParams.get('companyId');
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    const { data, error } = await sb.from('agent_webhooks').select('*')
      .eq('company_id', companyId).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhooks: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient() as any;
    const body = await request.json();
    const { companyId, agentId, url, secret, events, description, createdBy } = body;
    if (!companyId || !url) return NextResponse.json({ error: 'companyId and url required' }, { status: 400 });
    const { data, error } = await sb.from('agent_webhooks').insert({
      company_id: companyId, agent_id: agentId || null, url, secret: secret || null,
      events: events || [], description: description || null, is_active: true, created_by: createdBy || null,
    }).select().single() as any;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhook: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sb = getSupabaseClient() as any;
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const safe: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of ['url','secret','events','is_active','description','retry_count']) {
      if (updates[k] !== undefined) safe[k] = updates[k];
    }
    const { data, error } = await sb.from('agent_webhooks').update(safe).eq('id', id).select().single() as any;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhook: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
