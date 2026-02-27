'use client';
import { useState, useEffect } from 'react';

// ============================================================================
// Types — backward-compatible with old AgentDefinition
// ============================================================================
export type AgentStatus = 'live' | 'demo' | 'dev' | 'beta' | 'locked' | 'draft' | 'deprecated' | 'archived';
export type FeatureStatus = 'done' | 'backlog' | 'debt';
export type AgentCategory = 'finance' | 'sales' | 'operations' | 'compliance' | 'people' | 'portal' | 'hr' | 'marketing' | 'warehouse' | 'legal' | 'support' | 'research';

export interface AgentFeature {
  name: string;
  status: FeatureStatus;
}

export interface AgentDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  status: AgentStatus;
  category: string;
  completionPct: number;
  sortOrder: number;
  liveRoute: string;
  demoRoute: string;
  portal: string;
  features: AgentFeature[];
  odooModel?: string;
  emptyStateMessage: string;
  color?: string;
  keywords?: string[];
  modules?: any[];
}

// Backward-compatible alias
export type Agent = AgentDefinition;

// ============================================================================
// Transform registry API response → old AgentDefinition shape
// ============================================================================
function registryToLegacy(agent: any): AgentDefinition {
  const meta = agent.metadata || {};
  return {
    slug: agent.slug,
    name: agent.name || agent.display_name,
    description: agent.description || agent.short_description || '',
    icon: agent.icon || '🤖',
    status: agent.status || 'live',
    category: agent.primary_category?.slug || agent.primary_category?.display_name || meta.portal || '',
    completionPct: meta.completionPct || 0,
    sortOrder: agent.display_order || 0,
    liveRoute: meta.liveRoute || (agent.component_path ? '/' + agent.component_path : ''),
    demoRoute: meta.demoRoute || '',
    portal: meta.portal || 'shared',
    features: (agent.modules || []).map((m: any) => ({ name: m.display_name || m.slug, status: 'done' as FeatureStatus })),
    odooModel: meta.odooModel || undefined,
    emptyStateMessage: meta.emptyStateMessage || 'Configure this agent to get started.',
    color: agent.color,
    keywords: agent.keywords || [],
    modules: agent.modules || [],
  };
}

// ============================================================================
// Hook: useAgents — replaces `import { AGENTS } from '@/lib/agents'`
// ============================================================================
export function useAgents() {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/agents/registry');
        if (!res.ok) throw new Error('Failed to fetch agents');
        const data = await res.json();
        setAgents((data.agents || []).map(registryToLegacy));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { agents, loading, error };
}

// ============================================================================
// Hook: useAgent — fetch single agent by slug
// ============================================================================
export function useAgent(slug: string) {
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        const res = await fetch(`/api/agents/registry?slug=${slug}`);
        if (!res.ok) throw new Error('Agent not found');
        const data = await res.json();
        setAgent(registryToLegacy(data.agent));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  return { agent, loading, error };
}

// ============================================================================
// Helper functions — backward-compatible with old lib/agents
// ============================================================================
export function getAgentsByCategory(agents: AgentDefinition[], category: string): AgentDefinition[] {
  return agents.filter(a => a.category === category);
}

export function getLiveAgents(agents: AgentDefinition[]): AgentDefinition[] {
  return agents.filter(a => a.status === 'live');
}

export function getDevAgents(agents: AgentDefinition[]): AgentDefinition[] {
  return agents.filter(a => a.status === 'dev' || a.status === 'beta' || a.status === 'demo');
}

export function getAgentsByPortal(agents: AgentDefinition[], portal: string): AgentDefinition[] {
  return agents.filter(a => a.portal === portal);
}

// Category labels for sidebar grouping
export const CATEGORY_LABELS: Record<string, string> = {
  finance: 'Finance & Accounting',
  sales: 'Sales & Marketing',
  operations: 'Operations & Logistics',
  compliance: 'Legal & Compliance',
  people: 'People & Culture',
  portal: 'Portal & Tools',
  hr: 'HR & People',
  marketing: 'Marketing',
  warehouse: 'Warehouse',
  legal: 'Legal',
  support: 'Support',
  research: 'Research',
};

// Category sort order
export const CATEGORY_ORDER: string[] = [
  'finance', 'sales', 'operations', 'compliance', 'people', 'portal',
  'hr', 'marketing', 'warehouse', 'legal', 'support', 'research',
];
