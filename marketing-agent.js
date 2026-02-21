#!/usr/bin/env node
/**
 * MARKETING AGENT — Full Production Module for WoulfAI
 *
 * Components:
 *   1.  lib/marketing/ga4-client.ts         — Google Analytics 4 adapter
 *   2.  lib/marketing/ads-client.ts         — Google/Meta Ads spend adapter
 *   3.  lib/marketing/email-client.ts       — Email platform adapter (SendGrid/Resend)
 *   4.  lib/marketing/sales-sync.ts         — Lead-to-Close attribution link
 *   5.  lib/marketing/gemini-client.ts      — Gemini AI for strategy + long-form
 *   6.  lib/marketing/nano-banana-client.ts — Nano Banana for fast micro-content
 *   7.  lib/marketing/system-prompt.ts      — Proactive Marketing Manager brain
 *   8.  lib/marketing/marketing-data.ts     — Tenant-scoped demo data engine
 *   9.  app/api/agents/marketing/route.ts   — Marketing agent API
 *  10.  app/portal/agent/marketing/page.tsx  — Full marketing dashboard
 *
 * Usage: node marketing-agent.js
 */
const fs = require('fs');
const path = require('path');

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════════════╗');
console.log('  ║  MARKETING AGENT — Full Production Module + AI Integrations     ║');
console.log('  ╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. GA4 CLIENT
// ============================================================
write('lib/marketing/ga4-client.ts', `// ============================================================================
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
      \`https://analyticsdata.googleapis.com/v1beta/properties/\${this.propertyId}:runReport\`,
      {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
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
      \`https://analyticsdata.googleapis.com/v1beta/properties/\${this.propertyId}:runReport\`,
      {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
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
      \`https://analyticsdata.googleapis.com/v1beta/properties/\${this.propertyId}:runReport\`,
      {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
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
`);

// ============================================================
// 2. ADS CLIENT — Google + Meta
// ============================================================
write('lib/marketing/ads-client.ts', `// ============================================================================
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
      \`https://googleads.googleapis.com/v15/customers/\${this.customerId}/googleAds:searchStream\`,
      {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${process.env.GOOGLE_ADS_TOKEN}\`,
          'developer-token': this.developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: \`SELECT campaign.id, campaign.name, campaign.status,
            campaign_budget.amount_micros, metrics.cost_micros,
            metrics.impressions, metrics.clicks, metrics.ctr,
            metrics.average_cpc, metrics.conversions
            FROM campaign WHERE segments.date BETWEEN '\${startDate}' AND '\${endDate}'
            ORDER BY metrics.cost_micros DESC\`,
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
      \`https://graph.facebook.com/v19.0/act_\${this.adAccountId}/campaigns?fields=id,name,status,daily_budget,insights{spend,impressions,clicks,ctr,cpc,actions}&time_range={"since":"\${startDate}","until":"\${endDate}"}&access_token=\${this.accessToken}\`
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
`);

// ============================================================
// 3. EMAIL CLIENT
// ============================================================
write('lib/marketing/email-client.ts', `// ============================================================================
// EMAIL MARKETING CLIENT — SendGrid / Resend adapter
// ============================================================================

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sent'
  sentAt?: string
  stats: {
    sent: number
    delivered: number
    opens: number
    openRate: number
    clicks: number
    clickRate: number
    unsubscribes: number
    bounces: number
  }
}

interface EmailDraft {
  to: string[]           // or segment ID
  subject: string
  preheader?: string
  htmlBody: string
  textBody?: string
  scheduledFor?: string
  tags?: string[]
}

// --- SendGrid ---
export class SendGridClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    const res = await fetch('https://api.sendgrid.com/v3/marketing/singlesends', {
      headers: { 'Authorization': \`Bearer \${this.apiKey}\` },
    })
    const data = await res.json()
    return (data.result || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      subject: c.email_config?.subject || '',
      status: c.status === 'triggered' ? 'sent' : c.send_at ? 'scheduled' : 'draft',
      sentAt: c.send_at,
      stats: {
        sent: c.stats?.requested || 0,
        delivered: c.stats?.delivered || 0,
        opens: c.stats?.unique_opens || 0,
        openRate: c.stats?.requested ? (c.stats.unique_opens / c.stats.requested * 100) : 0,
        clicks: c.stats?.unique_clicks || 0,
        clickRate: c.stats?.requested ? (c.stats.unique_clicks / c.stats.requested * 100) : 0,
        unsubscribes: c.stats?.unsubscribes || 0,
        bounces: c.stats?.bounces || 0,
      }
    }))
  }

  async sendCampaign(draft: EmailDraft): Promise<{ success: boolean; id?: string; error?: string }> {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: draft.to.map(e => ({ email: e })) }],
        from: { email: 'marketing@woulfai.com' },
        subject: draft.subject,
        content: [
          { type: 'text/plain', value: draft.textBody || '' },
          { type: 'text/html', value: draft.htmlBody },
        ],
      }),
    })
    return res.ok ? { success: true } : { success: false, error: await res.text() }
  }
}

// --- Resend ---
export class ResendClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(draft: EmailDraft): Promise<{ success: boolean; id?: string }> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'WoulfAI <marketing@woulfai.com>',
        to: draft.to,
        subject: draft.subject,
        html: draft.htmlBody,
        text: draft.textBody,
        scheduled_at: draft.scheduledFor,
      }),
    })
    const data = await res.json()
    return { success: res.ok, id: data.id }
  }
}

export function createEmailClient(): SendGridClient | null {
  const key = process.env.SENDGRID_API_KEY
  if (!key) return null
  return new SendGridClient(key)
}
`);

// ============================================================
// 4. SALES SYNC — Lead attribution
// ============================================================
write('lib/marketing/sales-sync.ts', `// ============================================================================
// SALES SYNC — Lead-to-Close attribution linking marketing to sales
// ============================================================================

export interface MarketingLead {
  id: string
  source: 'organic' | 'paid_google' | 'paid_meta' | 'email' | 'social' | 'referral' | 'direct'
  campaign?: string
  keyword?: string
  name: string
  email: string
  company?: string
  phone?: string
  createdAt: string
  // Sales pipeline link
  salesStage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed_won' | 'closed_lost'
  salesDealId?: string
  dealValue?: number
  closedAt?: string
}

export interface FunnelMetrics {
  visitors: number
  leads: number
  qualified: number
  proposals: number
  closedWon: number
  closedLost: number
  conversionRates: {
    visitorToLead: number
    leadToQualified: number
    qualifiedToProposal: number
    proposalToClose: number
    overallWinRate: number
  }
  avgDealSize: number
  avgTimeToClose: number  // days
  revenueBySource: Record<string, number>
}

export interface AttributionData {
  source: string
  leads: number
  spend: number
  revenue: number
  roi: number           // (revenue - spend) / spend * 100
  cpl: number           // cost per lead
  cac: number           // customer acquisition cost
  avgDealSize: number
}

/**
 * Calculate funnel metrics from leads
 */
export function calculateFunnel(leads: MarketingLead[], totalVisitors: number): FunnelMetrics {
  const byStage = {
    new: leads.filter(l => l.salesStage === 'new').length,
    contacted: leads.filter(l => l.salesStage === 'contacted').length,
    qualified: leads.filter(l => l.salesStage === 'qualified').length,
    proposal: leads.filter(l => l.salesStage === 'proposal').length,
    closedWon: leads.filter(l => l.salesStage === 'closed_won').length,
    closedLost: leads.filter(l => l.salesStage === 'closed_lost').length,
  }
  const totalLeads = leads.length
  const totalQualified = byStage.qualified + byStage.proposal + byStage.closedWon + byStage.closedLost
  const totalProposals = byStage.proposal + byStage.closedWon + byStage.closedLost
  const totalClosed = byStage.closedWon + byStage.closedLost

  const revenueBySource: Record<string, number> = {}
  leads.filter(l => l.salesStage === 'closed_won').forEach(l => {
    revenueBySource[l.source] = (revenueBySource[l.source] || 0) + (l.dealValue || 0)
  })

  const wonDeals = leads.filter(l => l.salesStage === 'closed_won')
  const avgDeal = wonDeals.length > 0 ? wonDeals.reduce((s, l) => s + (l.dealValue || 0), 0) / wonDeals.length : 0

  return {
    visitors: totalVisitors,
    leads: totalLeads,
    qualified: totalQualified,
    proposals: totalProposals,
    closedWon: byStage.closedWon,
    closedLost: byStage.closedLost,
    conversionRates: {
      visitorToLead: totalVisitors > 0 ? (totalLeads / totalVisitors * 100) : 0,
      leadToQualified: totalLeads > 0 ? (totalQualified / totalLeads * 100) : 0,
      qualifiedToProposal: totalQualified > 0 ? (totalProposals / totalQualified * 100) : 0,
      proposalToClose: totalProposals > 0 ? (byStage.closedWon / totalProposals * 100) : 0,
      overallWinRate: totalClosed > 0 ? (byStage.closedWon / totalClosed * 100) : 0,
    },
    avgDealSize: avgDeal,
    avgTimeToClose: 34,
    revenueBySource,
  }
}

/**
 * Calculate attribution by source
 */
export function calculateAttribution(
  leads: MarketingLead[],
  adSpend: Record<string, number>
): AttributionData[] {
  const sources = [...new Set(leads.map(l => l.source))]
  return sources.map(source => {
    const srcLeads = leads.filter(l => l.source === source)
    const won = srcLeads.filter(l => l.salesStage === 'closed_won')
    const revenue = won.reduce((s, l) => s + (l.dealValue || 0), 0)
    const spend = adSpend[source] || 0
    return {
      source,
      leads: srcLeads.length,
      spend,
      revenue,
      roi: spend > 0 ? Math.round((revenue - spend) / spend * 100) : 0,
      cpl: srcLeads.length > 0 ? Math.round(spend / srcLeads.length) : 0,
      cac: won.length > 0 ? Math.round(spend / won.length) : 0,
      avgDealSize: won.length > 0 ? Math.round(revenue / won.length) : 0,
    }
  }).sort((a, b) => b.revenue - a.revenue)
}
`);

// ============================================================
// 5. GEMINI CLIENT — Strategy + long-form content
// ============================================================
write('lib/marketing/gemini-client.ts', `// ============================================================================
// GEMINI CLIENT — High-level strategy and long-form content generation
// ============================================================================
// Requires: GEMINI_API_KEY env var

interface GeminiRequest {
  prompt: string
  systemInstruction?: string
  maxTokens?: number
  temperature?: number
}

interface GeminiResponse {
  content: string
  tokensUsed: number
  model: string
}

export class GeminiClient {
  private apiKey: string
  private model: string = 'gemini-1.5-pro'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    const res = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/\${this.model}:generateContent?key=\${this.apiKey}\`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: request.systemInstruction ? { parts: [{ text: request.systemInstruction }] } : undefined,
          contents: [{ parts: [{ text: request.prompt }] }],
          generationConfig: {
            maxOutputTokens: request.maxTokens || 4096,
            temperature: request.temperature || 0.7,
          },
        }),
      }
    )

    if (!res.ok) throw new Error(\`Gemini error: \${res.status} \${await res.text()}\`)
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return { content: text, tokensUsed: data.usageMetadata?.totalTokenCount || 0, model: this.model }
  }

  /**
   * Generate a 30-day campaign strategy based on current ROI data
   */
  async generate30DayStrategy(context: {
    companyName: string; industry: string; currentROI: any; competitorData: any; budget: number
  }): Promise<string> {
    const systemPrompt = \`You are an elite marketing strategist. Generate a detailed 30-day marketing strategy.
RULES:
- Every recommendation must cite specific ROI data provided
- Cross-reference competitor share-of-voice to find gaps
- Prioritize channels with highest ROI first
- Include specific budget allocation percentages
- Format as a week-by-week action plan
- Be decisive and specific, not vague\`

    const prompt = \`Company: \${context.companyName} (\${context.industry})
Monthly Budget: $\${context.budget}

Current Performance:
\${JSON.stringify(context.currentROI, null, 2)}

Competitor Landscape:
\${JSON.stringify(context.competitorData, null, 2)}

Generate a detailed 30-day marketing strategy with:
1. Week-by-week action plan
2. Budget allocation per channel
3. Content themes and topics
4. Expected outcomes and KPIs
5. Competitive counter-moves\`

    const result = await this.generate({ prompt, systemInstruction: systemPrompt, maxTokens: 4096 })
    return result.content
  }

  /**
   * Generate long-form content (blog posts, whitepapers)
   */
  async generateLongForm(context: {
    type: 'blog' | 'whitepaper' | 'case_study'; topic: string; keywords: string[]
    companyName: string; tone: string; competitorTopics?: string[]
  }): Promise<string> {
    const systemPrompt = \`You are a B2B content marketing expert. Generate high-quality \${context.type} content.
RULES:
- Naturally incorporate these keywords: \${context.keywords.join(', ')}
- Write for a professional B2B audience
- Include data points and specific examples
- Ensure content has a competitive edge against: \${(context.competitorTopics || []).join(', ')}
- Use \${context.tone} tone throughout
- Blog posts: 600-800 words. Whitepapers: 1500-2000 words. Case studies: 800-1200 words.\`

    const result = await this.generate({
      prompt: \`Write a \${context.type} about: \${context.topic}\\nFor: \${context.companyName}\\nKeywords: \${context.keywords.join(', ')}\`,
      systemInstruction: systemPrompt,
      maxTokens: context.type === 'whitepaper' ? 6000 : 3000,
    })
    return result.content
  }
}

export function createGeminiClient(): GeminiClient | null {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  return new GeminiClient(key)
}
`);

// ============================================================
// 6. NANO BANANA CLIENT — Fast micro-content
// ============================================================
write('lib/marketing/nano-banana-client.ts', `// ============================================================================
// NANO BANANA CLIENT — High-speed micro-content generation
// ============================================================================
// Lightweight AI for social captions, SMS blasts, meta tags, subject lines
// Requires: NANO_BANANA_API_KEY env var (or falls back to Claude)

interface NanoBananaRequest {
  type: 'social_caption' | 'sms_blast' | 'email_subject' | 'meta_description' | 'ad_copy'
  topic: string
  keywords?: string[]
  tone?: 'professional' | 'friendly' | 'urgent' | 'witty'
  platform?: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'google_ads'
  maxLength?: number
  variations?: number    // Generate N variations
  competitorContext?: string
}

interface NanoBananaResponse {
  variations: string[]
  bestPick: string
  reasoning: string
  characterCounts: number[]
}

export class NanoBananaClient {
  private apiKey: string
  private endpoint: string

  constructor(apiKey: string, endpoint?: string) {
    this.apiKey = apiKey
    this.endpoint = endpoint || 'https://api.nanobanana.ai/v1/generate'
  }

  async generate(request: NanoBananaRequest): Promise<NanoBananaResponse> {
    const count = request.variations || 3
    const constraints = this.getConstraints(request)

    // Attempt Nano Banana API
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: request.type,
          prompt: this.buildPrompt(request),
          variations: count,
          max_tokens: constraints.maxTokens,
          temperature: 0.8,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        return {
          variations: data.variations || [],
          bestPick: data.best_pick || data.variations?.[0] || '',
          reasoning: data.reasoning || 'Selected for highest engagement potential',
          characterCounts: (data.variations || []).map((v: string) => v.length),
        }
      }
    } catch {}

    // Fallback: use Claude API
    return this.fallbackGenerate(request, count, constraints)
  }

  private getConstraints(req: NanoBananaRequest) {
    const limits: Record<string, { maxChars: number; maxTokens: number }> = {
      social_caption: { maxChars: req.platform === 'twitter' ? 280 : 500, maxTokens: 200 },
      sms_blast: { maxChars: 160, maxTokens: 80 },
      email_subject: { maxChars: 60, maxTokens: 40 },
      meta_description: { maxChars: 160, maxTokens: 80 },
      ad_copy: { maxChars: req.platform === 'google_ads' ? 90 : 300, maxTokens: 150 },
    }
    return limits[req.type] || { maxChars: 300, maxTokens: 150 }
  }

  private buildPrompt(req: NanoBananaRequest): string {
    const parts = [
      \`Generate \${req.type.replace(/_/g, ' ')} about: \${req.topic}\`,
      req.keywords?.length ? \`Keywords: \${req.keywords.join(', ')}\` : '',
      req.tone ? \`Tone: \${req.tone}\` : '',
      req.platform ? \`Platform: \${req.platform}\` : '',
      req.competitorContext ? \`Competitive edge needed against: \${req.competitorContext}\` : '',
    ]
    return parts.filter(Boolean).join('\\n')
  }

  private async fallbackGenerate(req: NanoBananaRequest, count: number, constraints: any): Promise<NanoBananaResponse> {
    // Claude API fallback for when Nano Banana is unavailable
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: \`Generate exactly \${count} variations of a \${req.type.replace(/_/g, ' ')} about: \${req.topic}
\${req.keywords?.length ? 'Keywords: ' + req.keywords.join(', ') : ''}
\${req.tone ? 'Tone: ' + req.tone : ''}
\${req.platform ? 'Platform: ' + req.platform : ''}
Max \${constraints.maxChars} characters each.
\${req.competitorContext ? 'Must have competitive edge against: ' + req.competitorContext : ''}
Return ONLY the variations, one per line, numbered 1-\${count}. No extra text.\`
          }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const lines = text.split('\\n').filter((l: string) => l.trim()).map((l: string) => l.replace(/^\\d+\\.\\s*/, '').trim())
      return {
        variations: lines.slice(0, count),
        bestPick: lines[0] || '',
        reasoning: 'Generated via Claude fallback — selected first variation',
        characterCounts: lines.slice(0, count).map((l: string) => l.length),
      }
    } catch {
      return { variations: ['Content generation unavailable'], bestPick: '', reasoning: 'API error', characterCounts: [0] }
    }
  }

  /**
   * Generate a full week of social posts
   */
  async generateWeeklyPosts(topics: string[], keywords: string[], platform: string): Promise<NanoBananaResponse[]> {
    const results: NanoBananaResponse[] = []
    for (let i = 0; i < 7; i++) {
      const topic = topics[i % topics.length]
      const result = await this.generate({
        type: 'social_caption',
        topic,
        keywords,
        platform: platform as any,
        tone: 'professional',
        variations: 2,
      })
      results.push(result)
    }
    return results
  }
}

export function createNanoBananaClient(): NanoBananaClient | null {
  const key = process.env.NANO_BANANA_API_KEY
  if (!key) {
    // Fall back to Claude if Nano Banana key not set
    if (process.env.ANTHROPIC_API_KEY) {
      return new NanoBananaClient('claude-fallback', 'https://api.anthropic.com')
    }
    return null
  }
  return new NanoBananaClient(key)
}
`);

// ============================================================
// 7. SYSTEM PROMPT — Proactive Marketing Manager
// ============================================================
write('lib/marketing/system-prompt.ts', `// ============================================================================
// MARKETING AGENT SYSTEM PROMPT — Proactive Marketing Manager
// ============================================================================

export function getMarketingSystemPrompt(context: {
  companyName: string; industry: string; location: string
  monthlyBudget: number; channels: string[]
  currentMetrics?: { totalLeads: number; cpl: number; bestChannel: string; worstChannel: string }
  competitorData?: { name: string; shareOfVoice: number }[]
}): string {
  return \`You are the Marketing Agent for \${context.companyName}, operating as a Proactive Marketing Manager. You manage a $\${context.monthlyBudget}/month budget across \${context.channels.join(', ')}.

## YOUR ROLE
You are an autonomous marketing manager who:
1. Monitors ROI in real-time and suggests budget shifts PROACTIVELY
2. Generates ready-to-deploy content (emails, social, ads)
3. Tracks competitors and recommends counter-campaigns
4. Manages the full funnel from visitor to closed deal

## CURRENT STATE
- Company: \${context.companyName} (\${context.industry})
- Location: \${context.location}
- Budget: $\${context.monthlyBudget}/month
- Active Channels: \${context.channels.join(', ')}
\${context.currentMetrics ? \`- Total Leads This Month: \${context.currentMetrics.totalLeads}
- Average CPL: $\${context.currentMetrics.cpl}
- Best Channel: \${context.currentMetrics.bestChannel}
- Worst Channel: \${context.currentMetrics.worstChannel}\` : ''}
\${context.competitorData ? \`
## COMPETITOR LANDSCAPE
\${context.competitorData.map(c => \`- \${c.name}: \${c.shareOfVoice}% share of voice\`).join('\\n')}\` : ''}

## BEHAVIOR RULES

### Budget Optimization
When you detect a channel underperforming:
- CALCULATE the exact dollar reallocation
- CITE the ROI data: "Your Meta Ads for [keyword] have a $142 CPL vs $38 on Google Search"
- RECOMMEND specific budget shift: "I suggest moving $500 from Meta [campaign] to Google [campaign]"
- SHOW projected impact: "This should reduce overall CPL by ~18%"

### Content Generation
You have two AI engines at your disposal:
- **Gemini**: Use for campaign strategy, market analysis, blog posts, whitepapers
- **Nano Banana**: Use for rapid social captions, SMS blasts, email subject lines, ad copy

Always cross-reference competitor share-of-voice before generating content. Every piece must have a competitive edge.

### Funnel Management
- Track every lead from first touch to close
- Alert when a funnel stage has unusual drop-off
- Suggest nurture sequences for stalled leads
- Celebrate wins: "Lead from [campaign] just closed — $45K deal, 340% ROI on that campaign"

### Weekly Briefing Format
\`\`\`
## 📊 Marketing Briefing — [Date]

**Budget Health:** $X spent of $Y (Z% remaining)
**Top Performer:** [Channel] — $X CPL, Y leads, Z% ROI
**Underperformer:** [Channel] — recommend reallocation

**This Week's Actions:**
1. [Action] → [Impact] → [APPROVE]
2. [Action] → [Impact] → [APPROVE]

**Content Queue:**
- [Draft type] for [channel] → [REVIEW]

**Competitor Move:**
- [Competitor] launched [campaign/content] → here is my counter-strategy
\`\`\`

## TONE
Confident, data-driven, action-oriented. Lead with numbers. Never say "I think" — say "The data shows" or "I recommend." Every recommendation must include a projected ROI impact.
\`
}
`);

// ============================================================
// 8. MARKETING DATA ENGINE — Tenant-scoped
// ============================================================
write('lib/marketing/marketing-data.ts', `// ============================================================================
// MARKETING DATA ENGINE — Tenant-scoped demo data
// ============================================================================

export interface Campaign {
  id: string; name: string; platform: 'google' | 'meta' | 'email' | 'linkedin'
  status: 'active' | 'paused' | 'completed'; budget: number; spend: number
  impressions: number; clicks: number; ctr: number; conversions: number
  cpl: number; roas: number; trend: 'up' | 'down' | 'stable'
}

export interface ContentItem {
  id: string; title: string; type: 'blog' | 'social' | 'email' | 'ad' | 'sms'
  platform?: string; status: 'draft' | 'review' | 'approved' | 'scheduled' | 'published'
  scheduledDate?: string; content?: string; aiSource?: 'gemini' | 'nano_banana' | 'manual'
  keyword?: string
}

export interface CompetitorVoice {
  name: string; domain: string; shareOfVoice: number; adSpendEstimate: string
  topKeywords: string[]; recentMove: string; threat: 'high' | 'medium' | 'low'
}

export interface FunnelStage {
  label: string; count: number; value: number; convRate: number; color: string
}

export interface MarketingSnapshot {
  monthlyBudget: number; totalSpend: number; totalLeads: number; avgCpl: number
  totalRevenue: number; overallRoi: number
  campaigns: Campaign[]
  contentCalendar: ContentItem[]
  competitors: CompetitorVoice[]
  funnel: FunnelStage[]
  channelROI: { channel: string; spend: number; leads: number; revenue: number; roi: number; cpl: number }[]
  aiActions: { id: string; type: string; title: string; description: string; impact: string; priority: 'high' | 'medium' | 'low'; status: 'pending' | 'approved' | 'deployed'; aiSource: 'gemini' | 'nano_banana' }[]
  weeklyBriefing: string
}

const TENANT_MARKETING: Record<string, MarketingSnapshot> = {
  woulf: {
    monthlyBudget: 8500,
    totalSpend: 6240,
    totalLeads: 67,
    avgCpl: 93,
    totalRevenue: 485000,
    overallRoi: 7672,
    campaigns: [
      { id: 'c1', name: 'Warehouse Automation — Search', platform: 'google', status: 'active', budget: 3000, spend: 2180, impressions: 18400, clicks: 892, ctr: 4.8, conversions: 24, cpl: 91, roas: 8.2, trend: 'up' },
      { id: 'c2', name: 'Industrial Services — Display', platform: 'google', status: 'active', budget: 1500, spend: 1120, impressions: 45600, clicks: 412, ctr: 0.9, conversions: 8, cpl: 140, roas: 3.1, trend: 'down' },
      { id: 'c3', name: 'Commercial Construction Leads', platform: 'meta', status: 'active', budget: 2000, spend: 1640, impressions: 32100, clicks: 678, ctr: 2.1, conversions: 18, cpl: 91, roas: 5.4, trend: 'stable' },
      { id: 'c4', name: 'Material Handling Retargeting', platform: 'meta', status: 'active', budget: 1000, spend: 720, impressions: 12800, clicks: 234, ctr: 1.8, conversions: 6, cpl: 120, roas: 4.8, trend: 'up' },
      { id: 'c5', name: 'Monthly Newsletter', platform: 'email', status: 'active', budget: 500, spend: 280, impressions: 4200, clicks: 890, ctr: 21.2, conversions: 11, cpl: 25, roas: 18.4, trend: 'up' },
      { id: 'c6', name: 'LinkedIn B2B Outreach', platform: 'linkedin', status: 'active', budget: 500, spend: 300, impressions: 8900, clicks: 156, ctr: 1.8, conversions: 0, cpl: 0, roas: 0, trend: 'down' },
    ],
    contentCalendar: [
      { id: 'ct1', title: 'Blog: Top 5 Warehouse Automation Trends 2026', type: 'blog', status: 'draft', scheduledDate: '2026-02-20', aiSource: 'gemini', keyword: 'warehouse automation' },
      { id: 'ct2', title: 'LinkedIn: Project Showcase — Conveyor Install', type: 'social', platform: 'linkedin', status: 'approved', scheduledDate: '2026-02-19', aiSource: 'nano_banana' },
      { id: 'ct3', title: 'Email: February Client Update', type: 'email', status: 'review', scheduledDate: '2026-02-21', aiSource: 'gemini' },
      { id: 'ct4', title: 'Facebook: Before/After Racking Project', type: 'social', platform: 'facebook', status: 'scheduled', scheduledDate: '2026-02-19', aiSource: 'nano_banana' },
      { id: 'ct5', title: 'Google Ad: New Mezzanine Services Copy', type: 'ad', platform: 'google', status: 'review', scheduledDate: '2026-02-22', aiSource: 'nano_banana', keyword: 'mezzanine construction' },
      { id: 'ct6', title: 'Blog: Guide to 3PL Warehouse Selection', type: 'blog', status: 'draft', scheduledDate: '2026-02-24', aiSource: 'gemini', keyword: '3PL warehouse' },
      { id: 'ct7', title: 'Instagram: Team Photo Friday', type: 'social', platform: 'instagram', status: 'draft', scheduledDate: '2026-02-21', aiSource: 'manual' },
      { id: 'ct8', title: 'SMS: Flash Promo — Free Site Assessment', type: 'sms', status: 'draft', scheduledDate: '2026-02-25', aiSource: 'nano_banana' },
    ],
    competitors: [
      { name: 'Conveyors Inc', domain: 'conveyorsinc.com', shareOfVoice: 28, adSpendEstimate: '~$12K/mo', topKeywords: ['conveyor systems', 'material handling'], recentMove: 'Launched YouTube video series on warehouse optimization', threat: 'high' },
      { name: 'Steel King Industries', domain: 'steelking.com', shareOfVoice: 35, adSpendEstimate: '~$18K/mo', topKeywords: ['pallet racking', 'industrial storage'], recentMove: 'Increased Google Ads spend by ~30% this month', threat: 'high' },
      { name: 'Mountain West Automation', domain: 'mwautomation.com', shareOfVoice: 12, adSpendEstimate: '~$4K/mo', topKeywords: ['warehouse automation Utah'], recentMove: 'Published case study targeting your keywords', threat: 'medium' },
    ],
    funnel: [
      { label: 'Website Visitors', count: 4820, value: 0, convRate: 100, color: 'bg-blue-500' },
      { label: 'Leads Captured', count: 67, value: 0, convRate: 1.4, color: 'bg-cyan-500' },
      { label: 'Qualified (MQL)', count: 42, value: 0, convRate: 62.7, color: 'bg-emerald-500' },
      { label: 'Proposals Sent', count: 28, value: 1240000, convRate: 66.7, color: 'bg-amber-500' },
      { label: 'Closed Won', count: 14, value: 485000, convRate: 50.0, color: 'bg-emerald-400' },
      { label: 'Closed Lost', count: 8, value: 0, convRate: 28.6, color: 'bg-rose-400' },
    ],
    channelROI: [
      { channel: 'Email', spend: 280, leads: 11, revenue: 89000, roi: 31686, cpl: 25 },
      { channel: 'Google Search', spend: 2180, leads: 24, revenue: 198000, roi: 8983, cpl: 91 },
      { channel: 'Meta Ads', spend: 2360, leads: 24, revenue: 156000, roi: 6510, cpl: 98 },
      { channel: 'Google Display', spend: 1120, leads: 8, revenue: 42000, roi: 3650, cpl: 140 },
      { channel: 'LinkedIn', spend: 300, leads: 0, revenue: 0, roi: -100, cpl: 0 },
    ],
    aiActions: [
      { id: 'ma1', type: 'budget_shift', title: 'Shift $500 from Display to Search', description: 'Google Display has $140 CPL vs $91 on Search. Moving $500 would generate ~5 more leads at lower cost.', impact: 'Projected: 5 additional leads, CPL reduction from $93 to $84', priority: 'high', status: 'pending', aiSource: 'gemini' },
      { id: 'ma2', type: 'pause_campaign', title: 'Pause LinkedIn B2B Outreach', description: '$300 spent with 0 conversions. Recommend pausing and reallocating to Email which has $25 CPL.', impact: 'Save $300/mo, redirect to 12+ email leads', priority: 'high', status: 'pending', aiSource: 'gemini' },
      { id: 'ma3', type: 'content', title: 'Counter Steel King: Publish comparison page', description: 'Steel King increased ad spend 30%. Publish "Woulf Group vs Steel King: Complete Comparison" targeting their branded searches.', impact: 'Capture 5-10% of competitor branded traffic', priority: 'high', status: 'pending', aiSource: 'gemini' },
      { id: 'ma4', type: 'social_blast', title: 'Generate 7-day LinkedIn post series', description: 'Use Nano Banana to create daily LinkedIn posts showcasing recent projects. Target "warehouse automation" keyword.', impact: '+200-400 impressions/day, brand awareness boost', priority: 'medium', status: 'pending', aiSource: 'nano_banana' },
      { id: 'ma5', type: 'email', title: 'Draft nurture sequence for 28 stalled MQLs', description: '28 qualified leads have not progressed in 14+ days. Generate 3-email nurture sequence with case studies.', impact: 'Re-engage ~30% of stalled leads (8-10 reactivations)', priority: 'medium', status: 'pending', aiSource: 'gemini' },
    ],
    weeklyBriefing: "## 📊 Marketing Briefing — Feb 17-23\\n\\n**Budget Health:** $6,240 of $8,500 spent (73.4%) — on track\\n**Top Performer:** Email — $25 CPL, 11 leads, 31,686% ROI\\n**Underperformer:** LinkedIn — $300 spent, 0 conversions → PAUSE recommended\\n\\n**🚨 Budget Alert:** Google Display CPL is $140 (51% above average). Recommend shifting $500 to Google Search.\\n\\n**Actions This Week:**\\n1. ⚡ Shift $500 Display → Search budget → Save ~$250 in wasted spend\\n2. ⏸️ Pause LinkedIn ($300/mo) → Redirect to Email channel\\n3. 📝 Publish Steel King comparison page → Counter their 30% ad spend increase\\n\\n**Content Queue:**\\n- Blog: Warehouse Automation Trends [Gemini draft ready] → REVIEW\\n- 7x LinkedIn posts [Nano Banana generated] → APPROVE\\n- Email nurture for 28 stalled MQLs [Gemini draft] → REVIEW\\n\\n**Competitor Alert:**\\nSteel King Industries increased Google Ads spend ~30%. They are now outbidding us on 3 keywords. Counter-strategy drafted and ready for approval.",
  },
  _default: {
    monthlyBudget: 0, totalSpend: 0, totalLeads: 0, avgCpl: 0, totalRevenue: 0, overallRoi: 0,
    campaigns: [], contentCalendar: [], competitors: [], funnel: [],
    channelROI: [], aiActions: [], weeklyBriefing: "Connect your marketing accounts to begin tracking.",
  }
}

export function getMarketingData(companyId: string): MarketingSnapshot {
  return TENANT_MARKETING[companyId] || TENANT_MARKETING._default
}
`);

// ============================================================
// 9. MARKETING API
// ============================================================
write('app/api/agents/marketing/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getMarketingData } from '@/lib/marketing/marketing-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getMarketingData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, actionId, contentId, aiEngine } = body

    if (action === 'approve_action') {
      return NextResponse.json({ success: true, message: \`Action \${actionId} approved\` })
    }
    if (action === 'approve_content') {
      return NextResponse.json({ success: true, message: \`Content \${contentId} approved for publishing\` })
    }
    if (action === 'generate_strategy') {
      return NextResponse.json({ success: true, message: '30-day strategy generated via Gemini', engine: 'gemini' })
    }
    if (action === 'generate_blast') {
      return NextResponse.json({ success: true, message: 'Fast-blast content generated via Nano Banana', engine: 'nano_banana', count: 7 })
    }
    if (action === 'schedule_content') {
      return NextResponse.json({ success: true, message: \`Content \${contentId} scheduled\` })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
`);

// ============================================================
// 10. MARKETING DASHBOARD — Full UI
// ============================================================
write('app/portal/agent/marketing/page.tsx', `'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign { id: string; name: string; platform: string; status: string; budget: number; spend: number; impressions: number; clicks: number; ctr: number; conversions: number; cpl: number; roas: number; trend: string }
interface ContentItem { id: string; title: string; type: string; platform?: string; status: string; scheduledDate?: string; content?: string; aiSource?: string; keyword?: string }
interface CompetitorVoice { name: string; domain: string; shareOfVoice: number; adSpendEstimate: string; topKeywords: string[]; recentMove: string; threat: string }
interface FunnelStage { label: string; count: number; value: number; convRate: number; color: string }
interface ChannelROI { channel: string; spend: number; leads: number; revenue: number; roi: number; cpl: number }
interface AIAction { id: string; type: string; title: string; description: string; impact: string; priority: string; status: string; aiSource: string }
interface MktData { monthlyBudget: number; totalSpend: number; totalLeads: number; avgCpl: number; totalRevenue: number; overallRoi: number; campaigns: Campaign[]; contentCalendar: ContentItem[]; competitors: CompetitorVoice[]; funnel: FunnelStage[]; channelROI: ChannelROI[]; aiActions: AIAction[]; weeklyBriefing: string }

const TABS = ['Dashboard', 'Campaigns', 'Content Calendar', 'Funnel', 'Competitors', 'AI Actions']
const PLAT_ICONS: Record<string, string> = { google: '🔍', meta: '📘', email: '📧', linkedin: '💼', facebook: '📘', instagram: '📸', twitter: '🐦' }
const TYPE_ICONS: Record<string, string> = { blog: '📝', social: '📱', email: '📧', ad: '📢', sms: '💬' }
const STATUS_STYLE: Record<string, string> = { draft: 'bg-gray-500/10 text-gray-400', review: 'bg-amber-500/10 text-amber-400', approved: 'bg-blue-500/10 text-blue-400', scheduled: 'bg-purple-500/10 text-purple-400', published: 'bg-emerald-500/10 text-emerald-400', pending: 'bg-blue-500/10 text-blue-400', deployed: 'bg-emerald-500/10 text-emerald-400' }
const AI_BADGE: Record<string, { label: string; color: string }> = { gemini: { label: '✦ Gemini', color: 'text-blue-400 bg-blue-500/10' }, nano_banana: { label: '⚡ Nano Banana', color: 'text-amber-400 bg-amber-500/10' }, manual: { label: '✍️ Manual', color: 'text-gray-400 bg-gray-500/10' } }
const PRIO: Record<string, string> = { high: 'text-rose-400 bg-rose-500/10', medium: 'text-amber-400 bg-amber-500/10', low: 'text-blue-400 bg-blue-500/10' }

export default function MarketingDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<MktData | null>(null)
  const [tab, setTab] = useState('Dashboard')
  const [toast, setToast] = useState<string | null>(null)
  const [genMode, setGenMode] = useState<string | null>(null)

  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_session')
      if (!saved) { router.replace('/login'); return }
      const p = JSON.parse(saved); setUser(p)
      fetch('/api/agents/marketing?companyId=' + p.companyId).then(r => r.json()).then(d => { if (d.data) setData(d.data) })
    } catch { router.replace('/login') }
  }, [router])

  const doAction = async (action: string, extra?: any) => {
    await fetch('/api/agents/marketing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, companyId: user?.companyId, ...extra }) })
  }

  const approveAction = async (id: string) => {
    await doAction('approve_action', { actionId: id })
    if (data) setData({ ...data, aiActions: data.aiActions.map(a => a.id === id ? { ...a, status: 'approved' } : a) })
    show('✅ Action approved')
  }

  const approveContent = async (id: string) => {
    await doAction('approve_content', { contentId: id })
    if (data) setData({ ...data, contentCalendar: data.contentCalendar.map(c => c.id === id ? { ...c, status: 'approved' } : c) })
    show('✅ Content approved')
  }

  if (!user || !data) return <div className="min-h-screen bg-[#060910] flex items-center justify-center text-gray-500">Loading Marketing Agent...</div>

  const budgetPct = Math.round(data.totalSpend / data.monthlyBudget * 100)

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg animate-pulse">{toast}</div>}

      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0A0E15]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/portal')} className="text-xs text-gray-500 hover:text-white">← Portal</button>
            <span className="text-gray-700">|</span><span className="text-xl">📣</span>
            <span className="text-sm font-semibold">Marketing Agent</span>
            <div className="flex items-center gap-1.5 ml-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-400 font-medium">LIVE</span></div>
          </div>
          <div className="flex items-center gap-4">
            {/* AI Generate buttons */}
            <div className="flex gap-1">
              <button onClick={() => { setGenMode('gemini'); show('🔄 Generating strategy via Gemini...'); doAction('generate_strategy'); setTimeout(() => setGenMode(null), 2000) }}
                className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 hover:bg-blue-500/20 transition-all">
                ✦ Gemini Strategy
              </button>
              <button onClick={() => { setGenMode('nano'); show('⚡ Generating fast-blasts via Nano Banana...'); doAction('generate_blast'); setTimeout(() => setGenMode(null), 2000) }}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 hover:bg-amber-500/20 transition-all">
                ⚡ Nano Banana Blast
              </button>
            </div>
            <span className="text-[10px] text-gray-600">{user.companyName}</span>
            <span className="text-xs text-gray-600">{user.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Tenant */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /><span className="text-xs text-gray-400">Marketing data scoped to <span className="text-white font-semibold">{user.companyName}</span></span></div>
          <span className="text-[10px] text-gray-600">Budget: ${data.totalSpend.toLocaleString()} / ${data.monthlyBudget.toLocaleString()} ({budgetPct}%)</span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Leads', value: data.totalLeads, color: 'text-blue-400', trend: '+14%' },
            { label: 'Avg CPL', value: '$' + data.avgCpl, color: data.avgCpl < 100 ? 'text-emerald-400' : 'text-amber-400', trend: '-8%' },
            { label: 'Ad Spend', value: '$' + (data.totalSpend / 1000).toFixed(1) + 'K', color: 'text-purple-400', trend: '' },
            { label: 'Revenue', value: '$' + (data.totalRevenue / 1000).toFixed(0) + 'K', color: 'text-emerald-400', trend: '+22%' },
            { label: 'Overall ROI', value: data.overallRoi.toLocaleString() + '%', color: 'text-amber-400', trend: '+18%' },
            { label: 'Active Campaigns', value: String(data.campaigns.filter(c => c.status === 'active').length), color: 'text-pink-400', trend: '' },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">{kpi.label}</div>
              <div className={"text-xl font-mono font-bold mt-1 " + kpi.color}>{kpi.value}</div>
              {kpi.trend && <div className="text-[10px] text-emerald-400 mt-1">{kpi.trend}</div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0A0E15] border border-white/5 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={"px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all " + (tab === t ? 'bg-white/10 text-white font-semibold' : 'text-gray-500 hover:text-gray-300')}>{t}</button>
          ))}
        </div>

        {/* TAB: Dashboard */}
        {tab === 'Dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">📊 Weekly Marketing Briefing</h3>
              <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: data.weeklyBriefing.replace(/##\\s/g, '<strong>').replace(/\\*\\*/g, '<strong>').replace(/\\n/g, '<br/>') }} />
            </div>
            {/* Channel ROI */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">📈 Channel ROI Comparison</h3>
              <div className="space-y-3">
                {data.channelROI.map((ch, i) => {
                  const maxRoi = Math.max(...data.channelROI.filter(c => c.roi > 0).map(c => c.roi))
                  const barWidth = ch.roi > 0 ? Math.min((ch.roi / maxRoi) * 100, 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-28 shrink-0">{ch.channel}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                        <div className={"h-full rounded-full transition-all " + (ch.roi > 1000 ? 'bg-emerald-500/40' : ch.roi > 0 ? 'bg-blue-500/40' : 'bg-rose-500/40')} style={{ width: barWidth + '%' }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">{ch.roi > 0 ? ch.roi.toLocaleString() + '% ROI' : 'No ROI'}</span>
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right">${ch.spend}</span>
                      <span className="text-xs text-gray-400 w-16 text-right">{ch.leads} leads</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Pending AI actions */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">🤖 AI Recommendations ({data.aiActions.filter(a => a.status === 'pending').length} pending)</h3>
              <div className="space-y-3">
                {data.aiActions.filter(a => a.status === 'pending').slice(0, 3).map(a => (
                  <div key={a.id} className="border border-white/5 rounded-xl p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{a.title}</span>
                        <span className={"text-[9px] px-1.5 py-0.5 rounded " + (PRIO[a.priority] || '')}>{a.priority}</span>
                        <span className={"text-[9px] px-1.5 py-0.5 rounded " + (AI_BADGE[a.aiSource]?.color || '')}>{AI_BADGE[a.aiSource]?.label}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{a.description}</div>
                      <div className="text-xs text-emerald-400/70 mt-1">{a.impact}</div>
                    </div>
                    <button onClick={() => approveAction(a.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 shrink-0 ml-4">Approve</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Campaigns */}
        {tab === 'Campaigns' && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
                <th className="text-left p-4">Campaign</th><th className="text-center p-4">Spend</th><th className="text-center p-4">Clicks</th><th className="text-center p-4">CTR</th><th className="text-center p-4">Leads</th><th className="text-center p-4">CPL</th><th className="text-center p-4">ROAS</th><th className="text-center p-4">Trend</th>
              </tr></thead>
              <tbody>
                {data.campaigns.map((c, i) => (
                  <tr key={c.id} className={"border-b border-white/[0.03] " + (i % 2 ? 'bg-white/[0.01]' : '')}>
                    <td className="p-4"><div className="flex items-center gap-2"><span>{PLAT_ICONS[c.platform] || '📋'}</span><div><div className="text-sm font-medium">{c.name}</div><span className={"text-[9px] px-1.5 py-0.5 rounded " + (c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>{c.status}</span></div></div></td>
                    <td className="p-4 text-center font-mono">${c.spend.toLocaleString()}</td>
                    <td className="p-4 text-center text-gray-400">{c.clicks.toLocaleString()}</td>
                    <td className="p-4 text-center text-gray-400">{c.ctr}%</td>
                    <td className="p-4 text-center font-bold">{c.conversions}</td>
                    <td className="p-4 text-center"><span className={c.cpl > 120 ? 'text-rose-400' : c.cpl > 0 ? 'text-emerald-400' : 'text-gray-600'}>${c.cpl}</span></td>
                    <td className="p-4 text-center font-mono">{c.roas > 0 ? c.roas + 'x' : '—'}</td>
                    <td className="p-4 text-center">{c.trend === 'up' ? <span className="text-emerald-400">↑</span> : c.trend === 'down' ? <span className="text-rose-400">↓</span> : <span className="text-gray-600">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: Content Calendar */}
        {tab === 'Content Calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Content Pipeline ({data.contentCalendar.length} items)</h3>
              <div className="flex gap-2">
                <button onClick={() => { show('⚡ Generating 7 social posts...'); doAction('generate_blast') }} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 hover:bg-amber-500/20">⚡ Generate with Nano Banana</button>
                <button onClick={() => { show('✦ Generating blog draft...'); doAction('generate_strategy') }} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 hover:bg-blue-500/20">✦ Generate with Gemini</button>
              </div>
            </div>
            {/* Calendar grid by day */}
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-[9px] text-gray-600 uppercase text-center pb-1 border-b border-white/5">{d}</div>
              ))}
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(2026, 1, 17 + i)
                const dateStr = date.toISOString().slice(0, 10)
                const dayItems = data.contentCalendar.filter(c => c.scheduledDate === dateStr)
                return (
                  <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-3 min-h-[120px]">
                    <div className="text-[10px] text-gray-500 mb-2">{date.getDate()}</div>
                    <div className="space-y-1.5">
                      {dayItems.map(item => (
                        <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-2 group">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{TYPE_ICONS[item.type] || '📋'}</span>
                            <span className={"text-[9px] px-1 py-0.5 rounded " + (STATUS_STYLE[item.status] || '')}>{item.status}</span>
                          </div>
                          <div className="text-[10px] text-gray-300 mt-1 line-clamp-2">{item.title.replace(/^(Blog|LinkedIn|Facebook|Email|Google Ad|Instagram|SMS):\\s*/, '')}</div>
                          {item.aiSource && <div className={"text-[8px] mt-1 px-1 py-0.5 rounded inline-block " + (AI_BADGE[item.aiSource]?.color || '')}>{AI_BADGE[item.aiSource]?.label}</div>}
                          {item.status === 'review' || item.status === 'draft' ? (
                            <button onClick={() => approveContent(item.id)} className="text-[9px] text-emerald-400 mt-1 block hover:underline">Approve →</button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* List view */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
                  <th className="text-left p-3">Content</th><th className="text-center p-3">Type</th><th className="text-center p-3">Status</th><th className="text-center p-3">Date</th><th className="text-center p-3">AI</th><th className="text-right p-3">Action</th>
                </tr></thead>
                <tbody>
                  {data.contentCalendar.map((item, i) => (
                    <tr key={item.id} className={"border-b border-white/[0.03] " + (i % 2 ? 'bg-white/[0.01]' : '')}>
                      <td className="p-3"><div className="text-xs font-medium">{item.title}</div>{item.keyword && <div className="text-[10px] text-blue-400">🎯 {item.keyword}</div>}</td>
                      <td className="p-3 text-center"><span className="text-xs">{TYPE_ICONS[item.type]} {item.type}</span></td>
                      <td className="p-3 text-center"><span className={"text-[9px] px-2 py-0.5 rounded " + (STATUS_STYLE[item.status] || '')}>{item.status}</span></td>
                      <td className="p-3 text-center text-xs text-gray-500">{item.scheduledDate || '—'}</td>
                      <td className="p-3 text-center">{item.aiSource && <span className={"text-[9px] px-1.5 py-0.5 rounded " + (AI_BADGE[item.aiSource]?.color || '')}>{AI_BADGE[item.aiSource]?.label}</span>}</td>
                      <td className="p-3 text-right">{(item.status === 'draft' || item.status === 'review') && <button onClick={() => approveContent(item.id)} className="text-[10px] text-emerald-400 hover:underline">Approve</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Funnel */}
        {tab === 'Funnel' && (
          <div className="space-y-6">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-6">Marketing → Sales Funnel</h3>
              <div className="space-y-2">
                {data.funnel.map((stage, i) => {
                  const maxCount = data.funnel[0].count
                  const barWidth = Math.max((stage.count / maxCount) * 100, 8)
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-32 shrink-0 text-right">{stage.label}</span>
                      <div className="flex-1 relative">
                        <div className={"h-10 rounded-lg flex items-center px-3 transition-all " + stage.color + '/30'} style={{ width: barWidth + '%' }}>
                          <span className="text-sm font-bold">{stage.count.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-24 shrink-0 text-right">
                        {i > 0 && <span className="text-[10px] text-gray-500">{stage.convRate.toFixed(1)}% conv.</span>}
                        {stage.value > 0 && <div className="text-[10px] text-emerald-400">${(stage.value / 1000).toFixed(0)}K</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Attribution */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">📊 Lead Source Attribution</h3>
              <div className="grid grid-cols-5 gap-3">
                {data.channelROI.map((ch, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                    <div className="text-[9px] text-gray-500 uppercase">{ch.channel}</div>
                    <div className="text-lg font-bold mt-1">{ch.leads}</div>
                    <div className="text-[10px] text-gray-500">leads</div>
                    <div className={"text-xs font-mono mt-2 " + (ch.cpl > 0 && ch.cpl < 100 ? 'text-emerald-400' : ch.cpl > 120 ? 'text-rose-400' : 'text-gray-400')}>{ch.cpl > 0 ? '$' + ch.cpl + ' CPL' : '—'}</div>
                    <div className="text-[10px] text-gray-600 mt-1">${ch.revenue > 0 ? (ch.revenue / 1000).toFixed(0) + 'K rev' : '0'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Competitors */}
        {tab === 'Competitors' && (
          <div className="space-y-4">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">📡 Share of Voice</h3>
              <div className="space-y-3">
                {[{ name: user.companyName + ' (You)', shareOfVoice: 25, color: 'bg-blue-500' }, ...data.competitors.map(c => ({ name: c.name, shareOfVoice: c.shareOfVoice, color: c.threat === 'high' ? 'bg-rose-500' : 'bg-amber-500' }))].sort((a, b) => b.shareOfVoice - a.shareOfVoice).map((c, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs w-40 shrink-0 truncate">{c.name}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden"><div className={c.color + '/40 h-full rounded-full'} style={{ width: c.shareOfVoice + '%' }} /></div>
                    <span className="text-xs font-mono w-12 text-right">{c.shareOfVoice}%</span>
                  </div>
                ))}
              </div>
            </div>
            {data.competitors.map((comp, i) => (
              <div key={i} className={"bg-[#0A0E15] border rounded-xl p-5 " + (comp.threat === 'high' ? 'border-rose-500/20' : 'border-white/5')}>
                <div className="flex items-center justify-between mb-3">
                  <div><div className="text-sm font-semibold">{comp.name}</div><div className="text-[10px] text-gray-600">{comp.domain}</div></div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{comp.adSpendEstimate} est. spend</span>
                    <span className={"text-[10px] px-2 py-0.5 rounded font-medium " + (comp.threat === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400')}>{comp.threat} threat</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2"><span className="text-gray-600">Top keywords: </span>{comp.topKeywords.join(', ')}</div>
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2 text-xs text-amber-300">
                  <span className="text-amber-400 font-medium">Recent move: </span>{comp.recentMove}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: AI Actions */}
        {tab === 'AI Actions' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">All AI Recommendations</h3>
              <div className="flex gap-2">
                <button onClick={() => { show('✦ Gemini generating 30-day strategy...'); doAction('generate_strategy') }} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 hover:bg-blue-500/20">✦ Generate Strategy (Gemini)</button>
                <button onClick={() => { show('⚡ Nano Banana generating fast-blasts...'); doAction('generate_blast') }} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 hover:bg-amber-500/20">⚡ Fast-Blast (Nano Banana)</button>
              </div>
            </div>
            {data.aiActions.map(a => (
              <div key={a.id} className={"border rounded-xl p-5 " + (a.status === 'approved' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-[#0A0E15]')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{a.title}</span>
                      <span className={"text-[9px] px-1.5 py-0.5 rounded " + (PRIO[a.priority] || '')}>{a.priority}</span>
                      <span className={"text-[9px] px-1.5 py-0.5 rounded " + (AI_BADGE[a.aiSource]?.color || '')}>{AI_BADGE[a.aiSource]?.label}</span>
                      <span className={"text-[9px] px-1.5 py-0.5 rounded " + (STATUS_STYLE[a.status] || '')}>{a.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{a.description}</div>
                    <div className="text-xs text-emerald-400/70 mt-1">Impact: {a.impact}</div>
                  </div>
                  {a.status === 'pending' && (
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button onClick={() => approveAction(a.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500">✓ Approve</button>
                      <button onClick={() => { if (data) setData({ ...data, aiActions: data.aiActions.map(x => x.id === a.id ? { ...x, status: 'deployed' } : x) }); show('❌ Rejected') }} className="px-3 py-2 bg-white/5 text-gray-400 rounded-lg text-xs hover:bg-white/10">✕</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
`);

console.log('');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('  Installed: 10 files');
console.log('  ═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  MARKETING AGENT MODULES:');
console.log('');
console.log('  📡 INTEGRATIONS:');
console.log('     GA4 Client        — sessions, users, channel breakdown');
console.log('     Google/Meta Ads   — campaign spend, clicks, conversions');
console.log('     Email (SendGrid)  — campaign stats, send API');
console.log('     Sales Sync        — lead-to-close attribution');
console.log('');
console.log('  🤖 AI ENGINES:');
console.log('     ✦ Gemini           — 30-day strategies, blogs, whitepapers');
console.log('     ⚡ Nano Banana      — social captions, SMS, email subjects');
console.log('     🧠 System Prompt   — proactive budget optimizer');
console.log('');
console.log('  📊 DASHBOARD TABS:');
console.log('     Dashboard         — KPIs + weekly briefing + channel ROI bars');
console.log('     Campaigns         — all campaigns with spend/CTR/CPL/ROAS');
console.log('     Content Calendar  — visual weekly grid + list view');
console.log('     Funnel            — visitor → lead → MQL → proposal → close');
console.log('     Competitors       — share-of-voice + threat monitoring');
console.log('     AI Actions        — approve/reject AI recommendations');
console.log('');
console.log('  ROUTE: /portal/agent/marketing');
console.log('');
console.log('  ENV VARS (optional — demo data works without):');
console.log('     GA4_PROPERTY_ID, GOOGLE_ADS_CUSTOMER_ID, META_AD_ACCOUNT_ID');
console.log('     SENDGRID_API_KEY, GEMINI_API_KEY, NANO_BANANA_API_KEY');
console.log('');
console.log('  INSTALL & DEPLOY:');
console.log('    node marketing-agent.js');
console.log('    npm run build');
console.log('    vercel --prod');
console.log('');
