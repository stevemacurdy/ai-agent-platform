// phase-b-session.js — Run from project root
// Applies B9: Session management hardening
var fs = require('fs');

// ============================================================================
// Step 1: Create lib/session-manager.ts
// ============================================================================
var sessionManager = `// lib/session-manager.ts
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
`;

fs.writeFileSync('lib/session-manager.ts', sessionManager);
console.log('OK: lib/session-manager.ts');

// ============================================================================
// Step 2: Wire into AuthProvider
// ============================================================================
var fp = 'components/AuthProvider.tsx';
var c = fs.readFileSync(fp, 'utf8');

// Add import
if (!c.includes('session-manager')) {
  c = c.replace(
    "import { useRouter } from 'next/navigation'",
    "import { useRouter } from 'next/navigation'\nimport { useIdleTimeout, recordAuth, clearSessionData } from '@/lib/session-manager'"
  );
  console.log('  Added session-manager import');
}

// Add useIdleTimeout hook after router declaration
if (!c.includes('useIdleTimeout')) {
  // Find the signOut function reference to pass to idle timeout
  // We need to add it after the component opens but we need signOutFn to exist first
  // Safest: add it right before the return statement
  c = c.replace(
    '  return (\n    <AuthContext.Provider',
    '  // B9: Auto-logout after 24h idle\n  useIdleTimeout(signOutFn)\n\n  return (\n    <AuthContext.Provider'
  );
  console.log('  Added useIdleTimeout(signOutFn)');
}

// Add recordAuth() to signIn success path
if (!c.includes('recordAuth')) {
  c = c.replace(
    "if (data.user) await fetchProfile(data.user.id)\n    return {}",
    "if (data.user) await fetchProfile(data.user.id)\n    recordAuth()\n    return {}"
  );
  console.log('  Added recordAuth() to signIn');
}

// Add clearSessionData() to signOut
if (!c.includes('clearSessionData')) {
  c = c.replace(
    'await supabase.auth.signOut()',
    'await supabase.auth.signOut()\n    clearSessionData()'
  );
  console.log('  Added clearSessionData() to signOut');
}

fs.writeFileSync(fp, c);
console.log('OK: ' + fp);

console.log('\nDone! Run: npm run build');
