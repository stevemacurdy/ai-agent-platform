// ============================================================================
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
    weeklyBriefing: "## 📊 Marketing Briefing — Feb 17-23\n\n**Budget Health:** $6,240 of $8,500 spent (73.4%) — on track\n**Top Performer:** Email — $25 CPL, 11 leads, 31,686% ROI\n**Underperformer:** LinkedIn — $300 spent, 0 conversions → PAUSE recommended\n\n**🚨 Budget Alert:** Google Display CPL is $140 (51% above average). Recommend shifting $500 to Google Search.\n\n**Actions This Week:**\n1. ⚡ Shift $500 Display → Search budget → Save ~$250 in wasted spend\n2. ⏸️ Pause LinkedIn ($300/mo) → Redirect to Email channel\n3. 📝 Publish Steel King comparison page → Counter their 30% ad spend increase\n\n**Content Queue:**\n- Blog: Warehouse Automation Trends [Gemini draft ready] → REVIEW\n- 7x LinkedIn posts [Nano Banana generated] → APPROVE\n- Email nurture for 28 stalled MQLs [Gemini draft] → REVIEW\n\n**Competitor Alert:**\nSteel King Industries increased Google Ads spend ~30%. They are now outbidding us on 3 keywords. Counter-strategy drafted and ready for approval.",
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
