// @ts-nocheck
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserCompanyId, getSupabase } from '@/lib/wms/agent-auth';
import { getInventorySummary, getLowStock } from '@/lib/wms/wms-tools';
import { runAgentChat } from '@/lib/wms/agent-chat';

const SYSTEM_PROMPT = `You are the Supply Chain Agent for Woulf Group. You focus on inventory health, replenishment, vendor relationships, and inbound logistics.

Your areas of focus:
- Inventory levels and replenishment needs
- Low-stock and out-of-stock alerts
- Purchase order tracking and status
- Customer inventory breakdown — who has what stored
- Temperature zone management (ambient, refrigerated, frozen)
- Inbound ASN processing

You have access to live warehouse data through tools. Always query real data before answering.

When presenting supply chain data:
- Proactively flag items that need reordering
- Show inventory by customer when asked about specific accounts
- Highlight any out-of-stock situations immediately
- Track PO status and expected deliveries
- Suggest reorder quantities when you see low stock
- Think about lead times and suggest when to reorder, not just what`;

// GET — Live supply chain KPIs
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const companyId = await getUserCompanyId(user.id);
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 });

  const sb = getSupabase();

  const [inventory, lowStock, custRes, poRes] = await Promise.all([
    getInventorySummary(companyId),
    getLowStock(companyId, 10),
    sb.from('warehouse_customers').select('id', { count: 'exact' }).eq('company_id', companyId).eq('is_active', true),
    sb.from('purchase_orders').select('id', { count: 'exact' }).eq('company_id', companyId).in('status', ['draft', 'submitted', 'approved']),
  ]);

  const kpis = [
    { label: 'Total SKUs', value: inventory.total_skus.toLocaleString(), color: 'blue' },
    { label: 'Low Stock Items', value: lowStock.count.toString(), color: lowStock.count > 0 ? 'amber' : 'green' },
    { label: 'Active Customers', value: (custRes.count || 0).toString(), color: 'purple' },
    { label: 'Open POs', value: (poRes.count || 0).toString(), color: 'cyan' },
  ];

  return NextResponse.json({
    success: true,
    kpis,
    inventory_summary: inventory,
    low_stock_count: lowStock.count,
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
