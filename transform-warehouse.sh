#!/bin/bash
# ============================================================
# WoulfAI P7: Warehouse Pages Dark → Light
# Run from repo root: bash scripts/transform-warehouse.sh
# ============================================================

echo ""
echo "🎨 WoulfAI P7: Warehouse Theme Transform"
echo "═════════════════════════════════════════"

# ── 1. WAREHOUSE LAYOUT: dark → light ────────────────────────
echo ""
echo "🏗️  Updating warehouse layout..."

FILE="app/warehouse/layout.tsx"
if [ -f "$FILE" ]; then
  # Main wrapper
  sed -i 's/bg-\[#0a0a0f\]/bg-[#F4F5F7]/g' "$FILE"

  # Sidebar bg
  sed -i 's/bg-\[#0d0d14\]/bg-white/g' "$FILE"

  # Borders
  sed -i 's/border-white\/10/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/5/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-blue-500\/30/border-[#2A9D8F]\/30/g' "$FILE"

  # Text
  sed -i 's/text-white truncate/text-[#1B2A4A] truncate/g' "$FILE"
  sed -i 's/text-white\/40/text-[#9CA3AF]/g' "$FILE"
  sed -i 's/text-white\/60/text-[#6B7280]/g' "$FILE"
  sed -i 's/text-white\/80/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/70/text-[#4B5563]/g' "$FILE"
  sed -i 's/text-white\/20/text-[#9CA3AF]/g' "$FILE"
  sed -i 's/font-semibold text-white/font-semibold text-[#1B2A4A]/g' "$FILE"
  sed -i 's/font-bold text-sm">W/font-bold text-sm text-white">W/g' "$FILE"

  # Active nav state
  sed -i 's/bg-blue-600\/20 text-blue-400/bg-[#2A9D8F]\/10 text-[#2A9D8F] font-medium/g' "$FILE"

  # Inactive nav
  sed -i 's/hover:text-white hover:bg-white\/5/hover:text-[#1B2A4A] hover:bg-gray-100/g' "$FILE"

  # Footer link
  sed -i 's/hover:text-white\/70 hover:bg-white\/5/hover:text-[#4B5563] hover:bg-gray-100/g' "$FILE"

  echo "   ✅ $FILE"
else
  echo "   ⚠️  Not found: $FILE"
fi

# ── 2. ALL WAREHOUSE PAGES ───────────────────────────────────
echo ""
echo "🔄 Transforming warehouse pages..."

FILES=$(find app/warehouse -name "page.tsx")

for FILE in $FILES; do
  if [ ! -f "$FILE" ]; then continue; fi

  # ── Dark backgrounds → Light ──
  sed -i 's/bg-\[#0A0E15\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#0a0e15\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#0a0a0f\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#060910\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#060912\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#0d0d14\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#111118\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#1a1a24\]/bg-white/g' "$FILE"
  sed -i 's/bg-gray-900/bg-white/g' "$FILE"
  sed -i 's/bg-gray-950/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-gray-800/bg-gray-100/g' "$FILE"

  # ── Cards / surfaces ──
  sed -i 's/bg-white\/\[0\.02\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/\[0\.03\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/\[0\.05\]/bg-white shadow-sm/g' "$FILE"
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

  # ── Badge backgrounds ──
  sed -i 's/bg-green-500\/10/bg-green-50/g' "$FILE"
  sed -i 's/bg-green-500\/20/bg-green-100/g' "$FILE"
  sed -i 's/bg-emerald-500\/10/bg-emerald-50/g' "$FILE"
  sed -i 's/bg-emerald-500\/20/bg-emerald-100/g' "$FILE"
  sed -i 's/bg-blue-500\/10/bg-blue-50/g' "$FILE"
  sed -i 's/bg-blue-500\/20/bg-blue-100/g' "$FILE"
  sed -i 's/bg-blue-600\/20/bg-blue-50/g' "$FILE"
  sed -i 's/bg-red-500\/10/bg-red-50/g' "$FILE"
  sed -i 's/bg-red-500\/20/bg-red-100/g' "$FILE"
  sed -i 's/bg-amber-500\/10/bg-amber-50/g' "$FILE"
  sed -i 's/bg-yellow-500\/10/bg-yellow-50/g' "$FILE"
  sed -i 's/bg-purple-500\/10/bg-purple-50/g' "$FILE"
  sed -i 's/bg-orange-500\/10/bg-orange-50/g' "$FILE"

  # ── Hover states ──
  sed -i 's/hover:bg-white\/10/hover:bg-gray-100/g' "$FILE"
  sed -i 's/hover:bg-white\/5/hover:bg-gray-50/g' "$FILE"
  sed -i 's/hover:bg-white\/20/hover:bg-gray-200/g' "$FILE"
  sed -i 's/hover:text-white/hover:text-[#1B2A4A]/g' "$FILE"
  sed -i 's/hover:bg-gray-800/hover:bg-gray-100/g' "$FILE"

  # ── Active tab ──
  sed -i 's/bg-blue-600 text-white/bg-[#1B2A4A] text-white/g' "$FILE"
  sed -i 's/bg-blue-500 text-white/bg-[#2A9D8F] text-white/g' "$FILE"
  sed -i 's/bg-blue-600\/20 text-blue-400/bg-[#2A9D8F]\/10 text-[#2A9D8F]/g' "$FILE"

  # ── Focus ──
  sed -i 's/focus:border-blue-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:ring-blue-500/focus:ring-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-blue-400/focus:border-[#2A9D8F]/g' "$FILE"

  # ── Placeholder ──
  sed -i 's/placeholder-gray-500/placeholder-[#9CA3AF]/g' "$FILE"
  sed -i 's/placeholder-gray-600/placeholder-[#9CA3AF]/g' "$FILE"
  sed -i 's/placeholder-white\/30/placeholder-[#9CA3AF]/g' "$FILE"
  sed -i 's/placeholder-white\/40/placeholder-[#9CA3AF]/g' "$FILE"

  # ── Dividers ──
  sed -i 's/divide-gray-800/divide-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/5/divide-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/10/divide-[#E5E7EB]/g' "$FILE"

  # ── Ring ──
  sed -i 's/ring-white\/10/ring-[#E5E7EB]/g' "$FILE"
  sed -i 's/ring-white\/5/ring-[#E5E7EB]/g' "$FILE"

  # ── Spinner ──
  sed -i 's/border-blue-500 border-t-transparent/border-[#2A9D8F] border-t-transparent/g' "$FILE"

  echo "   ✅ $FILE"
done

echo ""
echo "═════════════════════════════════════════"
echo "✅ P7 Transform complete!"
echo ""
echo "Run:"
echo "  npm run build"
echo "  git add app/warehouse/"
echo "  git commit -m 'P7: Warehouse pages - light theme'"
echo "  vercel --prod"
echo ""
