export const dynamic = 'force-dynamic';
// ============================================================================
// CRM CONNECT - Start OAuth flow or validate manual credentials
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getCRMAdapter } from '@/lib/crm';
import { upsertCRMConnection } from '@/lib/crm/store';
import type { CRMProvider } from '@/lib/crm/types';

// Get current user from Supabase session
async function getCurrentUser(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { cookie: req.headers.get('cookie') || '' },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { provider, manual, credentials } = body as {
      provider: CRMProvider;
      manual?: boolean;
      credentials?: Record<string, string>;
    };

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    const adapter = getCRMAdapter(provider);

    // Manual authentication (API key / TBA)
    if (manual && credentials) {
      if (!adapter.supportsManualAuth || !adapter.validateManualAuth) {
        return NextResponse.json({ error: 'Manual auth not supported for this provider' }, { status: 400 });
      }

      const token = await adapter.validateManualAuth({ credentials });
      const testResult = await adapter.testConnection({ token });

      if (!testResult.ok) {
        return NextResponse.json({ error: testResult.error || 'Connection test failed' }, { status: 400 });
      }

      await upsertCRMConnection(
        user.id,
        provider,
        token,
        testResult.accountLabel,
        testResult.meta
      );

      return NextResponse.json({
        success: true,
        accountLabel: testResult.accountLabel,
      });
    }

    // OAuth flow - generate auth URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/crm/callback`;
    
    // Create state with CSRF protection
    const state = Buffer.from(JSON.stringify({
      provider,
      userId: user.id,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7),
    })).toString('base64url');

    // Store state in cookie for validation
    cookies().set('crm_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    const authUrl = await adapter.getAuthUrl({ redirectUri, state });

    return NextResponse.json({ url: authUrl });
  } catch (error: any) {
    console.error('CRM connect error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
