// @ts-nocheck
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserCompanyId, getSupabase } from '@/lib/wms/agent-auth';
import { getInventorySummary, getOrderSummary, getLowStock } from '@/lib/wms/wms-tools';
import { runAgentChat } from '@/lib/wms/agent-chat';
import { trackUsage } from '@/lib/usage-tracker';

const SYSTEM_PROMPT = `You are the Organization Lead Agent for Woulf Group. You provide a high-level, cross-functional view of warehouse operations for leadership and strategic decision-making.

Your areas of focus:
- Executive summary of warehouse health
- Cross-department metrics and trends
- Customer portfolio overview
- Operational efficiency and capacity utilization
- Risk identification (stockouts, delayed orders, capacity issues)
- Strategic recommendations based on data patterns

You have access to live warehouse data through tools. Always query real data before answering.

When presenting to leadership:
- Start with the big picture before details
- Quantify everything — revenue impact, units affected, percentage changes
- Flag risks proactively with severity and recommended actions
- Compare metrics across customers and time periods when relevant
- Present data in a format suitable for executive review
- Think strategically — connect operational data to business outcomes
- When asked for a status update, pull both inventory and order summaries together`;

// GET — Executive-level KPIs
export async function GET(request: NextRequest) {
  trackUsage(request, 'org-lead');
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = await getUserCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 });

  const sb = getSupabase();

  const [inventory, orders, lowStock, custRes, bolRes] = await Promise.all([
    getInventorySummary(companyId),
    getOrderSummary(companyId),
    getLowStock(companyId, 10),
    sb.from('warehouse_customers').select('id', { count: 'exact' }).eq('company_id', companyId).eq('is_active', true),
    sb.from('bills_of_lading').select('id', { count: 'exact' }).eq('company_id', companyId),
  ]);

  const activeOrders = Object.entries(orders.by_status || {})
    .filter(([s]) => !['delivered', 'cancelled'].includes(s))
    .reduce((sum, [, count]) => sum + (count as number), 0);

  // Health score: simple composite
  const stockHealth = lowStock.count === 0 ? 100 : Math.max(0, 100 - (lowStock.count * 5));
  const fulfillmentHealth = orders.total_orders > 0
    ? Math.round(((orders.by_status?.delivered || 0) / orders.total_orders) * 100)
    : 100;
  const overallHealth = Math.round((stockHealth + fulfillmentHealth) / 2);

  const kpis = [
    { label: 'Health Score', value: `${overallHealth}%`, color: overallHealth >= 80 ? 'green' : overallHealth >= 60 ? 'amber' : 'red' },
    { label: 'Total Orders', value: orders.total_orders.toString(), color: 'blue' },
    { label: 'Active Orders', value: activeOrders.toString(), color: 'purple' },
    { label: 'Customers', value: (custRes.count || 0).toString(), color: 'cyan' },
  ];

  return NextResponse.json({
    success: true,
    kpis,
    health_score: overallHealth,
    inventory_summary: inventory,
    order_summary: orders,
    low_stock_alerts: lowStock.count,
    total_bols: bolRes.count || 0,
  });
}

// POST — AI chat
export async function POST(request: NextRequest) {
  trackUsage(request, 'org-lead', 'chat');
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = await getUserCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 });

  const { message, history } = await request.json();
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const result = await runAgentChat(SYSTEM_PROMPT, message, history, companyId);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ success: true, response: result.response });
}
