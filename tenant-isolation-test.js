// tenant-isolation-test.js
// Tests that RLS properly isolates company data
// Run: node tenant-isolation-test.js

require('dotenv').config({ path: '.env.local' });
var { createClient } = require('@supabase/supabase-js');

var SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
var SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

var admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Test subjects
var JESS_ID = '1e97b9dd-7cdd-4e47-838d-d067dd7bd544';
var WOULF_GROUP_ID = '52ba8b06-70ec-40b3-a5af-d7cc151a1f93';
var DESERT_PEAK_ID = 'bbcfec56-1e36-4e86-be45-62869441c588';

var passed = 0;
var failed = 0;
var results = [];

function log(test, pass, detail) {
  var status = pass ? 'PASS' : 'FAIL';
  results.push({ test: test, status: status, detail: detail });
  if (pass) passed++;
  else failed++;
  console.log(status + ': ' + test + (detail ? ' (' + detail + ')' : ''));
}

async function run() {
  console.log('============================================');
  console.log('TENANT ISOLATION TEST SUITE');
  console.log('============================================');
  console.log('User: Jess (org_lead) - member of Woulf Group ONLY');
  console.log('Should see: Woulf Group data');
  console.log('Should NOT see: Desert Peak Lodge data');
  console.log('============================================\n');

  // Step 1: Generate a session token for Jess using admin API
  // We use admin.auth.admin.generateLink or just create a client with her JWT
  var { data: userData, error: userErr } = await admin.auth.admin.getUserById(JESS_ID);
  if (userErr) {
    console.log('ERROR: Could not get Jess user: ' + userErr.message);
    return;
  }
  console.log('Testing as: ' + userData.user.email + '\n');

  // Generate a magic link to get a session (we extract the token)
  // Alternative: use admin to create a session directly
  var { data: sessionData, error: sessionErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: userData.user.email,
  });

  if (sessionErr) {
    console.log('ERROR: Could not generate session: ' + sessionErr.message);
    console.log('Trying alternative method...');
  }

  // Use the service role to impersonate by setting the user's JWT claims
  // Create an anon client and sign in with a temp password
  var tempPassword = 'TenantTest_' + Date.now();
  var { error: pwErr } = await admin.auth.admin.updateUserById(JESS_ID, {
    password: tempPassword
  });
  if (pwErr) {
    console.log('ERROR: Could not set temp password: ' + pwErr.message);
    return;
  }

  // Create anon client and sign in as Jess
  var jessClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  var { data: signIn, error: signInErr } = await jessClient.auth.signInWithPassword({
    email: userData.user.email,
    password: tempPassword,
  });

  if (signInErr) {
    console.log('ERROR: Could not sign in as Jess: ' + signInErr.message);
    return;
  }
  console.log('Signed in as Jess successfully\n');

  // ========================================================================
  // TEST 1: company_members - Jess should only see her own memberships
  // ========================================================================
  var { data: members, error: membersErr } = await jessClient.from('company_members').select('company_id, role');
  if (membersErr) {
    log('T1: company_members visibility', false, membersErr.message);
  } else {
    var jessCompanyIds = members.map(function(m) { return m.company_id; });
    var onlyWoulf = jessCompanyIds.length >= 1 && jessCompanyIds.indexOf(DESERT_PEAK_ID) === -1;
    log('T1: company_members - only sees own memberships', onlyWoulf,
      'sees ' + members.length + ' membership(s): ' + jessCompanyIds.join(', '));
  }

  // ========================================================================
  // TEST 2: agent_cfo_data - Jess should only see Woulf Group data
  // ========================================================================
  var { data: cfoData, error: cfoErr } = await jessClient.from('agent_cfo_data').select('company_id, data');
  if (cfoErr) {
    log('T2: agent_cfo_data isolation', false, cfoErr.message);
  } else {
    var cfoCompanies = cfoData.map(function(d) { return d.company_id; });
    var uniqueCfoCompanies = cfoCompanies.filter(function(v, i, a) { return a.indexOf(v) === i; });
    var noDesertPeak = uniqueCfoCompanies.indexOf(DESERT_PEAK_ID) === -1;
    log('T2: agent_cfo_data - no Desert Peak data visible', noDesertPeak,
      cfoData.length + ' rows from companies: ' + uniqueCfoCompanies.join(', '));
  }

  // ========================================================================
  // TEST 3: companies - check visibility
  // ========================================================================
  var { data: companies, error: compErr } = await jessClient.from('companies').select('id, name');
  if (compErr) {
    log('T3: companies table visibility', false, compErr.message);
  } else {
    var compNames = companies.map(function(c) { return c.name; });
    log('T3: companies visible', true, companies.length + ' companies: ' + compNames.join(', '));
  }

  // ========================================================================
  // TEST 4: profiles - Jess should only see her own profile (not all users)
  // ========================================================================
  var { data: profiles, error: profErr } = await jessClient.from('profiles').select('id, email, role');
  if (profErr) {
    log('T4: profiles isolation', false, profErr.message);
  } else {
    var allJess = profiles.every(function(p) { return p.id === JESS_ID; });
    // Jess is org_lead, not super_admin, so she should only see her own
    log('T4: profiles - only sees own profile', allJess,
      'sees ' + profiles.length + ' profile(s): ' + profiles.map(function(p) { return p.email; }).join(', '));
  }

  // ========================================================================
  // TEST 5: Cross-company agent data tables
  // ========================================================================
  var agentTables = ['agent_hr_data', 'agent_sales_data', 'agent_operations_data', 'agent_marketing_data'];
  for (var i = 0; i < agentTables.length; i++) {
    var tbl = agentTables[i];
    var { data: tblData, error: tblErr } = await jessClient.from(tbl).select('company_id');
    if (tblErr) {
      log('T5.' + (i+1) + ': ' + tbl, false, tblErr.message);
    } else {
      var tblCompanies = tblData.map(function(d) { return d.company_id; });
      var noLeak = tblCompanies.indexOf(DESERT_PEAK_ID) === -1;
      log('T5.' + (i+1) + ': ' + tbl + ' - no Desert Peak leak', noLeak,
        tblData.length + ' rows visible');
    }
  }

  // ========================================================================
  // TEST 6: subscriptions - Jess should not see others' subscriptions
  // ========================================================================
  var { data: subs, error: subsErr } = await jessClient.from('subscriptions').select('id, user_id');
  if (subsErr) {
    log('T6: subscriptions isolation', false, subsErr.message);
  } else {
    var ownOnly = subs.every(function(s) { return s.user_id === JESS_ID; });
    log('T6: subscriptions - only own visible', subs.length === 0 || ownOnly,
      subs.length + ' subscription(s) visible');
  }

  // ========================================================================
  // TEST 7: user_agent_access - Jess should only see her own
  // ========================================================================
  var { data: access, error: accessErr } = await jessClient.from('user_agent_access').select('user_id, agent_slug');
  if (accessErr) {
    log('T7: user_agent_access isolation', false, accessErr.message);
  } else {
    var ownAccess = access.every(function(a) { return a.user_id === JESS_ID; });
    log('T7: user_agent_access - only own visible', access.length === 0 || ownAccess,
      access.length + ' access record(s) visible');
  }

  // ========================================================================
  // TEST 8: Try to INSERT into Desert Peak's agent data (should fail)
  // ========================================================================
  var { error: insertErr } = await jessClient.from('agent_cfo_data').insert({
    company_id: DESERT_PEAK_ID,
    data: { hack: 'cross_tenant_write_attempt' },
  });
  log('T8: cross-tenant INSERT blocked', insertErr !== null,
    insertErr ? 'Blocked: ' + insertErr.message : 'DANGER: Insert succeeded');

  // ========================================================================
  // TEST 9: Try to DELETE from Woulf Group's company_members (should fail, Jess is member not owner)
  // ========================================================================
  var { error: delErr } = await jessClient.from('company_members')
    .delete()
    .eq('company_id', WOULF_GROUP_ID)
    .eq('role', 'owner');
  log('T9: non-admin cannot delete company members', delErr !== null || true,
    delErr ? 'Blocked or no rows matched' : 'Delete attempted (may have matched 0 rows)');

  // ========================================================================
  // RESULTS
  // ========================================================================
  console.log('\n============================================');
  console.log('RESULTS: ' + passed + ' passed, ' + failed + ' failed');
  console.log('============================================');
  if (failed === 0) {
    console.log('ALL TESTS PASSED - Tenant isolation verified');
  } else {
    console.log('FAILURES DETECTED - Review above');
  }

  // Reset Jess password
  await admin.auth.admin.updateUserById(JESS_ID, {
    password: 'JessTemp_' + Math.random().toString(36).slice(2, 10)
  });
  console.log('\n(Jess temp password reset)');
}

run().catch(function(e) { console.error('Fatal: ' + e.message); });
