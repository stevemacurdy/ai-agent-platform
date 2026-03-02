export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { listConnections, deleteConnection } from '@/lib/unified';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/integrations/connect — list connections for a company
export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('company_id');
    if (!companyId) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 });
    }

    // Get connections from Unified.to filtered by company external ref
    const connections = await listConnections(companyId);

    // Also get our local records
    const sb = supabaseAdmin();
    const { data: localConns } = await (sb as any)
      .from('integration_connections')
      .select('*')
      .eq('company_id', companyId);

    return NextResponse.json({
      connections: connections || [],
      local: localConns || [],
    });
  } catch (err: any) {
    console.error('[integrations/connect] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/integrations/connect — generate embed URL for customer authorization
export async function POST(req: NextRequest) {
  try {
    const { companyId, categories, successRedirect } = await req.json();

    if (!companyId || !categories) {
      return NextResponse.json({ error: 'companyId and categories required' }, { status: 400 });
    }

    const workspaceId = process.env.UNIFIED_WORKSPACE_ID;
    if (!workspaceId) {
      return NextResponse.json({ error: 'UNIFIED_WORKSPACE_ID not configured' }, { status: 500 });
    }

    // Build the Unified.to embedded authorization URL
    const params = new URLSearchParams({
      categories: Array.isArray(categories) ? categories.join(',') : categories,
      external_xref: companyId,
      success_redirect: successRedirect || `${req.headers.get('origin') || 'https://www.woulfai.com'}/settings/integrations?connected=true`,
      failure_redirect: successRedirect || `${req.headers.get('origin') || 'https://www.woulfai.com'}/settings/integrations?error=true`,
    });

    const embedUrl = `https://api.unified.to/unified/integration/auth/${workspaceId}?${params}`;

    return NextResponse.json({ embedUrl });
  } catch (err: any) {
    console.error('[integrations/connect] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/integrations/connect — disconnect an integration
export async function DELETE(req: NextRequest) {
  try {
    const { connectionId, companyId } = await req.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
    }

    // Delete from Unified.to
    await deleteConnection(connectionId);

    // Delete local record
    const sb = supabaseAdmin();
    await (sb as any)
      .from('integration_connections')
      .delete()
      .eq('connection_id', connectionId)
      .eq('company_id', companyId);

    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    console.error('[integrations/connect] DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
