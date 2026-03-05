export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/usage/track
 * Fire-and-forget usage logging. Accepts:
 *   { agentSlug, actionType, actionDetail?, tokensUsed?, responseTimeMs? }
 *
 * Also updates the daily rollup table for fast dashboard queries.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentSlug, actionType, actionDetail, tokensUsed, responseTimeMs } = body;

    if (!agentSlug || !actionType) {
      return NextResponse.json({ error: 'agentSlug and actionType required' }, { status: 400 });
    }

    // Extract user from auth header if present
    let userId: string | null = null;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const sb = supabaseAdmin();
        const { data: { user } } = await sb.auth.getUser(token);
        userId = user?.id || null;
      } catch { /* anonymous tracking is fine */ }
    }

    const sb = supabaseAdmin();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const ua = request.headers.get('user-agent') || null;

    // 1. Insert detailed log
    await sb.from('platform_usage_log').insert({
      user_id: userId,
      agent_slug: agentSlug,
      action_type: actionType,
      action_detail: actionDetail || null,
      tokens_used: tokensUsed || 0,
      response_time_ms: responseTimeMs || null,
      ip_address: ip,
      user_agent: ua,
    });

    // 2. Upsert daily rollup
    if (userId) {
      const today = new Date().toISOString().split('T')[0];
      const increment: Record<string, number> = {};

      if (actionType === 'console_view') increment.console_views = 1;
      else if (actionType === 'api_get' || actionType === 'api_post') increment.api_calls = 1;
      else if (actionType === 'ai_generation') {
        increment.ai_generations = 1;
        increment.tokens_used = tokensUsed || 0;
      }

      // Try upsert: insert or increment
      const { data: existing } = await sb
        .from('platform_usage_daily')
        .select('id, console_views, api_calls, ai_generations, tokens_used')
        .eq('user_id', userId)
        .eq('agent_slug', agentSlug)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        const updates: Record<string, number> = {};
        if (increment.console_views) updates.console_views = (existing.console_views || 0) + 1;
        if (increment.api_calls) updates.api_calls = (existing.api_calls || 0) + 1;
        if (increment.ai_generations) updates.ai_generations = (existing.ai_generations || 0) + 1;
        if (increment.tokens_used) updates.tokens_used = (existing.tokens_used || 0) + increment.tokens_used;
        if (Object.keys(updates).length > 0) {
          await sb.from('platform_usage_daily').update(updates).eq('id', existing.id);
        }
      } else {
        await sb.from('platform_usage_daily').insert({
          user_id: userId,
          agent_slug: agentSlug,
          date: today,
          console_views: increment.console_views || 0,
          api_calls: increment.api_calls || 0,
          ai_generations: increment.ai_generations || 0,
          tokens_used: increment.tokens_used || 0,
        });
      }

      // 3. Update last_active_at on profile
      await sb.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', userId);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    // Usage tracking should never fail the caller
    console.error('Usage tracking error:', e);
    return NextResponse.json({ ok: true });
  }
}
