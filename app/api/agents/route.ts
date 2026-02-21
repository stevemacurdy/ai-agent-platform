import { NextRequest, NextResponse } from 'next/server';
import { AGENTS, getAgent, getLiveAgents, getDevAgents } from '@/lib/agents';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const filter = searchParams.get('filter'); // 'live', 'dev', or null for all

  if (slug) {
    const agent = getAgent(slug);
    return agent ? NextResponse.json({ agent }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let agents = AGENTS;
  if (filter === 'live') agents = getLiveAgents();
  else if (filter === 'dev') agents = getDevAgents();

  return NextResponse.json({
    agents: agents.map(a => ({
      slug: a.slug, name: a.name, description: a.description, icon: a.icon,
      status: a.status, completionPct: a.completionPct, category: a.category,
      liveRoute: a.liveRoute, demoRoute: a.demoRoute,
      featuresDone: a.features.filter(f => f.status === 'done').length,
      featuresTotal: a.features.length,
    })),
    totalAgents: agents.length,
    liveCount: agents.filter(a => a.status === 'live').length,
    devCount: agents.filter(a => a.status !== 'live').length,
  });
}
