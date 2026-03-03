// ============================================================================
// WoulfAI Subscription Enforcement
// ============================================================================
// Wraps agent API routes with subscription + tier checking.
// Usage:
//   import { withSubscription } from '@/lib/subscription';
//   export const GET = withSubscription(async (req, ctx) => {
//     if (ctx.isDemo) return NextResponse.json(demoData);
//     // ... real data logic using ctx.companyId, ctx.tier, ctx.limits
//   });
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// --- Types ------------------------------------------------------------------

export interface TierLimits {
  tier_slug: string;
  tier_name: string;
  max_ai_actions_per_month: number;
  overage_rate_cents: number;
  overage_enabled: boolean;
  max_storage_bytes: number;
  max_seats: number;
  max_agents: number;
  agent_selection_type: string;
  max_integrations: number;
  api_access: boolean;
  custom_agent_training: boolean;
}

export interface SubscriptionContext {
  isDemo: boolean;
  userId: string | null;
  companyId: string | null;
  email: string | null;
  role: string | null;
  tier: string | null;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  limits: TierLimits | null;
}

type HandlerWithContext = (
  req: NextRequest,
  ctx: SubscriptionContext
) => Promise<NextResponse>;

// --- Core Lookup ------------------------------------------------------------

async function getSubscriptionContext(token: string | null): Promise<SubscriptionContext> {
  const demo: SubscriptionContext = {
    isDemo: true,
    userId: null,
    companyId: null,
    email: null,
    role: null,
    tier: null,
    subscriptionStatus: null,
    trialEndsAt: null,
    limits: null,
  };

  if (!token) return demo;

  const sb = supabaseAdmin();

  // 1. Verify user from token
  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return demo;

  // 2. Get profile
  const { data: profile } = await sb
    .from('profiles')
    .select('role, company_id, email, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) return { ...demo, userId: user.id, email: user.email || null };

  // Admin/super_admin always get full access
  if (profile.role === 'admin' || profile.role === 'super_admin') {
    return {
      isDemo: false,
      userId: user.id,
      companyId: profile.company_id || null,
      email: profile.email || user.email || null,
      role: profile.role,
      tier: 'enterprise',
      subscriptionStatus: 'active',
      trialEndsAt: null,
      limits: {
        tier_slug: 'enterprise',
        tier_name: 'Enterprise',
        max_ai_actions_per_month: -1,
        overage_rate_cents: 0,
        overage_enabled: false,
        max_storage_bytes: 1099511627776,
        max_seats: -1,
        max_agents: 21,
        agent_selection_type: 'all',
        max_integrations: -1,
        api_access: true,
        custom_agent_training: true,
      },
    };
  }

  // 3. Get subscription
  const { data: subscription } = await sb
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!subscription || !['active', 'trialing'].includes(subscription.status || '')) {
    return {
      isDemo: true,
      userId: user.id,
      companyId: profile.company_id || subscription?.company_id || null,
      email: profile.email || user.email || null,
      role: profile.role,
      tier: null,
      subscriptionStatus: subscription?.status || null,
      trialEndsAt: null,
      limits: null,
    };
  }

  // 4. Look up tier config from the subscription plan (bundle slug)
  const tierSlug = subscription.plan || 'starter';

  const { data: tierConfig } = await sb
    .from('tier_configs')
    .select('*')
    .eq('tier_slug', tierSlug)
    .eq('is_active', true)
    .single();

  // 5. Check trial status
  let trialEndsAt: string | null = null;
  if (subscription.status === 'trialing') {
    // Trial end is current_period_end for trial subscriptions
    trialEndsAt = subscription.current_period_end || null;
  }

  // Also check company_bundle_access for trial info
  const companyId = subscription.company_id || profile.company_id;
  if (companyId) {
    const { data: access } = await sb
      .from('company_bundle_access')
      .select('trial_ends_at, status')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (access?.trial_ends_at) {
      trialEndsAt = access.trial_ends_at;
    }
  }

  const limits: TierLimits | null = tierConfig ? {
    tier_slug: tierConfig.tier_slug,
    tier_name: tierConfig.tier_name,
    max_ai_actions_per_month: tierConfig.max_ai_actions_per_month,
    overage_rate_cents: tierConfig.overage_rate_cents,
    overage_enabled: tierConfig.overage_enabled,
    max_storage_bytes: tierConfig.max_storage_bytes,
    max_seats: tierConfig.max_seats,
    max_agents: tierConfig.max_agents,
    agent_selection_type: tierConfig.agent_selection_type,
    max_integrations: tierConfig.max_integrations,
    api_access: tierConfig.api_access,
    custom_agent_training: tierConfig.custom_agent_training,
  } : null;

  return {
    isDemo: false,
    userId: user.id,
    companyId: companyId || null,
    email: profile.email || user.email || null,
    role: profile.role,
    tier: tierSlug,
    subscriptionStatus: subscription.status,
    trialEndsAt,
    limits,
  };
}

// --- Middleware Wrapper ------------------------------------------------------

/**
 * Wraps an agent API route with subscription context.
 * The handler receives a SubscriptionContext with tier info and limits.
 * 
 * If no valid auth token: ctx.isDemo = true (agent should return demo data)
 * If subscription expired/canceled: ctx.isDemo = true
 * If active subscription: ctx.isDemo = false, ctx.limits has tier limits
 */
export function withSubscription(handler: HandlerWithContext) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '') || null;
      const ctx = await getSubscriptionContext(token);
      return handler(req, ctx);
    } catch (err: any) {
      console.error('[subscription] Middleware error:', err);
      // Fall through to demo mode on error
      const demoCtx: SubscriptionContext = {
        isDemo: true,
        userId: null,
        companyId: null,
        email: null,
        role: null,
        tier: null,
        subscriptionStatus: null,
        trialEndsAt: null,
        limits: null,
      };
      return handler(req, demoCtx);
    }
  };
}

// --- Usage Tracking ---------------------------------------------------------

/**
 * Record a usage event. Call this inside agent routes after returning data.
 * This runs in the background and doesn't block the response.
 */
export async function recordUsage(
  companyId: string,
  userId: string,
  agentSlug: string,
  actionType: string = 'query',
  actionCount: number = 1
) {
  try {
    const sb = supabaseAdmin();
    await sb.from('usage_events').insert({
      company_id: companyId,
      user_id: userId,
      agent_slug: agentSlug,
      action_type: actionType,
      action_count: actionCount,
      recorded_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[usage] Failed to record:', err);
  }
}

/**
 * Check current period usage against tier limits.
 * Returns { used, limit, percentUsed, exceeded, overage_enabled }
 */
export async function checkUsage(
  companyId: string,
  limits: TierLimits
): Promise<{
  used: number;
  limit: number;
  percentUsed: number;
  exceeded: boolean;
  overage_enabled: boolean;
}> {
  const sb = supabaseAdmin();

  // Get usage for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await sb
    .from('usage_events')
    .select('action_count')
    .eq('company_id', companyId)
    .gte('recorded_at', startOfMonth.toISOString());

  const used = (data || []).reduce((sum, e) => sum + (e.action_count || 1), 0);
  const limit = limits.max_ai_actions_per_month;
  const unlimited = limit === -1;

  return {
    used,
    limit,
    percentUsed: unlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 100,
    exceeded: unlimited ? false : used >= limit,
    overage_enabled: limits.overage_enabled,
  };
}

/**
 * Full enforcement check. Returns null if OK, or a NextResponse if blocked.
 * Use after withSubscription:
 * 
 *   const blocked = await enforceUsage(ctx, 'cfo');
 *   if (blocked) return blocked;
 */
export async function enforceUsage(
  ctx: SubscriptionContext,
  agentSlug: string
): Promise<NextResponse | null> {
  // Demo mode — no enforcement
  if (ctx.isDemo || !ctx.companyId || !ctx.limits) return null;

  // Unlimited tier — no enforcement
  if (ctx.limits.max_ai_actions_per_month === -1) return null;

  const usage = await checkUsage(ctx.companyId, ctx.limits);

  // Record this request
  if (ctx.userId) {
    // Fire and forget
    recordUsage(ctx.companyId, ctx.userId, agentSlug, 'query', 1).catch(() => {});
  }

  // If exceeded and no overage allowed, block
  if (usage.exceeded && !usage.overage_enabled) {
    return NextResponse.json(
      {
        error: 'usage_limit_exceeded',
        message: `You've used ${usage.used} of ${usage.limit} AI actions this month. Upgrade your plan for more capacity.`,
        usage: {
          used: usage.used,
          limit: usage.limit,
          percentUsed: usage.percentUsed,
        },
        upgrade_url: '/pricing',
      },
      { status: 429 }
    );
  }

  return null;
}

// --- Agent Access Check -----------------------------------------------------

/**
 * Check if a specific agent is accessible under the user's subscription.
 * For 'all' tiers, everything is accessible.
 * For 'pick' tiers, check company_bundle_access or bundle_agents.
 */
export async function checkAgentAccess(
  ctx: SubscriptionContext,
  agentSlug: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  // Demo mode — always accessible (returns demo data)
  if (ctx.isDemo) return { hasAccess: true };

  // No limits means something is wrong, allow demo
  if (!ctx.limits) return { hasAccess: true };

  // 'all' tiers get everything
  if (ctx.limits.agent_selection_type === 'all') return { hasAccess: true };

  // 'pick' tiers — check if this agent is in their bundle
  if (!ctx.companyId) return { hasAccess: false, reason: 'No company associated' };

  const sb = supabaseAdmin();

  // Look up agent ID
  const { data: agent } = await sb
    .from('agent_registry')
    .select('id')
    .eq('slug', agentSlug)
    .single();

  if (!agent) return { hasAccess: false, reason: 'Agent not found' };

  // Check company_bundle_access for this agent
  // Note: The webhook grants per-agent access rows
  const { data: access } = await sb
    .from('company_bundle_access')
    .select('status')
    .eq('company_id', ctx.companyId)
    .eq('status', 'active');

  // If they have any active bundle access, allow
  // (In the future, this should check specific agent IDs)
  if (access && access.length > 0) return { hasAccess: true };

  return {
    hasAccess: false,
    reason: `Your ${ctx.limits.tier_name} plan allows ${ctx.limits.max_agents} agents. Upgrade to access more.`,
  };
}
