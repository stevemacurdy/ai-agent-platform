// ============================================================================
// HUBSPOT CRM ADAPTER - OAuth2 + Private App Token Support
// ============================================================================

import type { CRMAdapter, CRMTokenPayload, CRMLead, CRMContact, CRMDeal, CRMTestResult, CRMCreateResult } from './types';

const HUBSPOT_API = 'https://api.hubapi.com';

export class HubSpotAdapter implements CRMAdapter {
  provider = 'hubspot' as const;
  authType = 'oauth2' as const;
  displayName = 'HubSpot';
  supportsManualAuth = true;

  // OAuth2 flow
  async getAuthUrl(params: { redirectUri: string; state: string }): Promise<string> {
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('HubSpot OAuth not configured. Use Private App Token instead.');
    }

    const scopes = [
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.objects.companies.read',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
    ].join(' ');

    const url = new URL('https://app.hubspot.com/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', scopes);
    url.searchParams.set('state', params.state);

    return url.toString();
  }

  async exchangeCode(params: { code: string; redirectUri: string }): Promise<CRMTokenPayload> {
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('HubSpot OAuth not configured');
    }

    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: params.redirectUri,
        code: params.code,
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
      token_type: 'Bearer',
      hub_id: data.hub_id,
    };
  }

  async refreshToken(params: { token: CRMTokenPayload }): Promise<CRMTokenPayload> {
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;

    if (!clientId || !clientSecret || !params.token.refresh_token) {
      throw new Error('Cannot refresh token');
    }

    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
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

  // Manual Private App Token
  async validateManualAuth(params: { credentials: Record<string, string> }): Promise<CRMTokenPayload> {
    const { access_token } = params.credentials;

    if (!access_token) {
      throw new Error('Private App Token is required');
    }

    const token: CRMTokenPayload = {
      authType: 'api_key',
      access_token,
    };

    const testResult = await this.testConnection({ token });
    if (!testResult.ok) {
      throw new Error(testResult.error || 'Invalid token');
    }

    return {
      ...token,
      hub_id: testResult.meta?.portalId,
    };
  }

  private getAuthHeader(token: CRMTokenPayload): string {
    return `Bearer ${token.access_token}`;
  }

  async testConnection(params: { token: CRMTokenPayload }): Promise<CRMTestResult> {
    try {
      // Get account info
      const response = await fetch(`${HUBSPOT_API}/account-info/v3/details`, {
        headers: { 'Authorization': this.getAuthHeader(params.token) },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ok: true,
          accountLabel: data.companyName || `HubSpot ${data.portalId}`,
          meta: { portalId: data.portalId, companyName: data.companyName },
        };
      }

      // Fallback: try contacts endpoint
      const contactsRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts?limit=1`, {
        headers: { 'Authorization': this.getAuthHeader(params.token) },
      });

      if (contactsRes.ok) {
        return {
          ok: true,
          accountLabel: 'HubSpot Account',
          meta: {},
        };
      }

      return { ok: false, error: `Connection failed: ${response.status}` };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }

  async createLead(params: { token: CRMTokenPayload; lead: CRMLead }): Promise<CRMCreateResult> {
    try {
      // HubSpot doesn't have "leads" - use contacts
      const [firstName, ...lastNameParts] = params.lead.name.split(' ');
      const lastName = lastNameParts.join(' ') || '-';

      const properties: Record<string, string> = {
        firstname: firstName,
        lastname: lastName,
      };

      if (params.lead.email) properties.email = params.lead.email;
      if (params.lead.phone) properties.phone = params.lead.phone;
      if (params.lead.company) properties.company = params.lead.company;
      if (params.lead.notes) properties.notes = params.lead.notes;

      const response = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(params.token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });

      if (response.ok) {
        const data = await response.json();
        return { ok: true, id: data.id, raw: data };
      } else {
        const error = await response.json();
        return { ok: false, error: error.message || 'Failed to create contact', raw: error };
      }
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }

  async getContacts(params: { token: CRMTokenPayload; limit?: number }): Promise<CRMContact[]> {
    try {
      const response = await fetch(
        `${HUBSPOT_API}/crm/v3/objects/contacts?limit=${params.limit || 50}&properties=firstname,lastname,email,phone,company`,
        { headers: { 'Authorization': this.getAuthHeader(params.token) } }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return (data.results || []).map((c: any) => ({
        id: c.id,
        firstName: c.properties.firstname,
        lastName: c.properties.lastname,
        email: c.properties.email,
        phone: c.properties.phone,
        company: c.properties.company,
      }));
    } catch {
      return [];
    }
  }

  async getDeals(params: { token: CRMTokenPayload; limit?: number }): Promise<CRMDeal[]> {
    try {
      const response = await fetch(
        `${HUBSPOT_API}/crm/v3/objects/deals?limit=${params.limit || 50}&properties=dealname,amount,dealstage,closedate`,
        { headers: { 'Authorization': this.getAuthHeader(params.token) } }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return (data.results || []).map((d: any) => ({
        id: d.id,
        name: d.properties.dealname,
        amount: parseFloat(d.properties.amount) || 0,
        stage: d.properties.dealstage,
        closeDate: d.properties.closedate,
      }));
    } catch {
      return [];
    }
  }
}
