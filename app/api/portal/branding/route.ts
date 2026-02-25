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

// GET — fetch branding for a company
export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');
  if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400 });

  const supabase = getSupabase();

  // Verify membership
  const { data: member } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('company_id', companyId)
    .single();

  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { data: branding } = await supabase
    .from('company_branding')
    .select('*')
    .eq('company_id', companyId)
    .single();

  return NextResponse.json({ branding: branding || null });
}

// PUT — update branding (admin only)
export async function PUT(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { company_id, logo_url, primary_color, secondary_color, sidebar_style, welcome_message } = body;

  if (!company_id) return NextResponse.json({ error: 'company_id required' }, { status: 400 });

  const supabase = getSupabase();

  // Verify admin
  const { data: member } = await supabase
    .from('company_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('company_id', company_id)
    .single();

  const adminRoles = ['super_admin', 'admin', 'company_admin'];
  if (!member || !adminRoles.includes(member.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Upsert branding
  const { data, error } = await supabase
    .from('company_branding')
    .upsert({
      company_id,
      logo_url: logo_url || null,
      primary_color: primary_color || '#3182CE',
      secondary_color: secondary_color || '#06080D',
      sidebar_style: sidebar_style || 'dark',
      welcome_message: welcome_message || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'company_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ branding: data });
}
