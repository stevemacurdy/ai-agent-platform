// @ts-nocheck
// ============================================================================
// Shared auth + company helper for warehouse-connected agents
// ============================================================================
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function getUser(req: NextRequest) {
  const supabase = getSupabase();
  let token = '';
  const bearer = req.headers.get('authorization');
  if (bearer?.startsWith('Bearer ')) {
    token = bearer.slice(7);
  } else {
    const cookies = req.headers.get('cookie') || '';
    const match = cookies.match(/sb-[^-]+-auth-token=([^;]+)/);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded);
        token = parsed?.access_token || parsed?.[0]?.access_token || '';
      } catch { token = match[1]; }
    }
  }
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function getUserCompanyId(userId: string): Promise<string | null> {
  const sb = getSupabase();
  const { data: memberships } = await sb
    .from('company_members')
    .select('company_id, companies(portal_type)')
    .eq('user_id', userId);

  if (!memberships || memberships.length === 0) return null;

  const wh = memberships.find(
    (m: any) => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both'
  );
  return wh?.company_id || memberships[0].company_id;
}
