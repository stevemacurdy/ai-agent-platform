export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const agentId = searchParams.get('agentId');
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    let query = sb.from('agent_user_permissions').select('*').eq('company_id', companyId);
    if (userId) query = query.eq('user_id', userId);
    if (agentId) query = query.eq('agent_id', agentId);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ permissions: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const body = await request.json();
    const { userId, agentId, companyId, permissionLevel, grantedBy } = body;
    if (!userId || !agentId || !companyId) return NextResponse.json({ error: 'userId, agentId, companyId required' }, { status: 400 });

    const { data, error } = await sb.from('agent_user_permissions').upsert({
      user_id: userId, agent_id: agentId, company_id: companyId,
      permission_level: permissionLevel || 'use', granted_by: grantedBy || null,
    }, { onConflict: 'user_id,agent_id,company_id' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.from('agent_audit_log').insert({
      agent_id: agentId, action: 'permission_changed', entity_type: 'permission',
      entity_id: data.id, changed_by: grantedBy,
      new_value: { userId, permissionLevel: permissionLevel || 'use' },
      description: `Permission ${permissionLevel || 'use'} granted`,
    });

    return NextResponse.json({ permission: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const companyId = searchParams.get('companyId');

    if (id) {
      const { error } = await sb.from('agent_user_permissions').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (userId && agentId && companyId) {
      const { error } = await sb.from('agent_user_permissions').delete()
        .eq('user_id', userId).eq('agent_id', agentId).eq('company_id', companyId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'id or (userId+agentId+companyId) required' }, { status: 400 });
    }

    await sb.from('agent_audit_log').insert({
      agent_id: agentId, action: 'access_revoked', entity_type: 'permission',
      changed_by: searchParams.get('revokedBy'),
      old_value: { userId }, description: 'Permission revoked',
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
