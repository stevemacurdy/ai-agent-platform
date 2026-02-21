const fs = require('fs');
const path = require('path');

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI Phase 7b: CFO Intelligence Console v2          ║');
console.log('  ║  Modal Drill-Downs, Traceable KPIs, Odoo+HubSpot Flow  ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

const BASE = path.join(__dirname, 'phase7b-files');
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
install('app/api/cfo-cashflow/route.ts', 'app/api/cfo-cashflow/route.ts');
console.log('');

console.log('UI Pages (replaces Phase 7 console):');
install('app/agents/cfo/console/page.tsx', 'app/agents/cfo/console/page.tsx');
console.log('');

console.log('  ────────────────────────────────────────');
console.log('  Installed: ' + installed + ' files');
console.log('  ────────────────────────────────────────');
console.log('');
console.log('  UPGRADES over Phase 7:');
console.log('');
console.log('    1. MODAL DRILL-DOWNS (not tab navigation)');
console.log('       Click any invoice number -> slide-over modal');
console.log('       Edit mode, audit trail, Odoo write-back');
console.log('');
console.log('    2. TRACEABLE KPIs');
console.log('       Click "Total AR" -> filtered list of source invoices');
console.log('       Click "Overdue" -> only overdue invoices');
console.log('       Every number links to underlying data');
console.log('');
console.log('    3. PREDICTIVE CASHFLOW (Odoo + HubSpot)');
console.log('       /api/cfo-cashflow');
console.log('       Inflows: Odoo account.move receivables + HubSpot deals');
console.log('       HubSpot deals weighted by close probability');
console.log('       Outflows: Odoo vendor_bills by payment schedule');
console.log('       Output: Bar chart with 30/60/90-day windows');
console.log('       Each window drillable to source transactions');
console.log('');
console.log('    4. TIERED COLLECTION STRATEGY');
console.log('       1-15d overdue + high reliability = Soft Reminder');
console.log('       16-45d overdue = Partner Outreach (phone call)');
console.log('       45+ days = Hard Collection (legal notice)');
console.log('       Vendor Reliability Score shifts thresholds');
console.log('');
console.log('  Route: /agents/cfo/console');
console.log('  Then: npm run dev');
console.log('');
