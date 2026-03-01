#!/bin/bash
# ============================================================
# WoulfAI P4: Agents Pages Dark → Light + Agent → Employee
#
# Run from repo root:
#   bash scripts/transform-agents.sh
#
# Scope:
#   1. app/agents/layout.tsx — light bg override wrapper
#   2. components/agents/warehouse-agent-ui.tsx — shared component (4 pages)
#   3. app/agents/*/page.tsx — all inline agent pages
#   4. app/agents/*/*/page.tsx — nested pages (cfo/*, sales/*)
# ============================================================

echo ""
echo "🎨 WoulfAI P4: Agents Theme Transform"
echo "════════════════════════════════════════"

# ── 1. AGENTS LAYOUT: wrap children in light bg ──────────────
echo ""
echo "📐 Updating agents layout..."

# Replace the layout to wrap children in a light override div
cat > app/agents/layout.tsx << 'LAYOUT'
import PlatformShell from '@/components/layout/PlatformShell';
import CompanyBanner from '@/components/portal/company-banner';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformShell>
      <div className="bg-[#F4F5F7] text-[#1B2A4A] min-h-screen">
        <CompanyBanner />
        {children}
      </div>
    </PlatformShell>
  );
}
LAYOUT
echo "   ✅ agents layout — light bg wrapper added"

# ── 2. SHARED COMPONENT: warehouse-agent-ui.tsx ──────────────
echo ""
echo "🔧 Transforming shared WarehouseAgentUI component..."

FILE="components/agents/warehouse-agent-ui.tsx"
if [ -f "$FILE" ]; then
  # Backgrounds
  sed -i 's/bg-white\/\[0\.02\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/10/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/5/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/10/bg-gray-100/g' "$FILE"

  # Borders
  sed -i 's/border-white\/10/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/5/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/30/border-[#E5E7EB]/g' "$FILE"

  # Text colors (order matters — most specific first)
  sed -i 's/text-white\/90/text-[#1B2A4A]/g' "$FILE"
  sed -i 's/text-white\/80/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/70/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/60/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/50/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/40/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/30/text-[#9CA3AF]/g' "$FILE"

  # Standalone text-white (headers, button text — but NOT inside gradient divs)
  # Only change text-white that appears as a className value, not inside gradient bg
  sed -i 's/font-bold text-white/font-bold text-[#1B2A4A]/g' "$FILE"
  sed -i 's/font-semibold text-white/font-semibold text-[#1B2A4A]/g' "$FILE"
  sed -i 's/font-mono text-white/font-mono text-[#1B2A4A]/g' "$FILE"

  # Hover states
  sed -i 's/hover:text-white/hover:text-[#1B2A4A]/g' "$FILE"
  sed -i 's/hover:bg-white\/10/hover:bg-gray-100/g' "$FILE"
  sed -i 's/hover:bg-white\/5/hover:bg-gray-50/g' "$FILE"

  # Placeholder
  sed -i 's/placeholder-white\/30/placeholder-[#9CA3AF]/g' "$FILE"

  # Focus
  sed -i 's/focus:border-blue-500/focus:border-[#2A9D8F]/g' "$FILE"

  # Chat bubbles — user messages
  sed -i 's/bg-blue-600\/30 border border-blue-500\/30 text-white/bg-[#1B2A4A]\/10 border border-[#1B2A4A]\/20 text-[#1B2A4A]/g' "$FILE"

  # Send button — keep blue-600 but ensure it works on light
  # (blue-600 button with text-white is fine on light bg)

  # Color map: keep semantic colors but adjust for light bg
  sed -i "s/text-blue-400/text-blue-600/g" "$FILE"
  sed -i "s/text-green-400/text-green-600/g" "$FILE"
  sed -i "s/text-emerald-400/text-emerald-600/g" "$FILE"
  sed -i "s/text-amber-400/text-amber-600/g" "$FILE"
  sed -i "s/text-purple-400/text-purple-600/g" "$FILE"
  sed -i "s/text-cyan-400/text-cyan-600/g" "$FILE"
  sed -i "s/text-red-400/text-red-600/g" "$FILE"
  sed -i "s/text-pink-400/text-pink-600/g" "$FILE"

  # Thinking dots — adjust for visibility on light
  sed -i 's/bg-blue-400 animate-bounce/bg-[#2A9D8F] animate-bounce/g' "$FILE"

  echo "   ✅ $FILE"
else
  echo "   ⚠️  Not found: $FILE"
fi

# ── 3. CALLER PROPS: Agent → Employee in WarehouseAgentUI pages ──
echo ""
echo "📝 Fixing Agent → Employee in component callers..."

for f in app/agents/wms/page.tsx app/agents/operations/page.tsx app/agents/supply-chain/page.tsx; do
  if [ -f "$f" ]; then
    sed -i 's/title="WMS Agent"/title="WMS Employee"/g' "$f"
    sed -i 's/title="Operations Agent"/title="Operations Employee"/g' "$f"
    sed -i 's/title="Supply Chain Agent"/title="Supply Chain Employee"/g' "$f"
    sed -i 's/WMSAgentPage/WMSEmployeePage/g' "$f"
    sed -i 's/OperationsAgentPage/OperationsEmployeePage/g' "$f"
    sed -i 's/SupplyChainAgentPage/SupplyChainEmployeePage/g' "$f"
    echo "   ✅ $f"
  fi
done

# org-lead doesn't say "Agent" in the title, but fix function name
if [ -f "app/agents/org-lead/page.tsx" ]; then
  sed -i 's/OrgLeadAgentPage/OrgLeadEmployeePage/g' "app/agents/org-lead/page.tsx"
  echo "   ✅ app/agents/org-lead/page.tsx"
fi

# ── 4. ALL INLINE PAGES: Dark → Light + Agent → Employee ────
echo ""
echo "🔄 Transforming inline agent pages..."

# Collect all agent page files
INLINE_FILES=$(find app/agents -name "page.tsx" -not -path "*/layout.tsx")

for FILE in $INLINE_FILES; do
  if [ ! -f "$FILE" ]; then continue; fi

  # ── Dark backgrounds → Light ──
  sed -i 's/bg-\[#0A0E15\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#0a0e15\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#060910\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#0a0a0f\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#111118\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#1a1a24\]/bg-white/g' "$FILE"
  sed -i 's/bg-gray-900/bg-white/g' "$FILE"
  sed -i 's/bg-gray-950/bg-[#F4F5F7]/g' "$FILE"

  # ── Card / surface backgrounds ──
  sed -i 's/bg-white\/\[0\.02\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/10/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/5/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/10/bg-gray-100/g' "$FILE"
  sed -i 's/bg-white\/20/bg-gray-200/g' "$FILE"

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

  # ── White text on dark surface → dark text ──
  sed -i 's/text-white\/90/text-[#1B2A4A]/g' "$FILE"
  sed -i 's/text-white\/80/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/70/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/60/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/50/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/40/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/30/text-[#9CA3AF]/g' "$FILE"

  # ── Hover states ──
  sed -i 's/hover:bg-white\/10/hover:bg-gray-100/g' "$FILE"
  sed -i 's/hover:bg-white\/5/hover:bg-gray-50/g' "$FILE"
  sed -i 's/hover:bg-white\/20/hover:bg-gray-200/g' "$FILE"
  sed -i 's/hover:text-white/hover:text-[#1B2A4A]/g' "$FILE"

  # ── Active tab pill: blue-600 → navy ──
  sed -i 's/bg-blue-600 text-white/bg-[#1B2A4A] text-white/g' "$FILE"

  # ── Focus states ──
  sed -i 's/focus:border-blue-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:ring-blue-500/focus:ring-[#2A9D8F]/g' "$FILE"

  # ── Colored text: 400 → 600 for light bg readability ──
  sed -i 's/text-blue-400/text-blue-600/g' "$FILE"
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

  # ── Badge / status bg colors: lighter for light theme ──
  sed -i 's/bg-green-500\/10/bg-green-50/g' "$FILE"
  sed -i 's/bg-emerald-500\/10/bg-emerald-50/g' "$FILE"
  sed -i 's/bg-blue-500\/10/bg-blue-50/g' "$FILE"
  sed -i 's/bg-red-500\/10/bg-red-50/g' "$FILE"
  sed -i 's/bg-amber-500\/10/bg-amber-50/g' "$FILE"
  sed -i 's/bg-yellow-500\/10/bg-yellow-50/g' "$FILE"
  sed -i 's/bg-purple-500\/10/bg-purple-50/g' "$FILE"

  # ── Dividers ──
  sed -i 's/bg-gray-800/bg-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-gray-800/divide-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/5/divide-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/10/divide-[#E5E7EB]/g' "$FILE"

  # ── Ring colors ──
  sed -i 's/ring-white\/10/ring-[#E5E7EB]/g' "$FILE"
  sed -i 's/ring-white\/5/ring-[#E5E7EB]/g' "$FILE"

  # ── Agent → Employee language ──
  sed -i 's/Compliance Agent/Compliance Employee/g' "$FILE"
  sed -i 's/HR Agent/HR Employee/g' "$FILE"
  sed -i 's/Legal Agent/Legal Employee/g' "$FILE"
  sed -i 's/Marketing Agent/Marketing Employee/g' "$FILE"
  sed -i 's/Operations Agent/Operations Employee/g' "$FILE"
  sed -i 's/Research Agent/Research Employee/g' "$FILE"
  sed -i 's/Sales Agent/Sales Employee/g' "$FILE"
  sed -i 's/SEO Agent/SEO Employee/g' "$FILE"
  sed -i 's/Supply Chain Agent/Supply Chain Employee/g' "$FILE"
  sed -i 's/Support Agent/Support Employee/g' "$FILE"
  sed -i 's/Training Agent/Training Employee/g' "$FILE"
  sed -i 's/WMS Agent/WMS Employee/g' "$FILE"
  sed -i 's/CFO Agent/CFO Employee/g' "$FILE"
  sed -i 's/STR Agent/STR Employee/g' "$FILE"

  # Function names: AgentPage → EmployeePage
  sed -i 's/ComplianceAgentPage/ComplianceEmployeePage/g' "$FILE"
  sed -i 's/HRAgentPage/HREmployeePage/g' "$FILE"
  sed -i 's/LegalAgentPage/LegalEmployeePage/g' "$FILE"
  sed -i 's/MarketingAgentPage/MarketingEmployeePage/g' "$FILE"
  sed -i 's/ResearchAgentPage/ResearchEmployeePage/g' "$FILE"
  sed -i 's/SalesAgentPage/SalesEmployeePage/g' "$FILE"
  sed -i 's/SEOAgentPage/SEOEmployeePage/g' "$FILE"
  sed -i 's/SupportAgentPage/SupportEmployeePage/g' "$FILE"
  sed -i 's/TrainingAgentPage/TrainingEmployeePage/g' "$FILE"
  sed -i 's/CFOAgentPage/CFOEmployeePage/g' "$FILE"
  sed -i 's/STRAgentPage/STREmployeePage/g' "$FILE"

  # Generic: "AI agents" → "AI Employees" in body copy
  sed -i 's/AI agents/AI Employees/g' "$FILE"
  sed -i 's/AI agent/AI Employee/g' "$FILE"
  sed -i 's/14 specialized AI Employees/14 specialized AI Employees/g' "$FILE"

  echo "   ✅ $FILE"
done

echo ""
echo "════════════════════════════════════════"
echo "✅ P4 Transform complete!"
echo ""
echo "Run:"
echo "  npm run build"
echo "  git add app/agents/ components/agents/"
echo "  git commit -m 'P4: Agents pages - light theme + Employee language'"
echo "  vercel --prod"
echo ""
