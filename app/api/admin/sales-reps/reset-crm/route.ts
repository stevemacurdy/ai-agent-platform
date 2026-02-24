export const dynamic = 'force-dynamic';
// ============================================================================
// ADMIN: RESET CRM CONNECTION
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(req: NextRequest) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { cookie: req.headers.get('cookie') || '' } } }
  );
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const supabase = getSupabaseClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from('sales_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return profile?.role === 'super_admin' || user.email === 'steve@woulfgroup.com';
}

export async function POST(req: NextRequest) {
  try {
    if (!await isAdmin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, provider } = await req.json();

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('crm_connections')
      .update({
        status: 'disconnected',
        token_encrypted: null,
      })
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
