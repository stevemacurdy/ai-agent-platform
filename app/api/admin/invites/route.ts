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

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { action, ...data } = await request.json();

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
      createdBy: request.headers.get('x-admin-email') || 'admin',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 day expiry
      usedAt: null,
    };
    invites.push(invite);

    // Build the invite link
    const baseUrl = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
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

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const token = new URL(request.url).searchParams.get('token');
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
