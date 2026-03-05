// ============================================================================
// WoulfAI Auth — Single Source of Truth
// ============================================================================
// This is THE auth layer. Every page, component, and API call goes through here.
// No more scattered localStorage calls or naked fetch() to authenticated endpoints.
// ============================================================================

const TOKEN_KEY = 'woulfai_token';
const USER_KEY = 'woulfai_user';

// --- Types ------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  role: string;
  company_id?: string | null;
  approved_agents?: string[];
}

export interface LoginResult {
  success: boolean;
  error?: string;
  must_reset_password?: boolean;
  user?: AuthUser;
}

// --- Token Storage ----------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// --- User Storage -----------------------------------------------------------

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}
// --- Legacy Session Bridge ---------------------------------------------------
// Old pages (hr, seo, [id]) read woulfai_session with camelCase fields.
// This bridge writes it so they keep working during migration.
function writeLegacySession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  const legacy = {
    id: user.id,
    email: user.email,
    name: user.name || user.full_name || user.email.split('@')[0],
    role: user.role,
    company_id: user.company_id || null,
    companyId: user.company_id || 'default',
    companyName: 'Woulf Group',
    agents: user.approved_agents || [],
  };
  localStorage.setItem('woulfai_session', JSON.stringify(legacy));
}
// --- Auth Actions -----------------------------------------------------------
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Invalid email or password' };
    }


    // Store the access token (this is what /api/auth/me needs as Bearer)
    if (data.session?.access_token) {
      setToken(data.session.access_token);

      // Also set the session on the browser Supabase client
      // so AuthGuard's sb.auth.getSession() can find it
      try {
        const { getSupabaseBrowser } = await import('@/lib/supabase-browser');
        const sb = getSupabaseBrowser();
        await sb.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      } catch { /* non-critical */ }
    }

    // Store user profile
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.display_name || data.user.name || data.user.email.split('@')[0],
      role: data.user.role || 'beta_tester',
      company_id: data.user.company_id || null,
    };
    setUser(user);
    writeLegacySession(user);

    return { success: true, user };
  } catch (e: any) {
    return { success: false, error: e.message || 'Something went wrong' };
  }
}

export function logout(): void {
  clearToken();
  clearUser();
  // Also clear legacy keys from old auth patterns
  if (typeof window !== 'undefined') {
    localStorage.removeItem('woulfai_session');
  }
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'super_admin' || user?.role === 'admin';
}

// --- Authenticated Fetch ----------------------------------------------------
// Use this instead of raw fetch() for ANY authenticated API call.
// It automatically attaches the Bearer token.

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

// --- Convenience Helpers ----------------------------------------------------

export const authApi = {
  get: (url: string) => authFetch(url),
  post: (url: string, body: any) =>
    authFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any) =>
    authFetch(url, { method: 'PUT', body: JSON.stringify(body) }),
  del: (url: string) =>
    authFetch(url, { method: 'DELETE' }),
};

// --- Refresh User from Server -----------------------------------------------
// Call this when you need fresh user data (role changes, agent access, etc.)

export async function refreshUser(): Promise<AuthUser | null> {
  try {
    const res = await authFetch('/api/auth/me');
    if (!res.ok) {
      // Token expired or invalid
      clearToken();
      clearUser();
      return null;
    }
    const data = await res.json();
    if (data.user) {
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name || data.user.email.split('@')[0],
        full_name: data.user.full_name,
        role: data.user.role || 'employee',
        company_id: data.user.company_id || null,
        approved_agents: data.user.approved_agents || [],
      };
      setUser(user);
      writeLegacySession(user);
      return user;
    }
    return null;
  } catch {
    return null;
  }
}
