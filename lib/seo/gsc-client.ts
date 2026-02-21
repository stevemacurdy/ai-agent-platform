// ============================================================================
// GOOGLE SEARCH CONSOLE CLIENT
// ============================================================================
// Fetches clicks, impressions, CTR, and keyword rankings for a domain.
// Requires: GOOGLE_SERVICE_ACCOUNT_KEY env var (JSON key file contents)
// Scopes: https://www.googleapis.com/auth/webmasters.readonly

interface GSCCredentials {
  clientEmail: string
  privateKey: string
}

interface GSCQueryParams {
  siteUrl: string           // e.g. "sc-domain:woulfgroup.com" or "https://woulfgroup.com/"
  startDate: string         // YYYY-MM-DD
  endDate: string           // YYYY-MM-DD
  dimensions?: string[]     // ['query', 'page', 'country', 'device', 'date']
  rowLimit?: number
  startRow?: number
  dimensionFilter?: {
    dimension: string
    operator: 'equals' | 'contains' | 'notContains'
    expression: string
  }[]
}

interface GSCRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface GSCResponse {
  rows: GSCRow[]
  responseAggregationType: string
}

export class GSCClient {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(private credentials: GSCCredentials) {}

  // JWT-based auth for service account
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken

    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const now = Math.floor(Date.now() / 1000)
    const claim = btoa(JSON.stringify({
      iss: this.credentials.clientEmail,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }))

    // In production, sign with privateKey using crypto
    // For now, use fetch to Google OAuth token endpoint
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: header + '.' + claim + '.SIGNATURE', // Replace with real JWT signing
      }),
    })
    const data = await res.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000
    return this.accessToken!
  }

  /**
   * Query Search Analytics — main method for keyword data
   */
  async query(params: GSCQueryParams): Promise<GSCResponse> {
    const token = await this.getAccessToken()
    const body: any = {
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: params.dimensions || ['query'],
      rowLimit: params.rowLimit || 100,
      startRow: params.startRow || 0,
    }

    if (params.dimensionFilter) {
      body.dimensionFilterGroups = [{
        filters: params.dimensionFilter.map(f => ({
          dimension: f.dimension,
          operator: f.operator,
          expression: f.expression,
        }))
      }]
    }

    const encodedUrl = encodeURIComponent(params.siteUrl)
    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GSC API error ${res.status}: ${err}`)
    }

    return res.json()
  }

  /**
   * Get top keywords by clicks for a domain
   */
  async getTopKeywords(siteUrl: string, days: number = 28, limit: number = 50) {
    const endDate = new Date().toISOString().slice(0, 10)
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

    const result = await this.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: limit,
    })

    return result.rows.map(row => ({
      keyword: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 10000) / 100, // Convert to percentage
      position: Math.round(row.position * 10) / 10,
    }))
  }

  /**
   * Get page performance
   */
  async getPagePerformance(siteUrl: string, days: number = 28) {
    const endDate = new Date().toISOString().slice(0, 10)
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

    const result = await this.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 25,
    })

    return result.rows.map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 10000) / 100,
      position: Math.round(row.position * 10) / 10,
    }))
  }

  /**
   * Get daily trend data for a specific keyword
   */
  async getKeywordTrend(siteUrl: string, keyword: string, days: number = 90) {
    const endDate = new Date().toISOString().slice(0, 10)
    const startDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)

    const result = await this.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['date'],
      dimensionFilter: [{ dimension: 'query', operator: 'equals', expression: keyword }],
    })

    return result.rows.map(row => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      position: Math.round(row.position * 10) / 10,
    }))
  }
}

// Factory: create client from env
export function createGSCClient(): GSCClient | null {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!key) return null

  try {
    const parsed = JSON.parse(key)
    return new GSCClient({
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    })
  } catch {
    console.error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY')
    return null
  }
}
