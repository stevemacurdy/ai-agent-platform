// ============================================================================
// WoulfAI Supabase Client
// ============================================================================
// Authentication is handled by Supabase Auth via AuthProvider.
// This file provides direct Supabase client access for pages that need it.
// The localStorage auth layer was removed 2026-02-24 (security).
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabase
}

// Re-export types used elsewhere
export type UserRole = 'super_admin' | 'admin' | 'company_admin' | 'employee' | 'beta_tester' | 'org_lead'
