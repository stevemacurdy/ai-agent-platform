export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET /api/agents/permissions?userId=xxx&companyId=xxx — get user's agent permissions
// GET /api/agents/permissions?companyId=xxx — get all permissions for a company
// POST /api/agents/permissions — grant permission
// DELETE /api/agents/permissions — revoke permission
export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const agentId = searchParams.get('agentId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    }

    let query = sb
      .from('agent_user_permissions')
      .select('*, profiles(id, email, full_name)')
      .eq('company_id', companyId);

    if (userId) query = query.eq('user_id', userId);
    if (agentId) query = query.eq('agent_id', agentId);

    const { data: permissions, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ permissions: permissions || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const body = await request.json();
    const { userId, agentId, companyId, permissionLevel, grantedBy } = body;

    if (!userId || !agentId || !companyId) {
      return NextResponse.json({ error: 'userId, agentId, and companyId required' }, { status: 400 });
    }

    const { data, error } = await sb
      .from('agent_user_permissions')
      .upsert({
        user_id: userId,
        agent_id: agentId,
        company_id: companyId,
        permission_level: permissionLevel || 'use',
        granted_by: grantedBy || null,
      }, { onConflict: 'user_id,agent_id,company_id' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit log
    await sb.from('agent_audit_log').insert({
      agent_id: agentId,
      action: 'permission_changed',
      entity_type: 'permission',
      entity_id: data.id,
      changed_by: grantedBy,
      new_value: { userId, permissionLevel: permissionLevel || 'use' },
      description: `Permission ${permissionLevel || 'use'} granted to user`,
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
    const revokedBy = searchParams.get('revokedBy');

    if (id) {
      const { error } = await sb.from('agent_user_permissions').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (userId && agentId && companyId) {
      const { error } = await sb
        .from('agent_user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .eq('company_id', companyId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'id or (userId + agentId + companyId) required' }, { status: 400 });
    }

    // Audit log
    await sb.from('agent_audit_log').insert({
      agent_id: agentId,
      action: 'access_revoked',
      entity_type: 'permission',
      changed_by: revokedBy,
      old_value: { userId },
      description: 'Permission revoked',
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
