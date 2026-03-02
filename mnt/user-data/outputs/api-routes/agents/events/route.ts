export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET /api/agents/events — list event catalog
// GET /api/agents/events?agentId=xxx — events for a specific agent
// GET /api/agents/events?category=finance — events by category
export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const agentSlug = searchParams.get('agentSlug');
    const category = searchParams.get('category');

    // Resolve agentId from slug
    let resolvedAgentId = agentId;
    if (!resolvedAgentId && agentSlug) {
      const { data: agent } = await sb
        .from('agent_registry')
        .select('id')
        .eq('slug', agentSlug)
        .single();
      resolvedAgentId = agent?.id;
    }

    // Events for a specific agent
    if (resolvedAgentId) {
      const { data: declarations, error } = await sb
        .from('agent_event_declarations')
        .select('direction, is_required, description, agent_events(id, slug, display_name, description, category, payload_schema)')
        .eq('agent_id', resolvedAgentId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const events = (declarations || []).map((d: any) => ({
        ...d.agent_events,
        direction: d.direction,
        is_required: d.is_required,
        agent_description: d.description,
      }));

      const emits = events.filter((e: any) => e.direction === 'emit' || e.direction === 'both');
      const consumes = events.filter((e: any) => e.direction === 'consume' || e.direction === 'both');

      return NextResponse.json({ events, emits, consumes, agent_id: resolvedAgentId });
    }

    // Full event catalog
    let query = sb.from('agent_events').select('*').eq('is_active', true).order('category').order('slug');
    if (category) query = query.eq('category', category);

    const { data: events, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get declaration counts per event
    const eventIds = (events || []).map((e: any) => e.id);
    const { data: declarations } = await sb
      .from('agent_event_declarations')
      .select('event_id, direction')
      .in('event_id', eventIds.length ? eventIds : ['none']);

    const enriched = (events || []).map((event: any) => {
      const decls = (declarations || []).filter((d: any) => d.event_id === event.id);
      return {
        ...event,
        emitter_count: decls.filter((d: any) => d.direction === 'emit' || d.direction === 'both').length,
        consumer_count: decls.filter((d: any) => d.direction === 'consume' || d.direction === 'both').length,
      };
    });

    // Group by category
    const categories = [...new Set(enriched.map((e: any) => e.category))];
    const grouped = categories.reduce((acc: any, cat: string) => {
      acc[cat] = enriched.filter((e: any) => e.category === cat);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({ events: enriched, grouped, total: enriched.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
