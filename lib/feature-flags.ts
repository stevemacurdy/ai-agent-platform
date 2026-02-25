// lib/feature-flags.ts
// Simple feature flag system backed by Supabase.
//
// Client usage:
//   const { isEnabled, loading } = useFeatureFlag('odoo_integration')
//   const { flags, loading } = useFeatureFlags()
//
// Server/API route usage:
//   const enabled = await checkFlag('odoo_integration')

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

interface FeatureFlag {
  key: string
  enabled: boolean
  description: string | null
  company_ids: string[]
}

// Cache flags for 60s to avoid hammering the DB
let flagCache: Record<string, FeatureFlag> = {}
let cacheTimestamp = 0
const CACHE_TTL = 60_000

async function fetchFlags(): Promise<Record<string, FeatureFlag>> {
  if (Date.now() - cacheTimestamp < CACHE_TTL && Object.keys(flagCache).length > 0) {
    return flagCache
  }
  const { data, error } = await getSupabase()
    .from('feature_flags')
    .select('key, enabled, description, company_ids') as { data: FeatureFlag[] | null, error: any }

  if (error || !data) return flagCache

  const newCache: Record<string, FeatureFlag> = {}
  for (const flag of data) {
    newCache[flag.key] = flag
  }
  flagCache = newCache
  cacheTimestamp = Date.now()
  return flagCache
}

export function useFeatureFlag(key: string, companyId?: string) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlags().then((flags) => {
      const flag = flags[key]
      if (!flag) {
        setIsEnabled(false)
      } else if (flag.company_ids && flag.company_ids.length > 0 && companyId) {
        setIsEnabled(flag.enabled && flag.company_ids.includes(companyId))
      } else {
        setIsEnabled(flag.enabled)
      }
      setLoading(false)
    })
  }, [key, companyId])

  return { isEnabled, loading }
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlags().then((f) => {
      setFlags(f)
      setLoading(false)
    })
  }, [])

  return { flags, loading }
}

export async function checkFlag(key: string, companyId?: string): Promise<boolean> {
  const flags = await fetchFlags()
  const flag = flags[key]
  if (!flag) return false
  if (flag.company_ids && flag.company_ids.length > 0 && companyId) {
    return flag.enabled && flag.company_ids.includes(companyId)
  }
  return flag.enabled
}
