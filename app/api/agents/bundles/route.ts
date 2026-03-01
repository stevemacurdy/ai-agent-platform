export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const companyId = searchParams.get('companyId');

    // Single agent lookup
    if (slug) {
      const { data: agent, error } = await sb
        .from('agent_registry')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      // Get categories
      const { data: categories } = await sb
        .from('agent_category_map')
        .select('category_id, is_primary, agent_categories(slug, display_name, icon, color)')
        .eq('agent_id', agent.id);

      // Get modules
      const { data: modules } = await sb
        .from('agent_module_assignments')
        .select('display_order, is_default, agent_modules(id, slug, display_name, icon)')
        .eq('agent_id', agent.id)
        .order('display_order');

      // Get tenant config if companyId provided
      let tenantConfig = null;
      if (companyId) {
        const { data: tc } = await sb
          .from('agent_tenant_config')
          .select('*')
          .eq('agent_id', agent.id)
          .eq('company_id', companyId)
          .single();
        tenantConfig = tc;
      }

      return NextResponse.json({
        agent: {
          ...agent,
          categories: categories || [],
          modules: (modules || []).map(m => ({
            ...(m.agent_modules as any),
            display_order: m.display_order,
            is_default: m.is_default,
          })),
          tenant_config: tenantConfig,
        }
      });
    }

    // List agents
    let query = sb
      .from('agent_registry')
      .select('*')
      .order('display_order');

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['live', 'beta', 'deprecated']);
    }

    const { data: agents, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get all category mappings in one query
    const agentIds = (agents || []).map(a => a.id);
    const { data: allCategories } = await sb
      .from('agent_category_map')
      .select('agent_id, is_primary, agent_categories(slug, display_name, icon, color)')
      .in('agent_id', agentIds);

    // Get company access if companyId provided
    let companyAccess: any[] = [];
    if (companyId) {
      const { data: access } = await sb
        .from('agent_company_access')
        .select('agent_id, visibility, permission_level, plan_type, trial_ends_at, expires_at')
        .eq('company_id', companyId)
        .in('agent_id', agentIds);
      companyAccess = access || [];
    }

    // Filter by category if provided
    let filteredAgents = agents || [];
    if (category && allCategories) {
      const agentIdsInCategory = allCategories
        .filter(c => (c.agent_categories as any)?.slug === category)
        .map(c => c.agent_id);
      filteredAgents = filteredAgents.filter(a => agentIdsInCategory.includes(a.id));
    }

    // Merge categories and access into agents
    const enrichedAgents = filteredAgents.map(agent => {
      const cats = (allCategories || []).filter(c => c.agent_id === agent.id);
      const access = companyAccess.find(a => a.agent_id === agent.id);
      const primaryCat = cats.find(c => c.is_primary);

      return {
        slug: agent.slug,
        name: agent.display_name,
        description: agent.description,
        short_description: agent.short_description,
        icon: agent.icon,
        color: agent.color,
        status: agent.status,
        maturity: agent.maturity,
        display_order: agent.display_order,
        is_featured: agent.is_featured,
        is_recommended: agent.is_recommended,
        component_path: agent.component_path,
        contract_version: agent.contract_version,
        keywords: agent.keywords,
        primary_category: primaryCat ? (primaryCat.agent_categories as any) : null,
        categories: cats.map(c => (c.agent_categories as any)),
        stripe_product_id: agent.stripe_product_id,
        is_free: agent.is_free,
        trial_days: agent.trial_days,
        access: access || null,
        metadata: agent.metadata,
      };
    });

    return NextResponse.json({
      agents: enrichedAgents,
      total: enrichedAgents.length,
      live_count: enrichedAgents.filter(a => a.status === 'live').length,
      beta_count: enrichedAgents.filter(a => a.status === 'beta').length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
