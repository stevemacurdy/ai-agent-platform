#!/bin/bash
# ============================================================
# WoulfAI P3: Demo Pages Dark → Light + Agent → Employee
# 
# Run from repo root:
#   bash scripts/transform-demos.sh
#
# Design System:
#   Navy:   #1B2A4A (primary brand, nav bg, headings)
#   Teal:   #2A9D8F (accents, focus rings, active states)
#   Orange: #F5920B (CTAs)
#   Light:  #F4F5F7 (page background)
#   White:  #FFFFFF (cards)
#   Border: #E5E7EB
#   Text:   #6B7280 (secondary), #9CA3AF (muted)
# ============================================================
set -e

DEMO_DIR="app/demo"
FILES=(
  "$DEMO_DIR/wms-proof-billing/page.tsx"
  "$DEMO_DIR/sales-field/page.tsx"
  "$DEMO_DIR/finance-ops/page.tsx"
  "$DEMO_DIR/marketing/page.tsx"
  "$DEMO_DIR/customer-support/page.tsx"
  "$DEMO_DIR/research-intel/page.tsx"
  "$DEMO_DIR/training/page.tsx"
)

echo ""
echo "🎨 WoulfAI P3: Demo Theme Transform"
echo "════════════════════════════════════"
echo ""

for FILE in "${FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "⚠️  Skip (not found): $FILE"
    continue
  fi
  echo "🔄 $FILE"

  # ── BACKGROUNDS ──
  sed -i 's/bg-\[#0a0a0f\] text-white/bg-[#F4F5F7] text-[#1B2A4A]/g' "$FILE"
  sed -i 's/bg-\[#0a0a0f\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i "s|bg-\[#F4F5F7\]/90 backdrop-blur-xl|bg-[rgba(27,42,74,0.97)] backdrop-blur-xl text-white|g" "$FILE"
  sed -i 's/bg-\[#111118\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#1a1a24\]/bg-white/g' "$FILE"
  sed -i 's/bg-black\/80/bg-[#1B2A4A]\/40/g' "$FILE"
  sed -i 's/bg-black\/50/bg-[#1B2A4A]\/30/g' "$FILE"
  sed -i 's/bg-white\/\[0\.02\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-white\/10/bg-gray-100/g' "$FILE"
  sed -i 's/bg-white\/20/bg-gray-200/g' "$FILE"

  # ── BORDERS ──
  sed -i 's/border-white\/5/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/10/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/20/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/30/border-[#E5E7EB]/g' "$FILE"

  # ── TEXT COLORS ──
  sed -i 's/text-gray-400/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-gray-500/text-[#9CA3AF]/g' "$FILE"
  sed -i 's/text-gray-300/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-gray-600/text-[#4B5563]/g' "$FILE"

  # ── TAB ACTIVE STATES → navy text + teal border ──
  sed -i "s/'text-white border-blue-500'/'text-[#1B2A4A] border-[#2A9D8F] font-semibold'/g" "$FILE"
  sed -i "s/'text-white border-emerald-500'/'text-[#1B2A4A] border-[#2A9D8F] font-semibold'/g" "$FILE"
  sed -i "s/'text-white border-amber-500'/'text-[#1B2A4A] border-[#2A9D8F] font-semibold'/g" "$FILE"
  sed -i "s/'text-white border-violet-500'/'text-[#1B2A4A] border-[#2A9D8F] font-semibold'/g" "$FILE"
  sed -i "s/'text-white border-pink-500'/'text-[#1B2A4A] border-[#2A9D8F] font-semibold'/g" "$FILE"
  sed -i "s/'text-white border-indigo-500'/'text-[#1B2A4A] border-[#2A9D8F] font-semibold'/g" "$FILE"
  sed -i "s/'text-white border-orange-500'/'text-[#1B2A4A] border-[#2A9D8F] font-semibold'/g" "$FILE"
  
  # Pill-style active tabs
  sed -i "s/'bg-indigo-600 text-white'/'bg-[#1B2A4A] text-white'/g" "$FILE"
  sed -i "s/'bg-orange-600 text-white'/'bg-[#1B2A4A] text-white'/g" "$FILE"

  # ── HOVER & FOCUS ──
  sed -i 's/hover:bg-white\/10/hover:bg-gray-100/g' "$FILE"
  sed -i 's/hover:bg-white\/20/hover:bg-gray-200/g' "$FILE"
  sed -i 's/hover:bg-white\/5/hover:bg-gray-50/g' "$FILE"
  sed -i 's/hover:text-white/hover:text-[#1B2A4A]/g' "$FILE"
  sed -i 's/focus:border-blue-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-pink-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-emerald-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-violet-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-indigo-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-orange-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-amber-500/focus:border-[#2A9D8F]/g' "$FILE"

  # ── HOVER BORDER ACCENTS → teal ──
  sed -i 's/hover:border-blue-500\/30/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-blue-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-emerald-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-purple-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-orange-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-violet-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-pink-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-amber-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"
  sed -i 's/hover:border-indigo-500\/50/hover:border-[#2A9D8F]\/40/g' "$FILE"

  # ── "View All →" LINKS → teal ──
  sed -i 's/text-blue-400 hover:text-blue-300/text-[#2A9D8F] hover:text-[#238577]/g' "$FILE"
  sed -i 's/text-emerald-400 hover:text-emerald-300/text-[#2A9D8F] hover:text-[#238577]/g' "$FILE"
  sed -i 's/text-amber-400 hover:text-amber-300/text-[#2A9D8F] hover:text-[#238577]/g' "$FILE"
  sed -i 's/text-violet-400 hover:text-violet-300/text-[#2A9D8F] hover:text-[#238577]/g' "$FILE"
  sed -i 's/text-pink-400 hover:text-pink-300/text-[#2A9D8F] hover:text-[#238577]/g' "$FILE"
  sed -i 's/text-orange-400 hover:text-orange-300/text-[#2A9D8F] hover:text-[#238577]/g' "$FILE"
  sed -i 's/text-indigo-400 hover:text-indigo-300/text-[#2A9D8F] hover:text-[#238577]/g' "$FILE"

  # ── SHADOWS ──
  sed -i 's/hover:shadow-blue-500\/5/hover:shadow-[rgba(27,42,74,0.08)]/g' "$FILE"
  sed -i 's/hover:shadow-lg/hover:shadow-md/g' "$FILE"

  # ── PRIMARY CTA BUTTONS → orange ──
  sed -i 's/bg-white text-black/bg-[#F5920B] text-white/g' "$FILE"
  sed -i 's/hover:bg-gray-100/hover:bg-[#e0850a]/g' "$FILE"

  # ── EMPLOYEE LANGUAGE ──
  sed -i 's/WMS Agent/WMS Employee/g' "$FILE"
  sed -i 's/Sales Agent/Sales Employee/g' "$FILE"
  sed -i 's/CFO Agent/CFO Employee/g' "$FILE"
  sed -i 's/Marketing Agent/Marketing Employee/g' "$FILE"
  sed -i 's/Support Agent/Support Employee/g' "$FILE"
  sed -i 's/Research Agent/Research Employee/g' "$FILE"
  sed -i 's/Training Agent/Training Employee/g' "$FILE"
  sed -i 's/AI Agent Status/AI Employee Status/g' "$FILE"
  sed -i 's/AI Agent<\/div>/AI Employee<\/div>/g' "$FILE"
  sed -i "s/AI Agent'/AI Employee'/g" "$FILE"
  sed -i 's/AI-Powered Sales Assistant/AI-Powered Sales Employee/g' "$FILE"
  sed -i 's/live agents/live AI Employees/g' "$FILE"
  sed -i 's/AI agents/AI Employees/g' "$FILE"
  sed -i 's/AI agent/AI Employee/g' "$FILE"

  echo "   ✅ done"
done

echo ""
echo "════════════════════════════════════"
echo "✅ Transform complete!"
echo ""
echo "Run: npm run build"
echo ""
echo "⚠️  Quick manual fixes (search in VS Code):"
echo ""
echo "  1. NAV DESCRIPTION TEXT"
echo "     Inside bg-[rgba(27,42,74,0.97)] nav bars,"
echo "     change: text-[#6B7280] → text-white/60"
echo "     (about 7 instances, one per page)"
echo ""
echo "  2. NOTIFICATION TOAST TEXT"  
echo "     bg-emerald-500 toasts should keep text-white"
echo "     (these are fine — emerald bg + white text survived)"
echo ""
echo "  3. GRADIENT BUTTON TEXT"
echo "     gradient-to-r buttons should keep text-white"
echo "     (these survived — only standalone text-white in"
echo "     className roots was changed)"
echo ""
echo "After fixes + build:"
echo "  git add app/demo/"
echo "  git commit -m 'P3: Demo pages - light theme + Employee language'"
echo "  vercel --prod"
