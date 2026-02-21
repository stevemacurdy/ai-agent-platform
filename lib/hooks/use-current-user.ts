'use client';
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
