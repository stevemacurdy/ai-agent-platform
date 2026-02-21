import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, agent_slugs } = await req.json();
    if (!user_id || !Array.isArray(agent_slugs)) {
      return NextResponse.json({ error: 'user_id and agent_slugs[] required' }, { status: 400 });
    }

    const sb = supabase();

    // Remove all current access
    await sb.from('user_agent_access').delete().eq('user_id', user_id);

    // Insert new access
    if (agent_slugs.length > 0) {
      const records = agent_slugs.map((slug: string) => ({
        user_id,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').insert(records);
    }

    return NextResponse.json({ success: true, agent_slugs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
