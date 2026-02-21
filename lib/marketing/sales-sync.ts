// ============================================================================
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
