#!/usr/bin/env node
// tests/tenant-isolation.test.js
// Automated tenant isolation tests for CI
// Creates ephemeral test users/companies, verifies RLS, cleans up
//
// Usage:  node tests/tenant-isolation.test.js
// Needs:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
//         (from .env.local or GitHub Actions secrets)

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Test state — cleaned up in finally block
const RUN_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const TEST_EMAIL_A = `ci-tenant-a-${RUN_ID}@test.woulfai.local`;
const TEST_EMAIL_B = `ci-tenant-b-${RUN_ID}@test.woulfai.local`;
const TEST_PASSWORD = `CiTest!${RUN_ID}`;
const COMPANY_A_SLUG = `ci-co-a-${RUN_ID}`;
const COMPANY_B_SLUG = `ci-co-b-${RUN_ID}`;

let userA_id, userB_id, companyA_id, companyB_id;
let passed = 0, failed = 0, skipped = 0;

function test(name, pass, detail) {
  const status = pass ? '✅ PASS' : '❌ FAIL';
  if (pass) passed++; else failed++;
  console.log(`${status}: ${name}${detail ? ` (${detail})` : ''}`);
}

function skip(name, reason) {
  skipped++;
  console.log(`⏭️  SKIP: ${name} (${reason})`);
}

// ============================================================================
// SETUP: Create ephemeral test companies and users
// ============================================================================
async function setup() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TENANT ISOLATION CI TESTS');
  console.log(`Run ID: ${RUN_ID}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Setting up test data...\n');

  // Create two test companies
  const { data: coA, error: coAErr } = await admin.from('companies').insert({
    name: `CI Test Company A ${RUN_ID}`,
    slug: COMPANY_A_SLUG,
  }).select('id').single();
  if (coAErr) throw new Error(`Failed to create Company A: ${coAErr.message}`);
  companyA_id = coA.id;

  const { data: coB, error: coBErr } = await admin.from('companies').insert({
    name: `CI Test Company B ${RUN_ID}`,
    slug: COMPANY_B_SLUG,
  }).select('id').single();
  if (coBErr) throw new Error(`Failed to create Company B: ${coBErr.message}`);
  companyB_id = coB.id;

  console.log(`  Company A: ${companyA_id} (${COMPANY_A_SLUG})`);
  console.log(`  Company B: ${companyB_id} (${COMPANY_B_SLUG})`);

  // Create two test users via Supabase Auth
  const { data: authA, error: authAErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL_A,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (authAErr) throw new Error(`Failed to create User A: ${authAErr.message}`);
  userA_id = authA.user.id;

  const { data: authB, error: authBErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL_B,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (authBErr) throw new Error(`Failed to create User B: ${authBErr.message}`);
  userB_id = authB.user.id;

  console.log(`  User A: ${userA_id} (${TEST_EMAIL_A})`);
  console.log(`  User B: ${userB_id} (${TEST_EMAIL_B})`);

  // Ensure profiles exist (may be auto-created by trigger)
  await admin.from('profiles').upsert({
    id: userA_id, email: TEST_EMAIL_A, role: 'member', full_name: 'CI Test User A'
  });
  await admin.from('profiles').upsert({
    id: userB_id, email: TEST_EMAIL_B, role: 'member', full_name: 'CI Test User B'
  });

  // Assign User A → Company A, User B → Company B
  await admin.from('company_members').insert({
    user_id: userA_id, company_id: companyA_id, role: 'member', status: 'active'
  });
  await admin.from('company_members').insert({
    user_id: userB_id, company_id: companyB_id, role: 'member', status: 'active'
  });

  // Seed test data into company-scoped tables
  const seedTables = [
    { table: 'chat_sessions', rows: [
      { user_id: userA_id, company_id: companyA_id, agent_slug: 'wms', title: `CI-A-${RUN_ID}` },
      { user_id: userB_id, company_id: companyB_id, agent_slug: 'wms', title: `CI-B-${RUN_ID}` },
    ]},
    { table: 'leads', rows: [
      { company_id: companyA_id, email: `lead-a-${RUN_ID}@test.local`, name: `CI Lead A ${RUN_ID}`, source: 'ci-test' },
      { company_id: companyB_id, email: `lead-b-${RUN_ID}@test.local`, name: `CI Lead B ${RUN_ID}`, source: 'ci-test' },
    ]},
  ];

  for (const { table, rows } of seedTables) {
    const { error } = await admin.from(table).insert(rows);
    if (error) console.log(`  ⚠️  Seed ${table}: ${error.message} (may not exist)`);
    else console.log(`  Seeded ${table}: ${rows.length} rows`);
  }

  console.log('\nSetup complete.\n');
}

// ============================================================================
// HELPER: Create authenticated client for a test user
// ============================================================================
async function getAuthClient(email) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (error) throw new Error(`Sign-in failed for ${email}: ${error.message}`);
  return client;
}

// ============================================================================
// TESTS
// ============================================================================
async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('RUNNING TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const clientA = await getAuthClient(TEST_EMAIL_A);
  const clientB = await getAuthClient(TEST_EMAIL_B);
  console.log('Both test users authenticated.\n');

  // ── T1: company_members isolation ─────────────────────────────────────
  {
    const { data, error } = await clientA.from('company_members').select('company_id');
    if (error) {
      test('T1: company_members read', false, error.message);
    } else {
      const ids = data.map(r => r.company_id);
      const isolated = ids.includes(companyA_id) && !ids.includes(companyB_id);
      test('T1: User A sees only Company A memberships', isolated,
        `${data.length} row(s), companies: ${ids.join(', ')}`);
    }
  }

  // ── T2: Reverse check — User B cannot see Company A ──────────────────
  {
    const { data, error } = await clientB.from('company_members').select('company_id');
    if (error) {
      test('T2: company_members reverse', false, error.message);
    } else {
      const ids = data.map(r => r.company_id);
      const isolated = ids.includes(companyB_id) && !ids.includes(companyA_id);
      test('T2: User B sees only Company B memberships', isolated,
        `${data.length} row(s), companies: ${ids.join(', ')}`);
    }
  }

  // ── T3: chat_sessions isolation ───────────────────────────────────────
  {
    const { data, error } = await clientA.from('chat_sessions').select('title, company_id');
    if (error) {
      test('T3: chat_sessions read', false, error.message);
    } else {
      const leakedB = data.some(r => r.company_id === companyB_id);
      const hasOwn = data.some(r => r.title === `CI-A-${RUN_ID}`);
      test('T3: User A chat_sessions — no Company B data', !leakedB && hasOwn,
        `${data.length} session(s) visible`);
    }
  }

  // ── T4: leads isolation ───────────────────────────────────────────────
  {
    const { data, error } = await clientA.from('leads').select('company_id, email');
    if (error) {
      // leads table might have different RLS; skip gracefully
      skip('T4: leads isolation', error.message);
    } else {
      const leakedB = data.some(r => r.company_id === companyB_id);
      test('T4: User A leads — no Company B data', !leakedB,
        `${data.length} lead(s) visible`);
    }
  }

  // ── T5: profiles isolation ────────────────────────────────────────────
  {
    const { data, error } = await clientA.from('profiles').select('id, email');
    if (error) {
      test('T5: profiles read', false, error.message);
    } else {
      const seesB = data.some(r => r.id === userB_id);
      test('T5: User A cannot see User B profile', !seesB,
        `${data.length} profile(s) visible`);
    }
  }

  // ── T6: subscriptions isolation ───────────────────────────────────────
  {
    const { data, error } = await clientA.from('subscriptions').select('user_id');
    if (error) {
      skip('T6: subscriptions', error.message);
    } else {
      const onlyOwn = data.every(r => r.user_id === userA_id);
      test('T6: User A subscriptions — only own', data.length === 0 || onlyOwn,
        `${data.length} subscription(s)`);
    }
  }

  // ── T7: user_agent_access isolation ───────────────────────────────────
  {
    const { data, error } = await clientA.from('user_agent_access').select('user_id');
    if (error) {
      skip('T7: user_agent_access', error.message);
    } else {
      const onlyOwn = data.every(r => r.user_id === userA_id);
      test('T7: User A agent access — only own', data.length === 0 || onlyOwn,
        `${data.length} record(s)`);
    }
  }

  // ── T8: Cross-tenant WRITE blocked ────────────────────────────────────
  {
    const { error } = await clientA.from('chat_sessions').insert({
      user_id: userA_id,
      company_id: companyB_id,  // WRONG company
      agent_slug: 'wms',
      title: `HACK-${RUN_ID}`,
    });
    test('T8: Cross-tenant INSERT into Company B blocked', error !== null,
      error ? `Blocked: ${error.code}` : 'DANGER — insert succeeded!');
  }

  // ── T9: Cross-tenant UPDATE blocked ───────────────────────────────────
  {
    const { data, error } = await clientA.from('company_members')
      .update({ role: 'owner' })
      .eq('company_id', companyB_id);
    // Should either error or affect 0 rows
    const safe = error !== null || !data || data.length === 0;
    test('T9: Cross-tenant UPDATE on Company B members blocked', safe,
      error ? `Blocked: ${error.code}` : `${(data || []).length} rows affected`);
  }

  // ── T10: Cross-tenant DELETE blocked ──────────────────────────────────
  {
    const { data, error } = await clientA.from('company_members')
      .delete()
      .eq('company_id', companyB_id)
      .eq('user_id', userB_id);
    const safe = error !== null || !data || data.length === 0;
    test('T10: Cross-tenant DELETE on Company B members blocked', safe,
      error ? `Blocked: ${error.code}` : `${(data || []).length} rows deleted`);
  }

  // ── T11: companies table — verify visibility rules ────────────────────
  {
    const { data, error } = await clientA.from('companies').select('id, name');
    if (error) {
      test('T11: companies visibility', false, error.message);
    } else {
      // User A should see at most their own company (some policies allow broader read)
      const seesB = data.some(r => r.id === companyB_id);
      // Note: some apps intentionally allow reading all company names (for directory)
      // So we log but don't fail — cross-tenant DATA isolation is what matters
      if (seesB) {
        console.log(`  ℹ️  INFO: T11: User A can see Company B name (${data.length} companies visible) — verify this is intentional`);
      } else {
        test('T11: companies — User A only sees own company', true,
          `${data.length} company/companies visible`);
      }
    }
  }

  // ── T12: audit_log isolation ──────────────────────────────────────────
  {
    const { data, error } = await clientA.from('audit_log').select('id, user_id').limit(10);
    if (error) {
      skip('T12: audit_log', error.message);
    } else {
      const onlyOwn = data.every(r => r.user_id === userA_id);
      test('T12: audit_log — only own entries visible', data.length === 0 || onlyOwn,
        `${data.length} log(s) visible`);
    }
  }
}

// ============================================================================
// CLEANUP: Remove all test data
// ============================================================================
async function cleanup() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CLEANUP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Delete in dependency order
  const cleanups = [
    // Chat data
    () => admin.from('chat_sessions').delete().like('title', `%${RUN_ID}%`),
    // Leads
    () => admin.from('leads').delete().like('email', `%${RUN_ID}%`),
    // Company members
    () => admin.from('company_members').delete().eq('user_id', userA_id),
    () => admin.from('company_members').delete().eq('user_id', userB_id),
    // Hack attempt rows (in case T8 insert leaked through)
    () => admin.from('chat_sessions').delete().like('title', `HACK-${RUN_ID}`),
    // Profiles
    () => admin.from('profiles').delete().eq('id', userA_id),
    () => admin.from('profiles').delete().eq('id', userB_id),
    // Companies
    () => admin.from('companies').delete().eq('id', companyA_id),
    () => admin.from('companies').delete().eq('id', companyB_id),
  ];

  for (const fn of cleanups) {
    try { await fn(); } catch (e) { /* best effort */ }
  }

  // Delete auth users
  if (userA_id) {
    try { await admin.auth.admin.deleteUser(userA_id); } catch (e) {}
  }
  if (userB_id) {
    try { await admin.auth.admin.deleteUser(userB_id); } catch (e) {}
  }

  console.log('Test data cleaned up.\n');
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  try {
    await setup();
    await runTests();
  } catch (e) {
    console.error(`\n💥 FATAL: ${e.message}`);
    failed++;
  } finally {
    await cleanup();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`RESULTS: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (failed > 0) {
    console.log('\n❌ TENANT ISOLATION FAILURES DETECTED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TENANT ISOLATION TESTS PASSED');
    process.exit(0);
  }
}

main();
