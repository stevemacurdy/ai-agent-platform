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

// GET /api/admin/usage-stats — View usage tracking data
// Query params: ?days=7 (default), ?company_id=xxx (optional)
export async function GET(req: NextRequest) {
  // Auth guard: admin only
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (token) {
    const sb2 = supabaseAdmin();
    const { data: { user }, error } = await sb2.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: profile } = await sb2.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['super_admin', 'admin'].includes(profile.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const days = parseInt(req.nextUrl.searchParams.get('days') || '7');
  const companyId = req.nextUrl.searchParams.get('company_id');

  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    let query = sb
      .from('usage_events')
      .select('agent_slug, action_type, action_count, company_id, user_id, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(500);

    if (companyId) query = query.eq('company_id', companyId);

    const { data: events, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Aggregate
    const byAgent: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    let total = 0;

    for (const e of events || []) {
      const count = e.action_count || 1;
      total += count;
      byAgent[e.agent_slug] = (byAgent[e.agent_slug] || 0) + count;
      byAction[e.action_type] = (byAction[e.action_type] || 0) + count;
      const day = e.created_at?.substring(0, 10) || 'unknown';
      byDay[day] = (byDay[day] || 0) + count;
    }

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      total,
      eventCount: (events || []).length,
      byAgent,
      byAction,
      byDay,
      recentEvents: (events || []).slice(0, 20),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
