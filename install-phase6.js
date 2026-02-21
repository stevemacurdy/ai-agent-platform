const fs = require('fs');
const path = require('path');

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI Phase 6: Active Payables + Sales Intelligence  ║');
console.log('  ║  Payment Engine, Bank Reconciliation, Behavioral Intel  ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

const BASE = path.join(__dirname, 'phase6-files');
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
install('app/api/finance-capture/route.ts', 'app/api/finance-capture/route.ts');
install('app/api/finance-reconcile/route.ts', 'app/api/finance-reconcile/route.ts');
install('app/api/sales-intel/route.ts', 'app/api/sales-intel/route.ts');
console.log('');

console.log('UI Pages:');
install('app/agents/cfo/payables/page.tsx', 'app/agents/cfo/payables/page.tsx');
install('app/agents/sales/intel/page.tsx', 'app/agents/sales/intel/page.tsx');
console.log('');

console.log('Sidebar:');
try {
  let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  let changed = false;

  // Try to add Payables
  if (!layout.includes('payables')) {
    // Simple approach: find the nav array and append
    if (layout.includes('navItems') || layout.includes('nav =') || layout.includes('links =') || layout.includes('items =')) {
      // Try multiple insert strategies
      const insertPairs = [
        ["'finops-pro'", "'finops'", "'integrations'", "'cfo-tools'", "'cfo-console'", "'debrief'", "'crm'", "'operations'"],
      ];
      for (const targets of insertPairs) {
        for (const target of targets) {
          if (layout.includes(target)) {
            const idx = layout.indexOf(target);
            const blockEnd = layout.indexOf('}', idx);
            const afterBlock = layout.indexOf(',', blockEnd);
            if (afterBlock > -1) {
              const insertAt = afterBlock + 1;
              const insert = "\n    { id: 'payables', label: 'Payables', href: '/agents/cfo/payables', icon: 'P' },\n    { id: 'sales-intel', label: 'Sales Intel', href: '/agents/sales/intel', icon: 'S' },";
              layout = layout.slice(0, insertAt) + insert + layout.slice(insertAt);
              changed = true;
              break;
            }
          }
        }
        if (changed) break;
      }
    }
  }

  if (changed) {
    fs.writeFileSync('app/admin/layout.tsx', layout);
    console.log('  ~ app/admin/layout.tsx (Payables + Sales Intel added)');
  } else if (layout.includes('payables')) {
    console.log('  o Sidebar already has entries');
  } else {
    console.log('  ! Auto-patch failed. Add these manually to the sidebar nav array:');
    console.log("    { id: 'payables', label: 'Payables', href: '/agents/cfo/payables', icon: 'P' },");
    console.log("    { id: 'sales-intel', label: 'Sales Intel', href: '/agents/sales/intel', icon: 'S' },");
  }
} catch(e) {
  console.log('  ! Sidebar: ' + e.message);
}

console.log('');
console.log('  ────────────────────────────────────────');
console.log('  Installed: ' + installed + ' files');
console.log('  ────────────────────────────────────────');
console.log('');
console.log('  CFO PAYABLES ENGINE (/agents/cfo/payables):');
console.log('    Smart Intake     Drag-drop or camera capture with AI OCR extraction');
console.log('    Pending Review   Verify auto-populated fields before ledger entry');
console.log('    Pay Invoices     Select funding source + one-click payment + Odoo sync');
console.log('    Reconciliation   Bank feed matching, auto-reconcile, suggestion engine');
console.log('');
console.log('  SALES INTELLIGENCE (/agents/sales/intel):');
console.log('    Behavioral Profiles    Communication style, buyer persona, buying bridge');
console.log('    Battle Cards           5x DO + 5x DO NOT field manual per contact');
console.log('    Negotiation Intel      Timing, decision chain, counter-strategies');
console.log('    Reality Score           0-100 close probability with engagement level');
console.log('');
console.log('  API endpoints:');
console.log('    /api/finance-capture     OCR, pending review, payment execution');
console.log('    /api/finance-reconcile   Bank feed matching, auto-reconcile');
console.log('    /api/sales-intel         Behavioral profiling, battle card generation');
console.log('');
console.log('  Then: npm run dev');
console.log('');
