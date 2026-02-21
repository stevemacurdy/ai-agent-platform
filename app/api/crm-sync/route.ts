import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// Multi-CRM Sync API
// Adapters: HubSpot, Salesforce, NetSuite, Pipedrive, Zoho
// Each rep can connect their own CRM with encrypted credentials
// ============================================================================

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) {
  const e = req.headers.get('x-admin-email');
  return e && ADMINS.includes(e.toLowerCase());
}

// ====== CRM Adapter Interface ======
interface CRMAdapter {
  name: string;
  pushContact(contact: any, credentials: any): Promise<{ externalId: string }>;
  pushDeal(deal: any, credentials: any): Promise<{ externalId: string }>;
  pullContacts(credentials: any): Promise<any[]>;
  pullDeals(credentials: any): Promise<any[]>;
}

// ====== HubSpot Adapter ======
const HubSpotAdapter: CRMAdapter = {
  name: 'hubspot',

  async pushContact(contact, credentials) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${credentials.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          email: contact.email,
          firstname: contact.name?.split(' ')[0] || '',
          lastname: contact.name?.split(' ').slice(1).join(' ') || '',
          phone: contact.phone || '',
          company: contact.company || '',
          jobtitle: contact.title || '',
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'HubSpot push failed');
    return { externalId: data.id };
  },

  async pushDeal(deal, credentials) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${credentials.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: {
          dealname: deal.title,
          amount: deal.value?.toString(),
          dealstage: mapStageToHubSpot(deal.stage),
          closedate: deal.expectedClose || '',
          pipeline: 'default',
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'HubSpot deal push failed');
    return { externalId: data.id };
  },

  async pullContacts(credentials) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=email,firstname,lastname,phone,company,jobtitle', {
      headers: { Authorization: `Bearer ${credentials.apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'HubSpot pull failed');
    return (data.results || []).map((c: any) => ({
      externalId: c.id,
      name: `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim(),
      email: c.properties.email,
      phone: c.properties.phone,
      company: c.properties.company,
      title: c.properties.jobtitle,
      source: 'hubspot',
    }));
  },

  async pullDeals(credentials) {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate', {
      headers: { Authorization: `Bearer ${credentials.apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'HubSpot deals pull failed');
    return (data.results || []).map((d: any) => ({
      externalId: d.id,
      title: d.properties.dealname,
      value: parseFloat(d.properties.amount) || 0,
      stage: mapHubSpotStageToInternal(d.properties.dealstage),
      expectedClose: d.properties.closedate,
      source: 'hubspot',
    }));
  },
};

function mapStageToHubSpot(stage: string): string {
  const map: Record<string, string> = {
    prospecting: 'appointmentscheduled',
    discovery: 'qualifiedtobuy',
    proposal: 'presentationscheduled',
    negotiation: 'decisionmakerboughtin',
    closed_won: 'closedwon',
    closed_lost: 'closedlost',
  };
  return map[stage] || 'appointmentscheduled';
}

function mapHubSpotStageToInternal(stage: string): string {
  const map: Record<string, string> = {
    appointmentscheduled: 'prospecting',
    qualifiedtobuy: 'discovery',
    presentationscheduled: 'proposal',
    decisionmakerboughtin: 'negotiation',
    contractsent: 'negotiation',
    closedwon: 'closed_won',
    closedlost: 'closed_lost',
  };
  return map[stage] || 'prospecting';
}

// ====== Placeholder Adapters ======
const SalesforceAdapter: CRMAdapter = {
  name: 'salesforce',
  async pushContact(contact, credentials) { return { externalId: 'sf-' + Date.now() }; },
  async pushDeal(deal, credentials) { return { externalId: 'sf-d-' + Date.now() }; },
  async pullContacts(credentials) { return []; },
  async pullDeals(credentials) { return []; },
};

const NetSuiteAdapter: CRMAdapter = {
  name: 'netsuite',
  async pushContact(contact, credentials) { return { externalId: 'ns-' + Date.now() }; },
  async pushDeal(deal, credentials) { return { externalId: 'ns-d-' + Date.now() }; },
  async pullContacts(credentials) { return []; },
  async pullDeals(credentials) { return []; },
};

const PipedriveAdapter: CRMAdapter = {
  name: 'pipedrive',
  async pushContact(contact, credentials) { return { externalId: 'pd-' + Date.now() }; },
  async pushDeal(deal, credentials) { return { externalId: 'pd-d-' + Date.now() }; },
  async pullContacts(credentials) { return []; },
  async pullDeals(credentials) { return []; },
};

const ZohoAdapter: CRMAdapter = {
  name: 'zoho',
  async pushContact(contact, credentials) { return { externalId: 'zh-' + Date.now() }; },
  async pushDeal(deal, credentials) { return { externalId: 'zh-d-' + Date.now() }; },
  async pullContacts(credentials) { return []; },
  async pullDeals(credentials) { return []; },
};

const ADAPTERS: Record<string, CRMAdapter> = {
  hubspot: HubSpotAdapter,
  salesforce: SalesforceAdapter,
  netsuite: NetSuiteAdapter,
  pipedrive: PipedriveAdapter,
  zoho: ZohoAdapter,
};

// ====== Credential Store (in-memory — swap to encrypted Supabase) ======
let credentials: Record<string, { crm: string; apiKey: string; instanceUrl?: string; repEmail: string; connectedAt: string }> = {};

// Sync log
let syncLog: { id: string; crm: string; direction: string; type: string; count: number; status: string; timestamp: string; error?: string }[] = [];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'connections') {
    return NextResponse.json({
      connections: Object.entries(credentials).map(([id, c]) => ({
        id, crm: c.crm, repEmail: c.repEmail, connectedAt: c.connectedAt,
        hasKey: !!c.apiKey,
      })),
      availableCRMs: Object.keys(ADAPTERS),
    });
  }

  if (view === 'sync-log') {
    return NextResponse.json({ log: syncLog.slice(-50) });
  }

  return NextResponse.json({
    connections: Object.entries(credentials).map(([id, c]) => ({ id, crm: c.crm, repEmail: c.repEmail })),
    syncLog: syncLog.slice(-10),
    availableCRMs: Object.keys(ADAPTERS),
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  switch (body.action) {
    // ====== Connect a CRM ======
    case 'connect': {
      if (!body.crm || !body.apiKey || !body.repEmail) {
        return NextResponse.json({ error: 'crm, apiKey, repEmail required' }, { status: 400 });
      }
      if (!ADAPTERS[body.crm]) {
        return NextResponse.json({ error: 'Unknown CRM: ' + body.crm }, { status: 400 });
      }
      const id = body.crm + '-' + body.repEmail.replace(/[^a-z0-9]/gi, '');
      credentials[id] = {
        crm: body.crm,
        apiKey: body.apiKey, // In production, encrypt with AES-256
        instanceUrl: body.instanceUrl,
        repEmail: body.repEmail,
        connectedAt: new Date().toISOString(),
      };
      return NextResponse.json({ connectionId: id, message: body.crm + ' connected for ' + body.repEmail });
    }

    // ====== Disconnect ======
    case 'disconnect': {
      if (!body.connectionId) return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
      delete credentials[body.connectionId];
      return NextResponse.json({ success: true });
    }

    // ====== Push Contact ======
    case 'push-contact': {
      if (!body.connectionId || !body.contact) {
        return NextResponse.json({ error: 'connectionId and contact required' }, { status: 400 });
      }
      const cred = credentials[body.connectionId];
      if (!cred) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });

      const adapter = ADAPTERS[cred.crm];
      const logEntry = { id: 'sync-' + Date.now(), crm: cred.crm, direction: 'push', type: 'contact', count: 1, status: 'success', timestamp: new Date().toISOString() };

      try {
        const result = await adapter.pushContact(body.contact, cred);
        syncLog.push(logEntry);
        return NextResponse.json({ externalId: result.externalId, crm: cred.crm });
      } catch (err: any) {
        logEntry.status = 'failed';
        // @ts-ignore
        // @ts-ignore
        logEntry.error = err.message;
        syncLog.push(logEntry);
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // ====== Push Deal ======
    case 'push-deal': {
      if (!body.connectionId || !body.deal) {
        return NextResponse.json({ error: 'connectionId and deal required' }, { status: 400 });
      }
      const cred = credentials[body.connectionId];
      if (!cred) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });

      const adapter = ADAPTERS[cred.crm];
      const logEntry = { id: 'sync-' + Date.now(), crm: cred.crm, direction: 'push', type: 'deal', count: 1, status: 'success', timestamp: new Date().toISOString() };

      try {
        const result = await adapter.pushDeal(body.deal, cred);
        syncLog.push(logEntry);
        return NextResponse.json({ externalId: result.externalId, crm: cred.crm });
      } catch (err: any) {
        logEntry.status = 'failed';
        // @ts-ignore
        // @ts-ignore
        logEntry.error = err.message;
        syncLog.push(logEntry);
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // ====== Pull Contacts from CRM ======
    case 'pull-contacts': {
      if (!body.connectionId) return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
      const cred = credentials[body.connectionId];
      if (!cred) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });

      const adapter = ADAPTERS[cred.crm];
      const logEntry = { id: 'sync-' + Date.now(), crm: cred.crm, direction: 'pull', type: 'contacts', count: 0, status: 'success', timestamp: new Date().toISOString() };

      try {
        const contacts = await adapter.pullContacts(cred);
        logEntry.count = contacts.length;
        syncLog.push(logEntry);
        return NextResponse.json({ contacts, count: contacts.length });
      } catch (err: any) {
        logEntry.status = 'failed';
        // @ts-ignore
        logEntry.error = err.message;
        syncLog.push(logEntry);
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // ====== Bulk Sync All Contacts ======
    case 'sync-all': {
      if (!body.connectionId) return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
      const cred = credentials[body.connectionId];
      if (!cred) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });

      // Fetch all CRM contacts
      const email = request.headers.get('x-admin-email') || 'admin';
      const baseUrl = request.nextUrl.origin;
      const crmRes = await fetch(`${baseUrl}/api/crm?action=all`, { headers: { 'x-admin-email': email } });
      const crmData = await crmRes.json();

      const adapter = ADAPTERS[cred.crm];
      let pushed = 0;
      let failed = 0;

      for (const contact of (crmData.contacts || [])) {
        try {
          await adapter.pushContact(contact, cred);
          pushed++;
        } catch {
          failed++;
        }
      }

      syncLog.push({
        id: 'sync-' + Date.now(), crm: cred.crm, direction: 'push',
        type: 'bulk-contacts', count: pushed, status: failed > 0 ? 'partial' : 'success',
        timestamp: new Date().toISOString(),
        ...(failed > 0 ? { error: `${failed} contacts failed` } : {}),
      });

      return NextResponse.json({ pushed, failed, total: crmData.contacts?.length || 0 });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
