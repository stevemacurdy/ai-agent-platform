export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Get profile
    const { data: profile } = await sb
      .from('profiles')
      .select('role, full_name, company_id, must_reset_password')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'employee';
    const isAdmin = role === 'super_admin' || role === 'admin';

    // Get approved agents
    let approved_agents: string[] = [];

    if (isAdmin) {
      // Admins get all live/beta agents
      const { data: allAgents } = await sb
        .from('agent_registry')
        .select('slug')
        .in('status', ['live', 'beta']);
      approved_agents = (allAgents || []).map(a => a.slug);
    } else {
      // Check user-level permissions first
      const { data: userPerms } = await sb
        .from('agent_user_permissions')
        .select('agent_id, permission_level')
        .eq('user_id', user.id)
        .in('permission_level', ['use', 'configure', 'admin']);

      if (userPerms && userPerms.length > 0) {
        // Resolve agent_ids to slugs
        const agentIds = userPerms.map(p => p.agent_id);
        const { data: agents } = await sb
          .from('agent_registry')
          .select('slug')
          .in('id', agentIds)
          .in('status', ['live', 'beta']);
        approved_agents = (agents || []).map(a => a.slug);
      } else {
        // Fall back to role-level permissions
        const { data: rolePerms } = await sb
          .from('agent_role_permissions')
          .select('agent_id')
          .eq('role', role)
          .in('permission_level', ['use', 'configure', 'admin']);

        if (rolePerms && rolePerms.length > 0) {
          const agentIds = rolePerms.map(p => p.agent_id);
          const { data: agents } = await sb
            .from('agent_registry')
            .select('slug')
            .in('id', agentIds)
            .in('status', ['live', 'beta']);
          approved_agents = (agents || []).map(a => a.slug);
        } else {
          // Final fallback: check old table for unmigrated users
          const { data: oldAccess } = await sb
            .from('user_agent_access')
            .select('agent_slug')
            .eq('user_id', user.id);
          approved_agents = (oldAccess || []).map(a => a.agent_slug);
        }
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role,
        full_name: profile?.full_name || null,
        company_id: profile?.company_id || null,
        must_reset_password: profile?.must_reset_password || false,
        approved_agents,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
