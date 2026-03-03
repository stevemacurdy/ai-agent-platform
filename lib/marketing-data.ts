// ─── Marketing Agent Data Layer ──────────────────────────
// Campaign performance, content analytics, lead generation,
// and channel ROI tracking.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getMarketingConnection(companyId: string): Promise<string | null> {
  try {
    const sb = supabaseAdmin();
    const { data } = await (sb as any)
      .from('integration_connections')
      .select('connection_id')
      .eq('company_id', companyId)
      .eq('category', 'marketing')
      .eq('status', 'active')
      .single();
    return data?.connection_id || null;
  } catch {
    return null;
  }
}

// ─── Types ──────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  leads: number;
  costPerLead: number;
  conversions: number;
  revenue: number;
  roi: number;
  startDate: string;
  endDate: string | null;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

export interface ContentMetric {
  id: string;
  title: string;
  type: 'blog' | 'case-study' | 'whitepaper' | 'video' | 'webinar' | 'social';
  publishDate: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  leadsGenerated: number;
  conversionRate: number;
  topKeyword: string;
}

export interface ChannelPerformance {
  channel: string;
  visitors: number;
  leads: number;
  conversionRate: number;
  costPerLead: number;
  revenue: number;
  roi: number;
  trend: 'up' | 'down' | 'flat';
}

export interface MarketingData {
  source: 'live' | 'demo';
  provider?: string;
  campaigns: Campaign[];
  content: ContentMetric[];
  channels: ChannelPerformance[];
  summary: {
    totalBudget: number;
    totalSpent: number;
    totalLeads: number;
    avgCostPerLead: number;
    totalRevenue: number;
    overallROI: number;
    topChannel: string;
    websiteVisitors: number;
    conversionRate: number;
    activeCampaigns: number;
  };
  recommendations: string[];
}

// ─── Main data fetcher ──────────────────────────────────

export async function getMarketingData(companyId: string): Promise<MarketingData> {
  const connId = await getMarketingConnection(companyId);
  if (connId) { /* Future: live marketing platform data */ }
  return getDemoMarketing();
}

function getDemoMarketing(): MarketingData {
  const campaigns: Campaign[] = [
    { id: 'camp-1', name: 'Warehouse Automation Guide — Google Ads', channel: 'Paid Search', status: 'active', budget: 5000, spent: 3200, leads: 24, costPerLead: 133, conversions: 3, revenue: 45000, roi: 1306, startDate: '2026-01-15', endDate: null, performance: 'excellent' },
    { id: 'camp-2', name: 'MODEX 2026 Follow-Up Sequence', channel: 'Email', status: 'active', budget: 500, spent: 200, leads: 18, costPerLead: 11, conversions: 2, revenue: 28000, roi: 13900, startDate: '2026-02-20', endDate: '2026-03-20', performance: 'excellent' },
    { id: 'camp-3', name: '3PL Growth Playbook — LinkedIn Ads', channel: 'Social', status: 'active', budget: 3000, spent: 2100, leads: 12, costPerLead: 175, conversions: 1, revenue: 15000, roi: 614, startDate: '2026-02-01', endDate: null, performance: 'good' },
    { id: 'camp-4', name: 'Cold Storage Solutions — Content Syndication', channel: 'Content', status: 'paused', budget: 2000, spent: 1800, leads: 6, costPerLead: 300, conversions: 0, revenue: 0, roi: -100, startDate: '2026-01-01', endDate: '2026-02-15', performance: 'poor' },
    { id: 'camp-5', name: 'WoulfAI Product Launch — Multi-Channel', channel: 'Multi-Channel', status: 'draft', budget: 8000, spent: 0, leads: 0, costPerLead: 0, conversions: 0, revenue: 0, roi: 0, startDate: '2026-03-15', endDate: null, performance: 'average' },
    { id: 'camp-6', name: 'Sportsman Warehouse Case Study Retargeting', channel: 'Display', status: 'completed', budget: 1500, spent: 1500, leads: 9, costPerLead: 167, conversions: 1, revenue: 12000, roi: 700, startDate: '2025-12-01', endDate: '2026-01-31', performance: 'good' },
  ];

  const content: ContentMetric[] = [
    { id: 'cnt-1', title: 'The Complete Guide to Warehouse Automation in 2026', type: 'blog', publishDate: '2026-02-10', views: 4200, uniqueVisitors: 3100, avgTimeOnPage: 285, bounceRate: 42, leadsGenerated: 14, conversionRate: 0.45, topKeyword: 'warehouse automation guide' },
    { id: 'cnt-2', title: 'How Cabelas Cut Fulfillment Time by 40%', type: 'case-study', publishDate: '2026-01-20', views: 1800, uniqueVisitors: 1400, avgTimeOnPage: 340, bounceRate: 28, leadsGenerated: 11, conversionRate: 0.79, topKeyword: 'warehouse case study' },
    { id: 'cnt-3', title: '5 Signs Your 3PL Needs a WMS Upgrade', type: 'blog', publishDate: '2026-02-25', views: 2100, uniqueVisitors: 1700, avgTimeOnPage: 195, bounceRate: 55, leadsGenerated: 6, conversionRate: 0.35, topKeyword: '3PL WMS upgrade' },
    { id: 'cnt-4', title: 'ROI Calculator: Warehouse Automation', type: 'whitepaper', publishDate: '2026-01-05', views: 900, uniqueVisitors: 750, avgTimeOnPage: 420, bounceRate: 22, leadsGenerated: 18, conversionRate: 2.4, topKeyword: 'warehouse automation ROI' },
    { id: 'cnt-5', title: 'Live Demo: WoulfAI Platform Walkthrough', type: 'webinar', publishDate: '2026-02-15', views: 320, uniqueVisitors: 280, avgTimeOnPage: 1800, bounceRate: 15, leadsGenerated: 22, conversionRate: 7.9, topKeyword: 'WoulfAI demo' },
  ];

  const channels: ChannelPerformance[] = [
    { channel: 'Organic Search', visitors: 8500, leads: 32, conversionRate: 0.38, costPerLead: 0, revenue: 65000, roi: 9999, trend: 'up' },
    { channel: 'Paid Search', visitors: 2400, leads: 24, conversionRate: 1.0, costPerLead: 133, revenue: 45000, roi: 1306, trend: 'up' },
    { channel: 'Email', visitors: 1200, leads: 18, conversionRate: 1.5, costPerLead: 11, revenue: 28000, roi: 13900, trend: 'flat' },
    { channel: 'LinkedIn', visitors: 1800, leads: 12, conversionRate: 0.67, costPerLead: 175, revenue: 15000, roi: 614, trend: 'up' },
    { channel: 'Referral', visitors: 600, leads: 8, conversionRate: 1.33, costPerLead: 0, revenue: 42000, roi: 9999, trend: 'flat' },
    { channel: 'Direct', visitors: 3200, leads: 5, conversionRate: 0.16, costPerLead: 0, revenue: 8000, roi: 9999, trend: 'down' },
  ];

  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

  return {
    source: 'demo',
    campaigns,
    content,
    channels,
    summary: {
      totalBudget: campaigns.reduce((s, c) => s + c.budget, 0),
      totalSpent,
      totalLeads,
      avgCostPerLead: totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0,
      totalRevenue,
      overallROI: totalSpent > 0 ? Math.round(((totalRevenue - totalSpent) / totalSpent) * 100) : 0,
      topChannel: 'Email',
      websiteVisitors: channels.reduce((s, c) => s + c.visitors, 0),
      conversionRate: 0.56,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    },
    recommendations: [
      'Email campaigns have 13,900% ROI — double down on MODEX follow-up sequence and build similar nurture flows',
      'Content syndication campaign is underperforming (0 conversions) — pause spend and reallocate to paid search',
      'ROI Calculator whitepaper has 2.4% conversion rate — gate it behind a form and promote on LinkedIn',
      'Webinar had highest per-attendee conversion — schedule monthly product demos',
      'Organic search traffic is growing — invest in SEO content around "warehouse automation" keywords',
    ],
  };
}
