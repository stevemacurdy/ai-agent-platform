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
    const body = await request.json();
    const { userId, fullName, email, phone, company, userType, role } = body;

    if (!userId || !fullName || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Upsert profile
    const { error: profileErr } = await sb.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      role,
      must_reset_password: false,
    });

    if (profileErr) {
      return NextResponse.json({ error: 'Failed to create profile: ' + profileErr.message }, { status: 500 });
    }

    // Create onboarding record
    const { error: onboardErr } = await sb.from('onboarding_records').insert({
      user_id: userId,
      user_type: userType,
      responses: {
        full_name: fullName,
        email,
        phone: phone || null,
        company: company || null,
        registered_at: new Date().toISOString(),
      },
      completed: userType === 'beta_tester', // beta testers skip onboarding
    });

    if (onboardErr) {
      console.error('Onboarding record error:', onboardErr.message);
      // Non-fatal — profile was still created
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: { id: userId, email, role, userType },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
