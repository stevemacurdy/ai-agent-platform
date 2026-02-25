export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { odoo } from '@/lib/integration-client';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function resolveCompanyId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = sbAdmin();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: membership } = await sb
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();
  return membership?.company_id || null;
}

export async function GET(req: NextRequest) {
  const companyId = await resolveCompanyId(req);
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const resource = url.searchParams.get('resource') || 'inventory';
  const limit = parseInt(url.searchParams.get('limit') || '50');

  let result;

  switch (resource) {
    case 'inventory':
      result = await odoo.getInventory(companyId, limit);
      break;
    case 'sales_orders':
      result = await odoo.getSalesOrders(companyId, limit);
      break;
    case 'purchase_orders':
      result = await odoo.getPurchaseOrders(companyId, limit);
      break;
    default:
      return NextResponse.json({ error: 'Unknown resource: ' + resource }, { status: 400 });
  }

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, source: 'odoo' },
      { status: result.status || 502 }
    );
  }

  return NextResponse.json({
    source: 'odoo',
    resource,
    data: result.data,
  });
}
