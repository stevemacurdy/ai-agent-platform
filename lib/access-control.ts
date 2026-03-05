// ============================================================================
// WoulfAI Access Control — Single Source of Truth
// ============================================================================
// Every access decision goes through canAccessAgent().
// Roles: admin | super_admin | employee | subscription | beta_tester | free
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'employee' | 'subscription' | 'beta_tester' | 'free';

export interface UserAccess {
  id: string;
  email: string;
  role: UserRole;
  assignedAgents: string[];
  paidAgents: string[];
  freeGrantedAgents: string[];
  betaActive: boolean;
}

/**
 * Can this user access a specific agent's console?
 * This is THE function. Everything else calls this.
 */
export function canAccessAgent(user: UserAccess, agentSlug: string): boolean {
  // Admins access everything
  if (user.role === 'super_admin' || user.role === 'admin') return true;

  // Beta testers access everything IF active
  if (user.role === 'beta_tester') return user.betaActive;

  // Employees only access assigned agents
  if (user.role === 'employee') {
    return user.assignedAgents.includes(agentSlug)
      || user.freeGrantedAgents.includes(agentSlug);
  }

  // Subscribers access paid + free-granted agents
  if (user.role === 'subscription') {
    return user.paidAgents.includes(agentSlug)
      || user.freeGrantedAgents.includes(agentSlug);
  }

  // Free users only access admin-granted free agents
  return user.freeGrantedAgents.includes(agentSlug);
}

/**
 * Get access status label for marketplace cards
 */
export function getAgentAccessStatus(user: UserAccess, agentSlug: string): {
  hasAccess: boolean;
  label: string;
  color: 'green' | 'blue' | 'teal' | 'purple' | 'orange' | 'gray';
  action: 'open' | 'subscribe' | 'request' | 'locked';
} {
  if (canAccessAgent(user, agentSlug)) {
    if (user.role === 'super_admin' || user.role === 'admin') {
      return { hasAccess: true, label: 'Admin Access', color: 'purple', action: 'open' };
    }
    if (user.paidAgents.includes(agentSlug)) {
      return { hasAccess: true, label: 'Active', color: 'green', action: 'open' };
    }
    if (user.assignedAgents.includes(agentSlug)) {
      return { hasAccess: true, label: 'Assigned', color: 'blue', action: 'open' };
    }
    if (user.freeGrantedAgents.includes(agentSlug)) {
      return { hasAccess: true, label: 'Free Access', color: 'teal', action: 'open' };
    }
    if (user.role === 'beta_tester') {
      return { hasAccess: true, label: 'Beta Access', color: 'orange', action: 'open' };
    }
    return { hasAccess: true, label: 'Active', color: 'green', action: 'open' };
  }

  if (user.role === 'employee') {
    return { hasAccess: false, label: 'Not Assigned', color: 'gray', action: 'request' };
  }
  return { hasAccess: false, label: 'Upgrade to Access', color: 'orange', action: 'subscribe' };
}

/**
 * Get all agent slugs a user can access (for sidebar)
 */
export function getAccessibleAgents(user: UserAccess, allSlugs: string[]): string[] {
  if (user.role === 'super_admin' || user.role === 'admin') return allSlugs;
  if (user.role === 'beta_tester' && user.betaActive) return allSlugs;

  const accessible = new Set<string>();
  user.assignedAgents.forEach(s => accessible.add(s));
  user.paidAgents.forEach(s => accessible.add(s));
  user.freeGrantedAgents.forEach(s => accessible.add(s));
  return Array.from(accessible);
}

/**
 * Build UserAccess from a profile row (server-side helper)
 */
export function profileToUserAccess(profile: {
  id: string;
  email?: string;
  role?: string;
  assigned_agents?: string[] | null;
  paid_agents?: string[] | null;
  free_granted_agents?: string[] | null;
  beta_active?: boolean;
}): UserAccess {
  return {
    id: profile.id,
    email: profile.email || '',
    role: (profile.role || 'free') as UserRole,
    assignedAgents: Array.isArray(profile.assigned_agents) ? profile.assigned_agents : [],
    paidAgents: Array.isArray(profile.paid_agents) ? profile.paid_agents : [],
    freeGrantedAgents: Array.isArray(profile.free_granted_agents) ? profile.free_granted_agents : [],
    betaActive: profile.beta_active || false,
  };
}
