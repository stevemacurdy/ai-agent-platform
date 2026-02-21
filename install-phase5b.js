const fs = require('fs');
const path = require('path');

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI Phase 5b: FinOps Pro — High-End Features       ║');
console.log('  ║  Tax Reserve, Duplicates, Anomalies, Vendors, Lending   ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

const BASE = path.join(__dirname, 'phase5b-files');
let installed = 0;
let patched = 0;

function install(src, dest) {
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(BASE, src), dest);
    const lines = fs.readFileSync(dest, 'utf8').split('\n').length;
    console.log('  + ' + dest + ' (' + lines + ' lines)');
    installed++;
  } catch(e) {
    console.log('  ! ' + src + ': ' + e.message);
  }
}

console.log('API Routes:');
install('app/api/tax-reserve/route.ts', 'app/api/tax-reserve/route.ts');
install('app/api/duplicate-detection/route.ts', 'app/api/duplicate-detection/route.ts');
install('app/api/anomaly/route.ts', 'app/api/anomaly/route.ts');
install('app/api/vendor-scoring/route.ts', 'app/api/vendor-scoring/route.ts');
install('app/api/lending-packet/route.ts', 'app/api/lending-packet/route.ts');
console.log('');

console.log('UI Pages:');
install('app/agents/cfo/finops-pro/page.tsx', 'app/agents/cfo/finops-pro/page.tsx');
console.log('');

console.log('Sidebar:');
try {
  let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  if (!layout.includes('finops-pro')) {
    const targets = ["'finops'", "'integrations'", "'cfo-tools'", "'debrief'"];
    let changed = false;
    for (const target of targets) {
      if (layout.includes(target)) {
        const pattern = new RegExp("(\\{[^}]*id:\\s*" + target + "[^}]*\\}),?");
        if (pattern.test(layout)) {
          layout = layout.replace(pattern, "$1,\n    { id: 'finops-pro', label: 'FinOps Pro', href: '/agents/cfo/finops-pro', icon: '\uD83D\uDC8E' },");
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      fs.writeFileSync('app/admin/layout.tsx', layout);
      console.log('  ~ app/admin/layout.tsx (FinOps Pro added)');
      patched++;
    } else {
      console.log('  ! Could not auto-patch. Add manually:');
      console.log("    { id: 'finops-pro', label: 'FinOps Pro', href: '/agents/cfo/finops-pro', icon: '\uD83D\uDC8E' }");
    }
  } else {
    console.log('  o Sidebar already has FinOps Pro');
  }
} catch(e) {
  console.log('  ! Sidebar: ' + e.message);
}

console.log('');
console.log('  ────────────────────────────────────────');
console.log('  Installed: ' + installed + ' files');
console.log('  Patched:   ' + patched + ' files');
console.log('  ────────────────────────────────────────');
console.log('');
console.log('  New route: /agents/cfo/finops-pro');
console.log('');
console.log('  5 Tabs:');
console.log('    Tax Reserve         Auto 28% allocation, quarterly payment schedule,');
console.log('                        monthly tracking, due date alerts');
console.log('    Duplicate Scan      Cross-references all AP for matching vendor+amount+date,');
console.log('                        match scoring (exact/probable/possible), dismiss/confirm');
console.log('    Anomalies           ML baselines per category, flags 1.5σ+ deviations,');
console.log('                        critical/warning/info severity, possible reasons');
console.log('    Vendor Scoring      Reliability scores, preferred/standard/watch tiers,');
console.log('                        early-pay discount recommendations');
console.log('    Lending Packet      One-click: Executive Summary + YTD P&L + Balance Sheet');
console.log('                        + Cash Flow Statement preview, ready for PDF export');
console.log('');
console.log('  Then: npm run dev');
console.log('');
