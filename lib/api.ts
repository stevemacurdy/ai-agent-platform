// ============================================================================
// Safe fetch wrapper — never throws, always returns typed result
// ============================================================================

function getEmail(): string {
  if (typeof window === 'undefined') return 'admin'
  try {
    const s = JSON.parse(localStorage.getItem('woulfai_session') || '{}')
    return s?.user?.email || 'admin'
  } catch { return 'admin' }
}

interface ApiResult<T> {
  data: T | null
  error: string | null
  status: number
}

export async function safeFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-email': getEmail(),
      ...(options.headers as Record<string, string> || {}),
    }

    const response = await fetch(url, { ...options, headers })

    // Handle empty responses (204, etc.)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { data: null, error: null, status: response.status }
    }

    // Try to parse JSON safely
    let data: T | null = null
    try {
      const text = await response.text()
      if (text && text.trim()) {
        data = JSON.parse(text)
      }
    } catch {
      // Response wasn't JSON — that's ok
    }

    if (!response.ok) {
      const errMsg = (data as any)?.error || response.statusText || 'Request failed'
      return { data, error: errMsg, status: response.status }
    }

    return { data, error: null, status: response.status }
  } catch (e: any) {
    return { data: null, error: e.message || 'Network error', status: 0 }
  }
}

// Convenience helpers
export const api = {
  get: <T = any>(url: string) => safeFetch<T>(url),
  post: <T = any>(url: string, body: any) => safeFetch<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(url: string, body: any) => safeFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T = any>(url: string) => safeFetch<T>(url, { method: 'DELETE' }),
}
