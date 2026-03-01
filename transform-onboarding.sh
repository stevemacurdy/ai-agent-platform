#!/bin/bash
# ============================================================
# WoulfAI P5: Onboarding Pages Dark → Light + Agent → Employee
# Run from repo root: bash scripts/transform-onboarding.sh
# ============================================================

echo ""
echo "🎨 WoulfAI P5: Onboarding Theme Transform"
echo "════════════════════════════════════════════"

# Update layout to set light bg
cat > app/onboarding/layout.tsx << 'LAYOUT'
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#F4F5F7] text-[#1B2A4A] min-h-screen">{children}</div>;
}
LAYOUT
echo "   ✅ onboarding layout — light bg wrapper"

FILES=$(find app/onboarding -name "page.tsx")

for FILE in $FILES; do
  if [ ! -f "$FILE" ]; then continue; fi

  # ── Page backgrounds ──
  sed -i 's/bg-\[#060912\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#06080D\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#060910\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#0a0a0f\]/bg-[#F4F5F7]/g' "$FILE"
  sed -i 's/bg-\[#0A0E15\]/bg-white/g' "$FILE"
  sed -i 's/bg-\[#111118\]/bg-white/g' "$FILE"
  sed -i 's/bg-gray-900/bg-white/g' "$FILE"
  sed -i 's/bg-gray-950/bg-[#F4F5F7]/g' "$FILE"

  # ── Cards / surfaces ──
  sed -i 's/bg-white\/\[0\.02\]/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/10/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5 border border-white\/5/bg-white border border-[#E5E7EB] shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/5/bg-white shadow-sm/g' "$FILE"
  sed -i 's/bg-white\/10/bg-gray-100/g' "$FILE"
  sed -i 's/bg-white\/20/bg-gray-200/g' "$FILE"

  # ── Badge backgrounds ──
  sed -i 's/bg-blue-500\/10/bg-blue-50/g' "$FILE"
  sed -i 's/bg-blue-500\/20/bg-blue-100/g' "$FILE"
  sed -i 's/bg-green-500\/10/bg-green-50/g' "$FILE"
  sed -i 's/bg-emerald-500\/10/bg-emerald-50/g' "$FILE"
  sed -i 's/bg-emerald-500\/20/bg-emerald-100/g' "$FILE"
  sed -i 's/bg-purple-500\/10/bg-purple-50/g' "$FILE"
  sed -i 's/bg-amber-500\/10/bg-amber-50/g' "$FILE"

  # ── Borders ──
  sed -i 's/border-white\/5/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/10/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/20/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-white\/30/border-[#E5E7EB]/g' "$FILE"
  sed -i 's/border-blue-500\/20/border-blue-200/g' "$FILE"
  sed -i 's/border-blue-500\/30/border-blue-300/g' "$FILE"
  sed -i 's/border-emerald-500\/20/border-emerald-200/g' "$FILE"
  sed -i 's/border-emerald-500\/30/border-emerald-300/g' "$FILE"
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

  # Standalone text-white → navy (but NOT inside buttons/gradients)
  # Target specific patterns
  sed -i 's/text-sm font-semibold text-white/text-sm font-semibold text-[#1B2A4A]/g' "$FILE"
  sed -i 's/text-sm text-white/text-sm text-[#1B2A4A]/g' "$FILE"
  sed -i 's/font-bold text-white/font-bold text-[#1B2A4A]/g' "$FILE"
  sed -i 's/font-mono text-white/font-mono text-[#1B2A4A]/g' "$FILE"

  # ── Colored text: 400 → 600 ──
  sed -i 's/text-blue-400/text-blue-600/g' "$FILE"
  sed -i 's/text-blue-300/text-blue-600/g' "$FILE"
  sed -i 's/text-green-400/text-green-600/g' "$FILE"
  sed -i 's/text-emerald-400/text-emerald-600/g' "$FILE"
  sed -i 's/text-emerald-300/text-emerald-600/g' "$FILE"
  sed -i 's/text-amber-400/text-amber-600/g' "$FILE"
  sed -i 's/text-purple-400/text-purple-600/g' "$FILE"
  sed -i 's/text-red-400/text-red-600/g' "$FILE"

  # ── Placeholder ──
  sed -i 's/placeholder-gray-500/placeholder-[#9CA3AF]/g' "$FILE"
  sed -i 's/placeholder-white\/30/placeholder-[#9CA3AF]/g' "$FILE"
  sed -i 's/placeholder-gray-600/placeholder-[#9CA3AF]/g' "$FILE"

  # ── Hover states ──
  sed -i 's/hover:bg-white\/10/hover:bg-gray-100/g' "$FILE"
  sed -i 's/hover:bg-white\/5/hover:bg-gray-50/g' "$FILE"
  sed -i 's/hover:bg-white\/20/hover:bg-gray-200/g' "$FILE"
  sed -i 's/hover:text-white/hover:text-[#1B2A4A]/g' "$FILE"
  sed -i 's/hover:text-blue-400/hover:text-blue-600/g' "$FILE"
  sed -i 's/hover:border-white\/20/hover:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/hover:border-white\/30/hover:border-[#2A9D8F]/g' "$FILE"

  # ── Focus ──
  sed -i 's/focus:border-blue-500/focus:border-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:ring-blue-500/focus:ring-[#2A9D8F]/g' "$FILE"
  sed -i 's/focus:border-blue-400/focus:border-[#2A9D8F]/g' "$FILE"

  # ── Active tab pill ──
  sed -i 's/bg-blue-600 text-white/bg-[#1B2A4A] text-white/g' "$FILE"
  sed -i 's/bg-blue-500 text-white/bg-[#2A9D8F] text-white/g' "$FILE"

  # ── Spinner ──
  sed -i 's/border-blue-500 border-t-transparent/border-[#2A9D8F] border-t-transparent/g' "$FILE"

  # ── Ring ──
  sed -i 's/ring-white\/10/ring-[#E5E7EB]/g' "$FILE"

  # ── Dividers ──
  sed -i 's/bg-gray-800/bg-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/5/divide-[#E5E7EB]/g' "$FILE"
  sed -i 's/divide-white\/10/divide-[#E5E7EB]/g' "$FILE"

  # ── Agent → Employee language ──
  sed -i 's/Agent Onboarding/Employee Onboarding/g' "$FILE"
  sed -i 's/Select an agent/Select an AI Employee/g' "$FILE"
  sed -i 's/Search agents/Search employees/g' "$FILE"
  sed -i 's/AI agents/AI Employees/g' "$FILE"
  sed -i 's/AI agent/AI Employee/g' "$FILE"
  sed -i 's/the agent/the employee/g' "$FILE"
  sed -i 's/this agent/this employee/g' "$FILE"

  echo "   ✅ $FILE"
done

echo ""
echo "════════════════════════════════════════════"
echo "✅ P5 Transform complete!"
echo ""
echo "Run:"
echo "  npm run build"
echo "  git add app/onboarding/"
echo "  git commit -m 'P5: Onboarding pages - light theme + Employee language'"
echo "  vercel --prod"
echo ""
