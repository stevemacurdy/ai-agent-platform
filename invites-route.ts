export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = sbAdmin();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin', 'admin', 'company_admin'].includes(profile.role)) return null;
  return user;
}

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, ...data } = await req.json();
  const sb = sbAdmin();

  if (action === 'create') {
    const { email, full_name, role = 'employee', company_id, agent_slugs = [], message = '' } = data;
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const token = crypto.randomBytes(32).toString('hex');

    const { data: existing } = await sb
      .from('invites')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'A pending invite already exists for this email' }, { status: 409 });
    }

    const { data: invite, error } = await sb.from('invites').insert({
      email: email.toLowerCase(),
      full_name: full_name || '',
      role,
      company_id: company_id || null,
      agent_slugs,
      message,
      token,
      invited_by: adminUser.id,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { error: authError } = await sb.auth.admin.inviteUserByEmail(email.toLowerCase(), {
      data: { full_name, role, invite_token: token },
      redirectTo: (process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com') + '/invite/' + token,
    });

    if (authError && !authError.message.includes('already been registered')) {
      console.error('[INVITE] Auth invite error:', authError.message);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com';
    return NextResponse.json({
      success: true,
      invite: { id: invite.id, token, role, email: invite.email, expires_at: invite.expires_at },
      link: baseUrl + '/invite/' + token,
    });
  }

  if (action === 'revoke') {
    const { invite_id } = data;
    if (!invite_id) return NextResponse.json({ error: 'invite_id required' }, { status: 400 });
    const { error } = await sb.from('invites').update({ status: 'revoked' }).eq('id', invite_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'resend') {
    const { invite_id } = data;
    if (!invite_id) return NextResponse.json({ error: 'invite_id required' }, { status: 400 });
    const { data: invite } = await sb.from('invites').select('*').eq('id', invite_id).single();
    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite not found or not pending' }, { status: 404 });
    }
    await sb.auth.admin.inviteUserByEmail(invite.email, {
      data: { full_name: invite.full_name, role: invite.role, invite_token: invite.token },
      redirectTo: (process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com') + '/invite/' + invite.token,
    });
    await sb.from('invites').update({ expires_at: new Date(Date.now() + 7 * 86400000).toISOString() }).eq('id', invite_id);
    return NextResponse.json({ success: true, message: 'Invite resent' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const sb = sbAdmin();
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  // Public lookup by token (for invite acceptance page — no auth needed)
  if (token) {
    const { data: invite } = await sb
      .from('invites')
      .select('*, companies(name, slug)')
      .eq('token', token)
      .single();
    if (!invite) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ invite });
  }

  // List invites — requires admin
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const company_id = url.searchParams.get('company_id');
  let query = sb.from('invites').select('*, companies(name, slug)').order('created_at', { ascending: false });
  if (company_id) query = query.eq('company_id', company_id);

  const { data: invites, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    invites: invites || [],
    total: invites?.length || 0,
    pending: invites?.filter((i: any) => i.status === 'pending').length || 0,
  });
}
