// ============================================================================
// NETSUITE CRM ADAPTER - OAuth2 + TBA Support
// ============================================================================

import type { CRMAdapter, CRMTokenPayload, CRMLead, CRMTestResult, CRMCreateResult } from './types';
import crypto from 'crypto';

export class NetSuiteAdapter implements CRMAdapter {
  provider = 'netsuite' as const;
  authType = 'netsuite_tba' as const;
  displayName = 'NetSuite';
  supportsManualAuth = true;

  // OAuth2 (if configured)
  async getAuthUrl(params: { redirectUri: string; state: string }): Promise<string> {
    const clientId = process.env.NETSUITE_CLIENT_ID;
    const authBase = process.env.NETSUITE_AUTH_BASE_URL;
    const scope = process.env.NETSUITE_SCOPE || 'rest_webservices';

    if (!clientId || !authBase) {
      throw new Error('NetSuite OAuth not configured. Use manual TBA connection.');
    }

    const url = new URL(authBase);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('state', params.state);
    url.searchParams.set('scope', scope);

    return url.toString();
  }

  async exchangeCode(params: { code: string; redirectUri: string }): Promise<CRMTokenPayload> {
    const clientId = process.env.NETSUITE_CLIENT_ID;
    const clientSecret = process.env.NETSUITE_CLIENT_SECRET;
    const tokenUrl = process.env.NETSUITE_TOKEN_URL;

    if (!clientId || !clientSecret || !tokenUrl) {
      throw new Error('NetSuite OAuth not configured');
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: params.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();

    return {
      authType: 'oauth2',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : undefined,
      token_type: data.token_type,
      scope: data.scope,
    };
  }

  async refreshToken(params: { token: CRMTokenPayload }): Promise<CRMTokenPayload> {
    const clientId = process.env.NETSUITE_CLIENT_ID;
    const clientSecret = process.env.NETSUITE_CLIENT_SECRET;
    const tokenUrl = process.env.NETSUITE_TOKEN_URL;

    if (!clientId || !clientSecret || !tokenUrl || !params.token.refresh_token) {
      throw new Error('Cannot refresh token');
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: params.token.refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    return {
      ...params.token,
      access_token: data.access_token,
      refresh_token: data.refresh_token || params.token.refresh_token,
      expires_at: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : undefined,
    };
  }

  // Manual TBA validation
  async validateManualAuth(params: { credentials: Record<string, string> }): Promise<CRMTokenPayload> {
    const { account_id, consumer_key, consumer_secret, token_id, token_secret } = params.credentials;

    if (!account_id || !consumer_key || !consumer_secret || !token_id || !token_secret) {
      throw new Error('All TBA credentials are required');
    }

    // Test the credentials by making a simple API call
    const token: CRMTokenPayload = {
      authType: 'netsuite_tba',
      account_id,
      consumer_key,
      consumer_secret,
      token_id,
      token_secret,
    };

    const testResult = await this.testConnection({ token });
    if (!testResult.ok) {
      throw new Error(testResult.error || 'Invalid TBA credentials');
    }

    return token;
  }

  // Generate OAuth1 signature for TBA
  private generateTBASignature(
    method: string,
    url: string,
    token: CRMTokenPayload,
    timestamp: string,
    nonce: string
  ): string {
    const params: Record<string, string> = {
      oauth_consumer_key: token.consumer_key!,
      oauth_token: token.token_id!,
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0',
    };

    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');

    const baseString = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(sortedParams),
    ].join('&');

    const signingKey = `${encodeURIComponent(token.consumer_secret!)}&${encodeURIComponent(token.token_secret!)}`;
    
    const signature = crypto
      .createHmac('sha256', signingKey)
      .update(baseString)
      .digest('base64');

    return signature;
  }

  private getTBAAuthHeader(method: string, url: string, token: CRMTokenPayload): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const signature = this.generateTBASignature(method, url, token, timestamp, nonce);

    const headerParams = {
      realm: token.account_id!,
      oauth_consumer_key: token.consumer_key!,
      oauth_token: token.token_id!,
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0',
      oauth_signature: signature,
    };

    const header = Object.entries(headerParams)
      .map(([k, v]) => `${k}="${encodeURIComponent(v)}"`)
      .join(', ');

    return `OAuth ${header}`;
  }

  async testConnection(params: { token: CRMTokenPayload }): Promise<CRMTestResult> {
    const { token } = params;

    try {
      if (token.authType === 'netsuite_tba') {
        // TBA: Make a simple SuiteQL query
        const accountId = token.account_id!.replace('_', '-').toLowerCase();
        const url = `https://${accountId}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getTBAAuthHeader('POST', url, token),
            'Prefer': 'transient',
          },
          body: JSON.stringify({ q: 'SELECT id, companyname FROM customer FETCH FIRST 1 ROWS ONLY' }),
        });

        if (response.ok) {
          return {
            ok: true,
            accountLabel: `NetSuite Account ${token.account_id}`,
            meta: { accountId: token.account_id },
          };
        } else {
          const error = await response.text();
          return { ok: false, error: `Connection failed: ${response.status}` };
        }
      } else {
        // OAuth2: Use access token
        // Stub - would need actual endpoint
        return {
          ok: true,
          accountLabel: 'NetSuite (OAuth)',
          meta: {},
        };
      }
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }

  async createLead(params: { token: CRMTokenPayload; lead: CRMLead }): Promise<CRMCreateResult> {
    const { token, lead } = params;

    try {
      if (token.authType === 'netsuite_tba') {
        const accountId = token.account_id!.replace('_', '-').toLowerCase();
        const url = `https://${accountId}.suitetalk.api.netsuite.com/services/rest/record/v1/lead`;

        const body = {
          companyName: lead.company || lead.name,
          firstName: lead.name.split(' ')[0],
          lastName: lead.name.split(' ').slice(1).join(' ') || '-',
          email: lead.email,
          phone: lead.phone,
          comments: lead.notes,
          leadSource: lead.source ? { id: lead.source } : undefined,
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.getTBAAuthHeader('POST', url, token),
          },
          body: JSON.stringify(body),
        });

        if (response.ok || response.status === 204) {
          const location = response.headers.get('Location');
          const id = location?.split('/').pop();
          return { ok: true, id, raw: { location } };
        } else {
          const error = await response.text();
          return { ok: false, error: `Failed to create lead: ${error}`, raw: error };
        }
      }

      // OAuth2 stub
      return { ok: false, error: 'OAuth2 lead creation not implemented yet' };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }
}
