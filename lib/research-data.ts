// ─── Research Agent Data Layer ────────────────────────────
// Industry research, market trends, technology scouting,
// and competitive benchmarking.

import { createClient } from '@supabase/supabase-js';
function supabaseAdmin() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } }); }

export interface IndustryTrend { id: string; title: string; category: string; impact: 'high' | 'medium' | 'low'; timeframe: string; description: string; relevance: string; sources: string[]; }
export interface TechScout { id: string; technology: string; category: string; maturity: 'emerging' | 'growing' | 'mainstream' | 'declining'; adoptionRate: number; costRange: string; applicability: 'high' | 'medium' | 'low'; useCase: string; vendors: string[]; }
export interface Benchmark { metric: string; woulfValue: number; industryAvg: number; topQuartile: number; unit: string; status: 'above' | 'at' | 'below'; }
export interface ResearchData { source: 'live' | 'demo'; trends: IndustryTrend[]; techScout: TechScout[]; benchmarks: Benchmark[]; summary: { trendsTracked: number; highImpactTrends: number; technologiesMonitored: number; benchmarksAboveAvg: number; benchmarksBelowAvg: number; industryGrowthRate: number; }; recommendations: string[]; }

export async function getResearchData(companyId: string): Promise<ResearchData> { return getDemoResearch(); }

function getDemoResearch(): ResearchData {
  const trends: IndustryTrend[] = [
    { id: 'tr-1', title: 'AI-Powered Warehouse Management', category: 'Technology', impact: 'high', timeframe: '2025-2028', description: 'AI/ML integration in WMS for demand forecasting, dynamic slotting, and autonomous picking is accelerating rapidly.', relevance: 'Directly aligned with WoulfAI platform — first-mover advantage in mid-market', sources: ['Gartner Supply Chain Report 2026', 'MHI Annual Survey'] },
    { id: 'tr-2', title: 'Micro-Fulfillment Centers', category: 'Market', impact: 'high', timeframe: '2025-2030', description: 'Retailers investing in small urban warehouses for same-day delivery. Market expected to reach $10B by 2030.', relevance: 'New project category — smaller builds, faster cycles, higher margins', sources: ['McKinsey Logistics Report', 'CBRE Industrial Outlook'] },
    { id: 'tr-3', title: 'Labor Shortage in Warehousing', category: 'Workforce', impact: 'high', timeframe: 'Ongoing', description: 'Warehouse worker shortage projected at 600K unfilled positions by 2027. Driving automation investment.', relevance: 'Creates demand for automation solutions — position as solution to labor challenges', sources: ['BLS Employment Projections', 'Deloitte Workforce Study'] },
    { id: 'tr-4', title: 'Cold Chain Expansion', category: 'Market', impact: 'medium', timeframe: '2025-2028', description: 'Pharmaceutical and fresh food cold chain growing 8% YoY. Specialized equipment and compliance requirements.', relevance: 'FreshDirect project is early entry — build cold chain expertise for growing market', sources: ['Grand View Research', 'IARW Market Report'] },
    { id: 'tr-5', title: 'Sustainable Warehouse Design', category: 'Regulation', impact: 'medium', timeframe: '2026-2030', description: 'ESG mandates and energy costs driving demand for solar, LED, and energy-efficient warehouse design.', relevance: 'Add green certification and energy audit services to project offerings', sources: ['US Green Building Council', 'EPA Energy Star'] },
  ];

  const techScout: TechScout[] = [
    { id: 'ts-1', technology: 'Autonomous Mobile Robots (AMR)', category: 'Automation', maturity: 'growing', adoptionRate: 28, costRange: '$25K-$100K per unit', applicability: 'high', useCase: 'Goods-to-person picking in e-commerce and 3PL warehouses', vendors: ['Locus Robotics', '6 River Systems', 'Fetch Robotics'] },
    { id: 'ts-2', technology: 'Computer Vision for QC', category: 'Quality', maturity: 'emerging', adoptionRate: 12, costRange: '$15K-$50K per station', applicability: 'medium', useCase: 'Automated quality inspection and damage detection at receiving', vendors: ['Landing AI', 'Cognex', 'Keyence'] },
    { id: 'ts-3', technology: 'Digital Twin Warehouses', category: 'Planning', maturity: 'emerging', adoptionRate: 8, costRange: '$50K-$200K implementation', applicability: 'high', useCase: 'Virtual modeling for layout optimization before physical changes', vendors: ['Siemens', 'Dassault Systèmes', 'PTC'] },
    { id: 'ts-4', technology: 'Voice-Directed Picking', category: 'Productivity', maturity: 'mainstream', adoptionRate: 45, costRange: '$2K-$5K per user', applicability: 'high', useCase: 'Hands-free picking increases accuracy to 99.9% and speed by 15%', vendors: ['Honeywell Vocollect', 'Zebra Technologies', 'EPG'] },
  ];

  const benchmarks: Benchmark[] = [
    { metric: 'Order Accuracy', woulfValue: 99.2, industryAvg: 97.5, topQuartile: 99.5, unit: '%', status: 'above' },
    { metric: 'On-Time Delivery', woulfValue: 94, industryAvg: 92, topQuartile: 97, unit: '%', status: 'above' },
    { metric: 'Inventory Turnover', woulfValue: 6.2, industryAvg: 8.1, topQuartile: 12.0, unit: 'turns/yr', status: 'below' },
    { metric: 'Picks Per Hour', woulfValue: 36, industryAvg: 40, topQuartile: 55, unit: 'picks', status: 'below' },
    { metric: 'Revenue Per Employee', woulfValue: 78500, industryAvg: 65000, topQuartile: 95000, unit: '$', status: 'above' },
    { metric: 'Safety Incident Rate', woulfValue: 0, industryAvg: 3.2, topQuartile: 0.8, unit: 'per 100 workers', status: 'above' },
  ];

  return {
    source: 'demo', trends, techScout, benchmarks,
    summary: {
      trendsTracked: trends.length, highImpactTrends: trends.filter(t => t.impact === 'high').length,
      technologiesMonitored: techScout.length, benchmarksAboveAvg: benchmarks.filter(b => b.status === 'above').length,
      benchmarksBelowAvg: benchmarks.filter(b => b.status === 'below').length, industryGrowthRate: 7.2,
    },
    recommendations: [
      'Picks per hour (36) is below industry average (40) — invest in voice-directed picking or AMR for client warehouses',
      'Inventory turnover below average — opportunity to offer consulting services to improve client inventory management',
      'AI warehouse management is highest-impact trend — WoulfAI platform positions you ahead of competitors',
      'AMR adoption growing fast — partner with Locus Robotics to offer turnkey automation packages',
      'Digital twin technology could differentiate project proposals — pilot with Logicorp Phase 3',
    ],
  };
}
