export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Default agents every Woulf Group employee gets access to
const DEFAULT_AGENT_SLUGS = [
  'wms', 'operations', 'hr', 'support', 'training',
];

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = sbAdmin();
  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { display_name, phone, job_title, department } = body;

  if (!display_name?.trim()) {
    return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
  }

  try {
    // 1. Update profile
    const profileUpdate: Record<string, any> = {
      display_name: display_name.trim(),
      full_name: display_name.trim(),
      status: 'active',
      updated_at: new Date().toISOString(),
    };
    if (phone) profileUpdate.phone = phone.trim();

    const { error: profileErr } = await sb
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id);

    if (profileErr) {
      console.error('[ONBOARD] Profile update error:', profileErr);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // 2. Find Woulf Group company (or use invite's company_id)
    let companyId: string | null = null;

    // Check if user was invited to a specific company
    const { data: invite } = await sb
      .from('invites')
      .select('company_id')
      .eq('email', user.email)
      .eq('status', 'pending')
      .maybeSingle();

    if (invite?.company_id) {
      companyId = invite.company_id;

      // Mark invite as accepted
      await sb
        .from('invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('email', user.email)
        .eq('status', 'pending');
    } else {
      // Default to Woulf Group
      const { data: company } = await sb
        .from('companies')
        .select('id')
        .or('slug.eq.woulf-group,slug.eq.woulfgroup,name.ilike.%Woulf Group%')
        .limit(1)
        .maybeSingle();

      if (company) companyId = company.id;
    }

    // 3. Add to company_members (if we found a company and they're not already a member)
    if (companyId) {
      const { data: existing } = await sb
        .from('company_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!existing) {
        await sb.from('company_members').insert({
          user_id: user.id,
          company_id: companyId,
          role: 'member',
          email: user.email,
          status: 'active',
        });
      }
    }

    // 4. Grant default agent access
    for (const slug of DEFAULT_AGENT_SLUGS) {
      const { data: agent } = await sb
        .from('agents')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (agent) {
        const { data: existingAccess } = await sb
          .from('user_agent_access')
          .select('id')
          .eq('user_id', user.id)
          .eq('agent_id', agent.id)
          .maybeSingle();

        if (!existingAccess) {
          await sb.from('user_agent_access').insert({
            user_id: user.id,
            agent_id: agent.id,
          });
        }
      }
    }

    console.log('[ONBOARD] Complete for', user.email, '| Company:', companyId);

    return NextResponse.json({
      success: true,
      message: 'Onboarding complete',
      companyId,
      agentCount: DEFAULT_AGENT_SLUGS.length,
    });
  } catch (err: any) {
    console.error('[ONBOARD] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Check onboarding status for current user
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = sbAdmin();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await sb
    .from('profiles')
    .select('display_name, phone, status, role')
    .eq('id', user.id)
    .single();

  const { data: memberships } = await sb
    .from('company_members')
    .select('company_id, role, companies(name)')
    .eq('user_id', user.id);

  const { data: agentAccess } = await sb
    .from('user_agent_access')
    .select('agent_id, agents(name, slug)')
    .eq('user_id', user.id);

  // User needs onboarding if they have no display name or no company membership
  const needsOnboarding = !profile?.display_name || (memberships?.length || 0) === 0;

  return NextResponse.json({
    needsOnboarding,
    profile,
    memberships: memberships || [],
    agentAccess: agentAccess || [],
  });
}
