'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin' | 'any';
  fallbackUrl?: string;
}

export default function AuthGuard({ children, requiredRole = 'any', fallbackUrl = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'denied'>('loading');

  useEffect(() => {
    // Prevent redirect loop: if we're already on the fallback page, don't check
    if (pathname === fallbackUrl) {
      setStatus('authenticated');
      return;
    }

    let cancelled = false;

    const check = async () => {
      try {
        // ── Step 1: Get a token ──────────────────────────────────
        // Check localStorage FIRST. The login page writes here synchronously
        // via lib/auth.ts before redirecting. This is always available
        // immediately after login, unlike the Supabase browser session
        // which depends on an async setSession() call that may not have
        // completed yet.
        let token: string | null = null;

        if (typeof window !== 'undefined') {
          token = localStorage.getItem('woulfai_token');
        }

        // If localStorage doesn't have it, try the Supabase browser session
        // as a backup (handles cases where user logged in via AuthProvider
        // or a previous session is still valid in the Supabase cookie).
        if (!token) {
          try {
            const sb = getSupabaseBrowser();
            const { data: { session } } = await sb.auth.getSession();
            token = session?.access_token || null;
          } catch {
            // Supabase client may fail if env vars are missing or network issues.
            // Not fatal — we just don't have a token from this source.
          }
        }

        // No token from either source = not logged in
        if (!token) {
          if (!cancelled) setStatus('denied');
          return;
        }

        // ── Step 2: Verify the token is still valid ──────────────
        // Don't trust localStorage blindly. The token could be expired
        // or revoked. Hit /api/auth/me to confirm.
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token },
        });

        if (!res.ok) {
          // Token is invalid or expired. Clear stale localStorage data
          // so we don't keep trying a dead token on every page load.
          if (typeof window !== 'undefined') {
            localStorage.removeItem('woulfai_token');
            localStorage.removeItem('woulfai_user');
            localStorage.removeItem('woulfai_session');
          }
          if (!cancelled) setStatus('denied');
          return;
        }

        const data = await res.json();
        if (!data.user?.id) {
          if (!cancelled) setStatus('denied');
          return;
        }

        // ── Step 3: Check role requirements ──────────────────────
        if (requiredRole === 'any') {
          if (!cancelled) setStatus('authenticated');
          return;
        }

        const role = data.user.role;
        if (requiredRole === 'admin' && (role === 'admin' || role === 'super_admin')) {
          if (!cancelled) setStatus('authenticated');
        } else if (requiredRole === 'super_admin' && role === 'super_admin') {
          if (!cancelled) setStatus('authenticated');
        } else {
          if (!cancelled) setStatus('denied');
        }
      } catch {
        if (!cancelled) setStatus('denied');
      }
    };

    check();

    // Cleanup: if the component unmounts before check() completes
    // (e.g., user navigates away), don't update state on unmounted component
    return () => { cancelled = true; };
  }, [requiredRole, pathname, fallbackUrl]);

  useEffect(() => {
    if (status === 'denied') {
      router.push(fallbackUrl);
    }
  }, [status, router, fallbackUrl]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F4F5F7' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#F4F5F7' }}>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
