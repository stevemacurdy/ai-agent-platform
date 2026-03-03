import { NextResponse } from 'next/server';
import '@/lib/demo-agents';
import { getAllAgents, toggleAgent } from '@/lib/demo-registry';

export async function GET() {
  const agents = getAllAgents().map(a => ({
    slug: a.meta.slug,
    name: a.meta.name,
    icon: a.meta.icon,
    dept: a.meta.dept,
    deptColor: a.meta.deptColor,
    buildBatch: a.meta.buildBatch,
    enabled: a.meta.enabled,
  }));
  return NextResponse.json({ agents, total: agents.length, enabled: agents.filter(a => a.enabled).length });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slug, enabled } = body as { slug: string; enabled: boolean };
    if (!slug || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'slug and enabled required' }, { status: 400 });
    }
    const success = toggleAgent(slug, enabled);
    if (!success) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json({ slug, enabled, success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
