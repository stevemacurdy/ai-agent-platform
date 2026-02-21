// ============================================================================
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
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
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
      `Generate ${req.type.replace(/_/g, ' ')} about: ${req.topic}`,
      req.keywords?.length ? `Keywords: ${req.keywords.join(', ')}` : '',
      req.tone ? `Tone: ${req.tone}` : '',
      req.platform ? `Platform: ${req.platform}` : '',
      req.competitorContext ? `Competitive edge needed against: ${req.competitorContext}` : '',
    ]
    return parts.filter(Boolean).join('\n')
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
            content: `Generate exactly ${count} variations of a ${req.type.replace(/_/g, ' ')} about: ${req.topic}
${req.keywords?.length ? 'Keywords: ' + req.keywords.join(', ') : ''}
${req.tone ? 'Tone: ' + req.tone : ''}
${req.platform ? 'Platform: ' + req.platform : ''}
Max ${constraints.maxChars} characters each.
${req.competitorContext ? 'Must have competitive edge against: ' + req.competitorContext : ''}
Return ONLY the variations, one per line, numbered 1-${count}. No extra text.`
          }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const lines = text.split('\n').filter((l: string) => l.trim()).map((l: string) => l.replace(/^\d+\.\s*/, '').trim())
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
