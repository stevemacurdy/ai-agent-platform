export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { unifiedRequest } from '@/lib/unified';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/integrations/data?company_id=xxx&category=accounting&object=invoice&limit=50
// Generic proxy to Unified.to - used by all agents
export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('company_id');
    const category = req.nextUrl.searchParams.get('category');
    const object = req.nextUrl.searchParams.get('object');

    if (!companyId || !category || !object) {
      return NextResponse.json(
        { error: 'company_id, category, and object are required' },
        { status: 400 }
      );
    }

    // Look up the connection for this company + category
    const sb = supabaseAdmin();
    const { data: conn, error: connErr } = await (sb as any)
      .from('integration_connections')
      .select('connection_id, provider, status')
      .eq('company_id', companyId)
      .eq('category', category)
      .eq('status', 'active')
      .single();

    if (connErr || !conn) {
      return NextResponse.json(
        { error: `No active ${category} integration found for this company. Please connect your ${category} software first.` },
        { status: 404 }
      );
    }

    // Build params from query string (pass through limit, offset, etc.)
    const params: Record<string, string> = {};
    const passthrough = ['limit', 'offset', 'cursor', 'updated_gte', 'sort', 'query'];
    passthrough.forEach(key => {
      const val = req.nextUrl.searchParams.get(key);
      if (val) params[key] = val;
    });

    // Call Unified.to
    const data = await unifiedRequest(`/${category}/${conn.connection_id}/${object}`, { params });

    return NextResponse.json({
      data,
      provider: conn.provider,
      connection_id: conn.connection_id,
    });
  } catch (err: any) {
    console.error('[integrations/data] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/integrations/data — write data to customer integration
export async function POST(req: NextRequest) {
  try {
    const { companyId, category, object, body } = await req.json();

    if (!companyId || !category || !object || !body) {
      return NextResponse.json(
        { error: 'companyId, category, object, and body are required' },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const { data: conn } = await (sb as any)
      .from('integration_connections')
      .select('connection_id')
      .eq('company_id', companyId)
      .eq('category', category)
      .eq('status', 'active')
      .single();

    if (!conn) {
      return NextResponse.json(
        { error: `No active ${category} integration found` },
        { status: 404 }
      );
    }

    const data = await unifiedRequest(`/${category}/${conn.connection_id}/${object}`, {
      method: 'POST',
      body,
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('[integrations/data] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
