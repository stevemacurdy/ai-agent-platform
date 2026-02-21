// ============================================================================
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
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
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
        'Authorization': `Bearer ${this.apiKey}`,
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
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
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
