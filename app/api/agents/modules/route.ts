export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient() as any;
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const companyId = searchParams.get('companyId');
    const slug = searchParams.get('agentSlug');

    let resolvedAgentId = agentId;
    if (!resolvedAgentId && slug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', slug).single() as any;
      resolvedAgentId = agent?.id;
    }
    if (!resolvedAgentId) return NextResponse.json({ error: 'agentId or agentSlug required' }, { status: 400 });

    const { data: assignments, error } = await sb.from('agent_module_assignments')
      .select('display_order, is_default, agent_modules(id, slug, display_name, icon, component_key)')
      .eq('agent_id', resolvedAgentId).order('display_order');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let modules = (assignments || []).map((a: any) => ({
      ...a.agent_modules, display_order: a.display_order, is_default: a.is_default, enabled: true, config: {},
    }));

    if (companyId) {
      const { data: tenantConfigs } = await sb.from('agent_tenant_module_config')
        .select('module_id, enabled, config').eq('company_id', companyId).eq('agent_id', resolvedAgentId);
      if (tenantConfigs) {
        modules = modules.map((m: any) => {
          const tc = tenantConfigs.find((t: any) => t.module_id === m.id);
          return tc ? { ...m, enabled: tc.enabled, config: tc.config || {} } : m;
        });
      }
    }

    return NextResponse.json({ modules, agent_id: resolvedAgentId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient() as any;
    const body = await request.json();
    const { companyId, agentId, moduleId, enabled, config, configuredBy } = body;
    if (!companyId || !agentId || !moduleId) return NextResponse.json({ error: 'companyId, agentId, moduleId required' }, { status: 400 });

    const { data, error } = await sb.from('agent_tenant_module_config').upsert({
      company_id: companyId, agent_id: agentId, module_id: moduleId,
      enabled: enabled !== undefined ? enabled : true, config: config || {},
      configured_by: configuredBy || null, updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id,agent_id,module_id' }).select().single() as any;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.from('agent_audit_log').insert({
      agent_id: agentId, action: 'module_toggled', entity_type: 'module',
      entity_id: moduleId, changed_by: configuredBy,
      new_value: { moduleId, enabled, config },
      description: `Module ${enabled ? 'enabled' : 'disabled'}`,
    });

    return NextResponse.json({ module_config: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
