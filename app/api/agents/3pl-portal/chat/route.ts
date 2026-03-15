export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { DEMO_CUSTOMER, DEMO_INVENTORY, DEMO_ORDERS, DEMO_INVOICES, DEMO_PAYMENTS, getDemoKPIs } from '@/lib/3pl-portal-data';

function buildSystemPrompt() {
  const kpis = getDemoKPIs();
  const topSKUs = DEMO_INVENTORY.slice(0, 8).map(i => `${i.sku}: ${i.quantity_available} avail (${i.description}, Zone ${i.warehouse_zone}-${i.bin_location})`).join('\n');
  const openOrders = DEMO_ORDERS.filter(o => !['delivered', 'cancelled'].includes(o.status)).map(o => `${o.order_number}: ${o.status} - ${o.ship_to_name}`).join('\n');
  const lastPayments = DEMO_PAYMENTS.slice(0, 3).map(p => `${p.created_at.split('T')[0]}: $${p.amount} (${p.timeliness})`).join('\n');

  return `You are a customer service AI for Clutch 3PL, a professional third-party logistics warehouse operated by Woulf Group. You are speaking with ${DEMO_CUSTOMER.contact_name} from ${DEMO_CUSTOMER.customer_name}.

Account details:
- Contract: ${DEMO_CUSTOMER.contract_start} to ${DEMO_CUSTOMER.contract_end}, ${DEMO_CUSTOMER.payment_terms}
- Rates: $${DEMO_CUSTOMER.storage_rate_pallet}/pallet/month storage, $${DEMO_CUSTOMER.handling_rate_in}/pallet in, $${DEMO_CUSTOMER.handling_rate_out}/pallet out
- Current inventory: ${kpis.totalUnits} total units across ${kpis.totalSKUs} SKUs
- Open orders: ${kpis.openOrderCount}
- Current balance: $${kpis.currentBalance} (${kpis.balanceStatus})
- Auto-pay: ${DEMO_CUSTOMER.auto_pay_enabled ? 'Active' : 'Inactive'}

Top inventory:
${topSKUs}

Open orders:
${openOrders}

Recent payments:
${lastPayments}

You can help with inventory questions, order status, billing, receiving, contract info, and general 3PL operations. Be professional, specific, and data-driven. If you cannot answer or the customer requests a human, indicate escalation is needed. Never fabricate data.`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'send-message': {
      const message = body.message || '';
      const history = body.history || [];

      // Try OpenAI if key is available AND user is authenticated
      const authHeader = request.headers.get('authorization');
      const isAuthenticated = authHeader?.startsWith('Bearer ');
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (isAuthenticated && apiKey && apiKey !== 'sk-placeholder') {
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({ apiKey });
          const messages = [
            { role: 'system' as const, content: buildSystemPrompt() },
            ...history.filter((m: any) => m.role !== 'system').slice(-10).map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            { role: 'user' as const, content: message },
          ];
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 500,
            temperature: 0.7,
          });
          const reply = completion.choices[0]?.message?.content || 'I apologize, I encountered an issue. Let me connect you with our support team.';
          const escalated = reply.toLowerCase().includes('escalat') || reply.toLowerCase().includes('connect you with');
          return NextResponse.json({ reply, escalated });
        }
      } catch (e) {
        console.error('OpenAI error:', e);
      }

      // Fallback demo responses
      const lower = message.toLowerCase();
      let reply = '';
      let escalated = false;

      if (lower.includes('inventory') || lower.includes('stock') || lower.includes('whey') || lower.includes('how many')) {
        reply = `You currently have ${DEMO_INVENTORY.reduce((s, i) => s + i.quantity_on_hand, 0).toLocaleString()} total units across ${DEMO_INVENTORY.length} SKUs. Your Whey Protein Isolate 5lb (WPI-5LB, Lot WPI-2024-112) has 400 units available in Zone A, Bin A-12-04. After your pending order ORD-20260303-0012 ships (50 cases), you'll have approximately 350 units. Would you like details on any specific SKU?`;
      } else if (lower.includes('order') || lower.includes('tracking') || lower.includes('ship')) {
        reply = 'You have 2 open orders: ORD-20260303-0012 is currently being picked for GNC Regional DC in Las Vegas (requested ship date March 5), and ORD-20260303-0015 is pending for Vitamin Shoppe - Provo (requested ship date March 6). Your most recent shipment ORD-20260228-0001 shipped via FedEx Freight on March 1 with tracking FXFE-7829104562. Would you like more details on any order?';
      } else if (lower.includes('invoice') || lower.includes('bill') || lower.includes('pay') || lower.includes('balance')) {
        reply = `Your current invoice INV-2026-12 is $${DEMO_INVOICES[0].total_due.toLocaleString()} for the March billing period, due March 31. The breakdown is: storage $${DEMO_INVOICES[0].storage_charges.toLocaleString()}, inbound handling $${DEMO_INVOICES[0].handling_in_charges.toLocaleString()}, outbound handling $${DEMO_INVOICES[0].handling_out_charges.toLocaleString()}, and accessorial charges $${DEMO_INVOICES[0].accessorial_charges.toLocaleString()}. You can pay online through the Billing page. Would you like to know about enabling auto-pay for a 3% discount?`;
      } else if (lower.includes('dispute') || lower.includes('charge') || lower.includes('wrong')) {
        reply = 'I understand your concern. Let me connect you with our billing team to review this. I\'ve noted the details for them. A representative will follow up within 4 business hours. Is there anything else I can help with in the meantime?';
        escalated = true;
      } else if (lower.includes('rate') || lower.includes('contract') || lower.includes('renewal')) {
        reply = 'Your current contract runs from January 1, 2025 to December 31, 2026 with rates of $18/pallet/month storage, $8.50/pallet inbound, and $12/pallet outbound on Net 30 terms. For any rate adjustments or contract modifications, I\'ll connect you with our account management team.';
        escalated = lower.includes('change') || lower.includes('modif') || lower.includes('negotiat');
      } else if (lower.includes('auto-pay') || lower.includes('autopay')) {
        reply = 'Auto-pay is currently disabled on your account. When enabled, your invoices are automatically charged on the due date and you receive a 3% discount instead of the 3.5% convenience fee. You can enable it in the Settings page or the Billing page. Would you like me to walk you through the setup?';
      } else {
        reply = 'I\'d be happy to help! I can assist with inventory lookups, order status, billing questions, receiving info, or contract details. What would you like to know about?';
      }

      return NextResponse.json({ reply, escalated });
    }

    case 'escalate':
      return NextResponse.json({ success: true, message: 'Conversation escalated to human support. A representative will respond within 4 business hours.' });

    case 'get-history':
      return NextResponse.json({ messages: [] });

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
