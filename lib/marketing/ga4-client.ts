// ============================================================================
// GOOGLE ANALYTICS 4 CLIENT — Traffic & conversion data
// ============================================================================
// Requires: GA4_PROPERTY_ID + GOOGLE_SERVICE_ACCOUNT_KEY env vars

interface GA4Metrics {
  sessions: number
  users: number
  newUsers: number
  pageviews: number
  avgSessionDuration: number  // seconds
  bounceRate: number          // 0-1
  conversions: number
  conversionRate: number
}

interface GA4ChannelData {
  channel: string         // 'organic_search' | 'paid_search' | 'social' | 'email' | 'direct' | 'referral'
  sessions: number
  users: number
  conversions: number
  conversionRate: number
  revenue: number
}

interface GA4PageData {
  path: string
  pageviews: number
  avgTimeOnPage: number
  bounceRate: number
  entrances: number
}

export class GA4Client {
  private propertyId: string
  private accessToken: string | null = null

  constructor(propertyId: string) {
    this.propertyId = propertyId
  }

  private async getToken(): Promise<string> {
    // In production: use service account JWT auth
    // Same pattern as GSC client
    if (this.accessToken) return this.accessToken
    const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!key) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set')
    // ... JWT signing logic ...
    return this.accessToken || ''
  }

  async getOverview(startDate: string, endDate: string): Promise<GA4Metrics> {
    const token = await this.getToken()
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: 'sessions' }, { name: 'totalUsers' }, { name: 'newUsers' },
            { name: 'screenPageViews' }, { name: 'averageSessionDuration' },
            { name: 'bounceRate' }, { name: 'conversions' },
          ],
        }),
      }
    )
    const data = await res.json()
    const vals = data.rows?.[0]?.metricValues || []
    return {
      sessions: parseInt(vals[0]?.value || '0'),
      users: parseInt(vals[1]?.value || '0'),
      newUsers: parseInt(vals[2]?.value || '0'),
      pageviews: parseInt(vals[3]?.value || '0'),
      avgSessionDuration: parseFloat(vals[4]?.value || '0'),
      bounceRate: parseFloat(vals[5]?.value || '0'),
      conversions: parseInt(vals[6]?.value || '0'),
      conversionRate: 0, // calculated
    }
  }

  async getChannelBreakdown(startDate: string, endDate: string): Promise<GA4ChannelData[]> {
    const token = await this.getToken()
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [
            { name: 'sessions' }, { name: 'totalUsers' },
            { name: 'conversions' }, { name: 'totalRevenue' },
          ],
        }),
      }
    )
    const data = await res.json()
    return (data.rows || []).map((row: any) => ({
      channel: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value),
      users: parseInt(row.metricValues[1].value),
      conversions: parseInt(row.metricValues[2].value),
      conversionRate: 0,
      revenue: parseFloat(row.metricValues[3].value),
    }))
  }

  async getTopPages(startDate: string, endDate: string, limit: number = 20): Promise<GA4PageData[]> {
    const token = await this.getToken()
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' }, { name: 'averageSessionDuration' },
            { name: 'bounceRate' }, { name: 'entrances' },
          ],
          limit,
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        }),
      }
    )
    const data = await res.json()
    return (data.rows || []).map((row: any) => ({
      path: row.dimensionValues[0].value,
      pageviews: parseInt(row.metricValues[0].value),
      avgTimeOnPage: parseFloat(row.metricValues[1].value),
      bounceRate: parseFloat(row.metricValues[2].value),
      entrances: parseInt(row.metricValues[3].value),
    }))
  }
}

export function createGA4Client(): GA4Client | null {
  const id = process.env.GA4_PROPERTY_ID
  if (!id) return null
  return new GA4Client(id)
}
