import { NextRequest, NextResponse } from 'next/server';

const leads: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, agent_slug, source } = body;

  if (!name || !email || !agent_slug) {
    return NextResponse.json({ error: 'Name, email, and agent_slug required' }, { status: 400 });
  }

  const lead = {
    id: 'lead-' + Date.now(),
    name, email, agent_slug,
    source: source || 'demo',
    status: 'new',
    created_at: new Date().toISOString(),
  };
  leads.push(lead);

  return NextResponse.json({
    success: true,
    message: "This agent is receiving a serious upgrade. We've saved your interest and will notify you when it's ready.",
    lead: { id: lead.id, agent_slug: lead.agent_slug },
  });
}

export async function GET(request: NextRequest) {
  const email = request.headers.get('x-admin-email');
  const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
  if (!email || !ADMINS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const byAgent: Record<string, number> = {};
  for (const l of leads) byAgent[l.agent_slug] = (byAgent[l.agent_slug] || 0) + 1;

  return NextResponse.json({ leads, totalLeads: leads.length, byAgent });
}
