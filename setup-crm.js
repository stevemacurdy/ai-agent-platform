const fs = require('fs');
const path = require('path');

console.log('WoulfAI Enterprise — Sales CRM Installer');
console.log('=========================================\n');

const FILES = {
  'app/api/crm/route.ts': 'crm-files/app/api/crm/route.ts',
  'app/admin/sales-crm/page.tsx': 'crm-files/app/admin/sales-crm/page.tsx',
  'app/admin/sales-crm/[contactId]/page.tsx': 'crm-files/app/admin/sales-crm/[contactId]/page.tsx',
};

// Copy CRM files
for (const [dest, src] of Object.entries(FILES)) {
  const srcPath = path.join(__dirname, src);
  if (fs.existsSync(srcPath)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(srcPath, dest);
    const lines = fs.readFileSync(dest, 'utf8').split('\n').length;
    console.log('  + ' + dest + ' (' + lines + ' lines)');
  } else {
    console.log('  ! Source not found: ' + srcPath);
  }
}

// Patch admin layout sidebar
try {
  let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  if (!layout.includes('sales-crm')) {
    // Try to add after Agent Creator nav item
    if (layout.includes("Agent Creator")) {
      layout = layout.replace(
        /(\{ id: ['"]agents['"],.*?['"]Agent Creator['"].*?\}),/,
        "$1,\n  { id: 'crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '\uD83D\uDCBC' },\n  { id: 'cfo-manage', label: 'CFO Console', href: '/agents/cfo/manage', icon: '\uD83D\uDCB0' },"
      );
    }
    // Fallback: try adding after any nav array item
    if (!layout.includes('sales-crm')) {
      layout = layout.replace(
        "{ id: 'users', label: 'Users', href: '/admin/users',",
        "{ id: 'crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '\uD83D\uDCBC' },\n  { id: 'cfo-manage', label: 'CFO Console', href: '/agents/cfo/manage', icon: '\uD83D\uDCB0' },\n  { id: 'users', label: 'Users', href: '/admin/users',"
      );
    }
    fs.writeFileSync('app/admin/layout.tsx', layout);
    console.log('  ~ app/admin/layout.tsx (Sales CRM + CFO Console added to sidebar)');
  } else {
    console.log('  o app/admin/layout.tsx (CRM already in sidebar)');
  }
} catch(e) {
  console.log('  ! Sidebar patch skipped: ' + e.message);
  console.log('    Add this to your sidebar nav array manually:');
  console.log("    { id: 'crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '\uD83D\uDCBC' },");
}

console.log('');
console.log('=== Sales CRM Installed ===');
console.log('');
console.log('Pages:');
console.log('  /admin/sales-crm              Pipeline board + Contact list');
console.log('  /admin/sales-crm/[contactId]  360-degree customer profile');
console.log('');
console.log('Features:');
console.log('  - Pipeline board with stage-advance buttons');
console.log('  - 5 rich contacts with personality bios');
console.log('  - 8 deals across all stages');
console.log('  - 12 activity entries (meetings, calls, emails, notes)');
console.log('  - AI "Reality Potential Score" per contact');
console.log('  - Full activity timeline with logging');
console.log('  - Contact editing with bio notes');
console.log('  - Revenue traceability (click any number -> source)');
console.log('');
console.log('Restart dev server: npm run dev');
