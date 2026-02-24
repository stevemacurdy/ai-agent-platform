export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(sb: any, token: string) {
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null;
  return user;
}

// GET - public: returns all agent prices
export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data: prices, error } = await sb.from('agent_pricing').select('*').order('agent_slug');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prices: prices || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - admin: set/update agent price
export async function POST(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = await verifyAdmin(sb, token);
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { agent_slug, monthly_price, description } = await request.json();
    if (!agent_slug || monthly_price === undefined) {
      return NextResponse.json({ error: 'agent_slug and monthly_price required' }, { status: 400 });
    }

    const { error } = await sb.from('agent_pricing').upsert({
      agent_slug,
      monthly_price: parseFloat(monthly_price),
      description: description || null,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'agent_slug' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
