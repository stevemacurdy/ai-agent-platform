// @ts-nocheck
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUser(req: Request) {
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

// GET — list feature requests for a company
export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400 });

  const supabase = getSupabase();

  const { data: member } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('company_id', companyId)
    .single();

  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { data: requests, error } = await supabase
    .from('feature_requests')
    .select('*')
    .eq('company_id', companyId)
    .order('votes', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ requests: requests || [] });
}

// POST — create a feature request
export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { company_id, title, description, category } = body;

  if (!company_id || !title) {
    return NextResponse.json({ error: 'company_id and title required' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: member } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('company_id', company_id)
    .single();

  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { data, error } = await supabase
    .from('feature_requests')
    .insert({
      company_id,
      user_id: user.id,
      title,
      description: description || null,
      category: category || 'general',
      status: 'new',
      votes: 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ request: data }, { status: 201 });
}

// PATCH — update status or vote (admin for status, any member for vote)
export async function PATCH(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status, vote } = body;

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = getSupabase();

  // Get the request to check company
  const { data: fr } = await supabase
    .from('feature_requests')
    .select('company_id, votes')
    .eq('id', id)
    .single();

  if (!fr) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: member } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('company_id', fr.company_id)
    .single();

  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (status) {
    const adminRoles = ['super_admin', 'admin', 'company_admin'];
    if (!adminRoles.includes(member.role)) {
      return NextResponse.json({ error: 'Admin access required for status changes' }, { status: 403 });
    }
    updates.status = status;
  }

  if (vote === 'up') {
    updates.votes = (fr.votes || 0) + 1;
  }

  const { data, error } = await supabase
    .from('feature_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ request: data });
}
