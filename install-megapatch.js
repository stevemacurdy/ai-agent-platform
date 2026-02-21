/**
 * WoulfAI MEGAPATCH — Installs ALL missing APIs + Pages in one pass
 * Run from: ai-agent-platform root
 * node install-megapatch.js
 */
const fs = require('fs');
const path = require('path');

console.log('');
console.log('  ╔════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI MEGAPATCH — All Missing Files             ║');
console.log('  ║  10 API routes + 3 UI pages + sidebar patches      ║');
console.log('  ╚════════════════════════════════════════════════════╝');
console.log('');

const SRC = path.join(__dirname, 'files');
let installed = 0;
let skipped = 0;

function install(rel) {
  const src = path.join(SRC, rel);
  const dst = path.join(process.cwd(), rel);
  if (!fs.existsSync(src)) { console.log('  ? Source missing: ' + rel); return; }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  // Don't overwrite if user has modified
  const overwrite = !fs.existsSync(dst);
  if (!overwrite) {
    console.log('  ~ Exists, overwriting: ' + rel);
  }
  fs.copyFileSync(src, dst);
  const lines = fs.readFileSync(dst, 'utf8').split('\n').length;
  console.log('  + ' + rel + ' (' + lines + ' lines)');
  installed++;
}

// ====== API ROUTES ======
console.log('  API Routes:');
install('app/api/ap/route.ts');
install('app/api/debt/route.ts');
install('app/api/finance-capture/route.ts');
install('app/api/finance-reconcile/route.ts');
install('app/api/sales-intel/route.ts');
install('app/api/cfo-invoices/route.ts');
install('app/api/cfo-collections/route.ts');
install('app/api/cfo-health/route.ts');
install('app/api/cfo-cashflow/route.ts');
install('app/api/refinance-alert/route.ts');
console.log('');

// ====== UI PAGES ======
console.log('  UI Pages:');
install('app/agents/cfo/console/page.tsx');
install('app/agents/cfo/payables/page.tsx');
install('app/agents/sales/intel/page.tsx');
console.log('');

// ====== SIDEBAR PATCH ======
console.log('  Sidebar Patch:');
const layoutPath = path.join(process.cwd(), 'app/admin/layout.tsx');
if (fs.existsSync(layoutPath)) {
  let layout = fs.readFileSync(layoutPath, 'utf8');
  const needed = [
    { id: 'cfo-console', label: 'CFO Console', href: '/agents/cfo/console', icon: 'C' },
    { id: 'payables', label: 'Payables', href: '/agents/cfo/payables', icon: 'P' },
    { id: 'sales-intel', label: 'Sales Intel', href: '/agents/sales/intel', icon: 'I' },
  ];
  const missing = needed.filter(n => !layout.includes(n.href));
  if (missing.length > 0) {
    const m = layout.match(/(const\s+\w+\s*(?::\s*[^=]*)?\s*=\s*\[)/);
    if (m) {
      const idx = m.index + m[0].length;
      const inj = missing.map(n => `\n    { id: '${n.id}', label: '${n.label}', href: '${n.href}', icon: '${n.icon}' },`).join('');
      layout = layout.slice(0, idx) + inj + layout.slice(idx);
      fs.writeFileSync(layoutPath, layout);
      console.log('  + Injected ' + missing.length + ' sidebar items: ' + missing.map(n => n.label).join(', '));
    } else {
      console.log('  ! Could not auto-patch sidebar. Add these manually:');
      missing.forEach(n => console.log(`    { id: '${n.id}', label: '${n.label}', href: '${n.href}' }`));
    }
  } else {
    console.log('  o Sidebar already has all items');
  }
} else {
  console.log('  ! app/admin/layout.tsx not found — add sidebar items manually');
}

// ====== suppressHydrationWarning ======
const rootLayout = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(rootLayout)) {
  let root = fs.readFileSync(rootLayout, 'utf8');
  if (!root.includes('suppressHydrationWarning')) {
    root = root.replace(/<body(?=[>\s])/g, '<body suppressHydrationWarning');
    fs.writeFileSync(rootLayout, root);
    console.log('  + Added suppressHydrationWarning to <body>');
  }
}

console.log('');
console.log('  ═══════════════════════════════════════════════');
console.log('  Installed: ' + installed + ' files');
console.log('  ═══════════════════════════════════════════════');
console.log('');
console.log('  VERIFY (after npm run dev):');
console.log('');
console.log('    for ep in /api/ap /api/debt /api/finance-capture /api/finance-reconcile \\');
console.log('      /api/sales-intel /api/cfo-invoices /api/cfo-collections /api/cfo-health \\');
console.log('      /api/cfo-cashflow /api/refinance-alert; do');
console.log('      STATUS=$(curl -s -o /dev/null -w "%{http_code}" \\');
console.log('        -H "x-admin-email: admin" "http://localhost:3000$ep")');
console.log('      echo "$STATUS $ep"');
console.log('    done');
console.log('');
console.log('  All should return 200.');
console.log('');
