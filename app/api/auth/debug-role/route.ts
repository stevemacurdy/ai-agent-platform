export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return NextResponse.json({ error: 'no token' });

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: userData, error: userError } = await sb.auth.getUser(token);
    if (userError) return NextResponse.json({ step: 'getUser', error: userError.message });

    const userId = userData.user.id;

    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      userId,
      profileFound: !!profile,
      profileError: profileError?.message || null,
      profileRole: profile?.role || 'NULL',
      profileRaw: profile,
      envCheck: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        keyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || 'MISSING',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ step: 'catch', error: e.message });
  }
}
