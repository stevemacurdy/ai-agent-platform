'use client';
import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getToken, refreshUser, logout, isAdmin as checkIsAdmin, type AuthUser } from '@/lib/auth';

// ============================================================================
// WoulfAI Authenticated Layout
// ============================================================================
// Wrap any page that requires login with this component.
// It handles: token check → user refresh → loading state → redirect if no auth.
// Provides consistent topbar, user menu, and content area.
//
// Usage:
//   import AuthenticatedLayout from '@/components/authenticated-layout';
//   export default function MyPage() {
//     return (
//       <AuthenticatedLayout>
//         {(user) => <div>Hello {user.name}</div>}
//       </AuthenticatedLayout>
//     );
//   }
// ============================================================================

interface Props {
  children: ReactNode | ((user: AuthUser) => ReactNode);
  /** If true, only admins can access. Non-admins get redirected to /portal. */
  adminOnly?: boolean;
}

export default function AuthenticatedLayout({ children, adminOnly = false }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    async function checkAuth() {
      // Quick check: is there even a token?
      const token = getToken();
      if (!token) {
        setStatus('unauthenticated');
        router.push('/login');
        return;
      }

      // Verify token is still valid with the server
      const freshUser = await refreshUser();
      if (!freshUser) {
        setStatus('unauthenticated');
        router.push('/login');
        return;
      }

      // Admin gate
      if (adminOnly && freshUser.role !== 'super_admin' && freshUser.role !== 'admin') {
        router.push('/portal');
        return;
      }

      setUser(freshUser);
      setStatus('authenticated');
    }

    checkAuth();
  }, [router, adminOnly]);

  // --- Loading State ---
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F5F7' }}>
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-[3px] mx-auto mb-4"
            style={{
              borderColor: '#E5E7EB',
              borderTopColor: '#2A9D8F',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p className="text-sm text-gray-500 font-medium">Loading your workspace...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- Unauthenticated (will redirect, show nothing) ---
  if (status === 'unauthenticated' || !user) {
    return null;
  }

  // --- Authenticated ---
  const userInitial = user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U';
  const displayName = user.name || user.email;
  const admin = checkIsAdmin();

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', color: '#1A1A2E' }}>
      {/* ── TOPBAR ──────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 px-6 sm:px-8"
        style={{
          background: 'rgba(27,42,74,0.97)',
          backdropFilter: 'blur(16px) saturate(1.6)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link href="/portal" className="flex items-center gap-3 group">
            <Image
              src="/woulf-badge.png"
              alt="Woulf Group"
              width={36}
              height={36}
              className="drop-shadow-lg group-hover:scale-105 transition-transform"
            />
            <span
              className="text-lg font-extrabold text-white tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link
              href="/billing"
              className="hidden sm:flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Billing
            </Link>

            {admin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Admin
              </Link>
            )}

            {/* User avatar / menu */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-all group relative">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: '#2A9D8F' }}
              >
                {userInitial}
              </div>
              <span className="hidden sm:block text-[13px] text-white/70 font-medium max-w-[120px] truncate">
                {displayName}
              </span>

              {/* Dropdown */}
              <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── CONTENT ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        {typeof children === 'function' ? children(user) : children}
      </main>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="mt-12 py-6 px-6 sm:px-8 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={20} height={20} className="opacity-50" />
            <span className="text-[11px] text-gray-400">&copy; 2026 WoulfAI by Woulf Group</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/security" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Security</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
