// phase-b-quick-wins.js — Run from project root
// Applies: B1 (dep scanning), B3 (endpoint timing), B5 (CSP enforcement), B6 (feature flags)
var fs = require('fs');
var path = require('path');

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

var applied = 0;

// ============================================================================
// B1: Dependency Vulnerability Scanning — GitHub Actions + Dependabot
// ============================================================================
(function () {
  console.log('\n--- B1: Dependency Vulnerability Scanning ---');

  // Dependabot config
  mkdirp('.github');
  var dependabot = `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
`;
  fs.writeFileSync('.github/dependabot.yml', dependabot);
  console.log('  OK: .github/dependabot.yml');

  // Security audit workflow
  mkdirp('.github/workflows');
  var workflow = `name: Security Audit

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 9 * * 1'
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Audit summary
        if: always()
        run: |
          echo "## Security Audit Results" >> $GITHUB_STEP_SUMMARY
          npm audit --audit-level=high 2>&1 | tail -20 >> $GITHUB_STEP_SUMMARY || true
`;
  fs.writeFileSync('.github/workflows/security-audit.yml', workflow);
  console.log('  OK: .github/workflows/security-audit.yml');
  applied++;
})();

// ============================================================================
// B3: Slow Endpoint Detection — API route timing wrapper
// ============================================================================
(function () {
  console.log('\n--- B3: Slow Endpoint Detection ---');

  var timing = `// lib/api-timing.ts
// Wraps API route handlers to log response times.
// Usage: export const POST = withTiming(async (req) => { ... })

import { NextRequest, NextResponse } from 'next/server'

const SLOW_THRESHOLD_MS = 3000

type RouteHandler = (req: NextRequest, context?: any) => Promise<NextResponse | Response>

export function withTiming(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    const start = Date.now()
    const pathname = req.nextUrl.pathname

    try {
      const response = await handler(req, context)
      const duration = Date.now() - start

      // Add timing header to every response
      const headers = new Headers(response.headers)
      headers.set('Server-Timing', \`total;dur=\${duration}\`)

      if (duration > SLOW_THRESHOLD_MS) {
        console.warn(\`[SLOW] \${req.method} \${pathname} took \${duration}ms\`)
      }

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      const duration = Date.now() - start
      console.error(\`[ERROR] \${req.method} \${pathname} failed after \${duration}ms\`, error)
      throw error
    }
  }
}
`;
  fs.writeFileSync('lib/api-timing.ts', timing);
  console.log('  OK: lib/api-timing.ts');
  applied++;
})();

// ============================================================================
// B5: CSP Header Enforcement — Report-Only → Enforced
// ============================================================================
(function () {
  console.log('\n--- B5: CSP Enforcement ---');

  var fp = 'next.config.mjs';
  var c = fs.readFileSync(fp, 'utf8');

  if (c.includes('Content-Security-Policy-Report-Only')) {
    c = c.replace('Content-Security-Policy-Report-Only', 'Content-Security-Policy');
    fs.writeFileSync(fp, c);
    console.log('  OK: CSP switched from Report-Only to Enforced');
    applied++;
  } else if (c.includes('"Content-Security-Policy"')) {
    console.log('  SKIP: CSP already enforced');
  } else {
    console.log('  SKIP: CSP header not found in next.config.mjs');
  }
})();

// ============================================================================
// B6: Feature Flags — Client hook + server helper
// ============================================================================
(function () {
  console.log('\n--- B6: Feature Flags ---');

  var flags = `// lib/feature-flags.ts
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
    .select('key, enabled, description, company_ids')

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
`;
  fs.writeFileSync('lib/feature-flags.ts', flags);
  console.log('  OK: lib/feature-flags.ts');
  applied++;
})();

console.log('\n========================================');
console.log('Applied: ' + applied + ' items');
console.log('========================================');
console.log('\nManual steps remaining:');
console.log('  1. Run the feature_flags SQL in Supabase SQL Editor (see below)');
console.log('  2. npm run build');
console.log('  3. git add -A && git commit -m "Phase B: dep scanning, endpoint timing, CSP enforcement, feature flags"');
console.log('  4. vercel --prod && git push');
