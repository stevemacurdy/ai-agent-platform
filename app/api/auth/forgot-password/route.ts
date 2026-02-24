export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { contact, email } = await request.json();
    const userEmail = email || contact;
    if (!userEmail) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    const { error } = await supabase().auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com'}/reset-password`,
    });
    if (error) {
      console.error('[FORGOT-PASSWORD] Supabase error:', error.message);
    }
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (err: any) {
    console.error('[FORGOT-PASSWORD] Error:', err.message);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
