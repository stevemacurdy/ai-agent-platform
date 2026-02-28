#!/bin/bash
# Fix nav subtitle text: text-[#6B7280] → text-white/60
# ONLY inside the bg-[rgba(27,42,74,0.97)] nav blocks
#
# Run from repo root:
#   bash scripts/fix-nav-text.sh

FILES=(
  "app/demo/wms-proof-billing/page.tsx"
  "app/demo/sales-field/page.tsx"
  "app/demo/finance-ops/page.tsx"
  "app/demo/marketing/page.tsx"
  "app/demo/customer-support/page.tsx"
  "app/demo/research-intel/page.tsx"
  "app/demo/training/page.tsx"
)

echo ""
echo "🔧 Fixing nav subtitle text in demo pages"
echo "════════════════════════════════════════════"

for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "   ⚠️  Not found: $f"
    continue
  fi

  # Use python for context-aware replacement:
  # Only change text-[#6B7280] within 15 lines after bg-[rgba(27,42,74,0.97)]
  python3 -c "
import re, sys

with open('$f', 'r', encoding='utf-8') as fh:
    lines = fh.readlines()

nav_line = -100
changed = 0
for i, line in enumerate(lines):
    if 'rgba(27,42,74,0.97)' in line:
        nav_line = i
    # Within 15 lines of nav opening, fix the subtitle color
    if 0 <= (i - nav_line) <= 15 and 'text-[#6B7280]' in line:
        lines[i] = line.replace('text-[#6B7280]', 'text-white/60')
        changed += 1

with open('$f', 'w', encoding='utf-8') as fh:
    fh.writelines(lines)

print(f'   ✅ {\"$f\"} — {changed} fix(es)')
" 2>/dev/null

  # Fallback if python3 not available: use python
  if [ $? -ne 0 ]; then
    python -c "
import re, sys

with open('$f', 'r', encoding='utf-8') as fh:
    lines = fh.readlines()

nav_line = -100
changed = 0
for i, line in enumerate(lines):
    if 'rgba(27,42,74,0.97)' in line:
        nav_line = i
    if 0 <= (i - nav_line) <= 15 and 'text-[#6B7280]' in line:
        lines[i] = line.replace('text-[#6B7280]', 'text-white/60')
        changed += 1

with open('$f', 'w', encoding='utf-8') as fh:
    fh.writelines(lines)

print(f'   ✅ {\"$f\"} — {changed} fix(es)')
"
  fi
done

echo "════════════════════════════════════════════"
echo "✅ Done! Now run:"
echo "   npm run build"
echo "   git add app/demo/"
echo "   git commit -m 'P3: Fix nav subtitle text in demo pages'"
echo "   vercel --prod"
echo ""
