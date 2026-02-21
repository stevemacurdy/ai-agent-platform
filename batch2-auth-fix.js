/**
 * ============================================================
 *  WoulfAI — Batch 2b: Auth Session Fix
 * ============================================================
 *  Root cause: Login stores session in localStorage (Supabase JS default).
 *  /api/auth/me looks for cookies that don't exist → returns null → loop.
 *
 *  Fix: AuthGuard reads token from Supabase client and passes it
 *  via Authorization header. /api/auth/me reads that header.
 *
 *  Run:
 *    node batch2-auth-fix.js
 *    npm run build
 *    vercel --prod
 */

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
let created = 0;

function write(fp, content) {
  const full = path.join(ROOT, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (fs.existsSync(full)) {
    const bd = path.join(ROOT, '.backups', 'batch2b');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(full, path.join(bd, fp.replace(/\//g, '__')));
  }
  fs.writeFileSync(full, content, 'utf8');
  created++;
  console.log('  \u2713 ' + fp);
}

console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 Batch 2b: Auth Session Fix         \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

const AP = fs.existsSync(path.join(ROOT, 'src/app')) ? 'src/' : '';

// ============================================================
// FILE 1: Supabase browser client helper
// ============================================================
console.log('  [1/5] Supabase browser client helper');

write(AP + 'lib/supabase-browser.ts', `import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (client) return client;
  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
`);

// ============================================================
// FILE 2: AuthGuard — reads token from Supabase client, passes via header
// ============================================================
console.log('  [2/5] AuthGuard (token-aware)');

write(AP + 'components/auth/AuthGuard.tsx', `'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin' | 'any';
  fallbackUrl?: string;
}

export default function AuthGuard({ children, requiredRole = 'any', fallbackUrl = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'denied'>('loading');

  useEffect(() => {
    const check = async () => {
      try {
        const sb = getSupabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();

        if (!session?.access_token) {
          setStatus('denied');
          return;
        }

        // Call /api/auth/me with the token
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });

        if (!res.ok) { setStatus('denied'); return; }
        const data = await res.json();
        if (!data.user?.id) { setStatus('denied'); return; }

        if (requiredRole === 'any') {
          setStatus('authenticated');
          return;
        }

        const role = data.user.role;
        if (requiredRole === 'admin' && (role === 'admin' || role === 'super_admin')) {
          setStatus('authenticated');
        } else if (requiredRole === 'super_admin' && role === 'super_admin') {
          setStatus('authenticated');
        } else {
          setStatus('denied');
        }
      } catch {
        setStatus('denied');
      }
    };
    check();
  }, [requiredRole]);

  useEffect(() => {
    if (status === 'denied') {
      router.push(fallbackUrl);
    }
  }, [status, router, fallbackUrl]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060910]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060910]">
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
`);

// ============================================================
// FILE 3: /api/auth/me — reads Authorization header properly
// ============================================================
console.log('  [3/5] /api/auth/me (reads Bearer token)');

write(AP + 'app/api/auth/me/route.ts', `export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    // Read token from Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // Verify the token and get the user
    const { data: { user }, error: authError } = await sb.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get profile data
    const { data: profile } = await sb
      .from('profiles')
      .select('role, full_name, must_reset_password')
      .eq('id', user.id)
      .single();

    // Get approved agents
    const { data: access } = await sb
      .from('user_agent_access')
      .select('agent_slug')
      .eq('user_id', user.id);

    const approved_agents = (access || []).map(a => a.agent_slug);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'employee',
        full_name: profile?.full_name || null,
        must_reset_password: profile?.must_reset_password || false,
        approved_agents,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ user: null, error: err.message }, { status: 500 });
  }
}
`);

// ============================================================
// FILE 4: useCurrentUser hook — passes token in header
// ============================================================
console.log('  [4/5] useCurrentUser hook (token-aware)');

write(AP + 'lib/hooks/use-current-user.ts', `'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface User {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  must_reset_password: boolean;
  approved_agents: string[];
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const sb = getSupabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();

        if (!session?.access_token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + session.access_token }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  return { user, loading, isAdmin, isLoading: loading };
}
`);

// ============================================================
// FILE 5: Ensure /api/admin/users has force-dynamic
// ============================================================
console.log('  [5/5] /api/admin/users force-dynamic check');

const usersApiPath = path.join(ROOT, AP + 'app/api/admin/users/route.ts');
if (fs.existsSync(usersApiPath)) {
  let content = fs.readFileSync(usersApiPath, 'utf8');
  if (!content.includes("export const dynamic")) {
    content = "export const dynamic = 'force-dynamic';\n" + content;
    fs.writeFileSync(usersApiPath, content, 'utf8');
    console.log('  \u2713 app/api/admin/users/route.ts (added force-dynamic)');
  } else {
    console.log('  \u2713 app/api/admin/users/route.ts (already has force-dynamic)');
  }
} else {
  console.log('  \u26A0 Not found - was it created by platform-fix-v3.js?');
}

// DONE
console.log('');
console.log('  ======================================================');
console.log('  \u2713 Created/Updated ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  ROOT CAUSE FIXED:');
console.log('    Login stores session in localStorage (Supabase JS default).');
console.log('    Old /api/auth/me looked for cookies that never existed.');
console.log('    Now: AuthGuard reads token from Supabase client session');
console.log('    and passes it via Authorization header to /api/auth/me.');
console.log('');
console.log('  IMPORTANT: Make sure your profiles table has your role set.');
console.log('  Run this in Supabase SQL Editor if you have not:');
console.log('');
console.log("    UPDATE profiles SET role = 'super_admin'");
console.log("    WHERE email IN ('stevemacurdy@gmail.com', 'steve@woulfgroup.com');");
console.log('');
console.log('  Next: npm run build && vercel --prod');
console.log('');
