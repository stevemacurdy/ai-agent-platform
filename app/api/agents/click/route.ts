import { NextRequest, NextResponse } from 'next/server';

// In-memory store (production: Supabase insert)
const clicks: any[] = [];
const rateLimiter = new Map<string, number[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_slug, source, session_id } = body;
    if (!agent_slug) return NextResponse.json({ error: 'Missing agent_slug' }, { status: 400 });

    // Rate limit: max 10 clicks per session per minute
    const key = session_id || 'anon';
    const now = Date.now();
    const recent = (rateLimiter.get(key) || []).filter(t => now - t < 60000);
    if (recent.length >= 10) return new NextResponse(null, { status: 204 });
    recent.push(now);
    rateLimiter.set(key, recent);

    clicks.push({
      id: 'click-' + Date.now(),
      agent_slug,
      source: source || 'unknown',
      session_id: session_id || null,
      user_agent: request.headers.get('user-agent')?.slice(0, 100) || null,
      created_at: new Date().toISOString(),
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

// Admin: get click analytics
export async function GET(request: NextRequest) {
  const email = request.headers.get('x-admin-email');
  const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
  if (!email || !ADMINS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const now = Date.now();
  const day = 86400000;
  const byAgent: Record<string, { total: number; last24h: number; last7d: number; uniqueSessions: Set<string> }> = {};

  for (const c of clicks) {
    if (!byAgent[c.agent_slug]) byAgent[c.agent_slug] = { total: 0, last24h: 0, last7d: 0, uniqueSessions: new Set() };
    const entry = byAgent[c.agent_slug];
    entry.total++;
    const age = now - new Date(c.created_at).getTime();
    if (age < day) entry.last24h++;
    if (age < 7 * day) entry.last7d++;
    if (c.session_id) entry.uniqueSessions.add(c.session_id);
  }

  const analytics = Object.entries(byAgent).map(([slug, data]) => ({
    agent_slug: slug,
    total_clicks: data.total,
    clicks_24h: data.last24h,
    clicks_7d: data.last7d,
    unique_sessions: data.uniqueSessions.size,
  })).sort((a, b) => b.total_clicks - a.total_clicks);

  return NextResponse.json({ analytics, totalClicks: clicks.length, since: clicks[0]?.created_at || null });
}
