export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/3pl-portal-supabase';

function buildSystemPrompt(data: any) {
  const { customer, kpis, inventory, orders, payments } = data;
  const topSKUs = inventory.slice(0, 8).map((i: any) =>
    `${i.sku}: ${i.quantity_available} avail (${i.description}, Zone ${i.warehouse_zone}-${i.bin_location})`
  ).join('\n');
  const openOrders = orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.status))
    .map((o: any) => `${o.order_number}: ${o.status} - ${o.ship_to_name}`).join('\n');
  const lastPayments = payments.slice(0, 3)
    .map((p: any) => `${p.created_at?.split('T')[0]}: $${p.amount} (${p.timeliness})`).join('\n');

  return `You are a customer service AI for Clutch 3PL, a professional third-party logistics warehouse operated by Woulf Group. You are speaking with ${customer.contact_name} from ${customer.customer_name}.

Account details:
- Contract: ${customer.contract_start} to ${customer.contract_end}, ${customer.payment_terms}
- Rates: $${customer.storage_rate_pallet}/pallet/month storage, $${customer.handling_rate_in}/pallet in, $${customer.handling_rate_out}/pallet out
- Current inventory: ${kpis.totalUnits} total units across ${kpis.totalSKUs} SKUs
- Open orders: ${kpis.openOrderCount}
- Current balance: $${kpis.currentBalance} (${kpis.balanceStatus})
- Auto-pay: ${customer.auto_pay_enabled ? 'Active' : 'Inactive'}

Top inventory:
${topSKUs}

Open orders:
${openOrders}

Recent payments:
${lastPayments}

Be professional, specific, and data-driven. If you cannot answer or the customer requests a human, indicate escalation is needed. Never fabricate data.`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, customerCode, message, history } = body;

  if (action === 'escalate') return NextResponse.json({ success: true, message: 'Escalated to human support.' });
  if (action === 'get-history') return NextResponse.json({ messages: [] });
  if (action !== 'send-message') return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  const dashData = await getDashboardData(customerCode || 'MWS-001');
  const systemPrompt = buildSystemPrompt(dashData);

  // Try OpenAI
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk-placeholder') {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });
      const msgs = [
        { role: 'system' as const, content: systemPrompt },
        ...(history || []).filter((m: any) => m.role !== 'system').slice(-10)
          .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: message },
      ];
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', messages: msgs, max_tokens: 500, temperature: 0.7,
      });
      const reply = completion.choices[0]?.message?.content || 'I encountered an issue. Let me connect you with support.';
      const escalated = reply.toLowerCase().includes('escalat') || reply.toLowerCase().includes('connect you with');
      return NextResponse.json({ reply, escalated });
    }
  } catch (e) { console.error('OpenAI error:', e); }

  // Fallback
  return NextResponse.json({
    reply: 'I can help with inventory, orders, billing, and receiving questions. What would you like to know?',
    escalated: false,
  });
}
