// @ts-nocheck
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserCompanyId } from '@/lib/wms/agent-auth';
import { getInventorySummary, getOrderSummary } from '@/lib/wms/wms-tools';
import { runAgentChat } from '@/lib/wms/agent-chat';

const SYSTEM_PROMPT = `You are the WMS (Warehouse Management System) AI agent for Woulf Group. You have direct access to live warehouse data through tool functions.

Your capabilities:
- Check inventory levels by SKU, product name, or location
- Get inventory summaries and statistics
- Find low-stock and out-of-stock items
- Look up orders by order number, customer, PO number, or tracking number
- Get order summaries and status breakdowns
- Look up bills of lading
- Search customer records and view customer-specific inventory

Guidelines:
- Always use your tools to get real data before answering questions about inventory, orders, BOLs, or customers.
- Present data clearly with specific numbers. Don't guess or use placeholder data.
- When showing multiple items, format them in a readable way.
- If a search returns no results, say so clearly and suggest alternative searches.
- For questions about trends or recommendations, query the data first, then provide analysis.
- Be concise but thorough. Warehouse managers need quick answers.`;

// GET — Live warehouse KPIs
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = await getUserCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 });

  const [inventory, orders] = await Promise.all([
    getInventorySummary(companyId),
    getOrderSummary(companyId),
  ]);

  const activeOrders = Object.entries(orders.by_status || {})
    .filter(([s]) => !['delivered', 'cancelled'].includes(s))
    .reduce((sum, [, count]) => sum + (count as number), 0);

  const kpis = [
    { label: 'Total SKUs', value: inventory.total_skus.toLocaleString(), color: 'blue' },
    { label: 'Units On Hand', value: inventory.total_on_hand.toLocaleString(), color: 'emerald' },
    { label: 'Units Available', value: inventory.total_available.toLocaleString(), color: 'green' },
    { label: 'Active Orders', value: activeOrders.toString(), color: 'purple' },
  ];

  return NextResponse.json({
    success: true,
    kpis,
    inventory_summary: inventory,
    order_summary: orders,
  });
}

// POST — AI chat
export async function POST(request: NextRequest) {
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
