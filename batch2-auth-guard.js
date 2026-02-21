/**
 * ============================================================
 *  WoulfAI — Batch 2: Auth Guards
 * ============================================================
 *  1. Admin layout: auth check, redirect to /login if not signed in
 *  2. AuthGuard component (reusable)
 *  3. Fix /api/admin/users force-dynamic (in case sed wasn't run)
 *
 *  Run:
 *    node batch2-auth-guard.js
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
    const bd = path.join(ROOT, '.backups', 'batch2');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(full, path.join(bd, fp.replace(/\//g, '__')));
  }
  fs.writeFileSync(full, content, 'utf8');
  created++;
  console.log('  \u2713 ' + fp);
}

console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 Batch 2: Auth Guards            \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

const AP = fs.existsSync(path.join(ROOT, 'src/app')) ? 'src/' : '';

// ============================================================
// FILE 1: AuthGuard component (reusable)
// ============================================================
console.log('  [1/4] AuthGuard component');

write(AP + 'components/auth/AuthGuard.tsx', `'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
        const res = await fetch('/api/auth/me');
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
// FILE 2: Admin layout with auth guard (admin role required)
// ============================================================
console.log('  [2/4] Admin layout with auth guard');

write(AP + 'app/admin/layout.tsx', `import PlatformShell from '@/components/layout/PlatformShell';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" fallbackUrl="/login">
      <PlatformShell>{children}</PlatformShell>
    </AuthGuard>
  );
}
`);

// ============================================================
// FILE 3: Portal layout with any-auth guard
// ============================================================
console.log('  [3/4] Portal layout with auth guard');

write(AP + 'app/portal/layout.tsx', `import PlatformShell from '@/components/layout/PlatformShell';
import AuthGuard from '@/components/auth/AuthGuard';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="any" fallbackUrl="/login">
      <PlatformShell>{children}</PlatformShell>
    </AuthGuard>
  );
}
`);

// ============================================================
// FILE 4: Fix /api/admin/users force-dynamic
// ============================================================
console.log('  [4/4] Fix /api/admin/users force-dynamic');

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
  console.log('  \u26A0 /api/admin/users/route.ts not found');
}

// DONE
console.log('');
console.log('  ======================================================');
console.log('  \u2713 Created/Updated ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  What changed:');
console.log('    1. AuthGuard component: checks /api/auth/me, redirects if not logged in');
console.log('    2. /admin/* routes: require admin or super_admin role');
console.log('    3. /portal/* routes: require any authenticated user');
console.log('    4. /api/admin/users: force-dynamic so it queries Supabase live');
console.log('');
console.log('  /agents/* and /demo/* remain public (no auth required)');
console.log('');
console.log('  Next: npm run build && vercel --prod');
console.log('');
