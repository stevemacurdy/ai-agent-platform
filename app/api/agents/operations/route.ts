export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withTierEnforcement } from '@/lib/usage-enforcement';
import { trackUsage } from '@/lib/usage-tracker';
import { getWmsData } from '@/lib/wms/wms-data';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function _GET(request: NextRequest) {
  trackUsage(request, 'operations');
  try {
    const { data, error } = await supabase().from('agent_operations_data').select('*').limit(100);
    if (error || !data?.length) {
      const demoData = getWmsData('_default');
      return NextResponse.json({ ...demoData, source: 'demo' });
    }
    return NextResponse.json({ items: data, source: 'live' });
  } catch {
    const demoData = getWmsData('_default');
    return NextResponse.json({ ...demoData, source: 'demo' });
  }
}
export const GET = withTierEnforcement(_GET);

export async function POST(request: NextRequest) {
  trackUsage(request, 'operations', 'action');
  const body = await request.json();
  const { action } = body;
  switch (action) {
    case 'create-project': {
      const { projectName, dueDate, lead, budget, teamSize, priority } = body;
      const { data, error } = await supabase().from('agent_operations_data').insert({ project_name: projectName, due_date: dueDate, lead, budget, team_size: teamSize, priority, status: 'planning' }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Project created', data });
    }
    case 'update-project': {
      const { id, status, progress, notes } = body;
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (progress !== undefined) updates.progress = progress;
      if (notes) updates.description = notes;
      const { error } = await supabase().from('agent_operations_data').update(updates).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: 'Project updated' });
    }
    case 'status-report': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const projects = JSON.stringify(body.projects || []);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an operations management AI for a warehouse systems integration company. Provide specific, actionable analysis.' },
          { role: 'user', content: `Project data: ${projects}\n\nGenerate a weekly executive status report covering: 1) Project status summary (on-track/at-risk/behind counts), 2) Key wins this week, 3) Risks and blockers requiring leadership attention, 4) Resource utilization concerns, 5) Equipment maintenance alerts, 6) Recommended decisions for this week.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to generate report.' });
    }
    case 'risk-assessment': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const projects = JSON.stringify(body.projects || []);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a project risk management AI for a warehouse systems integration company.' },
          { role: 'user', content: `Project data: ${projects}\n\nFlag: 1) Projects at risk of missing deadlines (with specific reasons), 2) Budget overrun risks, 3) Resource conflicts between projects, 4) Equipment dependencies that could cause delays, 5) Mitigation actions for each risk. Rank by impact severity.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to assess risks.' });
    }
    case 'resource-plan': {
      const openai = new (await import('openai')).default({ apiKey: process.env.OPENAI_API_KEY });
      const teamData = JSON.stringify(body.teamData || []);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a resource planning AI for a warehouse systems integration company.' },
          { role: 'user', content: `Team data: ${teamData}\n\nAnalyze: 1) Over-allocated team members needing relief, 2) Under-utilized resources to reassign, 3) Skill gaps for upcoming projects, 4) Recommended reallocation plan, 5) Hiring needs if any.` }
        ],
        max_tokens: 1000, temperature: 0.3,
      });
      return NextResponse.json({ result: response.choices[0]?.message?.content || 'Unable to plan resources.' });
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
