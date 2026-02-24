export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);


// Auth guard - verify admin access
async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sb = supabase();
    const { data: profiles, error } = await sb
      .from('profiles')
      .select('id, email, full_name, role, must_reset_password')
      .order('email');

    if (error) {
      return NextResponse.json({ users: [], _error: error.message });
    }

    const { data: access } = await sb
      .from('user_agent_access')
      .select('user_id, agent_slug');

    const accessMap: Record<string, string[]> = {};
    (access || []).forEach((a: any) => {
      if (!accessMap[a.user_id]) accessMap[a.user_id] = [];
      accessMap[a.user_id].push(a.agent_slug);
    });

    const users = (profiles || []).map(p => ({
      ...p,
      approved_agents: accessMap[p.id] || [],
    }));

    return NextResponse.json({ users }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (err: any) {
    return NextResponse.json({ users: [], error: err.message });
  }
}
