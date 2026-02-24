export const dynamic = 'force-dynamic';
// ============================================================================
// CRM TEST - Test existing connection
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCRMAdapter } from '@/lib/crm';
import { getCRMConnection } from '@/lib/crm/store';
import type { CRMProvider } from '@/lib/crm/types';

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

    const { provider } = await req.json() as { provider: CRMProvider };

    const connection = await getCRMConnection(user.id, provider);
    if (!connection || !connection.token) {
      return NextResponse.json({ error: 'No connection found' }, { status: 404 });
    }

    const adapter = getCRMAdapter(provider);
    const result = await adapter.testConnection({ token: connection.token });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
