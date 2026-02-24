// fix-admin-fetches.js — Run from project root
var fs = require("fs");
var fixed = 0;

// ============================================================================
// Fix 1: app/admin/page.tsx — bare fetch('/api/admin/users')
// ============================================================================
(function() {
  var fp = "app/admin/page.tsx";
  var c = fs.readFileSync(fp, "utf8");

  // Add import
  if (!c.includes("getSupabaseBrowser")) {
    c = c.replace(
      "'use client';",
      "'use client';\nimport { getSupabaseBrowser } from '@/lib/supabase-browser';"
    );
  }

  // Replace bare fetch with async IIFE that gets token
  var oldFetch = "fetch('/api/admin/users').then(r => r.json()).then(d => setUserCount(d.users?.length || 0)).catch(() => {});";
  var newFetch = "(async () => {\n      const sb = getSupabaseBrowser();\n      const { data: { session } } = await sb.auth.getSession();\n      const t = session?.access_token;\n      if (!t) return;\n      fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer ' + t } }).then(r => r.json()).then(d => setUserCount(d.users?.length || 0)).catch(() => {});\n    })();";

  if (c.includes(oldFetch)) {
    c = c.replace(oldFetch, newFetch);
    fs.writeFileSync(fp, c);
    console.log("OK: " + fp);
    fixed++;
  } else {
    console.log("SKIP: " + fp + " - pattern not found");
  }
})();

// ============================================================================
// Fix 2: app/admin/companies/page.tsx — 3 fetches without auth
// ============================================================================
(function() {
  var fp = "app/admin/companies/page.tsx";
  var c = fs.readFileSync(fp, "utf8");

  // Add import
  if (!c.includes("getSupabaseBrowser")) {
    c = c.replace(
      "'use client';",
      "'use client';\nimport { getSupabaseBrowser } from '@/lib/supabase-browser';"
    );
  }

  // Add getAuthToken helper after the component declaration
  if (!c.includes("getAuthToken")) {
    var marker = "const [msg, setMsg]";
    var idx = c.indexOf(marker);
    if (idx > 0) {
      var lineEnd = c.indexOf("\n", idx);
      c = c.slice(0, lineEnd + 1) +
        "\n  const getAuthToken = async (): Promise<string | null> => {\n" +
        "    const sb = getSupabaseBrowser();\n" +
        "    const { data: { session } } = await sb.auth.getSession();\n" +
        "    return session?.access_token || null;\n" +
        "  };\n" +
        c.slice(lineEnd + 1);
    }
  }

  // Fix loadCompanies — GET
  var oldLoad = "const res = await fetch('/api/admin/companies?t=' + Date.now());";
  var newLoad = "const token = await getAuthToken();\n      if (!token) { setLoading(false); return; }\n      const res = await fetch('/api/admin/companies?t=' + Date.now(), { headers: { 'Authorization': 'Bearer ' + token } });";
  if (c.includes(oldLoad)) {
    c = c.replace(oldLoad, newLoad);
  }

  // Fix handleCreate — POST
  var oldCreate = "const res = await fetch('/api/admin/companies', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },";
  var newCreate = "const cToken = await getAuthToken();\n      const res = await fetch('/api/admin/companies', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (cToken || '') },";
  if (c.includes(oldCreate)) {
    c = c.replace(oldCreate, newCreate);
  }

  // Fix saveAgents — PATCH
  var oldPatch = "const res = await fetch('/api/admin/companies', {\n        method: 'PATCH',\n        headers: { 'Content-Type': 'application/json' },";
  var newPatch = "const pToken = await getAuthToken();\n      const res = await fetch('/api/admin/companies', {\n        method: 'PATCH',\n        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (pToken || '') },";
  if (c.includes(oldPatch)) {
    c = c.replace(oldPatch, newPatch);
  }

  fs.writeFileSync(fp, c);
  console.log("OK: " + fp);
  fixed++;
})();

// ============================================================================
// Fix 3: app/admin/users/page.tsx — manage-agents missing Authorization header
// ============================================================================
(function() {
  var fp = "app/admin/users/page.tsx";
  var c = fs.readFileSync(fp, "utf8");

  var oldManage = "await fetch('/api/admin/manage-agents', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },";
  var newManage = "await fetch('/api/admin/manage-agents', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },";

  if (c.includes(oldManage)) {
    c = c.replace(oldManage, newManage);
    fs.writeFileSync(fp, c);
    console.log("OK: " + fp + " - added auth to manage-agents");
    fixed++;
  } else {
    console.log("SKIP: " + fp + " - manage-agents pattern not found");
  }
})();

// ============================================================================
// Fix 4: lib/supabase.ts — kill third dead auth layer
// ============================================================================
(function() {
  var fp = "lib/supabase.ts";
  if (!fs.existsSync(fp)) {
    console.log("SKIP: " + fp + " - not found");
    return;
  }

  // Back it up
  fs.mkdirSync("archive/backups/phase-a-round2/lib", { recursive: true });
  fs.copyFileSync(fp, "archive/backups/phase-a-round2/lib/supabase.ts");

  // Replace with clean version that only exports the Supabase client
  var clean = [
    "// ============================================================================",
    "// WoulfAI Supabase Client",
    "// ============================================================================",
    "// Authentication is handled by Supabase Auth via AuthProvider.",
    "// This file provides direct Supabase client access for pages that need it.",
    "// The localStorage auth layer was removed 2026-02-24 (security).",
    "// ============================================================================",
    "",
    "import { createClient } from '@supabase/supabase-js'",
    "",
    "const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''",
    "const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''",
    "",
    "let supabase: ReturnType<typeof createClient> | null = null",
    "",
    "export function getSupabaseClient() {",
    "  if (!supabase) {",
    "    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)",
    "  }",
    "  return supabase",
    "}",
    "",
    "// Re-export types used elsewhere",
    "export type UserRole = 'super_admin' | 'admin' | 'company_admin' | 'employee' | 'beta_tester' | 'org_lead'",
    "",
  ].join("\n");

  fs.writeFileSync(fp, clean);
  console.log("OK: " + fp + " - removed hardcoded passwords, localStorage auth, email bypass");
  fixed++;
})();

console.log("\nDone: " + fixed + " files fixed");
console.log("Next: npm run build");
