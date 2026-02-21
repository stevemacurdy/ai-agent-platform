// ============================================================================
// ADS CLIENT — Google Ads + Meta Ads spend & performance
// ============================================================================

interface AdCampaign {
  id: string
  platform: 'google' | 'meta'
  name: string
  status: 'active' | 'paused' | 'completed'
  budget: number         // daily budget
  spend: number          // total spend this period
  impressions: number
  clicks: number
  ctr: number
  cpc: number            // cost per click
  conversions: number
  cpl: number            // cost per lead
  roas: number           // return on ad spend
}

// --- Google Ads ---
export class GoogleAdsClient {
  private customerId: string
  private developerToken: string

  constructor(customerId: string, developerToken: string) {
    this.customerId = customerId
    this.developerToken = developerToken
  }

  async getCampaigns(startDate: string, endDate: string): Promise<AdCampaign[]> {
    const res = await fetch(
      `https://googleads.googleapis.com/v15/customers/${this.customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GOOGLE_ADS_TOKEN}`,
          'developer-token': this.developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `SELECT campaign.id, campaign.name, campaign.status,
            campaign_budget.amount_micros, metrics.cost_micros,
            metrics.impressions, metrics.clicks, metrics.ctr,
            metrics.average_cpc, metrics.conversions
            FROM campaign WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
            ORDER BY metrics.cost_micros DESC`,
        }),
      }
    )
    const data = await res.json()
    return (data.results || []).map((r: any) => ({
      id: r.campaign.id,
      platform: 'google' as const,
      name: r.campaign.name,
      status: r.campaign.status === 'ENABLED' ? 'active' : 'paused',
      budget: (r.campaignBudget?.amountMicros || 0) / 1000000,
      spend: (r.metrics?.costMicros || 0) / 1000000,
      impressions: r.metrics?.impressions || 0,
      clicks: r.metrics?.clicks || 0,
      ctr: r.metrics?.ctr || 0,
      cpc: (r.metrics?.averageCpc || 0) / 1000000,
      conversions: r.metrics?.conversions || 0,
      cpl: 0, roas: 0,
    }))
  }
}

// --- Meta Ads ---
export class MetaAdsClient {
  private accessToken: string
  private adAccountId: string

  constructor(adAccountId: string, accessToken: string) {
    this.adAccountId = adAccountId
    this.accessToken = accessToken
  }

  async getCampaigns(startDate: string, endDate: string): Promise<AdCampaign[]> {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/act_${this.adAccountId}/campaigns?fields=id,name,status,daily_budget,insights{spend,impressions,clicks,ctr,cpc,actions}&time_range={"since":"${startDate}","until":"${endDate}"}&access_token=${this.accessToken}`
    )
    const data = await res.json()
    return (data.data || []).map((c: any) => {
      const insights = c.insights?.data?.[0] || {}
      const leads = (insights.actions || []).find((a: any) => a.action_type === 'lead')?.value || 0
      return {
        id: c.id,
        platform: 'meta' as const,
        name: c.name,
        status: c.status === 'ACTIVE' ? 'active' : 'paused',
        budget: (c.daily_budget || 0) / 100,
        spend: parseFloat(insights.spend || 0),
        impressions: parseInt(insights.impressions || 0),
        clicks: parseInt(insights.clicks || 0),
        ctr: parseFloat(insights.ctr || 0),
        cpc: parseFloat(insights.cpc || 0),
        conversions: parseInt(leads),
        cpl: 0, roas: 0,
      }
    })
  }
}

export function createGoogleAdsClient(): GoogleAdsClient | null {
  const id = process.env.GOOGLE_ADS_CUSTOMER_ID
  const token = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  if (!id || !token) return null
  return new GoogleAdsClient(id, token)
}

export function createMetaAdsClient(): MetaAdsClient | null {
  const id = process.env.META_AD_ACCOUNT_ID
  const token = process.env.META_ACCESS_TOKEN
  if (!id || !token) return null
  return new MetaAdsClient(id, token)
}
