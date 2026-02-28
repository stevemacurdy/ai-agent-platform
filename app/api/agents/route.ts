export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const sb = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const filter = searchParams.get('filter');

  if (slug) {
    const { data: agent }: any = await sb.from('agent_registry').select('*').eq('slug', slug).single();
    if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ agent: { slug: agent.slug, name: agent.display_name, description: agent.description || agent.short_description, icon: agent.icon, status: agent.status, category: null, completionPct: 0 } });
  }

  let query = sb.from('agent_registry').select('*').order('display_order');
  if (filter === 'live') query = query.eq('status', 'live');
  else if (filter === 'dev') query = query.in('status', ['draft', 'beta']);

  const { data: agents }: any = await query;
  const list = (agents || []).map((a: any) => ({ slug: a.slug, name: a.display_name, description: a.description || a.short_description, icon: a.icon, status: a.status, completionPct: 0, category: null, liveRoute: a.component_path ? '/' + a.component_path : null, demoRoute: null, featuresDone: 0, featuresTotal: 0 }));

  return NextResponse.json({ agents: list, totalAgents: list.length, liveCount: list.filter((a: any) => a.status === 'live').length, devCount: list.filter((a: any) => a.status !== 'live').length });
}
