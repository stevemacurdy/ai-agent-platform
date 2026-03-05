'use client';
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
        // Try Supabase session first
        let token: string | null = null;
        try {
          const sb = getSupabaseBrowser();
          const { data: { session } } = await sb.auth.getSession();
          token = session?.access_token || null;
        } catch { /* fall through */ }

        // Fallback: check localStorage token (set by lib/auth.ts login)
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('woulfai_token');
        }

        if (!token) {
          setStatus('denied');
          return;
        }

        // Verify token with /api/auth/me
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token }
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
