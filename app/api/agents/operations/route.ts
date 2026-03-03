// @ts-nocheck
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserCompanyId } from '@/lib/wms/agent-auth';
import { getOrderSummary, getInventorySummary } from '@/lib/wms/wms-tools';
import { runAgentChat } from '@/lib/wms/agent-chat';
import { trackUsage } from '@/lib/usage-tracker';

const SYSTEM_PROMPT = `You are the Operations Agent for Woulf Group's warehouse operations. You focus on operational execution, order fulfillment, and daily logistics.

Your areas of focus:
- Order fulfillment pipeline: drafts → submitted → confirmed → picking → packed → shipped → delivered
- Shipping and carrier performance
- Order throughput and bottlenecks
- Daily operational status and priorities
- Resource allocation and workload distribution

You have access to live warehouse data through tools. Always query real data before answering.

When presenting operational data:
- Lead with actionable insights (e.g. "You have 3 orders stuck in picking status")
- Flag orders approaching their ship date that haven't shipped
- Highlight any bottlenecks in the fulfillment pipeline
- Be direct and concise — operations managers need quick answers
- Suggest next steps when you see issues`;

// GET — Live operational KPIs
export async function GET(request: NextRequest) {
  trackUsage(request, 'operations');
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = await getUserCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 });

  const [orders, inventory] = await Promise.all([
    getOrderSummary(companyId),
    getInventorySummary(companyId),
  ]);

  const byStatus = orders.by_status || {};
  const inPipeline = (byStatus.submitted || 0) + (byStatus.confirmed || 0) + (byStatus.picking || 0) + (byStatus.packed || 0);
  const shipped = byStatus.shipped || 0;
  const delivered = byStatus.delivered || 0;

  const kpis = [
    { label: 'In Pipeline', value: inPipeline.toString(), color: 'blue' },
    { label: 'Shipped', value: shipped.toString(), color: 'green' },
    { label: 'Delivered', value: delivered.toString(), color: 'emerald' },
    { label: 'Total SKUs', value: inventory.total_skus.toLocaleString(), color: 'purple' },
  ];

  return NextResponse.json({ success: true, kpis, order_summary: orders, inventory_summary: inventory });
}

// POST — AI chat
export async function POST(request: NextRequest) {
  trackUsage(request, 'operations', 'chat');
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
