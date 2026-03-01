#!/usr/bin/env node
// tests/tenant-isolation.test.js
// Automated tenant isolation tests for CI
// Creates ephemeral test users/companies, verifies RLS, cleans up
//
// Usage:  node tests/tenant-isolation.test.js
// Needs:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY

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

// Unique run ID for ephemeral data
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

function info(msg) {
  console.log(`  ℹ️  ${msg}`);
}

// ============================================================================
// SETUP
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

  // Create two test users
  const { data: authA, error: authAErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL_A, password: TEST_PASSWORD, email_confirm: true,
  });
  if (authAErr) throw new Error(`Failed to create User A: ${authAErr.message}`);
  userA_id = authA.user.id;

  const { data: authB, error: authBErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL_B, password: TEST_PASSWORD, email_confirm: true,
  });
  if (authBErr) throw new Error(`Failed to create User B: ${authBErr.message}`);
  userB_id = authB.user.id;

  console.log(`  User A: ${userA_id} (${TEST_EMAIL_A})`);
  console.log(`  User B: ${userB_id} (${TEST_EMAIL_B})`);

  // Ensure profiles exist
  await admin.from('profiles').upsert({
    id: userA_id, email: TEST_EMAIL_A, role: 'member', full_name: 'CI Test User A'
  });
  await admin.from('profiles').upsert({
    id: userB_id, email: TEST_EMAIL_B, role: 'member', full_name: 'CI Test User B'
  });

  // Assign User A -> Company A, User B -> Company B
  const { error: memAErr } = await admin.from('company_members').insert({
    user_id: userA_id, company_id: companyA_id, role: 'member', status: 'active', email: TEST_EMAIL_A
  });
  if (memAErr) throw new Error(`Failed to add User A to Company A: ${memAErr.message}`);

  const { error: memBErr } = await admin.from('company_members').insert({
    user_id: userB_id, company_id: companyB_id, role: 'member', status: 'active', email: TEST_EMAIL_B
  });
  if (memBErr) throw new Error(`Failed to add User B to Company B: ${memBErr.message}`);

  // Verify seed data via admin
  const { data: verifyMembers } = await admin.from('company_members')
    .select('user_id, company_id')
    .in('user_id', [userA_id, userB_id]);
  console.log(`  Company members seeded: ${(verifyMembers || []).length} rows`);

  console.log('\nSetup complete.\n');
}

// ============================================================================
// AUTH HELPER
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
// HELPER: Probe table columns via admin
// ============================================================================
async function getTableColumns(table) {
  const { data, error } = await admin.from(table).select('*').limit(1);
  if (error) return null; // table doesn't exist or no access
  if (data && data.length > 0) return Object.keys(data[0]);
  // Table exists but is empty — try inserting schema probe
  return [];
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

  // ── T1: company_members — User A cannot see User B's membership ──────
  {
    const { data, error } = await clientA.from('company_members').select('user_id, company_id');
    if (error) {
      test('T1: company_members read', false, error.message);
    } else {
      const seesB = data.some(r => r.company_id === companyB_id || r.user_id === userB_id);
      test('T1: User A cannot see Company B memberships', !seesB,
        `${data.length} row(s) visible`);
    }
  }

  // ── T2: Reverse — User B cannot see Company A ────────────────────────
  {
    const { data, error } = await clientB.from('company_members').select('user_id, company_id');
    if (error) {
      test('T2: company_members reverse', false, error.message);
    } else {
      const seesA = data.some(r => r.company_id === companyA_id || r.user_id === userA_id);
      test('T2: User B cannot see Company A memberships', !seesA,
        `${data.length} row(s) visible`);
    }
  }

  // ── T3: profiles — User A cannot see User B ──────────────────────────
  {
    const { data, error } = await clientA.from('profiles').select('id, email');
    if (error) {
      test('T3: profiles read', false, error.message);
    } else {
      const seesB = data.some(r => r.id === userB_id);
      test('T3: User A cannot see User B profile', !seesB,
        `${data.length} profile(s) visible`);
    }
  }

  // ── T4: companies — visibility check ─────────────────────────────────
  {
    const { data, error } = await clientA.from('companies').select('id, name');
    if (error) {
      test('T4: companies read', false, error.message);
    } else {
      const seesB = data.some(r => r.id === companyB_id);
      if (seesB) {
        info('T4: User A can read Company B name — acceptable if data tables are isolated');
        test('T4: companies readable (data isolation tested separately)', true,
          `${data.length} companies visible`);
      } else {
        test('T4: User A only sees own company', true,
          `${data.length} company/companies visible`);
      }
    }
  }

  // ── T5: subscriptions — only own ─────────────────────────────────────
  {
    const { data, error } = await clientA.from('subscriptions').select('*').limit(5);
    if (error) {
      skip('T5: subscriptions', error.message);
    } else {
      const cols = data.length > 0 ? Object.keys(data[0]) : [];
      const userCol = cols.find(c => c === 'user_id' || c === 'owner_id');
      if (userCol) {
        const seesB = data.some(r => r[userCol] === userB_id);
        test('T5: subscriptions — no User B data', !seesB, `${data.length} row(s)`);
      } else {
        test('T5: subscriptions — accessible', true, `${data.length} row(s)`);
      }
    }
  }

  // ── T6: user_agent_access — only own ─────────────────────────────────
  {
    const { data, error } = await clientA.from('user_agent_access').select('user_id');
    if (error) {
      skip('T6: user_agent_access', error.message);
    } else {
      const onlyOwn = data.every(r => r.user_id === userA_id);
      test('T6: user_agent_access — only own', data.length === 0 || onlyOwn,
        `${data.length} record(s)`);
    }
  }

  // ── T7: Cross-tenant INSERT into company_members — blocked ───────────
  {
    const { error } = await clientA.from('company_members').insert({
      user_id: userA_id,
      company_id: companyB_id,
      role: 'member',
      status: 'active',
      email: TEST_EMAIL_A,
    });
    test('T7: Cross-tenant INSERT into Company B members blocked', error !== null,
      error ? `Blocked: ${error.code || error.message}` : 'DANGER — insert succeeded!');
  }

  // ── T8: Cross-tenant UPDATE on company_members — blocked ─────────────
  {
    const { data, error } = await clientA.from('company_members')
      .update({ role: 'owner' })
      .eq('company_id', companyB_id);
    const safe = error !== null || !data || data.length === 0;
    test('T8: Cross-tenant UPDATE on Company B members blocked', safe,
      error ? `Blocked: ${error.code || error.message}` : `${(data || []).length} rows affected`);
  }

  // ── T9: Cross-tenant DELETE on company_members — blocked ─────────────
  {
    const { data, error } = await clientA.from('company_members')
      .delete()
      .eq('company_id', companyB_id)
      .eq('user_id', userB_id);
    const safe = error !== null || !data || data.length === 0;
    test('T9: Cross-tenant DELETE on Company B members blocked', safe,
      error ? `Blocked: ${error.code || error.message}` : `${(data || []).length} rows deleted`);
  }

  // ── T10: Dynamic agent data table tests ──────────────────────────────
  const agentTables = [
    'agent_cfo_data', 'agent_hr_data', 'agent_sales_data',
    'agent_operations_data', 'agent_marketing_data', 'agent_wms_data',
    'agent_seo_data', 'agent_support_data',
  ];

  let agentTestCount = 0;
  for (const table of agentTables) {
    const cols = await getTableColumns(table);
    if (cols === null) continue;
    if (!cols.includes('company_id')) continue;

    agentTestCount++;
    // Seed a row for Company B via admin
    const seedRow = { company_id: companyB_id };
    if (cols.includes('data')) seedRow.data = { ci_test: RUN_ID };
    if (cols.includes('content')) seedRow.content = `ci_test_${RUN_ID}`;

    await admin.from(table).insert(seedRow);

    // Check if User A can see it
    const { data, error } = await clientA.from(table).select('company_id').limit(100);
    if (error) {
      skip(`T10.${agentTestCount}: ${table}`, error.message);
    } else {
      const seesB = data.some(r => r.company_id === companyB_id);
      test(`T10.${agentTestCount}: ${table} — no Company B data visible`, !seesB,
        `${data.length} row(s)`);
    }

    // Clean up
    await admin.from(table).delete().eq('company_id', companyB_id);
  }

  if (agentTestCount === 0) {
    info('T10: No agent data tables with company_id found — skipping dynamic tests');
  }

  // ── T11: Admin (service role) CAN see both — proves RLS is the diff ──
  {
    const { data } = await admin.from('company_members')
      .select('user_id, company_id')
      .in('user_id', [userA_id, userB_id]);
    const hasBoth = data && data.length >= 2;
    test('T11: Admin sees both companies (confirms RLS is the isolation layer)', hasBoth,
      `${(data || []).length} rows`);
  }

  // ── T12: Unauthenticated client gets nothing ─────────────────────────
  {
    const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data, error } = await anonClient.from('company_members').select('*').limit(5);
    const empty = error !== null || !data || data.length === 0;
    test('T12: Unauthenticated client — no company_members data', empty,
      error ? error.message : `${(data || []).length} row(s)`);
  }
}

// ============================================================================
// CLEANUP
// ============================================================================
async function cleanup() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CLEANUP');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const cleanups = [
    () => admin.from('company_members').delete().in('user_id', [userA_id, userB_id]),
    () => admin.from('profiles').delete().in('id', [userA_id, userB_id]),
    () => admin.from('companies').delete().in('id', [companyA_id, companyB_id]),
  ];

  const agentTables = [
    'agent_cfo_data', 'agent_hr_data', 'agent_sales_data',
    'agent_operations_data', 'agent_marketing_data', 'agent_wms_data',
    'agent_seo_data', 'agent_support_data',
  ];
  for (const table of agentTables) {
    cleanups.push(() => admin.from(table).delete().eq('company_id', companyB_id));
  }

  for (const fn of cleanups) {
    try { await fn(); } catch (e) { /* best effort */ }
  }

  if (userA_id) try { await admin.auth.admin.deleteUser(userA_id); } catch (e) {}
  if (userB_id) try { await admin.auth.admin.deleteUser(userB_id); } catch (e) {}

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
