export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }
    const result = await sendWelcomeEmail(email, 'Steve');
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[email-test] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}