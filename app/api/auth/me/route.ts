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

    // Get profile — capture error explicitly
    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If profile query failed, log it but use safe defaults
    if (profileError) {
      console.error('[auth/me] Profile query failed:', profileError.message, 'for user:', user.id);
    }

    const role = profile?.role || 'employee';
    const isAdmin = role === 'super_admin' || role === 'admin';

    // Get approved agents
    let approved_agents: string[] = [];

    if (isAdmin) {
      // Admins get all live/beta agents from registry
      const { data: allAgents, error: agentError } = await sb
        .from('agent_registry')
        .select('slug')
        .in('status', ['live', 'beta']);

      if (agentError) {
        console.error('[auth/me] agent_registry query failed:', agentError.message);
        // Fallback: return a hardcoded list of known agent slugs so admin isn't locked out
        approved_agents = [
          'cfo','collections','finops','payables',
          'sales','sales-intel','sales-coach','marketing','seo',
          'warehouse','wms','operations','supply-chain','video-editor','3pl-portal',
          'hr','support','training',
          'legal','compliance',
          'research','org-lead'
        ];
      } else {
        approved_agents = (allAgents || []).map((a: any) => a.slug);
        // If registry returned empty (table might not exist yet), use hardcoded fallback
        if (approved_agents.length === 0) {
          approved_agents = [
            'cfo','collections','finops','payables',
            'sales','sales-intel','sales-coach','marketing','seo',
            'warehouse','wms','operations','supply-chain','video-editor','3pl-portal',
            'hr','support','training',
            'legal','compliance',
            'research','org-lead'
          ];
        }
      }
    } else {
      // Non-admin: check user-level permissions first
      const { data: userPerms } = await sb
        .from('agent_user_permissions')
        .select('agent_id, permission_level')
        .eq('user_id', user.id)
        .in('permission_level', ['use', 'configure', 'admin']);

      if (userPerms && userPerms.length > 0) {
        const agentIds = userPerms.map((p: any) => p.agent_id);
        const { data: agents } = await sb
          .from('agent_registry')
          .select('slug')
          .in('id', agentIds)
          .in('status', ['live', 'beta']);
        approved_agents = (agents || []).map((a: any) => a.slug);
      } else {
        // Fall back to role-level permissions
        const { data: rolePerms } = await sb
          .from('agent_role_permissions')
          .select('agent_id')
          .eq('role', role)
          .in('permission_level', ['use', 'configure', 'admin']);

        if (rolePerms && rolePerms.length > 0) {
          const agentIds = rolePerms.map((p: any) => p.agent_id);
          const { data: agents } = await sb
            .from('agent_registry')
            .select('slug')
            .in('id', agentIds)
            .in('status', ['live', 'beta']);
          approved_agents = (agents || []).map((a: any) => a.slug);
        } else {
          // Final fallback: check old table
          const { data: oldAccess } = await sb
            .from('user_agent_access')
            .select('agent_slug')
            .eq('user_id', user.id);
          approved_agents = (oldAccess || []).map((a: any) => a.agent_slug);
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
    console.error('[auth/me] Unhandled error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
