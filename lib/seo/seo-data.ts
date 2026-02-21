// ============================================================================
// SEO DATA ENGINE — Tenant-scoped demo data for SEO Agent
// ============================================================================

export interface KeywordRanking {
  keyword: string
  position: number
  prevPosition: number
  change: number
  clicks: number
  impressions: number
  ctr: number
  inMapPack: boolean
  mapPosition: number | null
  url: string
  trend: 'up' | 'down' | 'stable'
}

export interface SeoAction {
  id: string
  type: 'blog_post' | 'gbp_update' | 'meta_fix' | 'speed_fix' | 'backlink' | 'schema_markup'
  title: string
  description: string
  content?: string
  keyword?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'approved' | 'deployed' | 'rejected'
  impact: string
  createdAt: string
}

export interface CompetitorData {
  name: string
  domain: string
  avgPosition: number
  mapPackPresence: number  // % of tracked keywords in map pack
  estimatedTraffic: string
  threat: 'high' | 'medium' | 'low'
}

export interface SeoHealthSnapshot {
  avgPosition: number
  totalClicks: number
  totalImpressions: number
  avgCtr: number
  techScore: number
  pageSpeedMobile: number
  pageSpeedDesktop: number
  mapPackKeywords: number
  totalTracked: number
  gbpViews: number
  gbpActions: number
  brokenLinks: number
  keywords: KeywordRanking[]
  actions: SeoAction[]
  competitors: CompetitorData[]
  weeklyWinList: string
}

// ============================================================================
// TENANT DATA
// ============================================================================
const TENANT_SEO: Record<string, SeoHealthSnapshot> = {
  woulf: {
    avgPosition: 12.4,
    totalClicks: 847,
    totalImpressions: 23400,
    avgCtr: 3.6,
    techScore: 78,
    pageSpeedMobile: 62,
    pageSpeedDesktop: 84,
    mapPackKeywords: 4,
    totalTracked: 12,
    gbpViews: 1240,
    gbpActions: 89,
    brokenLinks: 3,
    keywords: [
      { keyword: 'warehouse automation Utah', position: 3.2, prevPosition: 5.1, change: -1.9, clicks: 124, impressions: 2100, ctr: 5.9, inMapPack: true, mapPosition: 2, url: '/services/automation', trend: 'up' },
      { keyword: 'industrial construction Salt Lake', position: 4.8, prevPosition: 4.5, change: 0.3, clicks: 98, impressions: 1800, ctr: 5.4, inMapPack: true, mapPosition: 3, url: '/services/construction', trend: 'down' },
      { keyword: 'conveyor systems installation', position: 6.1, prevPosition: 8.3, change: -2.2, clicks: 76, impressions: 1400, ctr: 5.4, inMapPack: false, mapPosition: null, url: '/services/conveyors', trend: 'up' },
      { keyword: 'warehouse design build', position: 8.7, prevPosition: 9.2, change: -0.5, clicks: 52, impressions: 1100, ctr: 4.7, inMapPack: true, mapPosition: 3, url: '/services/design-build', trend: 'up' },
      { keyword: 'material handling systems', position: 11.3, prevPosition: 10.8, change: 0.5, clicks: 41, impressions: 890, ctr: 4.6, inMapPack: false, mapPosition: null, url: '/services/material-handling', trend: 'down' },
      { keyword: 'pallet racking installation Utah', position: 5.4, prevPosition: 7.1, change: -1.7, clicks: 67, impressions: 980, ctr: 6.8, inMapPack: true, mapPosition: 1, url: '/services/racking', trend: 'up' },
      { keyword: 'dock equipment installation', position: 14.2, prevPosition: 16.5, change: -2.3, clicks: 28, impressions: 670, ctr: 4.2, inMapPack: false, mapPosition: null, url: '/services/dock-equipment', trend: 'up' },
      { keyword: 'mezzanine construction', position: 18.6, prevPosition: 22.1, change: -3.5, clicks: 19, impressions: 540, ctr: 3.5, inMapPack: false, mapPosition: null, url: '/services/mezzanines', trend: 'up' },
      { keyword: '3PL warehouse services', position: 9.8, prevPosition: 11.4, change: -1.6, clicks: 45, impressions: 760, ctr: 5.9, inMapPack: false, mapPosition: null, url: '/services/3pl', trend: 'up' },
      { keyword: 'Woulf Group', position: 1.0, prevPosition: 1.0, change: 0, clicks: 156, impressions: 320, ctr: 48.8, inMapPack: true, mapPosition: 1, url: '/', trend: 'stable' },
      { keyword: 'warehouse shelving Utah', position: 7.3, prevPosition: 9.8, change: -2.5, clicks: 38, impressions: 620, ctr: 6.1, inMapPack: false, mapPosition: null, url: '/services/shelving', trend: 'up' },
      { keyword: 'industrial automation companies', position: 21.4, prevPosition: 25.0, change: -3.6, clicks: 12, impressions: 410, ctr: 2.9, inMapPack: false, mapPosition: null, url: '/about', trend: 'up' },
    ],
    actions: [
      { id: 'a1', type: 'blog_post', title: 'Write: "Top 5 Warehouse Automation Trends for 2026"', description: 'Target keyword "warehouse automation" — currently ranking #3.2, can push to #1 with fresh content.', content: 'Draft ready — 650 words covering AI-powered picking, autonomous mobile robots, warehouse management systems, IoT sensors, and predictive maintenance. Includes 4 internal links and 2 external authority links.', keyword: 'warehouse automation', priority: 'high', status: 'pending', impact: 'Estimated +45 clicks/month, improve position from 3.2 to ~1.5', createdAt: '2026-02-17' },
      { id: 'a2', type: 'gbp_update', title: 'GBP Post: Latest Conveyor Installation Project', description: 'Photo + caption showcasing recent conveyor system install. Targets "conveyor systems installation" keyword.', content: '📸 Just completed a 200-ft conveyor system installation for a major distribution center in Salt Lake City! Our team designed and installed a custom sortation system that increased throughput by 40%. Looking for conveyor solutions? Contact Woulf Group for a free assessment! #ConveyorSystems #WarehouseAutomation #SaltLakeCity', keyword: 'conveyor systems installation', priority: 'high', status: 'pending', impact: 'Boost GBP visibility, target Map Pack for "conveyor systems"', createdAt: '2026-02-17' },
      { id: 'a3', type: 'meta_fix', title: 'Fix missing meta descriptions on 4 pages', description: '/services/dock-equipment, /services/mezzanines, /about/team, /projects/recent are missing meta descriptions.', keyword: 'various', priority: 'medium', status: 'pending', impact: 'Improve CTR by ~15% on affected pages', createdAt: '2026-02-16' },
      { id: 'a4', type: 'speed_fix', title: 'Optimize mobile page speed (62 → 80+)', description: 'Compress 12 unoptimized images, enable lazy loading, defer non-critical JS. Mobile score is 62/100.', priority: 'medium', status: 'pending', impact: 'Mobile ranking boost, improved Core Web Vitals', createdAt: '2026-02-16' },
      { id: 'a5', type: 'blog_post', title: 'Write: "How to Choose the Right Pallet Racking System"', description: 'Target "pallet racking installation Utah" — already #1 in Map Pack, reinforce with content.', keyword: 'pallet racking installation', priority: 'medium', status: 'pending', impact: 'Defend #1 Map Pack position, +30 clicks/month', createdAt: '2026-02-15' },
      { id: 'a6', type: 'schema_markup', title: 'Add LocalBusiness schema to all service pages', description: 'Missing structured data on 8 service pages. Adding schema improves rich snippet eligibility.', priority: 'low', status: 'pending', impact: 'Rich snippets in search, improved local relevance signals', createdAt: '2026-02-15' },
    ],
    competitors: [
      { name: 'Conveyors Inc', domain: 'conveyorsinc.com', avgPosition: 8.2, mapPackPresence: 42, estimatedTraffic: '~1,200/mo', threat: 'high' },
      { name: 'Steel King Industries', domain: 'steelking.com', avgPosition: 6.8, mapPackPresence: 58, estimatedTraffic: '~3,400/mo', threat: 'high' },
      { name: 'Mountain West Automation', domain: 'mwautomation.com', avgPosition: 15.4, mapPackPresence: 25, estimatedTraffic: '~450/mo', threat: 'medium' },
      { name: 'Pacific Storage', domain: 'pacificstorage.com', avgPosition: 11.1, mapPackPresence: 33, estimatedTraffic: '~890/mo', threat: 'medium' },
    ],
    weeklyWinList: "## 🏆 Weekly Win List — Feb 17-23, 2026\n\n**Quick Wins (Deploy Today):**\n1. 📝 Publish blog: \"Top 5 Warehouse Automation Trends for 2026\" — Could push \"warehouse automation Utah\" from #3.2 → #1.5 (+45 clicks/mo)\n2. 📸 Post GBP update with conveyor project photos — Boost Map Pack visibility for \"conveyor systems\"\n\n**Content Pipeline:**\n1. Draft blog: \"How to Choose the Right Pallet Racking System\" — Defend #1 Map Pack position\n2. Create comparison page: \"Woulf Group vs Competitors\" — Capture branded competitor searches\n\n**Technical Fixes:**\n1. Add meta descriptions to 4 pages — Quick CTR boost (~15%)\n2. Optimize 12 images for mobile speed — Score 62 → 80+\n\n**🚨 Competitor Alert:**\nSteel King Industries gained 2 positions for \"material handling systems\" this week. I recommend publishing targeted content and a GBP update to counter this move.",
  },
  _default: {
    avgPosition: 0, totalClicks: 0, totalImpressions: 0, avgCtr: 0,
    techScore: 0, pageSpeedMobile: 0, pageSpeedDesktop: 0,
    mapPackKeywords: 0, totalTracked: 0, gbpViews: 0, gbpActions: 0, brokenLinks: 0,
    keywords: [], actions: [], competitors: [],
    weeklyWinList: "Connect your domain to start tracking SEO performance.",
  }
}

export function getSeoData(companyId: string): SeoHealthSnapshot {
  return TENANT_SEO[companyId] || TENANT_SEO._default
}
