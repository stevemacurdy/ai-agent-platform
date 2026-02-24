export const dynamic = 'force-dynamic';
// ============================================================================
// CRM LEADS - Create leads in connected CRM
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCRMAdapter } from '@/lib/crm';
import { getCRMConnection } from '@/lib/crm/store';
import type { CRMProvider, CRMLead } from '@/lib/crm/types';

async function getCurrentUser(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { cookie: req.headers.get('cookie') || '' } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, lead } = await req.json() as { provider: CRMProvider; lead: CRMLead };

    if (!lead || !lead.name) {
      return NextResponse.json({ error: 'Lead name is required' }, { status: 400 });
    }

    const connection = await getCRMConnection(user.id, provider);
    if (!connection || !connection.token) {
      return NextResponse.json({ error: 'CRM not connected' }, { status: 400 });
    }

    const adapter = getCRMAdapter(provider);
    const result = await adapter.createLead({ token: connection.token, lead });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
