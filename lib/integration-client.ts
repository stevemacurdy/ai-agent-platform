// lib/integration-client.ts
// B13: Integration framework
//
// Fetches per-company credentials from the integrations table and makes
// authenticated API calls to external services (HubSpot, Odoo, etc.)
//
// Usage:
//   import { getIntegration, hubspot, odoo } from '@/lib/integration-client'
//
//   // Generic
//   const integration = await getIntegration(companyId, 'hubspot')
//   const data = await integrationFetch(integration, '/contacts', { method: 'GET' })
//
//   // HubSpot shorthand
//   const contacts = await hubspot.getContacts(companyId)
//   const deals = await hubspot.getDeals(companyId)

import { createClient } from '@supabase/supabase-js'

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ============================================================================
// Types
// ============================================================================

export interface Integration {
  id: string
  company_id: string
  provider: string
  label: string
  config: Record<string, any>
  status: string
  last_synced_at: string | null
  error_message: string | null
}

export interface IntegrationResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
  status?: number
}

// ============================================================================
// Core: Get integration config for a company
// ============================================================================

export async function getIntegration(
  companyId: string,
  provider: string
): Promise<Integration | null> {
  const sb = sbAdmin()
  const { data, error } = await sb
    .from('integrations')
    .select('*')
    .eq('company_id', companyId)
    .eq('provider', provider)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) return null
  return data as Integration
}

// ============================================================================
// Core: Make an authenticated fetch to an integration
// ============================================================================

export async function integrationFetch<T = any>(
  integration: Integration,
  path: string,
  options: {
    method?: string
    body?: any
    params?: Record<string, string>
    timeout?: number
  } = {}
): Promise<IntegrationResponse<T>> {
  const { method = 'GET', body, params, timeout = 15000 } = options
  const config = integration.config

  // Build URL based on provider
  let baseUrl = ''
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  switch (integration.provider) {
    case 'hubspot':
      baseUrl = 'https://api.hubapi.com'
      headers['Authorization'] = `Bearer ${config.access_token || config.api_key}`
      break
    case 'odoo':
      baseUrl = config.base_url || ''
      // Odoo uses session-based or API key auth depending on setup
      if (config.api_key) {
        headers['Authorization'] = `Bearer ${config.api_key}`
      }
      break
    default:
      baseUrl = config.base_url || ''
      if (config.api_key) {
        headers['Authorization'] = `Bearer ${config.api_key}`
      }
  }

  if (!baseUrl) {
    return { ok: false, error: `No base URL configured for ${integration.provider}` }
  }

  // Build full URL with query params
  const url = new URL(path, baseUrl)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }

  // Fetch with timeout
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      // Update integration status on auth errors
      if (response.status === 401 || response.status === 403) {
        await sbAdmin()
          .from('integrations')
          .update({
            status: 'error',
            error_message: `Auth error: ${response.status}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id)
      }

      return {
        ok: false,
        error: data?.message || `${integration.provider} API error ${response.status}`,
        status: response.status,
      }
    }

    // Update last_synced_at
    await sbAdmin()
      .from('integrations')
      .update({
        last_synced_at: new Date().toISOString(),
        status: 'active',
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id)

    return { ok: true, data: data as T, status: response.status }
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError'
      ? `${integration.provider} API timeout after ${timeout}ms`
      : err.message

    return { ok: false, error: errorMsg }
  } finally {
    clearTimeout(timer)
  }
}

// ============================================================================
// HubSpot helpers
// ============================================================================

export const hubspot = {
  async getContacts(companyId: string, limit = 50, after?: string) {
    const integration = await getIntegration(companyId, 'hubspot')
    if (!integration) return { ok: false as const, error: 'HubSpot not connected' }

    const params: Record<string, string> = { limit: String(limit) }
    if (after) params.after = after

    return integrationFetch(integration, '/crm/v3/objects/contacts', { params })
  },

  async getContact(companyId: string, contactId: string) {
    const integration = await getIntegration(companyId, 'hubspot')
    if (!integration) return { ok: false as const, error: 'HubSpot not connected' }

    return integrationFetch(integration, `/crm/v3/objects/contacts/${contactId}`, {
      params: { properties: 'email,firstname,lastname,phone,company,lifecyclestage,hs_lead_status' },
    })
  },

  async getDeals(companyId: string, limit = 50) {
    const integration = await getIntegration(companyId, 'hubspot')
    if (!integration) return { ok: false as const, error: 'HubSpot not connected' }

    return integrationFetch(integration, '/crm/v3/objects/deals', {
      params: { limit: String(limit), properties: 'dealname,amount,dealstage,closedate,pipeline' },
    })
  },

  async getCompanies(companyId: string, limit = 50) {
    const integration = await getIntegration(companyId, 'hubspot')
    if (!integration) return { ok: false as const, error: 'HubSpot not connected' }

    return integrationFetch(integration, '/crm/v3/objects/companies', {
      params: { limit: String(limit), properties: 'name,domain,industry,numberofemployees,annualrevenue' },
    })
  },

  async searchContacts(companyId: string, query: string) {
    const integration = await getIntegration(companyId, 'hubspot')
    if (!integration) return { ok: false as const, error: 'HubSpot not connected' }

    return integrationFetch(integration, '/crm/v3/objects/contacts/search', {
      method: 'POST',
      body: {
        query,
        limit: 20,
        properties: ['email', 'firstname', 'lastname', 'phone', 'company'],
      },
    })
  },
}

// ============================================================================
// Odoo helpers
// ============================================================================

export const odoo = {
  async authenticate(companyId: string) {
    const integration = await getIntegration(companyId, 'odoo')
    if (!integration) return { ok: false as const, error: 'Odoo not connected' }

    const config = integration.config
    return integrationFetch(integration, '/web/session/authenticate', {
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: config.database,
          login: config.username,
          password: config.password,
        },
      },
    })
  },

  async searchRead(companyId: string, model: string, domain: any[] = [], fields: string[] = [], limit = 50) {
    const integration = await getIntegration(companyId, 'odoo')
    if (!integration) return { ok: false as const, error: 'Odoo not connected' }

    return integrationFetch(integration, '/web/dataset/call_kw', {
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model,
          method: 'search_read',
          args: [domain],
          kwargs: { fields, limit },
        },
      },
    })
  },

  async getInventory(companyId: string, limit = 100) {
    return odoo.searchRead(companyId, 'stock.quant', [['quantity', '>', 0]], [
      'product_id', 'location_id', 'quantity', 'reserved_quantity',
    ], limit)
  },

  async getSalesOrders(companyId: string, limit = 50) {
    return odoo.searchRead(companyId, 'sale.order', [], [
      'name', 'partner_id', 'date_order', 'amount_total', 'state',
    ], limit)
  },

  async getPurchaseOrders(companyId: string, limit = 50) {
    return odoo.searchRead(companyId, 'purchase.order', [], [
      'name', 'partner_id', 'date_order', 'amount_total', 'state',
    ], limit)
  },
}
