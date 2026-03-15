import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import '@/lib/demo-agents';
import { getAllAgents, toggleAgent } from '@/lib/demo-registry';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = supabaseAdmin();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return null;
  return user;
}

export async function GET() {
  const agents = getAllAgents().map(a => ({
    slug: a.meta.slug,
    name: a.meta.name,
    icon: a.meta.icon,
    dept: a.meta.dept,
    deptColor: a.meta.deptColor,
    buildBatch: a.meta.buildBatch,
    enabled: a.meta.enabled,
  }));
  return NextResponse.json({ agents, total: agents.length, enabled: agents.filter(a => a.enabled).length });
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { slug, enabled } = body as { slug: string; enabled: boolean };
    if (!slug || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'slug and enabled required' }, { status: 400 });
    }
    const success = toggleAgent(slug, enabled);
    if (!success) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json({ slug, enabled, success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
