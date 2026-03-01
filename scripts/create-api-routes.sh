#!/bin/bash
# ============================================================
# WoulfAI: Create all 9 API routes
# Run from repo root: bash scripts/create-api-routes.sh
# ============================================================

echo ""
echo "🔌 WoulfAI: Creating API Routes"
echo "══════════════════════════════════════"

BASE="app/api/agents"

# Create directories
for dir in bundles permissions modules events dependencies integrations-req webhooks usage audit; do
  mkdir -p "$BASE/$dir"
done

# ── BUNDLES ──────────────────────────────────────────────────
cat > "$BASE/bundles/route.ts" << 'ENDOFFILE'
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
ENDOFFILE
echo "   ✅ bundles/route.ts"

# ── PERMISSIONS ──────────────────────────────────────────────
cat > "$BASE/permissions/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const agentId = searchParams.get('agentId');
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    let query = sb.from('agent_user_permissions').select('*').eq('company_id', companyId);
    if (userId) query = query.eq('user_id', userId);
    if (agentId) query = query.eq('agent_id', agentId);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ permissions: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const body = await request.json();
    const { userId, agentId, companyId, permissionLevel, grantedBy } = body;
    if (!userId || !agentId || !companyId) return NextResponse.json({ error: 'userId, agentId, companyId required' }, { status: 400 });

    const { data, error } = await sb.from('agent_user_permissions').upsert({
      user_id: userId, agent_id: agentId, company_id: companyId,
      permission_level: permissionLevel || 'use', granted_by: grantedBy || null,
    }, { onConflict: 'user_id,agent_id,company_id' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.from('agent_audit_log').insert({
      agent_id: agentId, action: 'permission_changed', entity_type: 'permission',
      entity_id: data.id, changed_by: grantedBy,
      new_value: { userId, permissionLevel: permissionLevel || 'use' },
      description: `Permission ${permissionLevel || 'use'} granted`,
    });

    return NextResponse.json({ permission: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');
    const companyId = searchParams.get('companyId');

    if (id) {
      const { error } = await sb.from('agent_user_permissions').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (userId && agentId && companyId) {
      const { error } = await sb.from('agent_user_permissions').delete()
        .eq('user_id', userId).eq('agent_id', agentId).eq('company_id', companyId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'id or (userId+agentId+companyId) required' }, { status: 400 });
    }

    await sb.from('agent_audit_log').insert({
      agent_id: agentId, action: 'access_revoked', entity_type: 'permission',
      changed_by: searchParams.get('revokedBy'),
      old_value: { userId }, description: 'Permission revoked',
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
ENDOFFILE
echo "   ✅ permissions/route.ts"

# ── MODULES ──────────────────────────────────────────────────
cat > "$BASE/modules/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const companyId = searchParams.get('companyId');
    const slug = searchParams.get('agentSlug');

    let resolvedAgentId = agentId;
    if (!resolvedAgentId && slug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', slug).single();
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
    const sb = getSupabaseClient();
    const body = await request.json();
    const { companyId, agentId, moduleId, enabled, config, configuredBy } = body;
    if (!companyId || !agentId || !moduleId) return NextResponse.json({ error: 'companyId, agentId, moduleId required' }, { status: 400 });

    const { data, error } = await sb.from('agent_tenant_module_config').upsert({
      company_id: companyId, agent_id: agentId, module_id: moduleId,
      enabled: enabled !== undefined ? enabled : true, config: config || {},
      configured_by: configuredBy || null, updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id,agent_id,module_id' }).select().single();
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
ENDOFFILE
echo "   ✅ modules/route.ts"

# ── EVENTS ───────────────────────────────────────────────────
cat > "$BASE/events/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const agentSlug = searchParams.get('agentSlug');
    const category = searchParams.get('category');

    let resolvedAgentId = agentId;
    if (!resolvedAgentId && agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single();
      resolvedAgentId = agent?.id;
    }

    if (resolvedAgentId) {
      const { data: declarations, error } = await sb.from('agent_event_declarations')
        .select('direction, is_required, description, agent_events(id, slug, display_name, description, category, payload_schema)')
        .eq('agent_id', resolvedAgentId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const events = (declarations || []).map((d: any) => ({
        ...d.agent_events, direction: d.direction, is_required: d.is_required, agent_description: d.description,
      }));
      return NextResponse.json({
        events,
        emits: events.filter((e: any) => e.direction === 'emit' || e.direction === 'both'),
        consumes: events.filter((e: any) => e.direction === 'consume' || e.direction === 'both'),
        agent_id: resolvedAgentId,
      });
    }

    let query = sb.from('agent_events').select('*').eq('is_active', true).order('category').order('slug');
    if (category) query = query.eq('category', category);
    const { data: events, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const eventIds = (events || []).map((e: any) => e.id);
    const { data: declarations } = await sb.from('agent_event_declarations')
      .select('event_id, direction').in('event_id', eventIds.length ? eventIds : ['none']);

    const enriched = (events || []).map((event: any) => {
      const decls = (declarations || []).filter((d: any) => d.event_id === event.id);
      return {
        ...event,
        emitter_count: decls.filter((d: any) => d.direction === 'emit' || d.direction === 'both').length,
        consumer_count: decls.filter((d: any) => d.direction === 'consume' || d.direction === 'both').length,
      };
    });

    return NextResponse.json({ events: enriched, total: enriched.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
ENDOFFILE
echo "   ✅ events/route.ts"

# ── DEPENDENCIES ─────────────────────────────────────────────
cat > "$BASE/dependencies/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const agentSlug = searchParams.get('agentSlug');

    let agentId: string | null = null;
    if (agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single();
      agentId = agent?.id || null;
      if (!agentId) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { data: allAgents } = await sb.from('agent_registry').select('id, slug, display_name, icon, status');
    const agentMap = new Map((allAgents || []).map((a: any) => [a.id, a]));

    const result: any = { depends_on: [], depended_by: [] };

    let q1 = sb.from('agent_dependencies').select('*');
    if (agentId) q1 = q1.eq('agent_id', agentId);
    const { data: depsOut } = await q1;
    result.depends_on = (depsOut || []).map((d: any) => ({
      ...d, agent: agentMap.get(d.agent_id), depends_on: agentMap.get(d.depends_on_agent_id),
    }));

    let q2 = sb.from('agent_dependencies').select('*');
    if (agentId) q2 = q2.eq('depends_on_agent_id', agentId);
    const { data: depsIn } = await q2;
    result.depended_by = (depsIn || []).map((d: any) => ({
      ...d, agent: agentMap.get(d.agent_id), depends_on: agentMap.get(d.depends_on_agent_id),
    }));

    const graph = !agentId ? (allAgents || []).map((agent: any) => ({
      slug: agent.slug, name: agent.display_name,
      depends_on: result.depends_on.filter((d: any) => d.agent_id === agent.id).map((d: any) => ({ slug: d.depends_on?.slug, type: d.dependency_type })),
      depended_by: result.depended_by.filter((d: any) => d.depends_on_agent_id === agent.id).map((d: any) => ({ slug: d.agent?.slug, type: d.dependency_type })),
    })).filter((a: any) => a.depends_on.length > 0 || a.depended_by.length > 0) : undefined;

    return NextResponse.json({ ...result, graph, agent_slug: agentSlug });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
ENDOFFILE
echo "   ✅ dependencies/route.ts"

# ── INTEGRATIONS-REQ ─────────────────────────────────────────
cat > "$BASE/integrations-req/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const agentSlug = searchParams.get('agentSlug');
    const companyId = searchParams.get('companyId');

    let agentId: string | null = null;
    if (agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single();
      agentId = agent?.id || null;
      if (!agentId) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    let reqQuery = sb.from('agent_integration_requirements').select('*');
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

    let ddQuery = sb.from('agent_data_domains').select('*');
    if (agentId) ddQuery = ddQuery.eq('agent_id', agentId);
    const { data: dataDomains } = await ddQuery;

    return NextResponse.json({ integrations: enrichedReqs, data_domains: dataDomains || [], agent_slug: agentSlug });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
ENDOFFILE
echo "   ✅ integrations-req/route.ts"

# ── WEBHOOKS ─────────────────────────────────────────────────
cat > "$BASE/webhooks/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const companyId = new URL(request.url).searchParams.get('companyId');
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    const { data, error } = await sb.from('agent_webhooks').select('*')
      .eq('company_id', companyId).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhooks: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const body = await request.json();
    const { companyId, agentId, url, secret, events, description, createdBy } = body;
    if (!companyId || !url) return NextResponse.json({ error: 'companyId and url required' }, { status: 400 });
    const { data, error } = await sb.from('agent_webhooks').insert({
      company_id: companyId, agent_id: agentId || null, url, secret: secret || null,
      events: events || [], description: description || null, is_active: true, created_by: createdBy || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhook: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const safe: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of ['url','secret','events','is_active','description','retry_count']) {
      if (updates[k] !== undefined) safe[k] = updates[k];
    }
    const { data, error } = await sb.from('agent_webhooks').update(safe).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ webhook: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await sb.from('agent_webhooks').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
ENDOFFILE
echo "   ✅ webhooks/route.ts"

# ── USAGE ────────────────────────────────────────────────────
cat > "$BASE/usage/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const agentSlug = searchParams.get('agentSlug');
    const metric = searchParams.get('metric');
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

    let resolvedAgentId = searchParams.get('agentId');
    if (!resolvedAgentId && agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single();
      resolvedAgentId = agent?.id || null;
    }

    let query = sb.from('agent_usage_metrics').select('*')
      .eq('company_id', companyId).order('period_start', { ascending: false });
    if (resolvedAgentId) query = query.eq('agent_id', resolvedAgentId);
    if (metric) query = query.eq('metric', metric);
    const from = searchParams.get('from'); const to = searchParams.get('to');
    if (from) query = query.gte('period_start', from);
    if (to) query = query.lte('period_end', to);

    const { data: usage, error } = await query.limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const summary = Object.values((usage || []).reduce((acc: any, u: any) => {
      const key = `${u.agent_id}:${u.metric}`;
      if (!acc[key]) acc[key] = { agent_id: u.agent_id, metric: u.metric, total: 0, periods: 0 };
      acc[key].total += Number(u.value); acc[key].periods += 1;
      return acc;
    }, {} as Record<string, any>));

    return NextResponse.json({ usage: usage || [], summary, total_records: (usage || []).length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { agentId, companyId, metric, value } = await request.json();
    if (!agentId || !companyId || !metric) return NextResponse.json({ error: 'agentId, companyId, metric required' }, { status: 400 });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: existing } = await sb.from('agent_usage_metrics').select('id, value')
      .eq('agent_id', agentId).eq('company_id', companyId).eq('metric', metric)
      .eq('period_start', periodStart).single();

    let data;
    if (existing) {
      const { data: updated, error } = await sb.from('agent_usage_metrics')
        .update({ value: Number(existing.value) + (value || 1), updated_at: new Date().toISOString() })
        .eq('id', existing.id).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      data = updated;
    } else {
      const { data: created, error } = await sb.from('agent_usage_metrics')
        .insert({ agent_id: agentId, company_id: companyId, metric, value: value || 1, period_start: periodStart, period_end: periodEnd })
        .select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      data = created;
    }
    return NextResponse.json({ usage: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
ENDOFFILE
echo "   ✅ usage/route.ts"

# ── AUDIT ────────────────────────────────────────────────────
cat > "$BASE/audit/route.ts" << 'ENDOFFILE'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const agentSlug = searchParams.get('agentSlug');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const changedBy = searchParams.get('changedBy');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    let resolvedAgentId = searchParams.get('agentId');
    if (!resolvedAgentId && agentSlug) {
      const { data: agent } = await sb.from('agent_registry').select('id').eq('slug', agentSlug).single();
      resolvedAgentId = agent?.id || null;
    }

    let query = sb.from('agent_audit_log').select('*', { count: 'exact' })
      .order('changed_at', { ascending: false }).range(offset, offset + limit - 1);
    if (resolvedAgentId) query = query.eq('agent_id', resolvedAgentId);
    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (changedBy) query = query.eq('changed_by', changedBy);

    const { data: entries, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entries: entries || [], total: count || 0, limit, offset, has_more: (count || 0) > offset + limit });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { agentId, action, entityType, entityId, changedBy, oldValue, newValue, description } = await request.json();
    if (!action) return NextResponse.json({ error: 'action required' }, { status: 400 });
    const { data, error } = await sb.from('agent_audit_log').insert({
      agent_id: agentId || null, action, entity_type: entityType || 'agent',
      entity_id: entityId || null, changed_by: changedBy || null,
      old_value: oldValue || null, new_value: newValue || null, description: description || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ entry: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
ENDOFFILE
echo "   ✅ audit/route.ts"

echo ""
echo "══════════════════════════════════════"
echo "✅ All 9 API routes created"
echo ""
echo "Run:"
echo "  npm run build"
echo "  git add app/api/agents/{bundles,permissions,modules,events,dependencies,integrations-req,webhooks,usage,audit}"
echo "  git commit -m 'api: 9 routes for bundles, permissions, modules, events, deps, integrations, webhooks, usage, audit'"
echo "  vercel --prod"
