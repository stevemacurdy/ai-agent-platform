export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { user_id, agent_slugs } = await req.json();
    if (!user_id || !Array.isArray(agent_slugs)) {
      return NextResponse.json({ error: 'user_id and agent_slugs[] required' }, { status: 400 });
    }

    const sb = supabase();

    // Remove all current access
    await sb.from('user_agent_access').delete().eq('user_id', user_id);

    // Insert new access
    if (agent_slugs.length > 0) {
      const records = agent_slugs.map((slug: string) => ({
        user_id,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').insert(records);
    }

    return NextResponse.json({ success: true, agent_slugs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
