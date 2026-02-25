// lib/session-manager.ts
// B9: Session Management Hardening
//
// Features:
// 1. Auto-logout after 24h of inactivity
// 2. Re-auth requirement for sensitive operations
// 3. Session activity tracking
//
// Usage:
//   useIdleTimeout(signOut)    — add to AuthProvider
//   requireReAuth(sb, e, p)    — call before sensitive operations
//   hasRecentAuth()            — check if recent re-auth exists

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000     // 24 hours
const ACTIVITY_CHECK_INTERVAL = 60 * 1000         // Check every 60s
const LAST_ACTIVITY_KEY = 'woulfai_last_activity'
const REAUTH_WINDOW_MS = 15 * 60 * 1000          // 15 min re-auth window
const LAST_AUTH_KEY = 'woulfai_last_auth'

// --- Idle Timeout Hook ---
export function useIdleTimeout(signOut: () => Promise<void>) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateActivity = useCallback(() => {
    try { localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString()) } catch {}
  }, [])

  const checkIdle = useCallback(() => {
    try {
      const last = localStorage.getItem(LAST_ACTIVITY_KEY)
      if (!last) return
      if (Date.now() - parseInt(last, 10) > IDLE_TIMEOUT_MS) {
        console.warn('[Session] Idle timeout reached, signing out')
        signOut()
      }
    } catch {}
  }, [signOut])

  useEffect(() => {
    updateActivity()
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    let lastUpdate = 0
    const throttledUpdate = () => {
      const now = Date.now()
      if (now - lastUpdate > 30_000) { lastUpdate = now; updateActivity() }
    }
    events.forEach(e => window.addEventListener(e, throttledUpdate, { passive: true }))
    const interval = setInterval(checkIdle, ACTIVITY_CHECK_INTERVAL)
    const onFocus = () => { checkIdle(); updateActivity() }
    window.addEventListener('focus', onFocus)
    return () => {
      events.forEach(e => window.removeEventListener(e, throttledUpdate))
      window.removeEventListener('focus', onFocus)
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [updateActivity, checkIdle])
}

// --- Re-Auth for Sensitive Ops ---
export async function requireReAuth(supabase: SupabaseClient, email: string, password: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return false
    try { localStorage.setItem(LAST_AUTH_KEY, Date.now().toString()) } catch {}
    return true
  } catch { return false }
}

export function hasRecentAuth(): boolean {
  try {
    const last = localStorage.getItem(LAST_AUTH_KEY)
    if (!last) return false
    return Date.now() - parseInt(last, 10) < REAUTH_WINDOW_MS
  } catch { return false }
}

export function recordAuth(): void {
  try { localStorage.setItem(LAST_AUTH_KEY, Date.now().toString()) } catch {}
}

export function clearSessionData(): void {
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY)
    localStorage.removeItem(LAST_AUTH_KEY)
  } catch {}
}
