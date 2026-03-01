export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const agentSlug = searchParams.get('agentSlug');
    const companyId = searchParams.get('companyId');

    let agentId: string | null = null;
    if (agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single() as any;
      agentId = agent?.id || null;
      if (!agentId) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    let reqQuery = sb.from('agent_integration_requirements').select('*') as any;
    if (agentId) reqQuery = reqQuery.eq('agent_id', agentId);
    const { data: requirements, error } = await reqQuery;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let enrichedReqs = requirements || [];
    if (companyId) {
      const { data: connections } = await sb.from('integration_connections')
        .select('integration_id, status, last_sync').eq('org_id', companyId);
      enrichedReqs = enrichedReqs.map((req: any) => {
        const conn = (connections || []).find((c: any) => c.integration_id === req.integration_slug);
        return { ...req, connection_status: conn?.status || 'not_connected', last_sync: conn?.last_sync || null };
      });
    }

    let ddQuery = sb.from('agent_data_domains').select('*') as any;
    if (agentId) ddQuery = ddQuery.eq('agent_id', agentId);
    const { data: dataDomains } = await ddQuery;

    return NextResponse.json({ integrations: enrichedReqs, data_domains: dataDomains || [], agent_slug: agentSlug });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
