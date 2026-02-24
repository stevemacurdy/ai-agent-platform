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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, source, interest, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { data, error } = await sb.from('leads').insert({
      name,
      email,
      phone: phone || null,
      company: company || null,
      source: source || 'contact_form',
      interest: interest || null,
      message: message || null,
      status: 'new',
    }).select().single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save lead: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Thanks! We've received your message and will get back to you within 24 hours.",
      lead: { id: data.id },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sb = supabaseAdmin();

    // Verify admin
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authErr } = await sb.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = sb.from('leads').select('*').order('created_at', { ascending: false }).limit(limit);
    if (status) query = query.eq('status', status);

    const { data: leads, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Stats
    const { count: totalCount } = await sb.from('leads').select('*', { count: 'exact', head: true });
    const { count: newCount } = await sb.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new');

    return NextResponse.json({
      leads: leads || [],
      total: totalCount || 0,
      new_count: newCount || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sb = supabaseAdmin();

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authErr } = await sb.auth.getUser(token);
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, status, assigned_to } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Lead id is required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;

    const { error } = await sb.from('leads').update(updates).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
