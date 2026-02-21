import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// Collection strategy engine
function generateStrategy(invoice: any): any {
  const score = invoice.vendorReliabilityScore || 50;
  const days = invoice.daysOverdue || 0;
  const amount = invoice.amount - (invoice.amountPaid || 0);

  // Factor reliability into aggressiveness
  let urgency: 'gentle' | 'firm' | 'escalated' | 'critical';
  if (score >= 85) {
    // Trusted client — be gentle longer
    urgency = days > 60 ? 'firm' : days > 30 ? 'gentle' : 'gentle';
  } else if (score >= 60) {
    urgency = days > 45 ? 'escalated' : days > 21 ? 'firm' : 'gentle';
  } else {
    urgency = days > 30 ? 'critical' : days > 14 ? 'escalated' : 'firm';
  }

  const strategies: Record<string, any> = {
    gentle: {
      action: 'Send Friendly Reminder',
      template: `Hi ${invoice.contactName},\n\nHope all is well. I wanted to touch base regarding invoice ${invoice.number} for $${amount.toLocaleString()}, which was due on ${invoice.dueDate}. I know things get busy — just wanted to make sure this didn't slip through the cracks.\n\nHappy to discuss if there are any questions on the line items.\n\nBest,\nWoulf Group`,
      channel: 'email',
      followUp: '7 days',
      reasoning: `${invoice.client} has a reliability score of ${score}/100. ${days} days overdue. Maintaining relationship with a soft touch.`,
    },
    firm: {
      action: 'Send Net-60 Final Notice',
      template: `Dear ${invoice.contactName},\n\nThis is a formal notice regarding invoice ${invoice.number} for $${amount.toLocaleString()}, now ${days} days past due (original due date: ${invoice.dueDate}).\n\nPer our terms, payment was expected within 30 days. Please arrange payment within the next 14 business days to avoid service interruption on active projects.\n\nIf there is a billing dispute, please contact us immediately so we can resolve it.\n\nRegards,\nWoulf Group — Accounts Receivable`,
      channel: 'email + phone',
      followUp: '5 days',
      reasoning: `${invoice.client} (score: ${score}) is ${days} days overdue. Firm notice warranted. Include phone follow-up.`,
    },
    escalated: {
      action: 'Schedule Partner-to-Partner Call',
      template: `${invoice.contactName},\n\nInvoice ${invoice.number} ($${amount.toLocaleString()}) is now ${days} days past due. I'd like to schedule a brief call between our principals to discuss payment arrangements and ensure we maintain our working relationship.\n\nPlease let me know your availability this week.\n\nSteve Macurdy\nFounder, Woulf Group`,
      channel: 'email + direct call from leadership',
      followUp: '3 days',
      reasoning: `${invoice.client} (score: ${score}) at ${days} days — escalating to leadership. Consider offering payment plan.`,
    },
    critical: {
      action: 'Formal Demand Letter + Hold Future Work',
      template: `FORMAL DEMAND FOR PAYMENT\n\nDear ${invoice.contactName},\n\nDespite multiple communications, invoice ${invoice.number} in the amount of $${amount.toLocaleString()} remains unpaid, now ${days} days past the agreed due date of ${invoice.dueDate}.\n\nPlease be advised that failure to remit payment within 10 business days will result in:\n1. Suspension of all active and future project work\n2. Referral to our collections counsel\n3. Reporting to applicable credit bureaus\n\nWe prefer to resolve this amicably. Please contact us immediately.\n\nWoulf Group — Legal & Finance`,
      channel: 'certified mail + email + attorney CC',
      followUp: '10 days — then legal',
      reasoning: `${invoice.client} (score: ${score}) — ${days} days overdue. Low reliability + significant overdue period warrants aggressive posture.`,
    },
  };

  return {
    urgency,
    priorityRank: amount * (days / 30) * (1 - score / 200), // Higher = more urgent
    ...strategies[urgency],
    discountOffer: score >= 80 && amount > 5000 ? { eligible: true, offer: `Offer 3% discount ($${Math.round(amount * 0.03).toLocaleString()}) for payment within 5 days`, savings: Math.round(amount * 0.03) } : null,
    paymentPlanEligible: amount > 10000 && score >= 50,
  };
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  // Fetch overdue invoices
  const baseUrl = request.nextUrl.origin;
  const email = request.headers.get('x-admin-email') || '';
  const invRes = await fetch(`${baseUrl}/api/cfo-invoices?view=overdue`, { headers: { 'x-admin-email': email } });
  const invData = await invRes.json();

  const strategies = (invData.invoices || []).map((inv: any) => ({
    invoice: inv,
    outstanding: inv.amount - (inv.amountPaid || 0),
    strategy: generateStrategy(inv),
  })).sort((a: any, b: any) => b.strategy.priorityRank - a.strategy.priorityRank);

  return NextResponse.json({
    strategies,
    totalOverdue: strategies.reduce((s: number, st: any) => s + st.outstanding, 0),
    debtorCount: strategies.length,
    summary: {
      gentle: strategies.filter((s: any) => s.strategy.urgency === 'gentle').length,
      firm: strategies.filter((s: any) => s.strategy.urgency === 'firm').length,
      escalated: strategies.filter((s: any) => s.strategy.urgency === 'escalated').length,
      critical: strategies.filter((s: any) => s.strategy.urgency === 'critical').length,
    },
  });
}
