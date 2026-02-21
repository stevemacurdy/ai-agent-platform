/**
 * ============================================================
 *  WoulfAI — Role-Based Access & User Management Patch
 * ============================================================
 *  1. Role-aware sidebar (employees see only approved agents)
 *  2. Admin user creation (temp password + invite link)
 *  3. First-login password reset flow
 *  4. Admin dashboard synced to all 14 agents
 *  5. User-agent assignment system
 *  6. SQL migration for user_agent_access + profiles updates
 *
 *  Run:
 *    cd /c/Users/steve/Desktop/ai-ecosystem/ai-agent-platform
 *    node role-access-patch.js
 *    npm run build
 *    vercel --prod
 *  Then run SQL migration in Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
let created = 0;

function write(filePath, content) {
  const fullPath = path.join(ROOT, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  if (fs.existsSync(fullPath)) {
    const bd = path.join(ROOT, '.backups', 'role-access-patch');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(fullPath, path.join(bd, filePath.replace(/\//g, '__')));
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  created++;
  console.log('  \u2713 ' + filePath);
}

console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 Role-Based Access Patch              \u2551');
console.log('  \u2551  Sidebar \u00B7 User Mgmt \u00B7 Temp Passwords \u00B7 RBAC     \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

const APP_PREFIX = fs.existsSync(path.join(ROOT, 'src/app')) ? 'src/' : '';

// ============================================================
// FILE 1: useCurrentUser hook
// ============================================================
console.log('  [1/12] useCurrentUser hook');

write(APP_PREFIX + 'lib/hooks/use-current-user.ts', `'use client';
import { useEffect, useState } from 'react';

export interface CurrentUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'employee' | 'beta_tester' | 'org_lead';
  must_reset_password: boolean;
  full_name?: string;
  approved_agents: string[]; // agent slugs this user can access
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { if (mounted) setLoading(false); return; }
        const data = await res.json();
        if (mounted) { setUser(data.user || data); setLoading(false); }
      } catch {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  return { user, loading, isAdmin };
}
`);

// ============================================================
// FILE 2: Role-aware sidebar
// ============================================================
console.log('  [2/12] Role-aware sidebar');

write(APP_PREFIX + 'components/dashboard/sidebar-nav.tsx', `'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/lib/providers/tenant-provider';
import { AGENTS, CATEGORY_LABELS, CATEGORY_ORDER, type AgentCategory } from '@/lib/agents/agent-registry';
import { useCurrentUser } from '@/lib/hooks/use-current-user';

const ALL_LIVE = AGENTS.filter(a => a.status === 'live');

export default function SidebarNav() {
  const pathname = usePathname();
  const { currentCompany, companies, switchCompany, isLoading } = useTenant();
  const { user, isAdmin } = useCurrentUser();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Role-based filtering: admins see all, employees see only approved
  const visibleAgents = isAdmin || !user
    ? ALL_LIVE
    : ALL_LIVE.filter(a => user.approved_agents?.includes(a.slug));

  const LIVE_COUNT = visibleAgents.length;

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const agents = visibleAgents.filter(a => a.category === cat);
    if (agents.length > 0) acc[cat] = agents;
    return acc;
  }, {} as Record<AgentCategory, typeof AGENTS>);

  const toggleCat = (cat: string) => setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  return (
    <aside className="w-64 bg-[#0A0E15] border-r border-white/5 text-gray-100 min-h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          Woulf<span className="text-blue-400">AI</span>
        </Link>
        <div className="text-[10px] text-gray-500 mt-1">{LIVE_COUNT} Live Agent{LIVE_COUNT !== 1 ? 's' : ''}</div>
      </div>

      {/* Business Switcher */}
      <div className="px-3 py-3 border-b border-white/5 relative">
        <button onClick={() => setSwitcherOpen(!switcherOpen)} className="w-full flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-sm">
          <span className="truncate">{isLoading ? 'Loading...' : currentCompany?.name || 'Select Company'}</span>
          <svg className={\`w-4 h-4 flex-shrink-0 ml-2 transition \${switcherOpen ? 'rotate-180' : ''}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {switcherOpen && companies.length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-[#111827] rounded-lg shadow-xl border border-white/10 z-50 max-h-60 overflow-y-auto">
            {companies.map((c) => (
              <button key={c.id} onClick={() => { switchCompany(c.id); setSwitcherOpen(false); }} className={\`w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition \${c.id === currentCompany?.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'}\`}>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links - visible to all */}
      <div className="px-3 py-3 border-b border-white/5 space-y-1">
        <Link href="/portal" className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition \${pathname?.startsWith('/portal') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}\`}>
          <span className="text-lg">{'\uD83D\uDCCB'}</span><span>Customer Portal</span>
        </Link>
        <Link href="/onboarding" className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition \${pathname?.startsWith('/onboarding') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}\`}>
          <span className="text-lg">{'\uD83D\uDE80'}</span><span>Onboarding</span>
        </Link>
      </div>

      {/* Agent Navigation - filtered by role */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {visibleAgents.length === 0 && !isAdmin && (
          <div className="px-3 py-4 text-center">
            <div className="text-2xl mb-2">{'\uD83D\uDD12'}</div>
            <p className="text-xs text-gray-500">No agents assigned yet.</p>
            <p className="text-xs text-gray-600 mt-1">Contact your admin for access.</p>
          </div>
        )}
        {Object.entries(grouped).map(([cat, agents]) => (
          <div key={cat}>
            <button onClick={() => toggleCat(cat)} className="w-full flex items-center justify-between px-3 mb-1">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{CATEGORY_LABELS[cat as AgentCategory]} ({agents.length})</h3>
              <svg className={\`w-3 h-3 text-gray-600 transition \${collapsed[cat] ? '-rotate-90' : ''}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsed[cat] && (
              <ul className="space-y-0.5">
                {agents.map((agent) => {
                  const active = pathname?.startsWith(agent.liveRoute);
                  return (
                    <li key={agent.slug}>
                      <Link href={agent.liveRoute} className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition \${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}\`}>
                        <span className="text-base">{agent.icon}</span>
                        <span className="truncate text-xs">{agent.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Links - Admin only */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        {isAdmin && (
          <>
            <Link href="/admin" className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition \${pathname?.startsWith('/admin') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}\`}>
              <span className="text-lg">{'\u26A1'}</span><span>Admin Dashboard</span>
            </Link>
            <Link href="/demo" className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition \${pathname?.startsWith('/demo') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}\`}>
              <span className="text-lg">{'\uD83C\uDFAE'}</span><span>Demo Hub</span>
            </Link>
          </>
        )}
        {user && (
          <div className="px-3 py-2 text-[10px] text-gray-600 border-t border-white/5 mt-2 pt-2">
            <div className="truncate">{user.email}</div>
            <div className="text-gray-700 capitalize">{user.role?.replace('_', ' ')}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
`);

// ============================================================
// FILE 3: Enhanced /api/auth/me endpoint
// ============================================================
console.log('  [3/12] Enhanced /api/auth/me');

write(APP_PREFIX + 'app/api/auth/me/route.ts', `import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie or header
    const token = req.cookies.get('sb-access-token')?.value
      || req.cookies.get('supabase-auth-token')?.value
      || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sb = supabase();
    const { data: { user: authUser }, error } = await sb.auth.getUser(token);

    if (error || !authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get profile with role
    const { data: profile } = await sb
      .from('profiles')
      .select('role, full_name, must_reset_password')
      .eq('id', authUser.id)
      .single();

    // Get approved agents for this user
    const { data: agentAccess } = await sb
      .from('user_agent_access')
      .select('agent_slug')
      .eq('user_id', authUser.id);

    const approved_agents = agentAccess?.map(a => a.agent_slug) || [];

    // Admins get all agents
    const role = profile?.role || 'employee';
    const isAdmin = role === 'super_admin' || role === 'admin';

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: authUser.email,
        role,
        full_name: profile?.full_name || '',
        must_reset_password: profile?.must_reset_password || false,
        approved_agents: isAdmin ? [] : approved_agents, // empty = show all for admins
      }
    });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
`);

// ============================================================
// FILE 4: Admin create-user endpoint (temp password)
// ============================================================
console.log('  [4/12] Admin create-user API');

write(APP_PREFIX + 'app/api/admin/create-user/route.ts', `import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTempPassword(): string {
  // Simple 8-char password: 4 letters + 4 digits
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  let pw = '';
  for (let i = 0; i < 4; i++) pw += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) pw += digits[Math.floor(Math.random() * digits.length)];
  return pw;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, role = 'employee', company_id, agent_slugs = [] } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sb = supabase();
    const tempPassword = generateTempPassword();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Skip email verification
      user_metadata: { full_name, role },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create/update profile
    await sb.from('profiles').upsert({
      id: userId,
      email,
      full_name: full_name || '',
      role,
      must_reset_password: true,
      updated_at: new Date().toISOString(),
    });

    // Add to company if specified
    if (company_id) {
      await sb.from('company_members').upsert({
        user_id: userId,
        company_id,
        role: role === 'admin' || role === 'super_admin' ? 'admin' : 'member',
      }, { onConflict: 'user_id,company_id' });
    }

    // Assign agents
    if (agent_slugs.length > 0) {
      const records = agent_slugs.map((slug: string) => ({
        user_id: userId,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').upsert(records, {
        onConflict: 'user_id,agent_slug',
      });
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      email,
      temp_password: tempPassword,
      message: 'User created. Temp password: ' + tempPassword,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ============================================================
// FILE 5: Admin invite-user endpoint (email invite link)
// ============================================================
console.log('  [5/12] Admin invite-user API');

write(APP_PREFIX + 'app/api/admin/invite-user/route.ts', `import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, role = 'employee', company_id, agent_slugs = [] } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sb = supabase();

    // Send magic link / invite via Supabase
    const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role },
      redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.woulfai.com') + '/login?invited=true',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user.id;

    // Create profile
    await sb.from('profiles').upsert({
      id: userId,
      email,
      full_name: full_name || '',
      role,
      must_reset_password: false,
      updated_at: new Date().toISOString(),
    });

    // Add to company
    if (company_id) {
      await sb.from('company_members').upsert({
        user_id: userId,
        company_id,
        role: role === 'admin' || role === 'super_admin' ? 'admin' : 'member',
      }, { onConflict: 'user_id,company_id' });
    }

    // Assign agents
    if (agent_slugs.length > 0) {
      const records = agent_slugs.map((slug: string) => ({
        user_id: userId,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').upsert(records, {
        onConflict: 'user_id,agent_slug',
      });
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      email,
      message: 'Invite sent to ' + email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ============================================================
// FILE 6: Admin manage-agents endpoint (assign/revoke)
// ============================================================
console.log('  [6/12] Admin manage-agents API');

write(APP_PREFIX + 'app/api/admin/manage-agents/route.ts', `import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, agent_slugs } = await req.json();
    if (!user_id || !Array.isArray(agent_slugs)) {
      return NextResponse.json({ error: 'user_id and agent_slugs[] required' }, { status: 400 });
    }

    const sb = supabase();

    // Remove all current access
    await sb.from('user_agent_access').delete().eq('user_id', user_id);

    // Insert new access
    if (agent_slugs.length > 0) {
      const records = agent_slugs.map((slug: string) => ({
        user_id,
        agent_slug: slug,
        granted_by: 'admin',
      }));
      await sb.from('user_agent_access').insert(records);
    }

    return NextResponse.json({ success: true, agent_slugs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ============================================================
// FILE 7: Password reset page (first login)
// ============================================================
console.log('  [7/12] Password reset page');

write(APP_PREFIX + 'app/reset-password/page.tsx', `'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update password');
        setSaving(false);
        return;
      }

      // Redirect to portal
      router.push('/agents/org-lead');
    } catch {
      setError('Network error');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Set Your Password</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Welcome to WoulfAI! Please create a secure password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
              placeholder="Type it again"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
`);

// ============================================================
// FILE 8: Password reset API
// ============================================================
console.log('  [8/12] Password reset API');

write(APP_PREFIX + 'app/api/auth/reset-password/route.ts', `import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Get current user from token
    const token = req.cookies.get('sb-access-token')?.value
      || req.cookies.get('supabase-auth-token')?.value
      || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sb = supabase();
    const { data: { user }, error: userError } = await sb.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Update password
    const { error: updateError } = await sb.auth.admin.updateUserById(user.id, {
      password,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Clear must_reset_password flag
    await sb.from('profiles').update({
      must_reset_password: false,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ============================================================
// FILE 9: Admin Users page with create user form
// ============================================================
console.log('  [9/12] Admin Users page (create + manage)');

write(APP_PREFIX + 'app/admin/users/page.tsx', `'use client';
import { useState, useEffect } from 'react';
import { AGENTS } from '@/lib/agents/agent-registry';
import Link from 'next/link';

const LIVE_AGENTS = AGENTS.filter(a => a.status === 'live');

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  approved_agents: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<'password' | 'invite'>('password');
  const [form, setForm] = useState({ email: '', full_name: '', role: 'employee', agent_slugs: [] as string[] });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editAgents, setEditAgents] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
  }, [result]);

  const toggleAgent = (slug: string) => {
    setForm(f => ({
      ...f,
      agent_slugs: f.agent_slugs.includes(slug)
        ? f.agent_slugs.filter(s => s !== slug)
        : [...f.agent_slugs, slug],
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, agent_slugs: LIVE_AGENTS.map(a => a.slug) }));
  const selectNone = () => setForm(f => ({ ...f, agent_slugs: [] }));

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);
    const endpoint = createMode === 'password' ? '/api/admin/create-user' : '/api/admin/invite-user';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setForm({ email: '', full_name: '', role: 'employee', agent_slugs: [] });
      }
    } catch (err: any) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const handleUpdateAgents = async (userId: string) => {
    await fetch('/api/admin/manage-agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, agent_slugs: editAgents }),
    });
    setEditingUser(null);
    setResult({ success: true, message: 'Agent access updated' });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">Create users, assign agents, manage access</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition"
        >
          {showCreate ? 'Close' : '+ Add User'}
        </button>
      </div>

      {/* Create User Panel */}
      {showCreate && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 space-y-5">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setCreateMode('password')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (createMode === 'password' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
            >
              Temp Password
            </button>
            <button
              onClick={() => setCreateMode('invite')}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (createMode === 'invite' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
            >
              Email Invite
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                placeholder="employee@company.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
                placeholder="Jane Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="org_lead">Organization Lead</option>
              <option value="beta_tester">Beta Tester</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-400">Assign Agents</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-blue-400 hover:underline">Select All</button>
                <button onClick={selectNone} className="text-[10px] text-gray-500 hover:underline">Clear</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LIVE_AGENTS.map(agent => (
                <button
                  key={agent.slug}
                  onClick={() => toggleAgent(agent.slug)}
                  className={"flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition border " +
                    (form.agent_slugs.includes(agent.slug)
                      ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10')}
                >
                  <span>{agent.icon}</span>
                  <span className="truncate">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !form.email}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {loading ? 'Creating...' : createMode === 'password' ? 'Create with Temp Password' : 'Send Invite Email'}
          </button>

          {result && (
            <div className={"px-4 py-3 rounded-lg text-sm " + (result.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400')}>
              {result.success ? (
                <div>
                  <div className="font-medium">{result.message}</div>
                  {result.temp_password && (
                    <div className="mt-2 bg-black/30 rounded px-3 py-2 font-mono">
                      Temp Password: <span className="text-white font-bold">{result.temp_password}</span>
                      <p className="text-[10px] text-gray-500 mt-1">Share this with the employee. They will be prompted to change it on first login.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>{result.error}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User List */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">User</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Agents</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="text-sm text-white">{u.full_name || 'No Name'}</div>
                  <div className="text-[10px] text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={"text-[10px] px-2 py-0.5 rounded font-medium " +
                    (u.role === 'super_admin' || u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400')
                  }>{u.role?.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3">
                  {editingUser === u.id ? (
                    <div className="flex flex-wrap gap-1">
                      {LIVE_AGENTS.map(a => (
                        <button
                          key={a.slug}
                          onClick={() => setEditAgents(prev =>
                            prev.includes(a.slug) ? prev.filter(s => s !== a.slug) : [...prev, a.slug]
                          )}
                          className={"text-[10px] px-1.5 py-0.5 rounded " +
                            (editAgents.includes(a.slug) ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-gray-600')}
                        >{a.icon}</button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {(u.approved_agents || []).slice(0, 5).map(slug => {
                        const a = LIVE_AGENTS.find(a => a.slug === slug);
                        return a ? <span key={slug} title={a.name} className="text-sm">{a.icon}</span> : null;
                      })}
                      {(u.approved_agents || []).length > 5 && (
                        <span className="text-[10px] text-gray-500">+{u.approved_agents.length - 5}</span>
                      )}
                      {(u.role === 'super_admin' || u.role === 'admin') && (
                        <span className="text-[10px] text-purple-400 italic">all access</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingUser === u.id ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleUpdateAgents(u.id)} className="text-xs text-blue-400 hover:underline">Save</button>
                      <button onClick={() => setEditingUser(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingUser(u.id); setEditAgents(u.approved_agents || []); }}
                      className="text-xs text-gray-500 hover:text-blue-400 transition"
                    >Edit Access</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-600">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

// ============================================================
// FILE 10: Sync lib/agents/index.ts with all 14 agents
// ============================================================
console.log('  [10/12] Sync agents index (all 14)');

write(APP_PREFIX + 'lib/agents/index.ts', `// ============================================================
// WoulfAI Agent Index — Synced with agent-registry.ts
// Re-exports for backward compatibility + full 14-agent list
// ============================================================
export type AgentStatus = 'live' | 'dev' | 'beta';
export type FeatureStatus = 'done' | 'backlog' | 'debt';

export interface AgentFeature {
  name: string;
  status: FeatureStatus;
}

export interface Agent {
  slug: string;
  name: string;
  description: string;
  icon: string;
  status: AgentStatus;
  completionPct: number;
  category: 'finance' | 'sales' | 'operations' | 'compliance' | 'people';
  liveRoute: string | null;
  demoRoute: string;
  features: AgentFeature[];
  sortOrder: number;
}

export const AGENTS: Agent[] = [
  {
    slug: 'cfo', name: 'CFO Agent', icon: '\uD83D\uDCC8', status: 'live', completionPct: 92,
    description: 'Financial intelligence, invoices, collections, health monitoring, and refinance alerts',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/cfo', sortOrder: 1,
    features: [
      { name: 'Invoice CRUD', status: 'done' },
      { name: 'Financial Health Score', status: 'done' },
      { name: 'Cashflow Forecast', status: 'done' },
      { name: 'Refinance Alert', status: 'done' },
      { name: 'Collections 4-Tier', status: 'done' },
    ],
  },
  {
    slug: 'sales', name: 'Sales Agent', icon: '\uD83C\uDFAF', status: 'live', completionPct: 95,
    description: 'CRM pipeline, behavioral profiles, battle cards, and deal intelligence',
    category: 'sales', liveRoute: '/agents/sales/intel', demoRoute: '/demo/sales', sortOrder: 2,
    features: [
      { name: 'Pipeline Kanban', status: 'done' },
      { name: 'Contact Intel', status: 'done' },
      { name: 'Battle Cards', status: 'done' },
      { name: 'Activity Tracking', status: 'done' },
    ],
  },
  {
    slug: 'finops', name: 'FinOps Agent', icon: '\uD83D\uDCCA', status: 'live', completionPct: 88,
    description: 'AP management, debt tracking, labor analysis, and forecasting',
    category: 'finance', liveRoute: '/agents/cfo/finops', demoRoute: '/demo/finops', sortOrder: 3,
    features: [
      { name: 'AP Dashboard', status: 'done' },
      { name: 'Debt Tracker', status: 'done' },
      { name: 'Labor Analysis', status: 'done' },
    ],
  },
  {
    slug: 'payables', name: 'Payables Agent', icon: '\uD83E\uDDFE', status: 'live', completionPct: 85,
    description: 'Invoice intake, approval workflows, payment processing',
    category: 'finance', liveRoute: '/agents/cfo/payables', demoRoute: '/demo/payables', sortOrder: 4,
    features: [
      { name: 'Invoice Intake', status: 'done' },
      { name: 'Approval Queue', status: 'done' },
      { name: 'Payment Processing', status: 'done' },
    ],
  },
  {
    slug: 'collections', name: 'Collections Agent', icon: '\uD83D\uDCDE', status: 'live', completionPct: 80,
    description: '4-tier AI collections with behavioral intelligence',
    category: 'finance', liveRoute: '/agents/cfo/console', demoRoute: '/demo/collections', sortOrder: 5,
    features: [
      { name: 'Aging Analysis', status: 'done' },
      { name: 'Auto-Escalation', status: 'done' },
      { name: 'Risk Scoring', status: 'done' },
    ],
  },
  {
    slug: 'org-lead', name: 'Organization Lead', icon: '\uD83C\uDFE2', status: 'live', completionPct: 95,
    description: 'Command center for org-wide KPIs, team management, and strategic oversight',
    category: 'operations', liveRoute: '/agents/org-lead', demoRoute: '/demo/org-lead', sortOrder: 6,
    features: [
      { name: 'KPI Dashboard', status: 'done' },
      { name: 'Team Overview', status: 'done' },
      { name: 'Strategic Planning', status: 'done' },
      { name: 'Cross-Agent Reports', status: 'done' },
    ],
  },
  {
    slug: 'seo', name: 'SEO Agent', icon: '\uD83D\uDD0D', status: 'live', completionPct: 95,
    description: 'Search rankings, keyword tracking, technical audits, and content optimization',
    category: 'sales', liveRoute: '/agents/seo', demoRoute: '/demo/seo', sortOrder: 7,
    features: [
      { name: 'Keyword Tracker', status: 'done' },
      { name: 'Technical Audit', status: 'done' },
      { name: 'Content Optimizer', status: 'done' },
    ],
  },
  {
    slug: 'marketing', name: 'Marketing Agent', icon: '\uD83D\uDCE3', status: 'live', completionPct: 95,
    description: 'Campaign management, content calendar, and analytics',
    category: 'sales', liveRoute: '/agents/marketing', demoRoute: '/demo/marketing', sortOrder: 8,
    features: [
      { name: 'Campaign Manager', status: 'done' },
      { name: 'Content Calendar', status: 'done' },
      { name: 'Analytics Dashboard', status: 'done' },
    ],
  },
  {
    slug: 'wms', name: 'WMS Agent', icon: '\uD83D\uDCE6', status: 'live', completionPct: 95,
    description: 'Warehouse inventory, receiving, and shipping management',
    category: 'operations', liveRoute: '/agents/wms', demoRoute: '/demo/wms', sortOrder: 9,
    features: [
      { name: 'Inventory Tracker', status: 'done' },
      { name: 'Receiving Workflow', status: 'done' },
      { name: 'Shipping Manager', status: 'done' },
    ],
  },
  {
    slug: 'hr', name: 'HR Agent', icon: '\uD83D\uDC65', status: 'live', completionPct: 95,
    description: 'Employee directory, PTO tracking, onboarding, and compliance',
    category: 'people', liveRoute: '/agents/hr', demoRoute: '/demo/hr', sortOrder: 10,
    features: [
      { name: 'Employee Directory', status: 'done' },
      { name: 'PTO Tracking', status: 'done' },
      { name: 'Onboarding Workflow', status: 'done' },
    ],
  },
  {
    slug: 'operations', name: 'Operations Agent', icon: '\u2699\uFE0F', status: 'live', completionPct: 95,
    description: 'Project tracking, crew scheduling, resource management',
    category: 'operations', liveRoute: '/agents/operations', demoRoute: '/demo/operations', sortOrder: 11,
    features: [
      { name: 'Project Tracker', status: 'done' },
      { name: 'Crew Scheduler', status: 'done' },
      { name: 'Resource Manager', status: 'done' },
    ],
  },
  {
    slug: 'legal', name: 'Legal Agent', icon: '\u2696\uFE0F', status: 'live', completionPct: 95,
    description: 'Contract analysis, risk assessment, compliance tracking',
    category: 'compliance', liveRoute: '/agents/legal', demoRoute: '/demo/legal', sortOrder: 12,
    features: [
      { name: 'Contract Analyzer', status: 'done' },
      { name: 'Risk Assessment', status: 'done' },
      { name: 'Compliance Tracker', status: 'done' },
    ],
  },
  {
    slug: 'compliance', name: 'Compliance Agent', icon: '\uD83D\uDEE1\uFE0F', status: 'live', completionPct: 95,
    description: 'Regulatory tracking, audit prep, policy management',
    category: 'compliance', liveRoute: '/agents/compliance', demoRoute: '/demo/compliance', sortOrder: 13,
    features: [
      { name: 'Regulatory Tracker', status: 'done' },
      { name: 'Audit Prep', status: 'done' },
      { name: 'Policy Manager', status: 'done' },
    ],
  },
  {
    slug: 'supply-chain', name: 'Supply Chain Agent', icon: '\uD83D\uDE9B', status: 'live', completionPct: 95,
    description: 'Vendor management, procurement, logistics optimization',
    category: 'operations', liveRoute: '/agents/supply-chain', demoRoute: '/demo/supply-chain', sortOrder: 14,
    features: [
      { name: 'Vendor Manager', status: 'done' },
      { name: 'Procurement', status: 'done' },
      { name: 'Logistics Optimizer', status: 'done' },
    ],
  },
];

export function getAgent(slug: string): Agent | undefined {
  return AGENTS.find(a => a.slug === slug);
}

export function getLiveAgents(): Agent[] {
  return AGENTS.filter(a => a.status === 'live');
}

export function getAgentsByCategory(category: Agent['category']): Agent[] {
  return AGENTS.filter(a => a.category === category && a.status === 'live');
}
`);

// ============================================================
// FILE 11: Updated Admin dashboard (all 14 agents)
// ============================================================
console.log('  [11/12] Admin dashboard (all 14 agents)');

write(APP_PREFIX + 'app/admin/page.tsx', `'use client';
import Link from 'next/link';
import { AGENTS } from '@/lib/agents/agent-registry';
import { useState, useEffect } from 'react';

const LIVE = AGENTS.filter(a => a.status === 'live');
const CATEGORIES = [...new Set(LIVE.map(a => a.category))];

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => setUserCount(d.users?.length || 0)).catch(() => {});
  }, []);

  const filtered = selectedCat ? LIVE.filter(a => a.category === selectedCat) : LIVE;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage {LIVE.length} live agents, {userCount} users, and platform settings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Live Agents</div>
          <div className="text-2xl font-bold mt-1 text-emerald-400">{LIVE.length}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Avg Completion</div>
          <div className="text-2xl font-bold mt-1">{Math.round(LIVE.reduce((s, a) => s + a.completionPct, 0) / LIVE.length)}%</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Users</div>
          <div className="text-2xl font-bold mt-1">{userCount}</div>
        </div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 uppercase">Categories</div>
          <div className="text-2xl font-bold mt-1">{CATEGORIES.length}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/admin/users" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition">
          Manage Users
        </Link>
        <Link href="/onboarding" className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition">
          Onboarding Wizard
        </Link>
        <Link href="/demo" className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/10 transition">
          Demo Hub
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCat(null)}
          className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (!selectedCat ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
        >
          All ({LIVE.length})
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize " + (selectedCat === cat ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
          >
            {cat} ({LIVE.filter(a => a.category === cat).length})
          </button>
        ))}
      </div>

      {/* Agent Grid — ALL 14 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(agent => (
          <Link
            key={agent.slug}
            href={agent.liveRoute}
            className="group bg-[#0A0E15] border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-400 transition text-sm">{agent.name}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{agent.category}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">LIVE</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-full h-1.5">
                <div className={"h-1.5 rounded-full " + (agent.completionPct >= 90 ? 'bg-emerald-500' : agent.completionPct >= 80 ? 'bg-blue-500' : 'bg-amber-500')}
                  style={{ width: agent.completionPct + '%' }} />
              </div>
              <span className="text-[10px] text-gray-500">{agent.completionPct}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
`);

// ============================================================
// FILE 12: SQL Migration
// ============================================================
console.log('  [12/12] SQL Migration');

write('supabase/migrations/009_user_agent_access.sql', `-- ============================================================
-- User Agent Access + Profile Updates
-- ============================================================

-- Add must_reset_password to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- User-Agent access control table
CREATE TABLE IF NOT EXISTS user_agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_slug TEXT NOT NULL,
  granted_by TEXT DEFAULT 'admin',
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_slug)
);

CREATE INDEX IF NOT EXISTS idx_uaa_user ON user_agent_access(user_id);
CREATE INDEX IF NOT EXISTS idx_uaa_slug ON user_agent_access(agent_slug);

-- RLS
ALTER TABLE user_agent_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_agent_access_self ON user_agent_access;
CREATE POLICY user_agent_access_self ON user_agent_access
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_agent_access_admin ON user_agent_access;
CREATE POLICY user_agent_access_admin ON user_agent_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Give your admin accounts full access to all agents
INSERT INTO user_agent_access (user_id, agent_slug)
SELECT u.id, a.slug
FROM auth.users u
CROSS JOIN agents a
WHERE u.email IN ('stevemacurdy@gmail.com', 'steve@woulfgroup.com')
  AND a.status = 'live'
ON CONFLICT (user_id, agent_slug) DO NOTHING;
`);

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('  ======================================================');
console.log('  \u2713 Created/Updated ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  What changed:');
console.log('    1.  useCurrentUser hook (role + approved agents)');
console.log('    2.  Sidebar: admins see all, employees see assigned only');
console.log('    3.  /api/auth/me: returns role + approved_agents');
console.log('    4.  /api/admin/create-user: temp password generation');
console.log('    5.  /api/admin/invite-user: email invite link');
console.log('    6.  /api/admin/manage-agents: assign/revoke agent access');
console.log('    7.  /reset-password: first-login password reset page');
console.log('    8.  /api/auth/reset-password: password update API');
console.log('    9.  /admin/users: full user management UI');
console.log('    10. lib/agents/index.ts: synced to all 14 agents');
console.log('    11. /admin: dashboard shows all 14 agents');
console.log('    12. SQL migration: user_agent_access table');
console.log('');
console.log('  Next steps:');
console.log('    1. npm run build');
console.log('    2. vercel --prod');
console.log('    3. Run SQL in Supabase: supabase/migrations/009_user_agent_access.sql');
console.log('');
console.log('  Backups: .backups/role-access-patch/');
console.log('');
