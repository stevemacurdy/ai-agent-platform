// ============================================================
// WoulfAI Agent Index — Re-exports from agent-registry.ts
// This file exists for backward compatibility.
// All definitions live in agent-registry.ts (single source of truth).
// ============================================================
export {
  AGENTS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getAgent,
  getAgentsByCategory,
  getAgentsByPortal,
  getAgentsBySortOrder,
  getLiveAgents,
  getDevAgents,
} from './agent-registry';

export type {
  Agent,
  AgentDefinition,
  AgentCategory,
  AgentFeature,
  AgentStatus,
  FeatureStatus,
} from './agent-registry';
