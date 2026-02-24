import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) {
  const e = req.headers.get('x-admin-email');
  return e && ADMINS.includes(e.toLowerCase());
}

// In-memory invite store (production: Supabase with signed JWTs)
const invites: any[] = [];

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}


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

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { action, ...data } = await req.json();

  if (action === 'create') {
    const { recipientName, recipientEmail, recipientPhone, role, message } = data;
    if (!recipientEmail || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 });

    const token = generateToken();
    const invite = {
      id: 'inv-' + Date.now(),
      token,
      recipientName: recipientName || '',
      recipientEmail,
      recipientPhone: recipientPhone || '',
      role, // 'employee' or 'beta_tester'
      message: message || '',
      status: 'pending',
      createdBy: req.headers.get('x-admin-email') || 'admin',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 day expiry
      usedAt: null,
    };
    invites.push(invite);

    // Build the invite link
    const baseUrl = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const inviteLink = protocol + '://' + baseUrl + '/invite/' + token;

    console.log('[INVITE] Created: ' + inviteLink + ' for ' + recipientEmail + ' as ' + role);

    return NextResponse.json({
      success: true,
      invite: { id: invite.id, token, role, recipientEmail, expiresAt: invite.expiresAt },
      link: inviteLink,
    });
  }

  if (action === 'revoke') {
    const inv = invites.find(i => i.id === data.inviteId);
    if (inv) { inv.status = 'revoked'; }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const token = new URL(req.url).searchParams.get('token');
  if (token) {
    const inv = invites.find(i => i.token === token);
    return inv ? NextResponse.json({ invite: inv }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    invites: invites.map(i => ({
      id: i.id, recipientName: i.recipientName, recipientEmail: i.recipientEmail,
      role: i.role, status: i.status, createdAt: i.createdAt, expiresAt: i.expiresAt, usedAt: i.usedAt,
    })),
    total: invites.length,
    pending: invites.filter(i => i.status === 'pending').length,
  });
}
