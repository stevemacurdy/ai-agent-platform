export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const sb = supabase();

    // Get all profiles
    const { data: profiles, error } = await sb
      .from('profiles')
      .select('id, email, full_name, role')
      .order('created_at', { ascending: false });

    if (error) {
      // If profiles table missing, return empty
      return NextResponse.json({ users: [] });
    }

    // Get agent access for each user
    const { data: access } = await sb
      .from('user_agent_access')
      .select('user_id, agent_slug');

    const accessMap: Record<string, string[]> = {};
    (access || []).forEach(a => {
      if (!accessMap[a.user_id]) accessMap[a.user_id] = [];
      accessMap[a.user_id].push(a.agent_slug);
    });

    const users = (profiles || []).map(p => ({
      ...p,
      approved_agents: accessMap[p.id] || [],
    }));

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ users: [], error: err.message });
  }
}
