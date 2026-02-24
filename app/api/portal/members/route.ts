export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - list members for a company

// Auth guard - verify logged-in user
async function verifyUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('company_id');
    if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400 });

    const sb = getSupabase();
    const { data: members, error } = await sb
      .from('company_members')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Members fetch error:', error);
      return NextResponse.json({ members: [] });
    }

    return NextResponse.json({ members: members || [] }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (e: any) {
    return NextResponse.json({ members: [], error: e.message });
  }
}

// POST - invite a member to a company
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_id, email, role, invited_by } = body;

    if (!company_id || !email) {
      return NextResponse.json({ error: 'company_id and email required' }, { status: 400 });
    }

    const sb = getSupabase();

    // Check if already a member
    const { data: existing } = await sb
      .from('company_members')
      .select('id, status')
      .eq('company_id', company_id)
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'User already invited or a member' }, { status: 409 });
    }

    // Check if user exists in profiles
    const { data: profile } = await sb
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    // Create member record
    const { data: member, error } = await sb
      .from('company_members')
      .insert({
        company_id,
        user_id: profile?.id || null,
        email,
        role: role || 'member',
        status: profile ? 'active' : 'pending',
        invited_by: invited_by || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Member invite error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ member, isNewUser: !profile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - remove a member
export async function DELETE(req: NextRequest) {
  try {
    const memberId = req.nextUrl.searchParams.get('id');
    if (!memberId) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const sb = getSupabase();
    const { error } = await sb
      .from('company_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
