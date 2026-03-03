// ─── STR Agent Data Layer ─────────────────────────────────
// Short-term rental portfolio analytics: occupancy, revenue,
// pricing optimization, guest satisfaction, and maintenance.

import { createClient } from '@supabase/supabase-js';
function supabaseAdmin() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } }); }

export interface Property { id: string; name: string; location: string; type: string; bedrooms: number; status: 'active' | 'maintenance' | 'onboarding'; avgNightlyRate: number; occupancyRate: number; revenueThisMonth: number; revenueLTM: number; rating: number; reviewCount: number; nextCheckIn: string | null; nextCheckOut: string | null; cleaningStatus: 'clean' | 'in-progress' | 'needs-cleaning'; }
export interface RevenueMetric { month: string; revenue: number; occupancy: number; adr: number; revpar: number; bookings: number; }
export interface GuestReview { id: string; property: string; guest: string; rating: number; comment: string; date: string; sentiment: 'positive' | 'neutral' | 'negative'; responseStatus: 'responded' | 'pending' | 'not-needed'; }
export interface MaintenanceItem { id: string; property: string; issue: string; priority: 'low' | 'medium' | 'high' | 'urgent'; status: 'open' | 'scheduled' | 'in-progress' | 'completed'; reportedDate: string; scheduledDate: string | null; estimatedCost: number; }
export interface STRData { source: 'live' | 'demo'; properties: Property[]; revenue: RevenueMetric[]; reviews: GuestReview[]; maintenance: MaintenanceItem[]; summary: { totalProperties: number; avgOccupancy: number; totalRevenueThisMonth: number; totalRevenueLTM: number; avgNightlyRate: number; avgRating: number; pendingReviews: number; openMaintenance: number; revpar: number; }; recommendations: string[]; }

export async function getSTRData(companyId: string): Promise<STRData> { return getDemoSTR(); }

function getDemoSTR(): STRData {
  const properties: Property[] = [
    { id: 'prop-1', name: 'Grantsville Mountain View', location: 'Grantsville, UT', type: 'House', bedrooms: 4, status: 'active', avgNightlyRate: 185, occupancyRate: 72, revenueThisMonth: 4100, revenueLTM: 52000, rating: 4.8, reviewCount: 48, nextCheckIn: '2026-03-05', nextCheckOut: '2026-03-08', cleaningStatus: 'clean' },
    { id: 'prop-2', name: 'Tooele Valley Retreat', location: 'Tooele, UT', type: 'House', bedrooms: 3, status: 'active', avgNightlyRate: 145, occupancyRate: 65, revenueThisMonth: 2900, revenueLTM: 38000, rating: 4.6, reviewCount: 32, nextCheckIn: '2026-03-04', nextCheckOut: '2026-03-06', cleaningStatus: 'needs-cleaning' },
    { id: 'prop-3', name: 'SLC Downtown Condo', location: 'Salt Lake City, UT', type: 'Condo', bedrooms: 2, status: 'active', avgNightlyRate: 165, occupancyRate: 82, revenueThisMonth: 4600, revenueLTM: 58000, rating: 4.9, reviewCount: 67, nextCheckIn: '2026-03-03', nextCheckOut: '2026-03-05', cleaningStatus: 'clean' },
  ];

  const revenue: RevenueMetric[] = [
    { month: 'Oct 2025', revenue: 10200, occupancy: 68, adr: 162, revpar: 110, bookings: 18 },
    { month: 'Nov 2025', revenue: 8800, occupancy: 58, adr: 155, revpar: 90, bookings: 14 },
    { month: 'Dec 2025', revenue: 14500, occupancy: 78, adr: 195, revpar: 152, bookings: 22 },
    { month: 'Jan 2026', revenue: 12800, occupancy: 72, adr: 178, revpar: 128, bookings: 19 },
    { month: 'Feb 2026', revenue: 11200, occupancy: 70, adr: 170, revpar: 119, bookings: 17 },
    { month: 'Mar 2026', revenue: 11600, occupancy: 73, adr: 175, revpar: 128, bookings: 15 },
  ];

  const reviews: GuestReview[] = [
    { id: 'rev-1', property: 'SLC Downtown Condo', guest: 'Jennifer M.', rating: 5, comment: 'Perfect location and spotless. Will book again!', date: '2026-02-28', sentiment: 'positive', responseStatus: 'responded' },
    { id: 'rev-2', property: 'Grantsville Mountain View', guest: 'Robert K.', rating: 4, comment: 'Great house, beautiful views. WiFi was a bit slow.', date: '2026-02-25', sentiment: 'positive', responseStatus: 'responded' },
    { id: 'rev-3', property: 'Tooele Valley Retreat', guest: 'Amanda S.', rating: 3, comment: 'House was fine but the hot tub was not working.', date: '2026-02-22', sentiment: 'negative', responseStatus: 'pending' },
    { id: 'rev-4', property: 'SLC Downtown Condo', guest: 'David L.', rating: 5, comment: 'Fantastic stay. Walking distance to everything.', date: '2026-03-01', sentiment: 'positive', responseStatus: 'not-needed' },
  ];

  const maintenance: MaintenanceItem[] = [
    { id: 'maint-1', property: 'Tooele Valley Retreat', issue: 'Hot tub heater malfunction', priority: 'high', status: 'scheduled', reportedDate: '2026-02-22', scheduledDate: '2026-03-03', estimatedCost: 450 },
    { id: 'maint-2', property: 'Grantsville Mountain View', issue: 'WiFi router needs upgrade', priority: 'medium', status: 'open', reportedDate: '2026-02-25', scheduledDate: null, estimatedCost: 120 },
    { id: 'maint-3', property: 'SLC Downtown Condo', issue: 'Touch-up paint in hallway', priority: 'low', status: 'open', reportedDate: '2026-02-20', scheduledDate: null, estimatedCost: 80 },
    { id: 'maint-4', property: 'Tooele Valley Retreat', issue: 'Dryer vent cleaning', priority: 'medium', status: 'scheduled', reportedDate: '2026-02-15', scheduledDate: '2026-03-05', estimatedCost: 150 },
  ];

  const totalRevMonth = properties.reduce((s, p) => s + p.revenueThisMonth, 0);

  return {
    source: 'demo', properties, revenue, reviews, maintenance,
    summary: {
      totalProperties: properties.length, avgOccupancy: Math.round(properties.reduce((s, p) => s + p.occupancyRate, 0) / properties.length),
      totalRevenueThisMonth: totalRevMonth, totalRevenueLTM: properties.reduce((s, p) => s + p.revenueLTM, 0),
      avgNightlyRate: Math.round(properties.reduce((s, p) => s + p.avgNightlyRate, 0) / properties.length),
      avgRating: Math.round(properties.reduce((s, p) => s + p.rating, 0) / properties.length * 10) / 10,
      pendingReviews: reviews.filter(r => r.responseStatus === 'pending').length, openMaintenance: maintenance.filter(m => m.status !== 'completed').length,
      revpar: Math.round(totalRevMonth / properties.length / 30),
    },
    recommendations: [
      'Tooele hot tub repair scheduled March 3 — confirm technician and respond to Amanda S. negative review ASAP',
      'SLC Downtown Condo has highest occupancy (82%) and rating (4.9) — raise nightly rate by $10-15 to test elasticity',
      'Tooele needs cleaning before March 4 check-in — schedule cleaning crew today',
      'Grantsville WiFi complaint recurring — upgrade router to fix before it impacts more reviews',
      'December was peak revenue ($14.5K) — set up dynamic pricing for next holiday season early',
    ],
  };
}
