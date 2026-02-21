'use client';
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
