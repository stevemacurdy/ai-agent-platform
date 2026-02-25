#!/bin/bash
# C11 UI Installer — Run from project root (ai-agent-platform/)
# Usage: bash install-c11.sh

set -e

echo "=== C11: Portal UI Components ==="
echo ""

# Create directories
dirs=(
  "app/api/portal/branding"
  "app/api/portal/feature-requests"
  "app/warehouse"
  "app/warehouse/inventory"
  "app/warehouse/orders/new"
  "app/warehouse/bol"
  "app/warehouse/purchase-orders"
  "app/warehouse/asn"
  "app/warehouse/customers"
  "components/portal"
)

for d in "${dirs[@]}"; do
  mkdir -p "$d"
done

echo "Directories created."

# Extract archive (assumes c11-ui-files.tar.gz is in ~/Downloads/)
ARCHIVE="$HOME/Downloads/c11-ui-files.tar.gz"
if [ -f "$ARCHIVE" ]; then
  tar xzf "$ARCHIVE"
  echo "Files extracted from archive."
else
  echo "ERROR: $ARCHIVE not found."
  echo "Download c11-ui-files.tar.gz to ~/Downloads/ first."
  exit 1
fi

echo ""
echo "=== Files installed ==="
echo ""
echo "WoulfAI Portal Enhancements:"
echo "  app/api/portal/branding/route.ts        — GET/PUT company branding"
echo "  app/api/portal/feature-requests/route.ts — CRUD feature requests"
echo "  components/portal/branding-settings.tsx  — Admin branding config UI"
echo "  components/portal/feature-request-widget.tsx — Feature request widget"
echo ""
echo "Warehouse 3PL Portal (7 pages):"
echo "  app/warehouse/layout.tsx                 — Sidebar navigation"
echo "  app/warehouse/page.tsx                   — Dashboard"
echo "  app/warehouse/inventory/page.tsx         — Inventory with search/filters"
echo "  app/warehouse/orders/page.tsx            — Orders list"
echo "  app/warehouse/orders/new/page.tsx        — New order form + BOL auto-gen"
echo "  app/warehouse/bol/page.tsx               — Bills of Lading"
echo "  app/warehouse/purchase-orders/page.tsx   — Purchase Orders"
echo "  app/warehouse/asn/page.tsx               — ASN Documents"
echo "  app/warehouse/customers/page.tsx         — Customer management"
echo ""
echo "=== Next: build and deploy ==="
echo "npm run build && git add -A && git commit -m 'C11: portal UI — branding, features, warehouse portal' && vercel --prod && git push"
