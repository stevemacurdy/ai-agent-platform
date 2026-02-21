// ============================================================================
// LOCAL SERP TRACKER — Track Map Pack and organic positions via SerpApi
// ============================================================================
// Requires: SERPAPI_KEY env var
// Tracks local "Map Pack" results for geo-targeted keywords

interface SerpApiParams {
  q: string           // Search query
  location: string    // e.g. "Salt Lake City, Utah"
  zipCode?: string    // Refine location
  gl?: string         // Country (default: 'us')
  hl?: string         // Language (default: 'en')
  num?: number        // Results count (default: 10)
}

interface MapPackResult {
  position: number
  title: string
  placeId?: string
  rating?: number
  reviews?: number
  address?: string
  phone?: string
  type?: string
  thumbnail?: string
}

interface OrganicResult {
  position: number
  title: string
  link: string
  snippet: string
  domain: string
}

interface SerpResult {
  keyword: string
  location: string
  mapPack: MapPackResult[]
  organicResults: OrganicResult[]
  localPack: {
    found: boolean
    position: number | null    // Position in map pack (1-3), null if not found
    competitorCount: number
  }
  timestamp: string
}

export class SerpTracker {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Track a keyword in local search results
   */
  async trackKeyword(params: SerpApiParams): Promise<SerpResult> {
    const searchParams = new URLSearchParams({
      api_key: this.apiKey,
      engine: 'google',
      q: params.q,
      location: params.location,
      gl: params.gl || 'us',
      hl: params.hl || 'en',
      num: String(params.num || 10),
    })

    const res = await fetch(`https://serpapi.com/search?${searchParams}`)
    if (!res.ok) throw new Error(`SerpApi error: ${res.status}`)

    const data = await res.json()

    // Parse Map Pack (local_results)
    const mapPack: MapPackResult[] = (data.local_results?.places || []).map((p: any, i: number) => ({
      position: i + 1,
      title: p.title,
      placeId: p.place_id,
      rating: p.rating,
      reviews: p.reviews,
      address: p.address,
      phone: p.phone,
      type: p.type,
      thumbnail: p.thumbnail,
    }))

    // Parse organic results
    const organicResults: OrganicResult[] = (data.organic_results || []).map((r: any, i: number) => ({
      position: i + 1,
      title: r.title,
      link: r.link,
      snippet: r.snippet || '',
      domain: new URL(r.link).hostname,
    }))

    return {
      keyword: params.q,
      location: params.location,
      mapPack,
      organicResults,
      localPack: {
        found: mapPack.length > 0,
        position: null, // Will be set by caller based on their business
        competitorCount: mapPack.length,
      },
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Track multiple keywords for a business
   */
  async trackKeywordBatch(
    keywords: string[],
    location: string,
    businessName: string
  ): Promise<{ results: SerpResult[]; summary: KeywordSummary }> {
    const results: SerpResult[] = []

    for (const kw of keywords) {
      try {
        const result = await this.trackKeyword({ q: kw, location })

        // Check if business appears in map pack
        const mapMatch = result.mapPack.findIndex(
          m => m.title.toLowerCase().includes(businessName.toLowerCase())
        )
        if (mapMatch !== -1) {
          result.localPack.position = mapMatch + 1
        }

        results.push(result)

        // Rate limit: SerpApi allows ~100 searches/month on free tier
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (err) {
        console.error(`SERP tracking failed for "${kw}": ${err}`)
      }
    }

    const inMapPack = results.filter(r => r.localPack.position !== null).length
    const avgPosition = results
      .filter(r => r.localPack.position !== null)
      .reduce((sum, r) => sum + (r.localPack.position || 0), 0) / (inMapPack || 1)

    return {
      results,
      summary: {
        totalKeywords: keywords.length,
        inMapPack,
        notInMapPack: keywords.length - inMapPack,
        avgMapPackPosition: Math.round(avgPosition * 10) / 10,
        trackedAt: new Date().toISOString(),
      }
    }
  }
}

interface KeywordSummary {
  totalKeywords: number
  inMapPack: number
  notInMapPack: number
  avgMapPackPosition: number
  trackedAt: string
}

// Factory
export function createSerpTracker(): SerpTracker | null {
  const key = process.env.SERPAPI_KEY
  if (!key) return null
  return new SerpTracker(key)
}
