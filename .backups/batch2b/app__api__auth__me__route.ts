import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie or header
    const token = req.cookies.get('sb-access-token')?.value
      || req.cookies.get('supabase-auth-token')?.value
      || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sb = supabase();
    const { data: { user: authUser }, error } = await sb.auth.getUser(token);

    if (error || !authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get profile with role
    const { data: profile } = await sb
      .from('profiles')
      .select('role, full_name, must_reset_password')
      .eq('id', authUser.id)
      .single();

    // Get approved agents for this user
    const { data: agentAccess } = await sb
      .from('user_agent_access')
      .select('agent_slug')
      .eq('user_id', authUser.id);

    const approved_agents = agentAccess?.map(a => a.agent_slug) || [];

    // Admins get all agents
    const role = profile?.role || 'employee';
    const isAdmin = role === 'super_admin' || role === 'admin';

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email,
        role,
        full_name: profile?.full_name || '',
        must_reset_password: profile?.must_reset_password || false,
        approved_agents: isAdmin ? [] : approved_agents, // empty = show all for admins
      }
    });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
