const fs = require('fs');
const path = require('path');

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════╗');
console.log('  ║  WoulfAI Phase 4: Auth + Branding + Billing + CRM Sync  ║');
console.log('  ║  Supabase Auth, Org White-Label, Stripe, Multi-CRM      ║');
console.log('  ╚══════════════════════════════════════════════════════════╝');
console.log('');

const BASE = path.join(__dirname, 'phase4-files');
let installed = 0;
let patched = 0;

function install(src, dest) {
  try {
    const srcPath = path.join(BASE, src);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(srcPath, dest);
    const lines = fs.readFileSync(dest, 'utf8').split('\n').length;
    console.log('  + ' + dest + ' (' + lines + ' lines)');
    installed++;
  } catch(e) {
    console.log('  ! ' + src + ': ' + e.message);
  }
}

// ====== LIBRARY ======
console.log('Libraries:');
install('lib/supabase.ts', 'lib/supabase.ts');
console.log('');

// ====== COMPONENTS ======
console.log('Providers:');
install('components/AuthProvider.tsx', 'components/AuthProvider.tsx');
install('components/BrandingProvider.tsx', 'components/BrandingProvider.tsx');
console.log('');

// ====== API ROUTES ======
console.log('API Routes:');
install('app/api/auth/route.ts', 'app/api/auth/route.ts');
install('app/api/branding/route.ts', 'app/api/branding/route.ts');
install('app/api/billing/route.ts', 'app/api/billing/route.ts');
install('app/api/crm-sync/route.ts', 'app/api/crm-sync/route.ts');
console.log('');

// ====== UI PAGES ======
console.log('Pages:');
install('app/login/page.tsx', 'app/login/page.tsx');
install('app/admin/integrations/page.tsx', 'app/admin/integrations/page.tsx');
console.log('');

// ====== SIDEBAR PATCH ======
console.log('Sidebar:');
try {
  let layout = fs.readFileSync('app/admin/layout.tsx', 'utf8');
  let changed = false;

  if (!layout.includes('integrations')) {
    // Find the last nav item and add Integrations after it
    if (layout.includes("'debrief'") || layout.includes("'cfo-tools'") || layout.includes("'cfo-console'")) {
      const targets = ["'debrief'", "'cfo-tools'", "'cfo-console'", "'crm'"];
      for (const target of targets) {
        if (layout.includes(target)) {
          const pattern = new RegExp("(\\{[^}]*id:\\s*" + target + "[^}]*\\}),?");
          if (pattern.test(layout)) {
            layout = layout.replace(pattern, "$1,\n    { id: 'integrations', label: 'CRM Sync', href: '/admin/integrations', icon: '\uD83D\uDD04' },");
            changed = true;
            break;
          }
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync('app/admin/layout.tsx', layout);
    console.log('  ~ app/admin/layout.tsx (CRM Sync added to sidebar)');
    patched++;
  } else if (layout.includes('integrations')) {
    console.log('  o Sidebar already has Integrations');
  } else {
    console.log('  ! Could not auto-patch sidebar. Manually add:');
    console.log("    { id: 'integrations', label: 'CRM Sync', href: '/admin/integrations', icon: '\uD83D\uDD04' }");
  }
} catch(e) {
  console.log('  ! Sidebar: ' + e.message);
}
console.log('');

// ====== ENV TEMPLATE ======
console.log('.env.local check:');
try {
  let env = fs.readFileSync('.env.local', 'utf8');
  let additions = [];

  if (!env.includes('NEXT_PUBLIC_SUPABASE_URL')) additions.push('# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  if (!env.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) additions.push('# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  if (!env.includes('SUPABASE_SERVICE_ROLE_KEY')) additions.push('# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  if (!env.includes('STRIPE_SECRET_KEY')) additions.push('# STRIPE_SECRET_KEY=sk_test_xxxxx');
  if (!env.includes('STRIPE_WEBHOOK_SECRET')) additions.push('# STRIPE_WEBHOOK_SECRET=whsec_xxxxx');
  if (!env.includes('STRIPE_PRICE_STARTER')) additions.push('# STRIPE_PRICE_STARTER=price_xxxxx');
  if (!env.includes('STRIPE_PRICE_PROFESSIONAL')) additions.push('# STRIPE_PRICE_PROFESSIONAL=price_xxxxx');
  if (!env.includes('STRIPE_PRICE_ENTERPRISE')) additions.push('# STRIPE_PRICE_ENTERPRISE=price_xxxxx');

  if (additions.length > 0) {
    env += '\n\n# ====== Phase 4: Auth + Billing (uncomment and fill in) ======\n' + additions.join('\n') + '\n';
    fs.writeFileSync('.env.local', env);
    console.log('  ~ .env.local (' + additions.length + ' placeholder keys added — uncomment and fill in)');
    patched++;
  } else {
    console.log('  o .env.local already has all required keys');
  }
} catch(e) {
  console.log('  ! .env.local: ' + e.message);
}

console.log('');
console.log('  ────────────────────────────────────────');
console.log('  Installed: ' + installed + ' files');
console.log('  Patched:   ' + patched + ' files');
console.log('  ────────────────────────────────────────');
console.log('');
console.log('  New routes:');
console.log('    /login                     Real auth (Supabase or dev fallback)');
console.log('    /admin/integrations        CRM connections, sync, and history');
console.log('    /api/auth                  Signup, signin, profile, admin create');
console.log('    /api/branding              Org branding fetch + update');
console.log('    /api/billing               Stripe checkout, portal, webhooks');
console.log('    /api/crm-sync              Multi-CRM push/pull (HubSpot live)');
console.log('');
console.log('  New components:');
console.log('    AuthProvider.tsx            Session + role context (dev mode compatible)');
console.log('    BrandingProvider.tsx        CSS variable injection from org_branding');
console.log('');
console.log('  To enable Supabase auth:');
console.log('    1. Uncomment SUPABASE keys in .env.local');
console.log('    2. Wrap app/layout.tsx with <AuthProvider>');
console.log('');
console.log('  To enable Stripe billing:');
console.log('    1. npm install stripe');
console.log('    2. Fill in STRIPE keys in .env.local');
console.log('    3. Create products/prices in Stripe Dashboard');
console.log('');
console.log('  Then: npm run dev');
console.log('');
