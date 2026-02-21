import { NextRequest, NextResponse } from 'next/server';

// In-memory store — swap to Supabase org_branding table
const brandingStore: Record<string, any> = {
  'woulf-group': { primary_color: '#3B82F6', secondary_color: '#8B5CF6', accent_color: '#10B981', bg_color: '#06080D', card_color: '#0A0E15', font_family: 'Outfit', logo_url: '', favicon_url: '', company_url: 'https://woulfgroup.com', support_email: 'support@woulfgroup.com', custom_css: '', org_name: 'Woulf Group', org_slug: 'woulf-group' },
  'logicorp': { primary_color: '#10B981', secondary_color: '#059669', accent_color: '#3B82F6', bg_color: '#06080D', card_color: '#0A0E15', font_family: 'Outfit', logo_url: '', favicon_url: '', company_url: '', support_email: '', custom_css: '', org_name: 'Logicorp', org_slug: 'logicorp' },
  'techforge': { primary_color: '#EF4444', secondary_color: '#DC2626', accent_color: '#F59E0B', bg_color: '#0A0A0A', card_color: '#141414', font_family: 'Outfit', logo_url: '', favicon_url: '', company_url: '', support_email: '', custom_css: '', org_name: 'TechForge Inc', org_slug: 'techforge' },
  'greenleaf': { primary_color: '#22C55E', secondary_color: '#16A34A', accent_color: '#06B6D4', bg_color: '#06080D', card_color: '#0A0E15', font_family: 'Outfit', logo_url: '', favicon_url: '', company_url: '', support_email: '', custom_css: '', org_name: 'GreenLeaf Supply', org_slug: 'greenleaf' },
  'pinnacle': { primary_color: '#6366F1', secondary_color: '#4F46E5', accent_color: '#EC4899', bg_color: '#06080D', card_color: '#0A0E15', font_family: 'Outfit', logo_url: '', favicon_url: '', company_url: '', support_email: '', custom_css: '', org_name: 'Pinnacle Group', org_slug: 'pinnacle' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  const branding = brandingStore[orgId] || null;
  return NextResponse.json({ branding });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });

  const allowed = ['primary_color', 'secondary_color', 'accent_color', 'bg_color', 'card_color', 'font_family', 'logo_url', 'favicon_url', 'company_url', 'support_email', 'custom_css'];

  if (!brandingStore[body.orgId]) {
    brandingStore[body.orgId] = {};
  }

  for (const [k, v] of Object.entries(body.updates || {})) {
    if (allowed.includes(k)) {
      brandingStore[body.orgId][k] = v;
    }
  }

  return NextResponse.json({ branding: brandingStore[body.orgId] });
}
