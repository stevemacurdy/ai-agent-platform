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
    const body = await req.json();
    const { email, full_name, role = 'employee', company_id, agent_slugs = [] } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sb = supabase();

    // Send magic link / invite via Supabase
    const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role },
      redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.woulfai.com') + '/login?invited=true',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user.id;

    // Create profile
    await sb.from('profiles').upsert({
      id: userId,
      email,
      full_name: full_name || '',
      role,
      must_reset_password: false,
      updated_at: new Date().toISOString(),
    });

    // Add to company
    if (company_id) {
      await sb.from('company_members').upsert({
        user_id: userId,
        company_id,
        role: role === 'admin' || role === 'super_admin' ? 'admin' : 'member',
      }, { onConflict: 'user_id,company_id' });
    }

    // Assign agents
    if (agent_slugs.length > 0) {
      const records = agent_slugs.map((slug: string) => ({
        user_id: userId,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').upsert(records, {
        onConflict: 'user_id,agent_slug',
      });
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      email,
      message: 'Invite sent to ' + email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
