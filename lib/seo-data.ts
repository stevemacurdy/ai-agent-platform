// ─── SEO Agent Data Layer ────────────────────────────────
// Keyword rankings, technical SEO health, backlink profile,
// content gap analysis, and optimization recommendations.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Types ──────────────────────────────────────────────

export interface KeywordRanking {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number;
  change: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  estimatedTraffic: number;
}

export interface TechnicalIssue {
  id: string;
  type: 'error' | 'warning' | 'notice';
  category: string;
  description: string;
  affectedPages: number;
  impact: 'high' | 'medium' | 'low';
  fix: string;
}

export interface BacklinkProfile {
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority: number;
  newBacklinks30d: number;
  lostBacklinks30d: number;
  topReferrers: { domain: string; authority: number; links: number }[];
}

export interface ContentGap {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competitorRanking: number;
  competitorUrl: string;
  opportunity: 'high' | 'medium' | 'low';
  suggestedContent: string;
}

export interface SEOData {
  source: 'live' | 'demo';
  keywords: KeywordRanking[];
  technical: TechnicalIssue[];
  backlinks: BacklinkProfile;
  contentGaps: ContentGap[];
  summary: {
    healthScore: number;
    totalKeywords: number;
    top10Keywords: number;
    top3Keywords: number;
    estimatedOrganicTraffic: number;
    organicTrafficChange: number;
    domainAuthority: number;
    technicalErrors: number;
    technicalWarnings: number;
    contentGapOpportunities: number;
  };
  recommendations: string[];
}

// ─── Main data fetcher ──────────────────────────────────

export async function getSEOData(companyId: string): Promise<SEOData> {
  // Future: integrate with SEMrush, Ahrefs, or Search Console API
  return getDemoSEO();
}

function getDemoSEO(): SEOData {
  const keywords: KeywordRanking[] = [
    { id: 'kw-1', keyword: 'warehouse systems integrator', position: 3, previousPosition: 5, change: 2, searchVolume: 880, difficulty: 42, url: '/services', intent: 'commercial', estimatedTraffic: 180 },
    { id: 'kw-2', keyword: 'warehouse automation company utah', position: 1, previousPosition: 1, change: 0, searchVolume: 320, difficulty: 28, url: '/', intent: 'transactional', estimatedTraffic: 195 },
    { id: 'kw-3', keyword: 'conveyor system installation', position: 8, previousPosition: 12, change: 4, searchVolume: 1200, difficulty: 55, url: '/services/conveyors', intent: 'commercial', estimatedTraffic: 85 },
    { id: 'kw-4', keyword: 'warehouse automation guide', position: 6, previousPosition: 9, change: 3, searchVolume: 2400, difficulty: 48, url: '/blog/warehouse-automation-guide', intent: 'informational', estimatedTraffic: 220 },
    { id: 'kw-5', keyword: '3PL warehouse setup', position: 11, previousPosition: 15, change: 4, searchVolume: 720, difficulty: 38, url: '/blog/3pl-warehouse-setup', intent: 'informational', estimatedTraffic: 32 },
    { id: 'kw-6', keyword: 'mezzanine installation cost', position: 4, previousPosition: 6, change: 2, searchVolume: 1600, difficulty: 35, url: '/services/mezzanines', intent: 'commercial', estimatedTraffic: 280 },
    { id: 'kw-7', keyword: 'WMS implementation services', position: 14, previousPosition: 18, change: 4, searchVolume: 590, difficulty: 52, url: '/services/wms', intent: 'transactional', estimatedTraffic: 18 },
    { id: 'kw-8', keyword: 'warehouse racking systems', position: 19, previousPosition: 22, change: 3, searchVolume: 3200, difficulty: 62, url: '/services/racking', intent: 'commercial', estimatedTraffic: 42 },
    { id: 'kw-9', keyword: 'ai warehouse management', position: 7, previousPosition: 0, change: 7, searchVolume: 1100, difficulty: 45, url: '/woulfai', intent: 'informational', estimatedTraffic: 110 },
    { id: 'kw-10', keyword: 'cold storage warehouse design', position: 5, previousPosition: 8, change: 3, searchVolume: 950, difficulty: 40, url: '/services/cold-storage', intent: 'commercial', estimatedTraffic: 145 },
    { id: 'kw-11', keyword: 'warehouse consulting firms', position: 22, previousPosition: 28, change: 6, searchVolume: 480, difficulty: 50, url: '/about', intent: 'commercial', estimatedTraffic: 8 },
    { id: 'kw-12', keyword: 'pallet racking installation', position: 9, previousPosition: 11, change: 2, searchVolume: 1800, difficulty: 44, url: '/services/racking', intent: 'transactional', estimatedTraffic: 95 },
  ];

  const technical: TechnicalIssue[] = [
    { id: 'tech-1', type: 'error', category: 'Crawlability', description: '3 pages returning 404 errors', affectedPages: 3, impact: 'high', fix: 'Set up 301 redirects for removed pages or restore content' },
    { id: 'tech-2', type: 'warning', category: 'Performance', description: 'Core Web Vitals: LCP exceeds 2.5s on 8 pages', affectedPages: 8, impact: 'high', fix: 'Optimize hero images, implement lazy loading, and reduce JavaScript bundle size' },
    { id: 'tech-3', type: 'warning', category: 'Content', description: '5 pages have duplicate meta descriptions', affectedPages: 5, impact: 'medium', fix: 'Write unique meta descriptions for each service page' },
    { id: 'tech-4', type: 'notice', category: 'Schema', description: 'Missing structured data on service pages', affectedPages: 12, impact: 'medium', fix: 'Add LocalBusiness and Service schema markup' },
    { id: 'tech-5', type: 'warning', category: 'Mobile', description: 'Touch targets too small on mobile navigation', affectedPages: 0, impact: 'medium', fix: 'Increase button/link padding to minimum 48x48px' },
    { id: 'tech-6', type: 'notice', category: 'Images', description: '14 images missing alt text', affectedPages: 6, impact: 'low', fix: 'Add descriptive alt text to all warehouse/equipment images' },
  ];

  const backlinks: BacklinkProfile = {
    totalBacklinks: 342,
    referringDomains: 87,
    domainAuthority: 38,
    newBacklinks30d: 12,
    lostBacklinks30d: 3,
    topReferrers: [
      { domain: 'mhi.org', authority: 72, links: 4 },
      { domain: 'supplychain247.com', authority: 65, links: 3 },
      { domain: 'sportsmanswarehouse.com', authority: 58, links: 2 },
      { domain: 'utahbusiness.com', authority: 52, links: 2 },
      { domain: 'cabelas.com', authority: 78, links: 1 },
    ],
  };

  const contentGaps: ContentGap[] = [
    { id: 'gap-1', keyword: 'warehouse automation ROI calculator', searchVolume: 1400, difficulty: 38, competitorRanking: 2, competitorUrl: 'conveyco.com/roi-calculator', opportunity: 'high', suggestedContent: 'Build interactive ROI calculator tool — high conversion potential' },
    { id: 'gap-2', keyword: 'how to choose a WMS', searchVolume: 2200, difficulty: 45, competitorRanking: 1, competitorUrl: 'korber.com/wms-guide', opportunity: 'high', suggestedContent: 'Long-form comparison guide: Top 10 WMS for Mid-Market (position Woulf as integration partner)' },
    { id: 'gap-3', keyword: 'warehouse layout design software', searchVolume: 1800, difficulty: 52, competitorRanking: 3, competitorUrl: 'cadmatic.com/layout', opportunity: 'medium', suggestedContent: 'Blog post: Warehouse Layout Best Practices + Free Template Download' },
    { id: 'gap-4', keyword: 'food warehouse requirements', searchVolume: 900, difficulty: 32, competitorRanking: 5, competitorUrl: 'cisco-eagle.com/food-warehouse', opportunity: 'high', suggestedContent: 'Definitive guide to food-grade warehouse compliance (pairs with cold storage services)' },
    { id: 'gap-5', keyword: 'automated sortation systems comparison', searchVolume: 650, difficulty: 48, competitorRanking: 4, competitorUrl: 'bastian.com/sortation', opportunity: 'medium', suggestedContent: 'Comparison article with vendor-neutral positioning — link to services page' },
  ];

  const top10 = keywords.filter(k => k.position <= 10).length;
  const top3 = keywords.filter(k => k.position <= 3).length;
  const totalTraffic = keywords.reduce((s, k) => s + k.estimatedTraffic, 0);

  return {
    source: 'demo',
    keywords,
    technical,
    backlinks,
    contentGaps,
    summary: {
      healthScore: 72,
      totalKeywords: keywords.length,
      top10Keywords: top10,
      top3Keywords: top3,
      estimatedOrganicTraffic: totalTraffic,
      organicTrafficChange: 18,
      domainAuthority: backlinks.domainAuthority,
      technicalErrors: technical.filter(t => t.type === 'error').length,
      technicalWarnings: technical.filter(t => t.type === 'warning').length,
      contentGapOpportunities: contentGaps.filter(g => g.opportunity === 'high').length,
    },
    recommendations: [
      '"Warehouse automation ROI calculator" has 1,400 monthly searches and low difficulty — build an interactive tool and capture leads',
      'Fix 3 broken pages returning 404s — these are losing link equity and hurting crawl budget',
      'Core Web Vitals failing on 8 pages — optimize images and JS to improve rankings across the site',
      '"AI warehouse management" jumped to position 7 — create a dedicated content cluster around this topic',
      'Add schema markup to all service pages — competitors have it, you dont',
      'Cold storage and mezzanine pages are climbing — double down with supporting content',
    ],
  };
}
