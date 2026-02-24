export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List all companies with user counts and agent assignments

// Auth guard - verify admin access
async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sb = supabaseAdmin();

    const { data: companies, error } = await sb
      .from('companies')
      .select('id, name, slug, logo_url, domain, agents, created_at')
      .order('name');

    if (error) throw error;

    // Get user counts per company
    const { data: memberships } = await sb
      .from('company_members')
      .select('company_id');

    const countMap: Record<string, number> = {};
    (memberships || []).forEach(m => {
      countMap[m.company_id] = (countMap[m.company_id] || 0) + 1;
    });

    const result = (companies || []).map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logo_url: c.logo_url,
      domain: c.domain || null,
      agents: c.agents || [],
      user_count: countMap[c.id] || 0,
      created_at: c.created_at,
    }));

    return NextResponse.json({ companies: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Create a new company
export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sb = supabaseAdmin();
    const { name, slug, domain } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

    // Check for duplicate slug
    const { data: existing } = await sb.from('companies').select('id').eq('slug', finalSlug).single();
    if (existing) {
      return NextResponse.json({ error: 'A company with this slug already exists' }, { status: 400 });
    }

    const { data: company, error } = await sb
      .from('companies')
      .insert({
        name,
        slug: finalSlug,
        domain: domain || null,
        agents: [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, company });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - Update company (agents, domain, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const { company_id, agents, domain, name } = await req.json();

    if (!company_id) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    const updates: any = {};
    if (agents !== undefined) updates.agents = agents;
    if (domain !== undefined) updates.domain = domain;
    if (name !== undefined) updates.name = name;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { error } = await sb
      .from('companies')
      .update(updates)
      .eq('id', company_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Remove a company
export async function DELETE(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sb = supabaseAdmin();
    const { company_id } = await req.json();

    if (!company_id) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    // Remove memberships first
    await sb.from('company_members').delete().eq('company_id', company_id);

    // Remove company
    const { error } = await sb.from('companies').delete().eq('id', company_id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
