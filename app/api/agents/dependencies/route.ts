export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return unauthorized();

  try {
    const sb = getSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const agentSlug = searchParams.get('agentSlug');
    const direction = searchParams.get('direction') || 'both';

    let agentId: string | null = null;
    if (agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single();
      agentId = agent?.id || null;
      if (!agentId) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { data: allAgents } = await sb.from('agent_registry').select('id, slug, display_name, icon, status');
    const agentMap = new Map((allAgents || []).map((a: any) => [a.id, a]));

    const result: any = { depends_on: [], depended_by: [] };

    if (!agentId || direction === 'both' || direction === 'depends_on') {
      let q = sb.from('agent_dependencies').select('*');
      if (agentId) q = q.eq('agent_id', agentId);
      const { data: deps } = await q;
      result.depends_on = (deps || []).map((d: any) => ({
        ...d, agent: agentMap.get(d.agent_id), depends_on: agentMap.get(d.depends_on_agent_id),
      }));
    }

    if (!agentId || direction === 'both' || direction === 'depended_by') {
      let q = sb.from('agent_dependencies').select('*');
      if (agentId) q = q.eq('depends_on_agent_id', agentId);
      const { data: deps } = await q;
      result.depended_by = (deps || []).map((d: any) => ({
        ...d, agent: agentMap.get(d.agent_id), depends_on: agentMap.get(d.depends_on_agent_id),
      }));
    }

    const graph = !agentId ? (allAgents || []).map((agent: any) => {
      const depsOut = result.depends_on.filter((d: any) => d.agent_id === agent.id);
      const depsIn = result.depended_by.filter((d: any) => d.depends_on_agent_id === agent.id);
      return {
        slug: agent.slug, name: agent.display_name,
        depends_on: depsOut.map((d: any) => ({ slug: d.depends_on?.slug, type: d.dependency_type })),
        depended_by: depsIn.map((d: any) => ({ slug: d.agent?.slug, type: d.dependency_type })),
      };
    }).filter((a: any) => a.depends_on.length > 0 || a.depended_by.length > 0) : undefined;

    return NextResponse.json({ ...result, graph, agent_slug: agentSlug });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
