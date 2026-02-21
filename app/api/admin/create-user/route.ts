import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTempPassword(): string {
  // Simple 8-char password: 4 letters + 4 digits
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  let pw = '';
  for (let i = 0; i < 4; i++) pw += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) pw += digits[Math.floor(Math.random() * digits.length)];
  return pw;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, role = 'employee', company_id, agent_slugs = [] } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sb = supabase();
    const tempPassword = generateTempPassword();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Skip email verification
      user_metadata: { full_name, role },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create/update profile
    await sb.from('profiles').upsert({
      id: userId,
      email,
      full_name: full_name || '',
      role,
      must_reset_password: true,
      updated_at: new Date().toISOString(),
    });

    // Add to company if specified
    if (company_id) {
      await sb.from('company_members').upsert({
        user_id: userId,
        company_id,
        role: role === 'admin' || role === 'super_admin' ? 'admin' : 'member',
      }, { onConflict: 'user_id,company_id' });
    }

    // Assign agents
    if (agent_slugs.length > 0) {
      const records = agent_slugs.map((slug: string) => ({
        user_id: userId,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').upsert(records, {
        onConflict: 'user_id,agent_slug',
      });
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      email,
      temp_password: tempPassword,
      message: 'User created. Temp password: ' + tempPassword,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
