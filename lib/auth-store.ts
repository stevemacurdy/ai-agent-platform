// ============================================================================
// AUTH STORE — Users, roles, multi-role eligibility, tenant isolation
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'employee' | 'beta_tester' | 'org_lead'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  /** Additional roles this user can switch into */
  eligibleRoles: UserRole[]
  agents: string[]
  status: 'active' | 'invited' | 'suspended'
  password: string
  companyId: string
  companyName: string
  createdAt: string
  lastLogin?: string
  inviteCode?: string
}

export const ALL_AGENTS = [
  { id: 'cfo', name: 'CFO Agent', icon: '📈', description: 'Financial intelligence, forecasting, and P&L analysis' },
  { id: 'sales', name: 'Sales Agent', icon: '💼', description: 'Pipeline management, CRM, and deal intelligence' },
  { id: 'finops', name: 'FinOps Agent', icon: '💰', description: 'Cost optimization and cloud spend management' },
  { id: 'payables', name: 'Payables Agent', icon: '🧾', description: 'Invoice processing and AP automation' },
  { id: 'collections', name: 'Collections Agent', icon: '📬', description: 'AR tracking and payment follow-ups' },
  { id: 'hr', name: 'HR Agent', icon: '👥', description: 'People operations and workforce management' },
  { id: 'operations', name: 'Operations Agent', icon: '⚙️', description: 'Project tracking and operational workflows' },
  { id: 'legal', name: 'Legal Agent', icon: '⚖️', description: 'Contract review and compliance monitoring' },
  { id: 'marketing', name: 'Marketing Agent', icon: '📣', description: 'Campaign management and market intelligence' },
  { id: 'wms', name: 'WMS Agent', icon: '🏭', description: 'Warehouse management and inventory control' },
  { id: 'compliance', name: 'Compliance Agent', icon: '🛡️', description: 'Regulatory compliance and risk assessment' },
]

export const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; description: string; tier: number; icon: string }> = {
  super_admin: { label: 'Super Admin', color: 'text-rose-400', bg: 'bg-rose-500/10', description: 'Full platform access, billing, user management', tier: 5, icon: '🔑' },
  admin: { label: 'Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', description: 'Manage users, analytics, all agents', tier: 4, icon: '⚡' },
  employee: { label: 'Employee', color: 'text-blue-400', bg: 'bg-blue-500/10', description: 'Live agents scoped to company data', tier: 3, icon: '🏢' },
  org_lead: { label: 'Organization Lead', color: 'text-amber-400', bg: 'bg-amber-500/10', description: 'Your custom AI intelligence suite', tier: 2, icon: '👑' },
  beta_tester: { label: 'Beta Tester', color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: 'Free trial — full live agent access', tier: 1, icon: '🧪' },
}

// Password generator
const WORDS = ['alpha','bravo','delta','echo','foxtrot','golf','hotel','india','kilo','lima','metro','nova','oscar','papa','quebec','romeo','sierra','tango','ultra','victor','whisky','xray','zulu','apex','bolt','core','dash','edge','flux','grid','haze','iron','jade','knot','loop','mist','node','onyx','peak','quad','reef','snap','tide','vibe','wave','zero','blaze','crisp','drift','forge','gleam','hatch','inlet','jetty','lunar','maple','nexus','orbit','prism','quartz','ridge','slate','torch','unity','vault','wren']
function generatePassword(): string {
  const w1 = WORDS[Math.floor(Math.random() * WORDS.length)]
  const w2 = WORDS[Math.floor(Math.random() * WORDS.length)]
  const digits = String(Math.floor(Math.random() * 90) + 10)
  return w1 + '-' + w2 + '-' + digits
}

function generateInviteCode(): string {
  return 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

// ============================================================================
// MULTI-ROLE ELIGIBILITY LOGIC
// ============================================================================
// Given a user's primary role, return all roles they can sign in as.
// Higher-tier roles can always access lower tiers.
export function getEligibleRoles(user: AuthUser): UserRole[] {
  const primary = user.role
  // Explicit eligibleRoles override if set
  if (user.eligibleRoles && user.eligibleRoles.length > 0) return user.eligibleRoles

  switch (primary) {
    case 'super_admin':
      return ['super_admin', 'admin', 'employee', 'org_lead', 'beta_tester']
    case 'admin':
      return ['admin', 'employee', 'beta_tester']
    case 'employee':
      return ['employee', 'beta_tester']
    case 'org_lead':
      return ['org_lead', 'beta_tester']
    case 'beta_tester':
      return ['beta_tester']
    default:
      return [primary]
  }
}

// ============================================================================
// USER STORE
// ============================================================================
const ALL_AGENT_IDS = ALL_AGENTS.map(a => a.id)

export const userStore: AuthUser[] = [
  {
    id: 'u1', email: 'steve@woulfgroup.com', name: 'Steve Macurdy',
    role: 'super_admin', eligibleRoles: [], agents: ALL_AGENT_IDS, status: 'active',
    password: 'admin', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-01-01', lastLogin: '2026-02-17'
  },
  {
    id: 'u2', email: 'marcus@woulfgroup.com', name: 'Marcus Williams',
    role: 'employee', eligibleRoles: [], agents: ['sales', 'cfo'], status: 'active',
    password: 'REMOVED', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-01-15', lastLogin: '2026-02-16'
  },
  {
    id: 'u3', email: 'diana@woulfgroup.com', name: 'Diana Reeves',
    role: 'employee', eligibleRoles: [], agents: ['sales', 'operations', 'wms'], status: 'active',
    password: 'echo-foxtrot-77', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-01-15', lastLogin: '2026-02-15'
  },
  {
    id: 'u4', email: 'jason@woulfgroup.com', name: 'Jason Park',
    role: 'employee', eligibleRoles: [], agents: ['sales'], status: 'active',
    password: 'golf-hotel-33', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-02-01', lastLogin: '2026-02-14'
  },
  {
    id: 'u5', email: 'jess@woulfgroup.com', name: 'Jess Scharmer',
    role: 'employee', eligibleRoles: [], agents: ['cfo', 'payables', 'finops'], status: 'invited',
    password: 'maple-torch-61', companyId: 'woulf', companyName: 'Woulf Group',
    createdAt: '2026-02-17'
  },
  {
    id: 'u6', email: 'demo@client1.com', name: 'Sarah Chen',
    role: 'beta_tester', eligibleRoles: [], agents: ['cfo', 'sales', 'finops'], status: 'active',
    password: 'REMOVED', companyId: 'client1', companyName: 'Chen Logistics',
    createdAt: '2026-02-05', lastLogin: '2026-02-17'
  },
  {
    id: 'u7', email: 'pilot@logistics.co', name: 'Tom Bradley',
    role: 'beta_tester', eligibleRoles: [], agents: ['wms', 'operations'], status: 'active',
    password: 'apex-bolt-88', companyId: 'bradleylog', companyName: 'Bradley Logistics',
    createdAt: '2026-02-08', lastLogin: '2026-02-16'
  },
  {
    id: 'u8', email: 'paid@enterprise.com', name: 'Rachel Kim',
    role: 'org_lead', eligibleRoles: [], agents: ['cfo', 'finops', 'payables', 'collections'], status: 'active',
    password: 'REMOVED', companyId: 'kimenterprises', companyName: 'Kim Enterprises',
    createdAt: '2026-02-01', lastLogin: '2026-02-17'
  },
]

// ============================================================================
// OPERATIONS
// ============================================================================
export function findUserByEmail(email: string): AuthUser | undefined {
  return userStore.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function findUserById(id: string): AuthUser | undefined {
  return userStore.find(u => u.id === id)
}

export function authenticateUser(email: string, password: string): AuthUser | null {
  const user = findUserByEmail(email)
  if (!user) return null
  if (user.password !== password) return null
  if (user.status === 'suspended') return null
  if (user.status === 'invited') user.status = 'active'
  user.lastLogin = new Date().toISOString().slice(0, 10)
  return user
}

export function createUser(data: {
  email: string; name: string; role: UserRole; agents: string[];
  companyId?: string; companyName?: string
}): { user: AuthUser; password: string; inviteCode: string } {
  const password = generatePassword()
  const inviteCode = generateInviteCode()
  const cid = data.companyId || data.email.split('@')[1]?.split('.')[0] || 'default'
  const user: AuthUser = {
    id: 'u-' + Date.now(),
    email: data.email,
    name: data.name || data.email.split('@')[0],
    role: data.role,
    eligibleRoles: [],
    agents: (data.role === 'admin' || data.role === 'super_admin') ? ALL_AGENT_IDS : data.agents,
    status: 'invited',
    password,
    companyId: cid,
    companyName: data.companyName || cid,
    inviteCode,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  userStore.push(user)
  return { user, password, inviteCode }
}

export function updateUser(id: string, updates: Partial<AuthUser>): AuthUser | null {
  const user = findUserById(id)
  if (!user) return null
  Object.assign(user, updates)
  if (updates.role === 'admin' || updates.role === 'super_admin') {
    user.agents = ALL_AGENT_IDS
  }
  return user
}

export function removeUser(id: string): boolean {
  const idx = userStore.findIndex(u => u.id === id)
  if (idx === -1) return false
  userStore.splice(idx, 1)
  return true
}

export function safeUser(user: AuthUser) {
  const { password, ...safe } = user
  return safe
}
