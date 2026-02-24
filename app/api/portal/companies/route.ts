export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// Auth guard - verify logged-in user
async function verifyUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, key);

    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, slug, domain, agents')
      .order('name');

    if (error) {
      return NextResponse.json({ companies: [], _error: error.message, _url: url?.slice(0,40) }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    return NextResponse.json({ 
      companies: companies || [], 
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (e: any) {
    return NextResponse.json({ companies: [], _catch: e.message });
  }
}
