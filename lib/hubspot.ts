// ============================================================================
// HUBSPOT INTEGRATION - Sales Agent Data Source
// ============================================================================

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

class HubSpotClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${HUBSPOT_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HubSpot API error: ${response.status}`);
    }

    return response.json();
  }

  // ============ DASHBOARD ============

  async getDashboard(): Promise<any> {
    const [contacts, companies, deals] = await Promise.all([
      this.getContacts(1),
      this.getCompanies(1),
      this.getDeals(100),
    ]);

    // Calculate pipeline stats
    const dealsByStage: Record<string, { count: number; value: number }> = {};
    let totalPipelineValue = 0;
    let wonDeals = 0;
    let wonValue = 0;

    for (const deal of deals.results || []) {
      const stage = deal.properties?.dealstage || 'unknown';
      const amount = parseFloat(deal.properties?.amount || '0');
      
      if (!dealsByStage[stage]) {
        dealsByStage[stage] = { count: 0, value: 0 };
      }
      dealsByStage[stage].count++;
      dealsByStage[stage].value += amount;
      totalPipelineValue += amount;

      if (stage === 'closedwon') {
        wonDeals++;
        wonValue += amount;
      }
    }

    return {
      totalContacts: contacts.total || 0,
      totalCompanies: companies.total || 0,
      totalDeals: deals.total || 0,
      pipelineValue: totalPipelineValue,
      wonDeals,
      wonValue,
      dealsByStage,
    };
  }

  // ============ CONTACTS ============

  async getContacts(limit = 100, after?: string): Promise<any> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (after) params.append('after', after);
    params.append('properties', 'firstname,lastname,email,phone,company,lifecyclestage,hs_lead_status,createdate,lastmodifieddate');
    
    return this.request(`/crm/v3/objects/contacts?${params}`);
  }

  async getContact(contactId: string): Promise<any> {
    return this.request(`/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,phone,company,lifecyclestage,hs_lead_status,createdate,lastmodifieddate`);
  }

  async createContact(properties: Record<string, string>): Promise<any> {
    return this.request('/crm/v3/objects/contacts', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  async updateContact(contactId: string, properties: Record<string, string>): Promise<any> {
    return this.request(`/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
  }

  async searchContacts(query: string): Promise<any> {
    return this.request('/crm/v3/objects/contacts/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        properties: ['firstname', 'lastname', 'email', 'company', 'lifecyclestage', 'phone'],
        limit: 100,
      }),
    });
  }

  // ============ COMPANIES ============

  async getCompanies(limit = 100, after?: string): Promise<any> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (after) params.append('after', after);
    params.append('properties', 'name,domain,industry,numberofemployees,annualrevenue,city,state,country');
    
    return this.request(`/crm/v3/objects/companies?${params}`);
  }

  async getCompany(companyId: string): Promise<any> {
    return this.request(`/crm/v3/objects/companies/${companyId}?properties=name,domain,industry,numberofemployees,annualrevenue,city,state,country,description`);
  }

  async createCompany(properties: Record<string, string>): Promise<any> {
    return this.request('/crm/v3/objects/companies', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  // ============ DEALS ============

  async getDeals(limit = 100, after?: string): Promise<any> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (after) params.append('after', after);
    params.append('properties', 'dealname,amount,dealstage,closedate,pipeline,hubspot_owner_id,createdate');
    
    return this.request(`/crm/v3/objects/deals?${params}`);
  }

  async getDeal(dealId: string): Promise<any> {
    return this.request(`/crm/v3/objects/deals/${dealId}?properties=dealname,amount,dealstage,closedate,pipeline,hubspot_owner_id,createdate,notes_last_updated`);
  }

  async createDeal(properties: Record<string, string>): Promise<any> {
    return this.request('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  async updateDeal(dealId: string, properties: Record<string, string>): Promise<any> {
    return this.request(`/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
  }

  // ============ ACTIVITIES ============

  async createNote(contactId: string, body: string): Promise<any> {
    return this.request('/crm/v3/objects/notes', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          hs_note_body: body,
          hs_timestamp: new Date().toISOString(),
        },
        associations: [{
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }]
        }]
      }),
    });
  }

  async createTask(contactId: string, subject: string, dueDate: string): Promise<any> {
    return this.request('/crm/v3/objects/tasks', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          hs_task_subject: subject,
          hs_task_status: 'NOT_STARTED',
          hs_timestamp: dueDate,
        },
        associations: [{
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 204 }]
        }]
      }),
    });
  }

  // ============ PIPELINES ============

  async getDealPipelines(): Promise<any> {
    return this.request('/crm/v3/pipelines/deals');
  }

  // ============ OWNERS ============

  async getOwners(): Promise<any> {
    return this.request('/crm/v3/owners');
  }

  // ============ ANALYTICS ============

  async getContactsByLifecycleStage(): Promise<Record<string, number>> {
    const stages = ['subscriber', 'lead', 'marketingqualifiedlead', 'salesqualifiedlead', 'opportunity', 'customer'];
    const results: Record<string, number> = {};

    for (const stage of stages) {
      try {
        const response = await this.request('/crm/v3/objects/contacts/search', {
          method: 'POST',
          body: JSON.stringify({
            filterGroups: [{
              filters: [{
                propertyName: 'lifecyclestage',
                operator: 'EQ',
                value: stage,
              }]
            }],
            limit: 1,
          }),
        });
        results[stage] = response.total || 0;
      } catch {
        results[stage] = 0;
      }
    }

    return results;
  }

  async getRecentDeals(limit = 10): Promise<any[]> {
    const deals = await this.getDeals(limit);
    return deals.results || [];
  }
}

// Singleton instance
let hubspotClient: HubSpotClient | null = null;

export function getHubSpotClient(): HubSpotClient {
  if (!hubspotClient) {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      throw new Error('HUBSPOT_ACCESS_TOKEN is not configured');
    }
    hubspotClient = new HubSpotClient(token);
  }
  return hubspotClient;
}

export { HubSpotClient };
