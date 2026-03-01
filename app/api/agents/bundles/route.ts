export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const companyId = searchParams.get('companyId');
    const activeOnly = searchParams.get('active') !== 'false';

    if (slug) {
      const { data: bundle, error } = await sb
        .from('agent_bundles').select('*').eq('slug', slug).single();
      if (error || !bundle) return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });

      const { data: bundleAgents } = await sb
        .from('bundle_agents').select('display_order, is_highlighted, agent_id')
        .eq('bundle_id', bundle.id).order('display_order');

      const agentIds = (bundleAgents || []).map((ba: any) => ba.agent_id);
      const { data: agents } = await sb
        .from('agent_registry').select('id, slug, display_name, icon, color, status, short_description')
        .in('id', agentIds.length ? agentIds : ['none']);

      const enrichedAgents = (bundleAgents || []).map((ba: any) => {
        const agent = (agents || []).find((a: any) => a.id === ba.agent_id);
        return { ...agent, display_order: ba.display_order, is_highlighted: ba.is_highlighted };
      });

      let access = null;
      if (companyId) {
        const { data: ca } = await sb.from('company_bundle_access').select('*')
          .eq('company_id', companyId).eq('bundle_id', bundle.id).single();
        access = ca;
      }

      return NextResponse.json({ bundle: { ...bundle, agents: enrichedAgents, access } });
    }

    let query = sb.from('agent_bundles').select('*').order('display_order');
    if (activeOnly) query = query.eq('is_active', true);
    const { data: bundles, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const bundleIds = (bundles || []).map((b: any) => b.id);
    const { data: allBundleAgents } = await sb.from('bundle_agents')
      .select('bundle_id, agent_id, display_order, is_highlighted')
      .in('bundle_id', bundleIds.length ? bundleIds : ['none']);

    const agentIds = [...new Set((allBundleAgents || []).map((ba: any) => ba.agent_id))];
    const { data: agents } = await sb.from('agent_registry')
      .select('id, slug, display_name, icon, color, status')
      .in('id', agentIds.length ? agentIds : ['none']);

    let companyAccess: any[] = [];
    if (companyId) {
      const { data: ca } = await sb.from('company_bundle_access').select('*')
        .eq('company_id', companyId).in('bundle_id', bundleIds.length ? bundleIds : ['none']);
      companyAccess = ca || [];
    }

    const enriched = (bundles || []).map((bundle: any) => {
      const bas = (allBundleAgents || []).filter((ba: any) => ba.bundle_id === bundle.id);
      const bundleAgentList = bas.map((ba: any) => {
        const agent = (agents || []).find((a: any) => a.id === ba.agent_id);
        return { ...agent, display_order: ba.display_order, is_highlighted: ba.is_highlighted };
      }).sort((a: any, b: any) => a.display_order - b.display_order);
      const access = companyAccess.find((ca: any) => ca.bundle_id === bundle.id);
      return { ...bundle, agents: bundleAgentList, agent_count: bundleAgentList.length, access: access || null };
    });

    return NextResponse.json({ bundles: enriched, total: enriched.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
