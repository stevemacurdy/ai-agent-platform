// WoulfAI Demo Registry — Central nervous system for all agent demos
// Each agent file calls registerAgent() on import. Zero central config needed.

export interface AgentDemoMeta {
  slug: string;
  name: string;
  icon: string;
  dept: string;
  deptColor: string;
  description: string;
  valueProposition: string;
  enabled: boolean;
  buildBatch: 1 | 2 | 3;
}

export interface DemoTab {
  id: string;
  label: string;
  kpis: DemoKpi[];
  columns: DemoColumn[];
  rows: Record<string, unknown>[];
  expandedFields?: string[];
  chart: DemoChart;
  recommendations: DemoRecommendation[];
  actions: DemoAction[];
}

export interface DemoKpi {
  label: string;
  value: number;
  textValue?: string;
  prefix?: string;
  suffix?: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  icon: string;
}

export interface DemoColumn {
  key: string;
  label: string;
  sortable: boolean;
}

export interface DemoChart {
  type: 'bar' | 'line' | 'area' | 'pie' | 'stacked-bar' | 'donut' | 'grouped-bar';
  data: Record<string, unknown>[];
  dataKeys: string[];
  xKey?: string;
  title: string;
  colors?: string[];
}

export interface DemoRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action: string;
}

export interface DemoAction {
  label: string;
  description: string;
}

export interface AgentDemoData {
  meta: AgentDemoMeta;
  tabs: DemoTab[];
}

const agentRegistry: Map<string, AgentDemoData> = new Map();

export function registerAgent(data: AgentDemoData): void {
  agentRegistry.set(data.meta.slug, data);
}

export function getAgent(slug: string): AgentDemoData | undefined {
  const agent = agentRegistry.get(slug);
  if (!agent || !agent.meta.enabled) return undefined;
  return agent;
}

export function getAllAgents(): AgentDemoData[] {
  return Array.from(agentRegistry.values());
}

export function getEnabledAgents(): AgentDemoData[] {
  return Array.from(agentRegistry.values()).filter(a => a.meta.enabled);
}

export function toggleAgent(slug: string, enabled: boolean): boolean {
  const agent = agentRegistry.get(slug);
  if (!agent) return false;
  agent.meta.enabled = enabled;
  return true;
}
