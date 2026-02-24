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

// Word list for generating readable temp passwords
const WORDS = ['alpha','bravo','delta','echo','foxtrot','golf','hotel','india','kilo','lima','metro','nova','oscar','papa','ridge','sierra','tango','ultra','victor','apex','bolt','core','dash','edge','flux','grid','haze','iron','jade','knot','loop','maple','nexus','orbit','prism','quartz','slate','torch','unity','vault'];

function generateTempPassword(): string {
  const w1 = WORDS[Math.floor(Math.random() * WORDS.length)];
  const w2 = WORDS[Math.floor(Math.random() * WORDS.length)];
  const digits = String(Math.floor(Math.random() * 90) + 10);
  return w1 + '-' + w2 + '-' + digits;
}

export async function POST(request: NextRequest) {
  try {
    const sb = supabaseAdmin();

    // Verify the caller is an admin
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user: caller }, error: authErr } = await sb.auth.getUser(token);
    if (authErr || !caller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: callerProfile } = await sb
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (!callerProfile || !['admin', 'super_admin'].includes(callerProfile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the target user ID
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Generate temp password and update
    const tempPassword = generateTempPassword();

    const { error: updateErr } = await sb.auth.admin.updateUserById(userId, {
      password: tempPassword,
    });

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to reset password: ' + updateErr.message }, { status: 500 });
    }

    // Set must_reset_password flag
    await sb.from('profiles').update({ must_reset_password: true }).eq('id', userId);

    return NextResponse.json({
      success: true,
      temp_password: tempPassword,
      message: 'Password reset. User will be prompted to change it on next login.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
