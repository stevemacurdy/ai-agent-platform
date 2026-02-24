export const dynamic = 'force-dynamic';
// ============================================================================
// SALES PROFILE API - Get/Update current user's sales profile
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(req: NextRequest) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { cookie: req.headers.get('cookie') || '' } } }
  );
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from('sales_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      // Auto-create profile for new users
      const slug = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || user.id.slice(0, 8);
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Sales Rep';
      
      const { data: newProfile, error } = await admin
        .from('sales_profiles')
        .insert({
          user_id: user.id,
          display_name: displayName,
          portal_slug: slug,
          email: user.email,
          role: user.email === 'steve@woulfgroup.com' ? 'super_admin' : 'sales_rep',
        })
        .select()
        .single();

      if (error) {
        // Slug might be taken, try with random suffix
        const { data: retryProfile } = await admin
          .from('sales_profiles')
          .insert({
            user_id: user.id,
            display_name: displayName,
            portal_slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
            email: user.email,
            role: user.email === 'steve@woulfgroup.com' ? 'super_admin' : 'sales_rep',
          })
          .select()
          .single();

        return NextResponse.json({
          displayName: retryProfile?.display_name,
          portalSlug: retryProfile?.portal_slug,
          email: retryProfile?.email,
          role: retryProfile?.role,
        });
      }

      return NextResponse.json({
        displayName: newProfile?.display_name,
        portalSlug: newProfile?.portal_slug,
        email: newProfile?.email,
        role: newProfile?.role,
      });
    }

    return NextResponse.json({
      displayName: profile.display_name,
      portalSlug: profile.portal_slug,
      email: profile.email,
      role: profile.role,
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabaseClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, portalSlug } = body;

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('sales_profiles')
      .update({
        display_name: displayName,
        portal_slug: portalSlug,
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      displayName: data.display_name,
      portalSlug: data.portal_slug,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
