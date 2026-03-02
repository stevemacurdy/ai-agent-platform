export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET /api/agents/integrations — all integration requirements
// GET /api/agents/integrations?agentSlug=cfo — for one agent
// GET /api/agents/integrations?agentSlug=cfo&companyId=xxx — include connection status
export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const agentSlug = searchParams.get('agentSlug');
    const companyId = searchParams.get('companyId');
    const includeDataDomains = searchParams.get('dataDomains') !== 'false';

    // Resolve agent
    let agentId: string | null = null;
    if (agentSlug) {
      const { data: agent } = await sb
        .from('agent_registry')
        .select('id')
        .eq('slug', agentSlug)
        .single();
      agentId = agent?.id || null;
      if (!agentId) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Integration requirements
    let reqQuery = sb.from('agent_integration_requirements').select('*');
    if (agentId) reqQuery = reqQuery.eq('agent_id', agentId);
    const { data: requirements, error } = await reqQuery;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Overlay connection status if companyId provided
    let enrichedReqs = requirements || [];
    if (companyId) {
      const { data: connections } = await sb
        .from('integration_connections')
        .select('integration_id, status, last_sync')
        .eq('org_id', companyId);

      enrichedReqs = enrichedReqs.map((req: any) => {
        const conn = (connections || []).find((c: any) => c.integration_id === req.integration_slug);
        return {
          ...req,
          connection_status: conn?.status || 'not_connected',
          last_sync: conn?.last_sync || null,
        };
      });
    }

    // Data domains
    let dataDomains: any[] = [];
    if (includeDataDomains) {
      let ddQuery = sb.from('agent_data_domains').select('*');
      if (agentId) ddQuery = ddQuery.eq('agent_id', agentId);
      const { data: dd } = await ddQuery;
      dataDomains = dd || [];
    }

    // Group integrations by agent if no specific agent
    let grouped: any = null;
    if (!agentId) {
      const { data: agents } = await sb
        .from('agent_registry')
        .select('id, slug, display_name')
        .in('id', [...new Set(enrichedReqs.map((r: any) => r.agent_id))]);

      grouped = (agents || []).map((agent: any) => ({
        agent_slug: agent.slug,
        agent_name: agent.display_name,
        integrations: enrichedReqs.filter((r: any) => r.agent_id === agent.id),
        data_domains: dataDomains.filter((d: any) => d.agent_id === agent.id),
      }));
    }

    return NextResponse.json({
      integrations: enrichedReqs,
      data_domains: dataDomains,
      grouped,
      agent_slug: agentSlug,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
