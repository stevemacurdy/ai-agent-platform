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

const VALID_ROLES = ['super_admin', 'admin', 'employee', 'org_lead', 'beta_tester', 'business_owner', 'individual', 'user'];

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

    const { userId, role } = await request.json();
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role: ' + role }, { status: 400 });
    }

    // Only super_admin can create other super_admins
    if (role === 'super_admin' && callerProfile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can assign super admin role' }, { status: 403 });
    }

    // Update the role
    const { error: updateErr } = await sb
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update role: ' + updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated to ' + role,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
