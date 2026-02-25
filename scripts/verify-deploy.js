#!/usr/bin/env node
// scripts/verify-deploy.js
// Post-deployment smoke tests — checks critical paths on production
// Run: node scripts/verify-deploy.js [base-url]
// Default: https://www.woulfai.com

const BASE = process.argv[2] || 'https://www.woulfai.com';
let passed = 0, failed = 0;

function test(name, ok, detail) {
  const s = ok ? '✅ PASS' : '❌ FAIL';
  if (ok) passed++; else failed++;
  console.log(`${s}: ${name}${detail ? ` (${detail})` : ''}`);
}

async function checkPage(path, { status = 200, contains, headerCheck } = {}) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const ok = res.status === status;
    let detail = `${res.status}`;

    if (contains && ok) {
      const text = await res.text();
      const found = text.includes(contains);
      test(`GET ${path}`, found, found ? detail : `${detail} — missing "${contains}"`);
      return res;
    }

    if (headerCheck && ok) {
      const val = res.headers.get(headerCheck.name);
      const headerOk = headerCheck.includes
        ? val && val.includes(headerCheck.includes)
        : !!val;
      test(`GET ${path}`, headerOk,
        headerOk ? `${headerCheck.name} present` : `${headerCheck.name} missing or wrong`);
      return res;
    }

    test(`GET ${path}`, ok, detail);
    return res;
  } catch (e) {
    test(`GET ${path}`, false, e.message);
    return null;
  }
}

async function checkAPI(path, { method = 'GET', status = 200, body, expectError } = {}) {
  const url = `${BASE}${path}`;
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (expectError) {
      test(`${method} ${path}`, res.status === status, `${res.status}`);
    } else {
      test(`${method} ${path}`, res.status === status, `${res.status}`);
    }
    return res;
  } catch (e) {
    test(`${method} ${path}`, false, e.message);
    return null;
  }
}

async function run() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('POST-DEPLOY VERIFICATION');
  console.log(`Target: ${BASE}`);
  console.log(`Time:   ${new Date().toISOString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ── Public pages load ──────────────────────────────────────────────
  console.log('── Public Pages ──\n');
  await checkPage('/', { contains: 'WoulfAI' });
  await checkPage('/pricing', { contains: 'ricing' });
  await checkPage('/security', { contains: 'Security' });
  await checkPage('/about', { contains: 'Woulf' });
  await checkPage('/contact');
  await checkPage('/login');
  await checkPage('/register');

  // ── Security headers ───────────────────────────────────────────────
  console.log('\n── Security Headers ──\n');
  const homeRes = await fetch(BASE);
  const headers = homeRes.headers;

  const secHeaders = [
    { name: 'x-frame-options', expect: 'DENY' },
    { name: 'x-content-type-options', expect: 'nosniff' },
    { name: 'strict-transport-security', expect: 'max-age' },
    { name: 'content-security-policy', expect: null },
  ];

  for (const h of secHeaders) {
    const val = headers.get(h.name);
    if (h.expect) {
      test(`Header: ${h.name}`, val && val.includes(h.expect),
        val ? val.substring(0, 60) : 'missing');
    } else {
      test(`Header: ${h.name}`, !!val, val ? 'present' : 'missing');
    }
  }

  // ── API health ─────────────────────────────────────────────────────
  console.log('\n── API Endpoints ──\n');

  // Auth endpoints should return 401 or 400 without credentials (not 500)
  await checkAPI('/api/auth/me', { status: 401 });
  await checkAPI('/api/auth/login', {
    method: 'POST',
    body: { email: 'smoke@test.local', password: 'x' },
    status: 401,
    expectError: true,
  });

  // Agents list should be accessible
  await checkAPI('/api/agents');


  // Protected endpoints should reject unauthenticated requests (not 500)
  const protectedRoutes = [
    '/api/admin/users',
    '/api/admin/companies',
    '/api/chat',
    '/api/billing',
  ];

  for (const route of protectedRoutes) {
    const res = await fetch(`${BASE}${route}`);
    const notServerError = res.status !== 500;
    test(`${route} — no 500`, notServerError,
      `${res.status} (expected 401/403/405, not 500)`);
  }

  // ── 404 handling ───────────────────────────────────────────────────
  console.log('\n── Error Handling ──\n');
  await checkPage('/this-page-does-not-exist-12345', { status: 404 });

  // ── Results ────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (failed > 0) {
    console.log('\n❌ DEPLOY VERIFICATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ DEPLOY VERIFIED — ALL CHECKS PASSED');
    process.exit(0);
  }
}

run();
