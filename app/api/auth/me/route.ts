export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  try {
    // Read token from Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // Verify the token and get the user
    const { data: { user }, error: authError } = await sb.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get profile data
    const { data: profile } = await sb
      .from('profiles')
      .select('role, full_name, must_reset_password')
      .eq('id', user.id)
      .single();

    // Get approved agents
    const { data: access } = await sb
      .from('user_agent_access')
      .select('agent_slug')
      .eq('user_id', user.id);

    const approved_agents = (access || []).map(a => a.agent_slug);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'employee',
        full_name: profile?.full_name || null,
        must_reset_password: profile?.must_reset_password || false,
        approved_agents,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, error: err.message }, { status: 500 });
  }
}
