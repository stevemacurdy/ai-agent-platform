export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let _supabase: any = null;
function supabase() { if (!_supabase) _supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
); return _supabase; }

async function getUser(req: Request) {
  let token = '';
  const bearer = req.headers.get('authorization');
  if (bearer?.startsWith('Bearer ')) {
    token = bearer.slice(7);
  } else {
    const cookies = req.headers.get('cookie') || '';
    const match = cookies.match(/sb-[^-]+-auth-token=([^;]+)/);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded);
        token = parsed?.access_token || parsed?.[0]?.access_token || '';
      } catch { token = match[1]; }
    }
  }
  if (!token) return null;
  const { data: { user } } = await supabase().auth.getUser(token);
  return user;
}

async function requireAdmin(req: Request) {
  const user = await getUser(req);
  if (!user) return { error: 'Authentication required', status: 401 };
  const { data: profile } = await supabase().from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
    return { error: 'Forbidden', status: 403 };
  }
  return { user, profile };
}

// GET — list all custom domains (admin) or company domains (company_admin)
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('company_id');

  let query = supabase().from('custom_domains').select(`
    id, domain, status, verified_at, created_at, company_id,
    companies(name, slug)
  `).order('created_at', { ascending: false });

  if (companyId) query = query.eq('company_id', companyId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ domains: data });
}

// POST — add a custom domain
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { domain, company_id } = body;

  if (!domain || !company_id) {
    return NextResponse.json({ error: 'domain and company_id required' }, { status: 400 });
  }

  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  // Check company exists
  const { data: company } = await supabase().from('companies').select('id').eq('id', company_id).single();
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  // Check domain not already taken
  const { data: existing } = await supabase().from('custom_domains').select('id').eq('domain', domain).single();
  if (existing) return NextResponse.json({ error: 'Domain already registered' }, { status: 409 });

  // Insert
  const { data, error } = await supabase().from('custom_domains').insert({
    domain: domain.toLowerCase(),
    company_id,
    status: 'pending',
    created_by: auth.user!.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    domain: data,
    setup_instructions: {
      step_1: `Add ${domain} as a custom domain in Vercel Dashboard → Settings → Domains`,
      step_2: `Create a CNAME record: ${domain} → cname.vercel-dns.com`,
      step_3: 'Wait for DNS propagation and SSL certificate provisioning',
      step_4: `Call PATCH /api/admin/domains?id=${data.id} with status=active once verified`,
    },
  });
}

// PATCH — update domain status
export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const body = await req.json();
  const { status } = body;

  if (!['pending', 'verifying', 'active', 'failed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const update: any = { status, updated_at: new Date().toISOString() };
  if (status === 'active') update.verified_at = new Date().toISOString();

  const { data, error } = await supabase().from('custom_domains')
    .update(update).eq('id', id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ domain: data });
}

// DELETE — remove a custom domain
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabase().from('custom_domains').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
