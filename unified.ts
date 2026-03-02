// ─── Unified.to API Client ──────────────────────────────
// Wraps the Unified.to REST API for WoulfAI agents
// Pattern: https://api.unified.to/{category}/{connection_id}/{object}
// Auth: Bearer token from UNIFIED_API_KEY env var

const UNIFIED_BASE = 'https://api.unified.to';

function getApiKey(): string {
  const key = process.env.UNIFIED_API_KEY;
  if (!key) throw new Error('UNIFIED_API_KEY environment variable is not set');
  return key;
}

interface UnifiedRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, string>;
}

// ─── Core request function ──────────────────────────────
export async function unifiedRequest(
  path: string,
  options: UnifiedRequestOptions = {}
) {
  const { method = 'GET', body, params } = options;

  let url = `${UNIFIED_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += (url.includes('?') ? '&' : '?') + qs;
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Unified.to API error (${res.status}): ${errText}`);
  }

  return res.json();
}

// ─── Connection Management ──────────────────────────────

// Get the authorization URL to embed for a customer
export function getEmbedUrl(options: {
  categories: string[];       // e.g. ['accounting', 'crm']
  externalId: string;         // your company ID
  successRedirect: string;    // where to redirect after auth
  failureRedirect?: string;
}) {
  const params = new URLSearchParams({
    categories: options.categories.join(','),
    external_xref: options.externalId,
    success_redirect: options.successRedirect,
    failure_redirect: options.failureRedirect || options.successRedirect,
  });
  return `${UNIFIED_BASE}/unified/integration/auth/${process.env.UNIFIED_WORKSPACE_ID}?${params}`;
}

// List all connections for a customer
export async function listConnections(externalId?: string) {
  const params: Record<string, string> = {};
  if (externalId) params.external_xref = externalId;
  return unifiedRequest('/unified/connection', { params });
}

// Get a single connection
export async function getConnection(connectionId: string) {
  return unifiedRequest(`/unified/connection/${connectionId}`);
}

// Delete a connection
export async function deleteConnection(connectionId: string) {
  return unifiedRequest(`/unified/connection/${connectionId}`, { method: 'DELETE' });
}

// ─── Accounting API ─────────────────────────────────────

export const accounting = {
  listInvoices: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/invoice`, { params }),

  getInvoice: (connId: string, invoiceId: string) =>
    unifiedRequest(`/accounting/${connId}/invoice/${invoiceId}`),

  listBills: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/bill`, { params }),

  listAccounts: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/account`, { params }),

  listContacts: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/contact`, { params }),

  listTransactions: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/transaction`, { params }),

  listJournals: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/journal`, { params }),

  getProfitLoss: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/profitloss`, { params }),

  getBalanceSheet: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/balancesheet`, { params }),

  getCashflow: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/cashflow`, { params }),

  listTaxRates: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/taxrate`, { params }),

  listOrders: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/accounting/${connId}/order`, { params }),

  getOrganization: (connId: string) =>
    unifiedRequest(`/accounting/${connId}/organization`),
};

// ─── CRM API ────────────────────────────────────────────

export const crm = {
  listContacts: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/crm/${connId}/contact`, { params }),

  getContact: (connId: string, contactId: string) =>
    unifiedRequest(`/crm/${connId}/contact/${contactId}`),

  createContact: (connId: string, data: any) =>
    unifiedRequest(`/crm/${connId}/contact`, { method: 'POST', body: data }),

  listDeals: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/crm/${connId}/deal`, { params }),

  getDeal: (connId: string, dealId: string) =>
    unifiedRequest(`/crm/${connId}/deal/${dealId}`),

  listCompanies: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/crm/${connId}/company`, { params }),

  listLeads: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/crm/${connId}/lead`, { params }),

  listPipelines: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/crm/${connId}/pipeline`, { params }),

  listEvents: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/crm/${connId}/event`, { params }),
};

// ─── HRIS API ───────────────────────────────────────────

export const hris = {
  listEmployees: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/hris/${connId}/employee`, { params }),

  getEmployee: (connId: string, employeeId: string) =>
    unifiedRequest(`/hris/${connId}/employee/${employeeId}`),

  listGroups: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/hris/${connId}/group`, { params }),

  listPayslips: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/hris/${connId}/payslip`, { params }),

  listTimeoffs: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/hris/${connId}/timeoff`, { params }),
};

// ─── Marketing API ──────────────────────────────────────

export const martech = {
  listLists: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/martech/${connId}/list`, { params }),

  listMembers: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/martech/${connId}/member`, { params }),

  listCampaigns: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/martech/${connId}/campaign`, { params }),
};

// ─── Ticketing API ──────────────────────────────────────

export const ticketing = {
  listTickets: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/ticketing/${connId}/ticket`, { params }),

  getTicket: (connId: string, ticketId: string) =>
    unifiedRequest(`/ticketing/${connId}/ticket/${ticketId}`),

  createTicket: (connId: string, data: any) =>
    unifiedRequest(`/ticketing/${connId}/ticket`, { method: 'POST', body: data }),

  listCustomers: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/ticketing/${connId}/customer`, { params }),
};

// ─── Commerce API ───────────────────────────────────────

export const commerce = {
  listItems: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/commerce/${connId}/item`, { params }),

  listOrders: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/commerce/${connId}/order`, { params }),

  listCollections: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/commerce/${connId}/collection`, { params }),

  listInventory: (connId: string, params?: Record<string, string>) =>
    unifiedRequest(`/commerce/${connId}/inventory`, { params }),
};

// ─── Passthrough API (raw calls to any integration) ─────

export async function passthrough(
  connectionId: string,
  path: string,
  options: UnifiedRequestOptions = {}
) {
  return unifiedRequest(`/passthrough/${connectionId}`, {
    method: 'POST',
    body: {
      method: options.method || 'GET',
      path,
      body: options.body,
    },
  });
}
