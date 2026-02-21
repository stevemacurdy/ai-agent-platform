const fs = require('fs');
const path = require('path');

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI: Master Enterprise Installer                   ║');
console.log('  ║  IAM + CFO Write-Back + Sales CRM + Middleware          ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

const BASE = path.join(__dirname, 'master-files');
let installed = 0;
let patched = 0;
let errors = 0;

function copyFile(src, dest) {
  try {
    const srcPath = path.join(BASE, src);
    if (!fs.existsSync(srcPath)) {
      console.log('  ! Missing: ' + src);
      errors++;
      return;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(srcPath, dest);
    const lines = fs.readFileSync(dest, 'utf8').split('\n').length;
    console.log('  + ' + dest + ' (' + lines + ' lines)');
    installed++;
  } catch(e) {
    console.log('  ! Error copying ' + src + ': ' + e.message);
    errors++;
  }
}

// ============================================================================
// STEP 1: Install API Routes
// ============================================================================
console.log('API Routes:');
copyFile('app/api/admin/users/route.ts', 'app/api/admin/users/route.ts');
copyFile('app/api/agents/cfo/write/route.ts', 'app/api/agents/cfo/write/route.ts');
copyFile('app/api/crm/route.ts', 'app/api/crm/route.ts');
console.log('');

// ============================================================================
// STEP 2: Install UI Pages
// ============================================================================
console.log('UI Pages:');
copyFile('app/admin/users/page.tsx', 'app/admin/users/page.tsx');
copyFile('app/admin/sales-crm/page.tsx', 'app/admin/sales-crm/page.tsx');
copyFile('app/admin/sales-crm/[contactId]/page.tsx', 'app/admin/sales-crm/[contactId]/page.tsx');
console.log('');

// ============================================================================
// STEP 3: Install Middleware
// ============================================================================
console.log('Infrastructure:');
copyFile('middleware.ts', 'middleware.ts');
console.log('');

// ============================================================================
// STEP 4: Patch lib/odoo.ts with write-back methods
// ============================================================================
console.log('Odoo Patch:');
try {
  let odoo = fs.readFileSync('lib/odoo.ts', 'utf8');
  if (odoo.includes('updateInvoice')) {
    console.log('  o lib/odoo.ts (write methods already exist)');
  } else {
    const methodsFile = path.join(BASE, 'lib/odoo-write-methods.ts');
    const methods = fs.readFileSync(methodsFile, 'utf8');
    // Strip the comment header
    const cleanMethods = methods.split('\n').filter(l => !l.startsWith('// ====') && !l.startsWith('// ODOO')).join('\n');

    // Insert before the closing of the class (right after getRecentPayments)
    if (odoo.includes('getRecentPayments')) {
      odoo = odoo.replace(
        /async getRecentPayments\(\)[^}]*\}/,
        (match) => match + '\n' + cleanMethods
      );
      fs.writeFileSync('lib/odoo.ts', odoo);
      console.log('  ~ lib/odoo.ts (write-back methods added: updateInvoice, updateContact, createInvoice, getPartnerDetail, getInvoiceLines, getAttachments, getBankStatementLines)');
      patched++;
    } else {
      console.log('  ! lib/odoo.ts: cannot find getRecentPayments — add write methods manually');
    }
  }
} catch(e) {
  console.log('  ! lib/odoo.ts error: ' + e.message);
  errors++;
}
console.log('');

// ============================================================================
// STEP 5: Patch admin sidebar navigation
// ============================================================================
console.log('Sidebar Patch:');
try {
  let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  let changed = false;

  // Add Sales CRM
  if (!layout.includes('sales-crm')) {
    // Strategy 1: Insert after Agent Creator
    if (layout.includes('Agent Creator')) {
      layout = layout.replace(
        /(\{[^}]*label:\s*['"]Agent Creator['"][^}]*\}),?/,
        "$1,\n    { id: 'crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '\uD83D\uDCBC' },"
      );
      changed = true;
    }
    // Strategy 2: Insert after Users
    else if (layout.includes("'/admin/users'") || layout.includes('Users')) {
      layout = layout.replace(
        /(\{[^}]*label:\s*['"]Users['"][^}]*\}),?/,
        "$1,\n    { id: 'crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '\uD83D\uDCBC' },"
      );
      changed = true;
    }
  }

  // Add CFO Console
  if (!layout.includes('cfo-manage')) {
    if (layout.includes('sales-crm')) {
      layout = layout.replace(
        /(\{[^}]*label:\s*['"]Sales CRM['"][^}]*\}),?/,
        "$1,\n    { id: 'cfo-console', label: 'CFO Console', href: '/agents/cfo/manage', icon: '\uD83D\uDCB0' },"
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync('app/admin/layout.tsx', layout);
    console.log('  ~ app/admin/layout.tsx (Sales CRM + CFO Console added to sidebar)');
    patched++;
  } else {
    console.log('  o app/admin/layout.tsx (sidebar already up to date)');
  }
} catch(e) {
  console.log('  ! Sidebar patch: ' + e.message);
  console.log('    Manually add to your sidebar nav:');
  console.log("    { id: 'crm', label: 'Sales CRM', href: '/admin/sales-crm' }");
}
console.log('');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('  ────────────────────────────────────────');
console.log('  Installed: ' + installed + ' files');
console.log('  Patched:   ' + patched + ' files');
console.log('  Errors:    ' + errors);
console.log('  ────────────────────────────────────────');
console.log('');
console.log('  Routes added:');
console.log('    /admin/users              IAM: create users, set roles, manage permissions');
console.log('    /admin/sales-crm          Pipeline board + contact list');
console.log('    /admin/sales-crm/[id]     360-degree customer profile');
console.log('    /api/admin/users           Users CRUD API with seat enforcement');
console.log('    /api/agents/cfo/write      Odoo write-back (invoices, contacts)');
console.log('    /api/crm                   CRM data API (contacts, deals, activities)');
console.log('');
console.log('  Next steps:');
console.log('    1. Restart: npm run dev');
console.log('    2. Visit /admin → sidebar now has Sales CRM + CFO Console');
console.log('    3. SQL migration: paste woulfai-master-migration.sql into Supabase');
console.log('');
