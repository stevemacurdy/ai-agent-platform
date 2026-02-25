export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = sbAdmin();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin', 'admin', 'company_admin'].includes(profile.role)) return null;
  return user;
}

// GET: List integrations (optionally by company_id)
export async function GET(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = sbAdmin();
  const url = new URL(req.url);
  const companyId = url.searchParams.get('company_id');

  let query = sb
    .from('integrations')
    .select('id, company_id, provider, label, status, last_synced_at, error_message, created_at, companies(name, slug)')
    .order('created_at', { ascending: false });

  if (companyId) query = query.eq('company_id', companyId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ integrations: data || [] });
}

// POST: Create or update an integration
export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, ...body } = await req.json();
  const sb = sbAdmin();

  if (action === 'upsert') {
    const { company_id, provider, config, label } = body;
    if (!company_id || !provider) {
      return NextResponse.json({ error: 'company_id and provider required' }, { status: 400 });
    }

    // Check if integration already exists
    const { data: existing } = await sb
      .from('integrations')
      .select('id')
      .eq('company_id', company_id)
      .eq('provider', provider)
      .maybeSingle();

    if (existing) {
      // Update
      const { data, error } = await sb
        .from('integrations')
        .update({
          config: config || {},
          label: label || '',
          status: 'active',
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ integration: data, updated: true });
    } else {
      // Insert
      const { data, error } = await sb
        .from('integrations')
        .insert({
          company_id,
          provider,
          config: config || {},
          label: label || '',
          status: 'active',
          created_by: adminUser.id,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ integration: data, created: true });
    }
  }

  if (action === 'test') {
    const { integration_id } = body;
    if (!integration_id) return NextResponse.json({ error: 'integration_id required' }, { status: 400 });

    const { data: integration } = await sb
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Test connectivity based on provider
    try {
      let testUrl = '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (integration.provider === 'hubspot') {
        testUrl = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=1';
        const token = integration.config.access_token || integration.config.api_key;
        headers['Authorization'] = `Bearer ${token}`;
      } else if (integration.provider === 'odoo') {
        testUrl = `${integration.config.base_url}/web/session/get_session_info`;
        // Odoo test is just checking the URL is reachable
      }

      if (!testUrl) {
        return NextResponse.json({ error: 'Test not supported for this provider' }, { status: 400 });
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(testUrl, { headers, signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        await sb.from('integrations').update({
          status: 'active',
          error_message: null,
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', integration_id);

        return NextResponse.json({ success: true, message: 'Connection successful' });
      } else {
        const errText = await res.text().catch(() => '');
        await sb.from('integrations').update({
          status: 'error',
          error_message: `HTTP ${res.status}: ${errText.slice(0, 200)}`,
          updated_at: new Date().toISOString(),
        }).eq('id', integration_id);

        return NextResponse.json({ success: false, message: `HTTP ${res.status}`, detail: errText.slice(0, 500) });
      }
    } catch (err: any) {
      await sb.from('integrations').update({
        status: 'error',
        error_message: err.message,
        updated_at: new Date().toISOString(),
      }).eq('id', integration_id);

      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  if (action === 'delete') {
    const { integration_id } = body;
    if (!integration_id) return NextResponse.json({ error: 'integration_id required' }, { status: 400 });
    const { error } = await sb.from('integrations').delete().eq('id', integration_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'deactivate') {
    const { integration_id } = body;
    if (!integration_id) return NextResponse.json({ error: 'integration_id required' }, { status: 400 });
    const { error } = await sb.from('integrations').update({ status: 'inactive', updated_at: new Date().toISOString() }).eq('id', integration_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
