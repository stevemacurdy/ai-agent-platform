// ============================================================================
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
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
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

    if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`)
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
    const systemPrompt = `You are an elite marketing strategist. Generate a detailed 30-day marketing strategy.
RULES:
- Every recommendation must cite specific ROI data provided
- Cross-reference competitor share-of-voice to find gaps
- Prioritize channels with highest ROI first
- Include specific budget allocation percentages
- Format as a week-by-week action plan
- Be decisive and specific, not vague`

    const prompt = `Company: ${context.companyName} (${context.industry})
Monthly Budget: $${context.budget}

Current Performance:
${JSON.stringify(context.currentROI, null, 2)}

Competitor Landscape:
${JSON.stringify(context.competitorData, null, 2)}

Generate a detailed 30-day marketing strategy with:
1. Week-by-week action plan
2. Budget allocation per channel
3. Content themes and topics
4. Expected outcomes and KPIs
5. Competitive counter-moves`

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
    const systemPrompt = `You are a B2B content marketing expert. Generate high-quality ${context.type} content.
RULES:
- Naturally incorporate these keywords: ${context.keywords.join(', ')}
- Write for a professional B2B audience
- Include data points and specific examples
- Ensure content has a competitive edge against: ${(context.competitorTopics || []).join(', ')}
- Use ${context.tone} tone throughout
- Blog posts: 600-800 words. Whitepapers: 1500-2000 words. Case studies: 800-1200 words.`

    const result = await this.generate({
      prompt: `Write a ${context.type} about: ${context.topic}\nFor: ${context.companyName}\nKeywords: ${context.keywords.join(', ')}`,
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
