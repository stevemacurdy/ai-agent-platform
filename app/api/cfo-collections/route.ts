export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// Pulls from cfo-invoices data (in production, would fetch internally)
const overdueInvoices = [
  { id: 'inv-1', number: 'INV/2026/00001', client: 'Logicorp', contact: 'Marcus Chen', email: 'mchen@logicorp.com', amount: 24500, amountPaid: 0, daysOverdue: 32, vendorReliabilityScore: 95 },
  { id: 'inv-3', number: 'INV/2026/00003', client: 'GreenLeaf Supply', contact: 'Tom Bradley', email: 'tbradley@greenleaf.com', amount: 8200, amountPaid: 0, daysOverdue: 15, vendorReliabilityScore: 65 },
  { id: 'inv-6', number: 'INV/2026/00006', client: 'Logicorp', contact: 'Marcus Chen', email: 'mchen@logicorp.com', amount: 45000, amountPaid: 0, daysOverdue: 17, vendorReliabilityScore: 95 },
];

function generateStrategy(inv: any): any {
  const days = inv.daysOverdue;
  const score = inv.vendorReliabilityScore;
  const outstanding = inv.amount - inv.amountPaid;

  // Tiered logic with reliability adjustment
  // High reliability (85+): shift thresholds right (more lenient)
  // Low reliability (<60): shift thresholds left (more aggressive)
  const softMax = score >= 85 ? 30 : score >= 60 ? 15 : 10;
  const firmMax = score >= 85 ? 60 : score >= 60 ? 45 : 30;

  let urgency: string, action: string, channel: string, followUp: string, reasoning: string;
  let template = '';

  if (days <= softMax) {
    urgency = 'gentle';
    action = 'Send Friendly Reminder';
    channel = 'email';
    followUp = '7-day follow-up';
    reasoning = score >= 85
      ? `${inv.client} has a ${score}/100 reliability score — trusted partner. Gentle approach appropriate even at ${days} days overdue.`
      : `Invoice is ${days} days overdue. Standard soft reminder.`;
    template = `Hi ${inv.contact},\n\nHope all is well. I wanted to touch base regarding invoice ${inv.number} for $${outstanding.toLocaleString()}, which was due ${days} days ago.\n\nIf this has already been processed, please disregard. Otherwise, could you let me know the expected payment date?\n\nThanks for the continued partnership.\n\nBest,\nSteve Macurdy\nWoulf Group`;
  } else if (days <= firmMax) {
    urgency = 'firm';
    action = 'Send Formal Notice + Schedule Call';
    channel = 'email + phone';
    followUp = '5-day follow-up';
    reasoning = `Invoice ${inv.number} is ${days} days overdue. ${score >= 85 ? 'Despite strong reliability history, ' : ''}formal notice warranted at this stage.`;
    template = `Dear ${inv.contact},\n\nThis is a formal notice regarding invoice ${inv.number} in the amount of $${outstanding.toLocaleString()}, which is now ${days} days past due.\n\nPlease remit payment within 10 business days or contact us to arrange a payment plan.\n\nWe value our relationship with ${inv.client} and want to resolve this promptly.\n\nRegards,\nSteve Macurdy\nWoulf Group\n(801) 555-0142`;
  } else if (days <= firmMax + 15) {
    urgency = 'escalated';
    action = 'Schedule Partner-to-Partner Call';
    channel = 'phone + email';
    followUp = '3-day follow-up';
    reasoning = `${days} days overdue exceeds normal terms. Escalating to leadership involvement. ${score >= 85 ? 'Offering payment plan given strong history.' : 'Escalation with firm timeline.'}`;
    template = `Dear ${inv.contact},\n\nI'm reaching out directly as this matter requires prompt attention. Invoice ${inv.number} ($${outstanding.toLocaleString()}) is ${days} days past due.\n\nI'd like to schedule a brief call this week to discuss resolution options, including a structured payment plan if that would help.\n\nPlease respond within 48 hours.\n\nSteve Macurdy\nFounder, Woulf Group`;
  } else {
    urgency = 'critical';
    action = 'Formal Demand Letter + Hold Future Work';
    channel = 'certified mail + email';
    followUp = '10-day ultimatum';
    reasoning = `${days} days overdue with $${outstanding.toLocaleString()} outstanding. All prior outreach exhausted. Formal demand required.`;
    template = `FORMAL DEMAND FOR PAYMENT\n\nTo: ${inv.contact}, ${inv.client}\nRe: Invoice ${inv.number} — $${outstanding.toLocaleString()}\n\nDear ${inv.contact},\n\nDespite prior correspondence, the above-referenced invoice remains unpaid after ${days} days. This letter serves as formal demand for payment in full within 10 business days.\n\nFailure to remit payment may result in:\n- Suspension of current and future project work\n- Referral to collections\n- Reporting to credit agencies\n\nPlease contact us immediately to resolve.\n\nSteve Macurdy\nFounder, Woulf Group\nCC: Legal Counsel`;
  }

  const discountOffer = score >= 85 && urgency !== 'critical' ? {
    offer: `Offer ${inv.client} 3% discount ($${Math.round(outstanding * 0.03).toLocaleString()} savings) if paid within 5 days`,
    discountAmount: Math.round(outstanding * 0.03),
  } : null;

  const priority = outstanding * (days / 30) * (1 - score / 200);

  return {
    invoice: { id: inv.id, number: inv.number, client: inv.client, contact: inv.contact, email: inv.email, daysOverdue: days, vendorReliabilityScore: score },
    outstanding,
    priority: Math.round(priority),
    strategy: { urgency, action, channel, followUp, reasoning, template, discountOffer, paymentPlanEligible: days > 30 },
  };
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const strategies = overdueInvoices.map(generateStrategy).sort((a, b) => b.priority - a.priority);
  const totalOverdue = overdueInvoices.reduce((s, i) => s + i.amount - i.amountPaid, 0);

  const summary: Record<string, number> = { gentle: 0, firm: 0, escalated: 0, critical: 0 };
  strategies.forEach(s => summary[s.strategy.urgency]++);

  return NextResponse.json({ strategies, totalOverdue, debtorCount: overdueInvoices.length, summary, generatedAt: new Date().toISOString() });
}
