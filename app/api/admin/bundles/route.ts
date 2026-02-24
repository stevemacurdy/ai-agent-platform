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

// GET - public: returns active bundles (or all for admin)
export async function GET(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const isAdmin = token ? await verifyAdmin(sb, token) : null;

    let query = sb.from('bundles').select('*').order('monthly_price');
    if (!isAdmin) query = query.eq('is_active', true);

    const { data: bundles, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bundles: bundles || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - admin: create or update bundle
export async function POST(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = await verifyAdmin(sb, token);
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { id, name, description, agent_slugs, monthly_price, is_active } = await request.json();
    if (!name || !agent_slugs || monthly_price === undefined) {
      return NextResponse.json({ error: 'name, agent_slugs, and monthly_price required' }, { status: 400 });
    }

    if (id) {
      // Update
      const { error } = await sb.from('bundles').update({
        name,
        description: description || null,
        agent_slugs,
        monthly_price: parseFloat(monthly_price),
        is_active: is_active !== false,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // Create
      const { error } = await sb.from('bundles').insert({
        name,
        description: description || null,
        agent_slugs,
        monthly_price: parseFloat(monthly_price),
        is_active: is_active !== false,
        created_by: admin.id,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - admin: deactivate bundle
export async function DELETE(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = await verifyAdmin(sb, token);
    if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Bundle id required' }, { status: 400 });

    const { error } = await sb.from('bundles').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
