-- =============================================================================
-- Migrate user_agent_access → agent_user_permissions
-- =============================================================================

-- 1. Copy existing access records, resolving slug → agent UUID
INSERT INTO agent_user_permissions (agent_id, user_id, company_id, permission_level, granted_by)
SELECT 
  ar.id AS agent_id,
  ua.user_id,
  COALESCE(p.company_id, '00000000-0000-0000-0000-000000000000') AS company_id,
  'use'::permission_level,
  ua.user_id AS granted_by  -- self-reference since old table just had 'admin' string
FROM user_agent_access ua
JOIN agent_registry ar ON ar.slug = ua.agent_slug
LEFT JOIN profiles p ON p.id = ua.user_id
ON CONFLICT (agent_id, user_id, company_id) DO NOTHING;

-- 2. Seed role-level defaults so admins get all agents automatically
INSERT INTO agent_role_permissions (agent_id, role, permission_level)
SELECT ar.id, r.role, r.perm
FROM agent_registry ar
CROSS JOIN (VALUES 
  ('super_admin', 'admin'::permission_level),
  ('admin', 'admin'::permission_level)
) AS r(role, perm)
WHERE ar.status IN ('live', 'beta')
ON CONFLICT (agent_id, role) DO NOTHING;

-- 3. Verify
SELECT 'User permissions migrated: ' || count(*) FROM agent_user_permissions;
SELECT 'Role permissions seeded: ' || count(*) FROM agent_role_permissions;
