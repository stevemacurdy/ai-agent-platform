/**
 * ============================================================
 *  WoulfAI — Batch 4: Cleanup
 * ============================================================
 *  1. Remove old hardcoded demo pages (replaced by dynamic /demo/[slug])
 *  2. Remove orphaned /agents/sales/intel (merged into /agents/sales)
 *  3. Add mobile hamburger menu to sidebar
 *  4. Clean up /agents/sales/solo redirect (keep but simplify)
 *
 *  Run:  node batch4-cleanup.js
 *  Then: npm run build && vercel --prod
 */

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const AP = fs.existsSync(path.join(ROOT, 'src/app')) ? 'src/' : '';
let removed = 0;
let created = 0;

function rm(fp) {
  const full = path.join(ROOT, fp);
  if (fs.existsSync(full)) {
    const bd = path.join(ROOT, '.backups', 'batch4');
    fs.mkdirSync(bd, { recursive: true });
    fs.cpSync(full, path.join(bd, fp.replace(/\//g, '__')), { recursive: true });
    fs.rmSync(full, { recursive: true });
    removed++;
    console.log('  \u2717 Removed ' + fp);
  } else {
    console.log('  - Skip (not found): ' + fp);
  }
}

function write(fp, content) {
  const full = path.join(ROOT, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (fs.existsSync(full)) {
    const bd = path.join(ROOT, '.backups', 'batch4');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(full, path.join(bd, fp.replace(/\//g, '__')));
  }
  fs.writeFileSync(full, content, 'utf8');
  created++;
  console.log('  \u2713 ' + fp);
}

console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 Batch 4: Cleanup                  \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

// ── STEP 1: Remove old hardcoded demo pages ──
console.log('  [1/4] Removing old hardcoded demo pages');
console.log('        (Dynamic /demo/[slug] handles all agents now)');
console.log('');

const OLD_DEMOS = [
  'app/demo/customer-support',
  'app/demo/finance-ops',
  'app/demo/marketing',
  'app/demo/research-intel',
  'app/demo/sales-field',
  'app/demo/training',
  'app/demo/wms-proof-billing',
];

OLD_DEMOS.forEach(d => rm(AP + d));

// ── STEP 2: Remove orphaned sales/intel ──
console.log('');
console.log('  [2/4] Removing orphaned /agents/sales/intel');
console.log('        (Merged into main /agents/sales page)');
console.log('');

rm(AP + 'app/agents/sales/intel');

// ── STEP 3: Mobile hamburger sidebar ──
console.log('');
console.log('  [3/4] Mobile-responsive sidebar with hamburger menu');
console.log('');

write(AP + 'components/layout/PlatformShell.tsx', [
"'use client';",
"import { useState } from 'react';",
"import SidebarNav from '@/components/dashboard/sidebar-nav';",
"",
"export default function PlatformShell({ children }: { children: React.ReactNode }) {",
"  const [mobileOpen, setMobileOpen] = useState(false);",
"",
"  return (",
"    <div className=\"flex min-h-screen bg-[#060910]\">",
"      {/* Desktop sidebar */}",
"      <aside className=\"hidden lg:block w-64 flex-shrink-0 border-r border-white/5 bg-[#070B12] overflow-y-auto h-screen sticky top-0\">",
"        <SidebarNav />",
"      </aside>",
"",
"      {/* Mobile overlay */}",
"      {mobileOpen && (",
"        <div className=\"fixed inset-0 z-40 lg:hidden\">",
"          <div className=\"absolute inset-0 bg-black/60\" onClick={() => setMobileOpen(false)} />",
"          <aside className=\"relative w-72 h-full bg-[#070B12] border-r border-white/5 overflow-y-auto z-50\">",
"            <div className=\"flex justify-end p-3\">",
"              <button onClick={() => setMobileOpen(false)} className=\"text-gray-400 hover:text-white p-1\">",
"                <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M18 6L6 18M6 6l12 12\" /></svg>",
"              </button>",
"            </div>",
"            <SidebarNav />",
"          </aside>",
"        </div>",
"      )}",
"",
"      {/* Main content */}",
"      <main className=\"flex-1 min-w-0\">",
"        {/* Mobile header bar */}",
"        <div className=\"lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#070B12] sticky top-0 z-30\">",
"          <button onClick={() => setMobileOpen(true)} className=\"text-gray-400 hover:text-white p-1\">",
"            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M3 12h18M3 6h18M3 18h18\" /></svg>",
"          </button>",
"          <span className=\"text-sm font-semibold text-white\">WoulfAI</span>",
"        </div>",
"        {children}",
"      </main>",
"    </div>",
"  );",
"}",
].join('\n'));

// ── STEP 4: Simplify sales/solo redirect ──
console.log('');
console.log('  [4/4] Simplify /agents/sales/solo redirect');
console.log('');

write(AP + 'app/agents/sales/solo/page.tsx', [
"'use client';",
"import { useEffect } from 'react';",
"import { useRouter } from 'next/navigation';",
"",
"export default function SoloRedirect() {",
"  const router = useRouter();",
"  useEffect(() => { router.replace('/agents/sales'); }, [router]);",
"  return <div className=\"flex items-center justify-center min-h-screen bg-[#060910]\"><p className=\"text-sm text-gray-500\">Redirecting...</p></div>;",
"}",
].join('\n'));

// DONE
console.log('');
console.log('  ======================================================');
console.log('  Removed ' + removed + ' items | Created ' + created + ' files');
console.log('  ======================================================');
console.log('');
console.log('  What changed:');
console.log('    1. Removed 7 old hardcoded demo pages');
console.log('       (/demo/customer-support, finance-ops, marketing,');
console.log('        research-intel, sales-field, training, wms-proof-billing)');
console.log('       Dynamic /demo/[slug] now handles all 14 agents.');
console.log('');
console.log('    2. Removed /agents/sales/intel (orphaned)');
console.log('       Sales Agent at /agents/sales has all 6 tabs now.');
console.log('');
console.log('    3. PlatformShell now mobile-responsive:');
console.log('       - Sidebar hidden on mobile, hamburger menu in top bar');
console.log('       - Slide-out drawer with overlay on tap');
console.log('       - X to close');
console.log('');
console.log('    4. /agents/sales/solo simplified redirect');
console.log('');
console.log('  All originals backed up to .backups/batch4/');
console.log('');
console.log('  Next: npm run build && vercel --prod');
console.log('');
