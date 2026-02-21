const fs = require('fs');
const path = require('path');

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI Phase 7: CFO Intelligence Console              ║');
console.log('  ║  Invoice Drill-Down, AI Collections, Financial Health   ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

const BASE = path.join(__dirname, 'phase7-files');
let installed = 0;

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
install('app/api/cfo-invoices/route.ts', 'app/api/cfo-invoices/route.ts');
install('app/api/cfo-collections/route.ts', 'app/api/cfo-collections/route.ts');
install('app/api/cfo-health/route.ts', 'app/api/cfo-health/route.ts');
console.log('');

console.log('UI Pages:');
install('app/agents/cfo/console/page.tsx', 'app/agents/cfo/console/page.tsx');
console.log('');

console.log('Sidebar:');
try {
  let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  if (!layout.includes('cfo-console') && !layout.includes('/agents/cfo/console')) {
    console.log('  ! Add manually to sidebar nav array:');
    console.log("    { id: 'cfo-console', label: 'CFO Console', href: '/agents/cfo/console', icon: 'C' },");
  } else {
    console.log('  o CFO Console already in sidebar');
  }
} catch(e) {
  console.log('  ! ' + e.message);
}

console.log('');
console.log('  ────────────────────────────────────────');
console.log('  Installed: ' + installed + ' files');
console.log('  ────────────────────────────────────────');
console.log('');
console.log('  Route: /agents/cfo/console');
console.log('');
console.log('  5 Tabs:');
console.log('    Overview            KPI cards + action buttons to trigger all analyses');
console.log('    Invoice Drill-Down  Click any invoice to see line items, edit mode,');
console.log('                        audit log (user/time/before/after), Odoo sync');
console.log('    AI Collections      Scans overdue invoices, factors vendor reliability,');
console.log('                        generates prioritized gentle/firm/escalated/critical');
console.log('                        strategies with draft messages per debtor');
console.log('    Financial Health    Health Score (0-100), Quick Ratio, DSO, Burn Rate,');
console.log('                        runway, actionable 3-step checklist, vendor discounts');
console.log('    Cash Forecast       30/60/90-day + 12/24-month projections with alerts');
console.log('');
console.log('  API endpoints:');
console.log('    /api/cfo-invoices     Invoice CRUD, line item editing, audit log');
console.log('    /api/cfo-collections  AI collection strategy engine');
console.log('    /api/cfo-health       Health score, vendor discounts, forecasting');
console.log('');
console.log('  Then: npm run dev');
console.log('');
