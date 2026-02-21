import { NextRequest, NextResponse } from 'next/server';

// In-memory code store (production: Redis or Supabase with TTL)
const codes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
  const { method, contact } = await request.json();
  if (!contact) return NextResponse.json({ error: 'Contact required' }, { status: 400 });

  const code = Math.random().toString().slice(2, 8);
  codes.set(contact, { code, expires: Date.now() + 600000 }); // 10 min TTL

  // In production: send via email (SendGrid/Resend) or SMS (Twilio)
  console.log('[FORGOT-PASSWORD] Code for ' + contact + ': ' + code);

  return NextResponse.json({
    success: true,
    message: 'Verification code sent to ' + contact,
    // DEV ONLY — remove in production:
    _devCode: code,
  });
}

export async function PUT(request: NextRequest) {
  const { action, contact, code, newPassword } = await request.json();

  if (action === 'verify') {
    const stored = codes.get(contact);
    if (!stored) return NextResponse.json({ error: 'No code found. Request a new one.' }, { status: 400 });
    if (Date.now() > stored.expires) { codes.delete(contact); return NextResponse.json({ error: 'Code expired' }, { status: 400 }); }
    if (stored.code !== code) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    return NextResponse.json({ success: true, message: 'Code verified' });
  }

  if (action === 'reset') {
    const stored = codes.get(contact);
    if (!stored || stored.code !== code) return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    codes.delete(contact);
    // In production: hash password and update in Supabase
    console.log('[FORGOT-PASSWORD] Password reset for ' + contact);
    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
