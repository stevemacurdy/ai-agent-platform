export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Get user's company_id
    const { data: profile } = await sb.from('profiles').select('company_id').eq('id', user_id).single();
    const companyId = profile?.company_id || '00000000-0000-0000-0000-000000000000';

    // Resolve slugs to agent UUIDs
    const { data: agents } = await sb
      .from('agent_registry')
      .select('id, slug')
      .in('slug', agent_slugs.length > 0 ? agent_slugs : ['__none__']);

    const agentMap = new Map((agents || []).map(a => [a.slug, a.id]));

    // Remove all current user permissions
    await sb.from('agent_user_permissions').delete().eq('user_id', user_id);

    // Also clean old table for backward compat
    await sb.from('user_agent_access').delete().eq('user_id', user_id);

    // Insert new permissions
    if (agent_slugs.length > 0) {
      const newPerms = agent_slugs
        .filter((slug: string) => agentMap.has(slug))
        .map((slug: string) => ({
          agent_id: agentMap.get(slug),
          user_id,
          company_id: companyId,
          permission_level: 'use',
          granted_by: adminUser.id,
        }));

      if (newPerms.length > 0) {
        await sb.from('agent_user_permissions').insert(newPerms);
      }

      // Also write to old table for backward compat during migration
      const oldRecords = agent_slugs.map((slug: string) => ({
        user_id,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').insert(oldRecords);
    }

    return NextResponse.json({ success: true, agent_slugs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
