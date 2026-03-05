export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { profileToUserAccess, getAgentAccessStatus } from '@/lib/access-control';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * GET /api/marketplace
 * Returns all agents with the current user's access status for each.
 */
export async function GET(request: NextRequest) {
  const sb = supabaseAdmin();

  // Get user from token
  let userAccess = null;
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const { data: { user } } = await sb.auth.getUser(token);
      if (user) {
        const { data: profile } = await sb.from('profiles')
          .select('id, email, role, assigned_agents, paid_agents, free_granted_agents, beta_active')
          .eq('id', user.id)
          .single();
        if (profile) {
          userAccess = profileToUserAccess({ ...profile, email: user.email || '' });
        }
      }
    } catch { /* anonymous browsing */ }
  }

  // Get all live agents from registry
  const { data: agents } = await sb
    .from('agent_registry')
    .select('slug, display_name, short_description, description, icon, status, component_path')
    .in('status', ['live', 'beta'])
    .order('display_order');

  // Get categories for grouping
  const { data: catMaps } = await sb
    .from('agent_category_map')
    .select('agent_id, is_primary, agent_categories(slug, display_name)')
    .eq('is_primary', true);

  // Build agent ID -> category map
  const { data: agentIds } = await sb
    .from('agent_registry')
    .select('id, slug')
    .in('status', ['live', 'beta']);

  const idToSlug: Record<string, string> = {};
  (agentIds || []).forEach((a: { id: string; slug: string }) => { idToSlug[a.id] = a.slug; });

  const slugToCategory: Record<string, string> = {};
  (catMaps || []).forEach((m: any) => {
    const slug = idToSlug[m.agent_id];
    const cat = m.agent_categories?.display_name || m.agent_categories?.slug || 'Other';
    if (slug) slugToCategory[slug] = cat;
  });

  // Build response with access status per agent
  const agentCards = (agents || []).map((a: any) => {
    const access = userAccess
      ? getAgentAccessStatus(userAccess, a.slug)
      : { hasAccess: false, label: 'Sign In to Access', color: 'gray', action: 'locked' as const };

    return {
      slug: a.slug,
      name: a.display_name || a.slug,
      description: a.short_description || a.description || '',
      icon: a.icon || '🤖',
      department: slugToCategory[a.slug] || 'Other',
      consolePath: a.component_path ? '/' + a.component_path : `/agents/${a.slug}/console`,
      demoPath: `/demo/${a.slug}`,
      access,
    };
  });

  // Group by department
  const departments: Record<string, typeof agentCards> = {};
  agentCards.forEach((a: any) => {
    if (!departments[a.department]) departments[a.department] = [];
    departments[a.department].push(a);
  });

  return NextResponse.json({
    agents: agentCards,
    departments,
    user: userAccess ? {
      id: userAccess.id,
      role: userAccess.role,
      accessibleCount: agentCards.filter((a: any) => a.access.hasAccess).length,
      totalAgents: agentCards.length,
    } : null,
  });
}

/**
 * POST /api/marketplace
 * Actions: subscribe-to-agent, get-pricing
 */
export async function POST(request: NextRequest) {
  const sb = supabaseAdmin();
  const body = await request.json();
  const { action } = body;

  // Auth required for POST actions
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  switch (action) {
    case 'get-pricing': {
      // Return pricing tiers for an agent
      const { agentSlug } = body;
      // For now return standard pricing from Stripe products
      return NextResponse.json({
        agentSlug,
        pricing: [
          { tier: 'Starter', price: 497, interval: 'month', features: ['Console access', 'Demo data', 'Email support'] },
          { tier: 'Professional', price: 1997, interval: 'month', features: ['Console access', 'Live integrations', 'AI actions', 'Priority support'] },
          { tier: 'Enterprise', price: 4997, interval: 'month', features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee'] },
        ],
      });
    }

    case 'subscribe-to-agent': {
      const { agentSlug } = body;
      if (!agentSlug) return NextResponse.json({ error: 'agentSlug required' }, { status: 400 });

      // Create agent_subscriptions record
      await sb.from('agent_subscriptions').upsert({
        user_id: user.id,
        agent_slug: agentSlug,
        access_type: 'paid',
        status: 'active',
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id,agent_slug' });

      // Update paid_agents on profile
      const { data: profile } = await sb.from('profiles')
        .select('paid_agents')
        .eq('id', user.id)
        .single();

      const current = Array.isArray(profile?.paid_agents) ? profile.paid_agents : [];
      if (!current.includes(agentSlug)) {
        await sb.from('profiles').update({
          paid_agents: [...current, agentSlug],
          subscription_status: 'active',
          role: profile ? undefined : 'subscription', // only set if needed
        }).eq('id', user.id);
      }

      return NextResponse.json({ success: true, message: 'Subscribed to ' + agentSlug });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
