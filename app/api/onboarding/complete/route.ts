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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, industry, teamSize, integrations, teamEmails, selectedAgents, sessionId } = body;
    const sb = supabaseAdmin();

    // Update company info if available
    if (companyName) {
      // Try to update the onboarding_progress or a similar table
      await sb.from('onboarding_progress').upsert({
        session_id: sessionId || 'unknown',
        company_name: companyName,
        industry: industry || null,
        team_size: teamSize || null,
        selected_integrations: integrations || [],
        team_emails: (teamEmails || []).filter((e: string) => e.trim()),
        selected_agents: selectedAgents || [],
        completed_at: new Date().toISOString(),
        status: 'completed',
      }, { onConflict: 'session_id' });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[onboarding/complete] Error:', err);
    return NextResponse.json({ success: true }); // Fail silently — don't block onboarding
  }
}
