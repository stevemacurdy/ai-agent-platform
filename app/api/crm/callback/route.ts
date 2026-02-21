// ============================================================================
// CRM CALLBACK - OAuth callback handler
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCRMAdapter } from '@/lib/crm';
import { upsertCRMConnection } from '@/lib/crm/store';
import type { CRMProvider } from '@/lib/crm/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/sales/settings?error=${encodeURIComponent(error)}`, req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/sales/settings?error=missing_params', req.url));
    }

    // Validate state
    const storedState = cookies().get('crm_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL('/sales/settings?error=invalid_state', req.url));
    }

    // Clear state cookie
    cookies().delete('crm_oauth_state');

    // Decode state
    let stateData: { provider: CRMProvider; userId: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return NextResponse.redirect(new URL('/sales/settings?error=invalid_state', req.url));
    }

    const { provider, userId } = stateData;
    const adapter = getCRMAdapter(provider);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/crm/callback`;

    // Exchange code for tokens
    const token = await adapter.exchangeCode({ code, redirectUri });

    // Test connection
    const testResult = await adapter.testConnection({ token });
    if (!testResult.ok) {
      return NextResponse.redirect(new URL(`/sales/settings?error=${encodeURIComponent(testResult.error || 'connection_failed')}`, req.url));
    }

    // Save connection
    await upsertCRMConnection(
      userId,
      provider,
      token,
      testResult.accountLabel,
      testResult.meta
    );

    return NextResponse.redirect(new URL(`/sales/settings?connected=${provider}`, req.url));
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL(`/sales/settings?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
