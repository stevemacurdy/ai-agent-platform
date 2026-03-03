// ============================================================================
// WoulfAI Usage Tracker — Shadow Mode
// ============================================================================
// Drop ONE line into any agent API route to track usage:
//
//   import { trackUsage } from '@/lib/usage-tracker';
//
//   // At end of GET/POST handler, fire-and-forget:
//   trackUsage(req, 'cfo');
//
// This runs in the background and never blocks/fails the response.
// Shadow mode: logs to usage_events but does NOT enforce limits.
// ============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Extract user info from request using any of the auth patterns in the codebase.
 * Tries Bearer token first, falls back to session cookie.
 * Returns { userId, companyId } or nulls.
 */
async function resolveUser(req: NextRequest): Promise<{ userId: string | null; companyId: string | null }> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return { userId: null, companyId: null };

    const sb = supabaseAdmin();
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return { userId: null, companyId: null };

    // Try to get company_id from profile
    const { data: profile } = await sb
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    return {
      userId: user.id,
      companyId: profile?.company_id || null,
    };
  } catch {
    return { userId: null, companyId: null };
  }
}

/**
 * Track a usage event. Fire-and-forget — never throws, never blocks.
 *
 * @param req - The NextRequest (used to extract user/company from auth header)
 * @param agentSlug - e.g. 'cfo', 'sales', 'operations', 'wms'
 * @param actionType - e.g. 'query', 'chat', 'export' (defaults to 'query')
 * @param actionCount - number of actions (defaults to 1)
 */
export function trackUsage(
  req: NextRequest,
  agentSlug: string,
  actionType: string = 'query',
  actionCount: number = 1
): void {
  // Fire and forget — wrap everything in a promise we don't await
  (async () => {
    try {
      const { userId, companyId } = await resolveUser(req);

      const sb = supabaseAdmin();
      await sb.from('usage_events').insert({
        company_id: companyId,
        user_id: userId,
        agent_slug: agentSlug,
        action_type: actionType,
        action_count: actionCount,
        metadata: {
          path: req.nextUrl.pathname,
          params: Object.fromEntries(req.nextUrl.searchParams),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      // Shadow mode: silently swallow errors
      console.error('[usage-tracker] Error (non-blocking):', err);
    }
  })();
}

/**
 * Track usage with known user/company (skip auth resolution).
 * Use when you already have the user info from your auth middleware.
 */
export function trackUsageDirect(
  agentSlug: string,
  userId: string | null,
  companyId: string | null,
  actionType: string = 'query',
  actionCount: number = 1,
  meta?: Record<string, any>
): void {
  (async () => {
    try {
      const sb = supabaseAdmin();
      await sb.from('usage_events').insert({
        company_id: companyId,
        user_id: userId,
        agent_slug: agentSlug,
        action_type: actionType,
        action_count: actionCount,
        metadata: meta || {},
      });
    } catch (err) {
      console.error('[usage-tracker] Error (non-blocking):', err);
    }
  })();
}

/**
 * Get usage summary for a company in the current billing period.
 */
export async function getUsageSummary(companyId: string): Promise<{
  total: number;
  byAgent: Record<string, number>;
  byAction: Record<string, number>;
}> {
  const sb = supabaseAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await sb
    .from('usage_events')
    .select('agent_slug, action_type, action_count')
    .eq('company_id', companyId)
    .gte('created_at', startOfMonth.toISOString());

  if (error || !data) return { total: 0, byAgent: {}, byAction: {} };

  const byAgent: Record<string, number> = {};
  const byAction: Record<string, number> = {};
  let total = 0;

  for (const row of data) {
    const count = row.action_count || 1;
    total += count;
    byAgent[row.agent_slug] = (byAgent[row.agent_slug] || 0) + count;
    byAction[row.action_type] = (byAction[row.action_type] || 0) + count;
  }

  return { total, byAgent, byAction };
}
