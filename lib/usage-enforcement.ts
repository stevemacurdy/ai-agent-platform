// ─── Usage Enforcement Middleware ────────────────────────────────
// Phase 4.2: Hard enforcement of tier limits
// Wraps agent API routes — checks usage against tier limits before allowing access

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Tier limits (monthly)
const TIER_LIMITS: Record<string, { actions: number; agents: number; seats: number; storageMb: number }> = {
  starter: { actions: 500, agents: 5, seats: 2, storageMb: 1000 },
  growth: { actions: 2000, agents: 10, seats: 10, storageMb: 5000 },
  professional: { actions: 10000, agents: 21, seats: 25, storageMb: 25000 },
  enterprise: { actions: Infinity, agents: 21, seats: Infinity, storageMb: Infinity },
};

export interface EnforcementResult {
  allowed: boolean;
  tier: string;
  usage: { current: number; limit: number; percentage: number };
  reason?: string;
}

export async function checkTierLimits(companyId: string, agentSlug: string): Promise<EnforcementResult> {
  const sb = supabaseAdmin();

  // Get company subscription tier
  const { data: sub } = await sb
    .from('subscriptions')
    .select('tier, status')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .single();

  const tier = sub?.tier || 'starter';
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.starter;

  // Get current month usage count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await sb
    .from('usage_events')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', startOfMonth.toISOString());

  const current = count || 0;
  const percentage = Math.round((current / limits.actions) * 100);

  if (current >= limits.actions) {
    return {
      allowed: false,
      tier,
      usage: { current, limit: limits.actions, percentage },
      reason: `Monthly action limit reached (${current}/${limits.actions}). Upgrade your plan for more.`,
    };
  }

  return {
    allowed: true,
    tier,
    usage: { current, limit: limits.actions, percentage },
  };
}

// Warning thresholds for proactive notifications
export function getUsageWarningLevel(percentage: number): 'none' | 'info' | 'warning' | 'critical' | 'exceeded' {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  if (percentage >= 50) return 'info';
  return 'none';
}

// HOF: Wrap any agent route handler with tier enforcement
export function withTierEnforcement(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Extract company_id from auth token or header
      const authHeader = req.headers.get('authorization');
      let companyId: string | null = null;

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const sb = supabaseAdmin();
        const { data: { user } } = await sb.auth.getUser(token);
        if (user) {
          const { data: profile } = await sb
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
          companyId = profile?.company_id;
        }
      }

      companyId = companyId || req.headers.get('x-company-id');

      // No company = no enforcement (anonymous/demo)
      if (!companyId) {
        return handler(req, context);
      }

      const result = await checkTierLimits(companyId, '');

      if (!result.allowed) {
        return NextResponse.json(
          {
            error: 'Usage limit exceeded',
            message: result.reason,
            usage: result.usage,
            tier: result.tier,
            upgradeUrl: '/pricing',
          },
          { status: 429 }
        );
      }

      // Add usage headers to response
      const response = await handler(req, context);
      response.headers.set('X-Usage-Current', String(result.usage.current));
      response.headers.set('X-Usage-Limit', String(result.usage.limit));
      response.headers.set('X-Usage-Percentage', String(result.usage.percentage));
      response.headers.set('X-Tier', result.tier);

      return response;
    } catch (err) {
      console.error('[enforcement] Error:', err);
      // Fail open — don't block on enforcement errors
      return handler(req, context);
    }
  };
}

// Check seat limits for team invites
export async function checkSeatLimit(companyId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const sb = supabaseAdmin();

  const { data: sub } = await sb
    .from('subscriptions')
    .select('tier')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .single();

  const tier = sub?.tier || 'starter';
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.starter;

  const { count } = await sb
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const current = count || 0;
  return { allowed: current < limits.seats, current, limit: limits.seats };
}
