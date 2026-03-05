export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * POST /api/beta/suggest
 * Beta testers submit suggestions. Updates beta_last_suggestion on profile.
 * Body: { agentSlug?, suggestion, category }
 */
export async function POST(request: NextRequest) {
  const sb = supabaseAdmin();

  // Auth required
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  // Verify beta tester role
  const { data: profile } = await sb.from('profiles')
    .select('role, beta_active, beta_suggestion_count')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'beta_tester') {
    return NextResponse.json({ error: 'Only beta testers can submit suggestions' }, { status: 403 });
  }

  const body = await request.json();
  const { agentSlug, suggestion, category } = body;

  if (!suggestion || suggestion.trim().length < 10) {
    return NextResponse.json({ error: 'Suggestion must be at least 10 characters' }, { status: 400 });
  }

  // Insert suggestion
  const { error } = await sb.from('beta_suggestions').insert({
    user_id: user.id,
    agent_slug: agentSlug || null,
    suggestion: suggestion.trim(),
    category: category || 'general',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update profile: last suggestion timestamp + count
  await sb.from('profiles').update({
    beta_last_suggestion: new Date().toISOString(),
    beta_suggestion_count: (profile.beta_suggestion_count || 0) + 1,
    beta_active: true,
  }).eq('id', user.id);

  return NextResponse.json({
    success: true,
    message: 'Suggestion submitted. Thank you for helping improve WoulfAI!',
    totalSuggestions: (profile.beta_suggestion_count || 0) + 1,
  });
}
