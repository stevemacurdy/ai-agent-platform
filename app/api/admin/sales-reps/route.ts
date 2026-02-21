import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) {
  const e = req.headers.get('x-admin-email');
  return e && ADMINS.includes(e.toLowerCase());
}

const salesReps = [
  {
    id: 'rep-1', name: 'Steve Macurdy', email: 'steve@woulfgroup.com', role: 'Founder / Lead Sales',
    territory: 'National', status: 'active', avatar: 'SM',
    stats: { totalDeals: 12, wonDeals: 8, pipeline: 485000, closedRevenue: 312000, avgDealSize: 39000, winRate: 67 },
    recentActivity: [
      { date: '2026-02-14', type: 'call', description: 'Follow-up with Marcus Chen at Logicorp' },
      { date: '2026-02-12', type: 'meeting', description: 'Proposal review with Sarah Kim, Pinnacle Group' },
      { date: '2026-02-10', type: 'email', description: 'Sent SOW to Tom Bradley, GreenLeaf Supply' },
    ],
    connectedCrm: { platform: 'HubSpot', status: 'configured', lastSync: '2026-02-16T10:00:00Z' },
  },
  {
    id: 'rep-2', name: 'Jake Morrison', email: 'jake@woulfgroup.com', role: 'Sales Representative',
    territory: 'Northeast', status: 'active', avatar: 'JM',
    stats: { totalDeals: 6, wonDeals: 3, pipeline: 180000, closedRevenue: 94000, avgDealSize: 31333, winRate: 50 },
    recentActivity: [
      { date: '2026-02-13', type: 'call', description: 'Cold outreach to FreshPack Logistics' },
      { date: '2026-02-11', type: 'email', description: 'Sent case study to Meridian Transport' },
    ],
    connectedCrm: null,
  },
  {
    id: 'rep-3', name: 'Lisa Chen', email: 'lisa@woulfgroup.com', role: 'Sales Representative',
    territory: 'West Coast', status: 'active', avatar: 'LC',
    stats: { totalDeals: 4, wonDeals: 2, pipeline: 220000, closedRevenue: 68000, avgDealSize: 34000, winRate: 50 },
    recentActivity: [
      { date: '2026-02-15', type: 'meeting', description: 'Site walk with PacificShore Distribution' },
      { date: '2026-02-13', type: 'call', description: 'Discovery call with SunValley Warehouse' },
    ],
    connectedCrm: { platform: 'Salesforce', status: 'pending', lastSync: null },
  },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const id = new URL(request.url).searchParams.get('id');

  if (id) {
    const rep = salesReps.find(r => r.id === id);
    return rep ? NextResponse.json({ rep }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const teamStats = {
    totalReps: salesReps.length,
    totalPipeline: salesReps.reduce((s, r) => s + r.stats.pipeline, 0),
    totalClosed: salesReps.reduce((s, r) => s + r.stats.closedRevenue, 0),
    avgWinRate: Math.round(salesReps.reduce((s, r) => s + r.stats.winRate, 0) / salesReps.length),
  };

  return NextResponse.json({ reps: salesReps, teamStats });
}
