import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const TIER_STORAGE: Record<string, number> = {
  starter: 1_000_000_000,
  growth: 5_000_000_000,
  professional: 25_000_000_000,
  enterprise: Infinity,
};

export async function trackStorage(companyId: string, bytes: number, action: 'add' | 'remove') {
  const sb = supabaseAdmin();
  const delta = action === 'add' ? bytes : -bytes;
  try {
    await sb.rpc('increment_storage', { p_company_id: companyId, p_bytes: delta });
  } catch {
    await sb.from('storage_usage').upsert({
      company_id: companyId,
      bytes_used: Math.max(0, delta),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id' });
  }
}

export async function checkStorageLimit(companyId: string): Promise<{
  allowed: boolean; used: number; limit: number; percentage: number; warning: string | null;
}> {
  const sb = supabaseAdmin();

  const { data: sub } = await sb
    .from('subscriptions')
    .select('tier')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .single();

  const tier = sub?.tier || 'starter';
  const limit = TIER_STORAGE[tier] || TIER_STORAGE.starter;

  const { data: usage } = await sb
    .from('storage_usage')
    .select('bytes_used')
    .eq('company_id', companyId)
    .single();

  const used = usage?.bytes_used || 0;
  const percentage = limit === Infinity ? 0 : Math.round((used / limit) * 100);

  let warning: string | null = null;
  if (percentage >= 100) warning = 'Storage limit reached. Upgrade to continue uploading.';
  else if (percentage >= 80) warning = `Storage at ${percentage}% capacity. Consider upgrading.`;

  return { allowed: percentage < 100, used, limit, percentage, warning };
}
