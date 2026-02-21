// ============================================================================
// GOOGLE BUSINESS PROFILE MANAGER
// ============================================================================
// Drafts and manages Google Business Profile posts (Updates, Photos, Offers)
// Requires: GBP_ACCESS_TOKEN env var (OAuth2 token)
// API: Google My Business API v4

interface GBPPost {
  id?: string
  topicType: 'STANDARD' | 'EVENT' | 'OFFER'
  summary: string           // Post text (max 1500 chars)
  callToAction?: {
    actionType: 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP' | 'CALL'
    url?: string
  }
  media?: {
    mediaFormat: 'PHOTO' | 'VIDEO'
    sourceUrl: string       // Public URL to image/video
  }[]
  event?: {
    title: string
    schedule: {
      startDate: { year: number; month: number; day: number }
      endDate: { year: number; month: number; day: number }
    }
  }
  offer?: {
    couponCode?: string
    redeemOnlineUrl?: string
    termsConditions?: string
  }
  status: 'draft' | 'pending_approval' | 'published' | 'rejected'
  createdAt: string
  scheduledFor?: string
}

interface GBPDraftRequest {
  type: 'update' | 'photo' | 'offer' | 'event'
  topic: string             // What the post is about
  keyword?: string          // Target SEO keyword to weave in
  tone?: 'professional' | 'friendly' | 'urgent'
  callToAction?: string
  photoUrl?: string
}

export class GBPManager {
  private accountId: string
  private locationId: string
  private accessToken: string

  constructor(accountId: string, locationId: string, accessToken: string) {
    this.accountId = accountId
    this.locationId = locationId
    this.accessToken = accessToken
  }

  /**
   * Draft a Google Business update post
   * In production, this calls Claude to generate compelling copy
   */
  draftPost(request: GBPDraftRequest): GBPPost {
    const templates: Record<string, (r: GBPDraftRequest) => string> = {
      update: (r) => {
        const kw = r.keyword ? ` specializing in ${r.keyword}` : ''
        return `🔨 ${r.topic}${kw}. Our team delivers quality results on every project. Contact us today for a free estimate!\n\n#${(r.keyword || r.topic).replace(/\s+/g, '')} #LocalBusiness #QualityWork`
      },
      photo: (r) => {
        return `📸 Check out our latest ${r.topic} project!${r.keyword ? ` This ${r.keyword} work showcases our commitment to excellence.` : ''} What do you think?\n\nGet your free quote today! 📞`
      },
      offer: (r) => {
        return `🎉 Special Offer: ${r.topic}!${r.keyword ? ` Book your ${r.keyword} project now.` : ''} Limited time only — contact us to claim this deal before it expires!\n\n📞 Call now or visit our website.`
      },
      event: (r) => {
        return `📅 Join us for ${r.topic}!${r.keyword ? ` Learn about ${r.keyword} and more.` : ''} We look forward to seeing you there!\n\nRSVP today!`
      },
    }

    const generator = templates[request.type] || templates.update
    const summary = generator(request)

    const post: GBPPost = {
      topicType: request.type === 'offer' ? 'OFFER' : request.type === 'event' ? 'EVENT' : 'STANDARD',
      summary: summary.slice(0, 1500),
      status: 'draft',
      createdAt: new Date().toISOString(),
    }

    if (request.callToAction) {
      post.callToAction = { actionType: 'LEARN_MORE', url: request.callToAction }
    }

    if (request.photoUrl) {
      post.media = [{ mediaFormat: 'PHOTO', sourceUrl: request.photoUrl }]
    }

    return post
  }

  /**
   * Publish a post to GBP (requires OAuth token)
   */
  async publishPost(post: GBPPost): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const res = await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/${this.accountId}/locations/${this.locationId}/localPosts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topicType: post.topicType,
            summary: post.summary,
            callToAction: post.callToAction,
            media: post.media?.map(m => ({
              mediaFormat: m.mediaFormat,
              sourceUrl: m.sourceUrl,
            })),
          }),
        }
      )

      if (!res.ok) {
        const err = await res.text()
        return { success: false, error: `GBP API error ${res.status}: ${err}` }
      }

      const data = await res.json()
      return { success: true, postId: data.name }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Generate a batch of posts for a weekly content calendar
   */
  generateWeeklyCalendar(keywords: string[], businessName: string): GBPPost[] {
    const posts: GBPPost[] = []
    const days = ['Monday', 'Wednesday', 'Friday']

    days.forEach((day, i) => {
      const kw = keywords[i % keywords.length]
      posts.push(this.draftPost({
        type: i === 1 ? 'photo' : 'update',
        topic: `${businessName} — ${kw}`,
        keyword: kw,
        tone: 'professional',
      }))
    })

    return posts
  }
}

// Factory
export function createGBPManager(): GBPManager | null {
  const token = process.env.GBP_ACCESS_TOKEN
  const accountId = process.env.GBP_ACCOUNT_ID
  const locationId = process.env.GBP_LOCATION_ID
  if (!token || !accountId || !locationId) return null
  return new GBPManager(accountId, locationId, token)
}
