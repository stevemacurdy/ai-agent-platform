export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/unified';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/integrations/callback?id={connection_id}
// Unified.to redirects here after successful customer authorization
export async function GET(req: NextRequest) {
  try {
    const connectionId = req.nextUrl.searchParams.get('id');
    if (!connectionId) {
      return NextResponse.redirect(new URL('/settings/integrations?error=no_connection', req.url));
    }

    // Fetch connection details from Unified.to
    const connection = await getConnection(connectionId);

    const companyId = connection.external_xref; // We passed company_id as external_xref
    const integrationType = connection.integration_type; // e.g. 'quickbooks', 'hubspot'
    const categories = connection.categories || []; // e.g. ['accounting']

    if (!companyId) {
      console.error('[callback] No external_xref (company_id) on connection');
      return NextResponse.redirect(new URL('/settings/integrations?error=no_company', req.url));
    }

    // Save connection to our database
    const sb = supabaseAdmin();
    await (sb as any).from('integration_connections').upsert({
      connection_id: connectionId,
      company_id: companyId,
      provider: integrationType || connection.type || 'unknown',
      category: categories[0] || 'unknown',
      status: 'active',
      metadata: {
        categories,
        integration_type: integrationType,
        created_at_unified: connection.created_at,
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'connection_id' });

    console.log(`[callback] Saved connection ${connectionId} for company ${companyId} (${integrationType})`);

    // Redirect to integrations page with success
    return NextResponse.redirect(new URL(`/settings/integrations?connected=true&provider=${integrationType}`, req.url));
  } catch (err: any) {
    console.error('[callback] Error:', err);
    return NextResponse.redirect(new URL('/settings/integrations?error=failed', req.url));
  }
}
