#!/bin/bash
# ============================================================
# WoulfAI P6: Admin + PlatformShell + Sidebar → Light Theme
# Run from repo root: bash scripts/transform-admin.sh
#
# Scope:
#   1. PlatformShell — dark bg → light (fixes admin + agents + billing)
#   2. Sidebar — dark nav → light nav with navy accents
#   3. Admin layout — light bg override (in case needed)
#   4. All admin pages — dark → light + Agent → Employee
#   5. Agents layout — remove redundant light wrapper (PlatformShell is now light)
# ============================================================

echo ""
echo "🎨 WoulfAI P6: Admin + Shell Theme Transform"
echo "══════════════════════════════════════════════"

# ── 1. PLATFORMSHELL: flip to light ──────────────────────────
echo ""
echo "🏗️  Updating PlatformShell..."

cat > components/layout/PlatformShell.tsx << 'SHELL'
'use client';
import SidebarNav from '@/components/dashboard/sidebar-nav';
export default function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-[#1B2A4A]">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
SHELL
echo "   ✅ PlatformShell — light bg"

# ── 2. SIDEBAR: dark → light with navy accents ──────────────
echo ""
echo "🧭 Updating sidebar-nav..."

FILE="components/dashboard/sidebar-nav.tsx"
if [ -f "$FILE" ]; then
  # Active state: blue-600/10 + blue-400 → teal
  sed -i "s/bg-blue-600\/10 text-blue-400/bg-[#2A9D8F]\/10 text-[#2A9D8F] font-medium/g" "$FILE"

  # Inactive text
  sed -i 's/text-gray-400 hover:bg-white\/5 hover:text-white/text-[#6B7280] hover:bg-gray-100 hover:text-[#1B2A4A]/g' "$FILE"
  sed -i "s/text-gray-400 hover:bg-white\/5/text-[#6B7280] hover:bg-gray-100/g" "$FILE"

  # Logo text
  sed -i 's/text-sm font-bold text-white/text-sm font-bold text-[#1B2A4A]/g' "$FILE"

  # Live badge
  sed -i 's/bg-blue-500\/10 text-blue-400/bg-[#2A9D8F]\/10 text-[#2A9D8F]/g' "$FILE"

  # Section headers
  sed -i 's/text-\[9px\] text-gray-600 uppercase/text-[9px] text-[#9CA3AF] uppercase/g' "$FILE"

  # User info footer
  sed -i 's/border-white\/5/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/text-\[10px\] text-gray-500/text-[10px] text-[#6B7280]/g' "$FILE"
  sed -i "s/text-\[9px\] text-gray-600 uppercase mt/text-[9px] text-[#9CA3AF] uppercase mt/g" "$FILE"

  # No agents message
  sed -i 's/text-xs text-gray-600 text-center/text-xs text-[#9CA3AF] text-center/g' "$FILE"

  # Agent → Employee in sidebar
  sed -i 's/AI Agents/AI Employees/g' "$FILE"

  echo "   ✅ $FILE"
else
  echo "   ⚠️  Not found: $FILE"
fi

# ── 3. AGENTS LAYOUT: remove redundant light wrapper ────────
echo ""
echo "🧹 Cleaning up agents layout (PlatformShell is now light)..."

cat > app/agents/layout.tsx << 'LAYOUT'
import PlatformShell from '@/components/layout/PlatformShell';
import CompanyBanner from '@/components/portal/company-banner';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PlatformShell><><CompanyBanner />{children}</></PlatformShell>;
}
LAYOUT
echo "   ✅ agents layout — cleaned up"

# ── 4. ADMIN PAGES: dark → light + Agent → Employee ────────
echo ""
echo "🔄 Transforming admin pages..."

FILES=$(find app/admin -name "page.tsx")

for FILE in $FILES; do
  if [ ! -f "$FILE" ]; then continue; fi

  # ── Dark backgrounds → Light ──
  sed -i 's/bg-\[#0A0E15\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#0a0e15\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#060910\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#060912\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#0a0a0f\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#111118\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#1a1a24\]/bg-white/g' "$FILE"
  sed -i 's/bg-gray-900/bg-white/g' "$FILE"
  sed -i 's/bg-gray-950/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-gray-800/bg-gray-100/g' "$FILE"

  # ── Card / surface backgrounds ──
  sed -i 's/bg-white\/\[0\.02\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/\[0\.03\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/\[0\.05\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/10/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/5/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/10/bg-gray-100/g' "$FILE"
  sed -i 's/bg-white\/20/bg-gray-200/g' "$FILE"
  sed -i 's/bg-black\/50/bg-[#1B2A4A]\/40/g' "$FILE"
  sed -i 's/bg-black\/80/bg-[#1B2A4A]\/40/g' "$FILE"

  # ── Borders ──
  sed -i 's/border-white\/5/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/10/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/20/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/30/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-gray-800/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-gray-700/border-[#E5E7EB]/g' "$FILE"

  # ── Text colors ──
  sed -i 's/text-gray-100/text-[#1B2A4A]/g' "$FILE"
  sed -i 's/text-gray-200/text-[#1B2A4A]/g' "$FILE"
  sed -i 's/text-gray-300/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-gray-400/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-gray-500/text-[#9CA3AF]/g' "$FILE"
  sed -i 's/text-gray-600/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/90/text-[#1B2A4A]/g' "$FILE"
  sed -i 's/text-white\/80/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/70/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/60/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/50/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/40/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/30/text-[#9CA3AF]/g' "$FILE"

  # ── Colored text: 400 → 600 ──
  sed -i 's/text-blue-400/text-blue-600/g' "$FILE"
  sed -i 's/text-blue-300/text-blue-600/g' "$FILE"
  sed -i 's/text-green-400/text-green-600/g' "$FILE"
  sed -i 's/text-emerald-400/text-emerald-600/g' "$FILE"
  sed -i 's/text-amber-400/text-amber-600/g' "$FILE"
  sed -i 's/text-purple-400/text-purple-600/g' "$FILE"
  sed -i 's/text-cyan-400/text-cyan-600/g' "$FILE"
  sed -i 's/text-red-400/text-red-600/g' "$FILE"
  sed -i 's/text-pink-400/text-pink-600/g' "$FILE"
  sed -i 's/text-yellow-400/text-yellow-600/g' "$FILE"
  sed -i 's/text-orange-400/text-orange-600/g' "$FILE"
  sed -i 's/text-indigo-400/text-indigo-600/g' "$FILE"
  sed -i 's/text-teal-400/text-teal-600/g' "$FILE"
  sed -i 's/text-violet-400/text-violet-600/g' "$FILE"

  # ── Badge backgrounds ──
  sed -i 's/bg-green-500\/10/bg-green-50/g' "$FILE"
  sed -i 's/bg-emerald-500\/10/bg-emerald-50/g' "$FILE"
  sed -i 's/bg-blue-500\/10/bg-blue-50/g' "$FILE"
  sed -i 's/bg-blue-500\/20/bg-blue-100/g' "$FILE"
  sed -i 's/bg-red-500\/10/bg-red-50/g' "$FILE"
  sed -i 's/bg-amber-500\/10/bg-amber-50/g' "$FILE"
  sed -i 's/bg-yellow-500\/10/bg-yellow-50/g' "$FILE"
  sed -i 's/bg-purple-500\/10/bg-purple-50/g' "$FILE"
  sed -i 's/bg-emerald-500\/20/bg-emerald-100/g' "$FILE"

  # ── Hover states ──
  sed -i 's/hover:bg-white\/10/hover:bg-gray-100/g' "$FILE"
  sed -i 's/hover:bg-white\/5/hover:bg-gray-50/g' "$FILE"
  sed -i 's/hover:bg-white\/20/hover:bg-gray-200/g' "$FILE"
  sed -i 's/hover:text-white/hover:text-[#1B2A4A]/g' "$FILE"
  sed -i 's/hover:text-blue-400/hover:text-blue-600/g' "$FILE"
  sed -i 's/hover:border-white\/20/hover:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/hover:border-white\/30/hover:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/hover:bg-gray-800/hover:bg-gray-100/g' "$FILE"

  # ── Active tab pill ──
  sed -i 's/bg-blue-600 text-white/bg-[#1B2A4A] text-white/g' "$FILE"
  sed -i 's/bg-blue-500 text-white/bg-[#2A9D8F] text-white/g' "$FILE"

  # ── Focus states ──
  sed -i 's/focus:border-blue-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:ring-blue-500/focus:ring-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-blue-400/focus:border-[#2A9D8F]/g' "$FILE"

  # ── Placeholder ──
  sed -i 's/placeholder-gray-500/placeholder-[#9CA3AF]/g' "$FILE"
  sed -i 's/placeholder-gray-600/placeholder-[#9CA3AF]/g' "$FILE"
  sed -i 's/placeholder-white\/30/placeholder-[#9CA3AF]/g' "$FILE"

  # ── Dividers ──
  sed -i 's/divide-gray-800/divide-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/5/divide-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/10/divide-[#E5E7EB]/g' "$FILE"

  # ── Ring colors ──
  sed -i 's/ring-white\/10/ring-[#E5E7EB]/g' "$FILE"
  sed -i 's/ring-white\/5/ring-[#E5E7EB]/g' "$FILE"

  # ── Spinner ──
  sed -i 's/border-blue-500 border-t-transparent/border-[#2A9D8F] border-t-transparent/g' "$FILE"

  # ── Agent → Employee language ──
  sed -i 's/Agent Creator/Employee Creator/g' "$FILE"
  sed -i 's/Agent Registry/Employee Registry/g' "$FILE"
  sed -i 's/agent creator/employee creator/g' "$FILE"
  sed -i 's/AI Agents/AI Employees/g' "$FILE"
  sed -i 's/AI agents/AI Employees/g' "$FILE"
  sed -i 's/AI agent/AI Employee/g' "$FILE"
  sed -i 's/agents assigned/employees assigned/g' "$FILE"
  sed -i 's/Manage Agents/Manage Employees/g' "$FILE"
  sed -i 's/manage agents/manage employees/g' "$FILE"
  sed -i 's/active agents/active employees/g' "$FILE"
  sed -i 's/Active Agents/Active Employees/g' "$FILE"
  sed -i 's/Live Agents/Live Employees/g' "$FILE"
  sed -i 's/live agents/live employees/g' "$FILE"
  sed -i 's/agent\.name/agent.name/g' "$FILE"
  sed -i 's/agent\.slug/agent.slug/g' "$FILE"

  echo "   ✅ $FILE"
done

echo ""
echo "══════════════════════════════════════════════"
echo "✅ P6 Transform complete!"
echo ""
echo "Run:"
echo "  npm run build"
echo "  git add app/admin/ app/agents/layout.tsx components/"
echo "  git commit -m 'P6: Admin + PlatformShell + Sidebar - light theme + Employee language'"
echo "  vercel --prod"
echo ""
