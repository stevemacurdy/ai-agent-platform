export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const { user_type, responses, completed } = await request.json();

    if (!user_type || !responses) {
      return NextResponse.json({ error: 'user_type and responses required' }, { status: 400 });
    }

    // Get user from auth token if available
    let userId = null;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const { data: { user } } = await sb.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { error } = await sb.from('onboarding_records').insert({
      user_id: userId,
      user_type,
      responses,
      completed: completed || false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
