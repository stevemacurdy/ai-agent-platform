# WoulfAI Agent Build Prompts — Master Index (Updated)

## Current Agent Roster: 22 Agents (21 Active + 1 Set Aside)

### How to Use

1. **Every session:** Paste `woulfai-context-primer.md` FIRST
2. **One-time:** Run `00-remove-str-from-demos.md` to deactivate STR
3. **Then paste** individual agent build prompts (1-3 per session depending on complexity)

---

## All Agents

| # | File | Agent | Dept | Status | Notes |
|---|------|-------|------|--------|-------|
| — | 00-remove-str-from-demos.md | STR Removal | — | Run First | Comment out STR, don't delete |
| 01 | 01-build-collections.md | Collections | Finance | Full Build | Migration 025a |
| 02 | 02-build-finops.md | FinOps | Finance | Full Build | Migration 025b |
| 03 | 03-build-payables.md | Payables | Finance | Full Build | Migration 025c |
| 04 | 04-build-sales-intel.md | Sales Intel | Sales | Full Build | Migration 026a |
| 05 | 05-build-sales-coach.md | Sales Coach | Sales | Full Build | Migration 026b |
| 06 | 06-build-marketing.md | Marketing | Sales | Full Build | Migration 026c |
| 07 | 07-build-seo.md | SEO | Sales | Full Build | Migration 027a |
| 08 | 08-build-operations.md | Operations | Operations | Full Build | Migration 027b |
| 09 | 09-build-supply-chain.md | Supply Chain | Operations | Full Build | Migration 027c |
| 10 | 10-build-wms.md | WMS | Operations | Upgrade | Console only, no new table |
| 11 | 11-build-hr.md | HR | People | Full Build | Migration 028a |
| 12 | 12-build-support.md | Support | People | Full Build | Migration 028b |
| 13 | 13-build-training.md | Training | People | Full Build | Migration 029a |
| 14 | 14-build-legal.md | Legal | Legal | Full Build | Migration 029b |
| 15 | 15-build-compliance.md | Compliance | Legal | Full Build | Migration 029c |
| 16 | 16-build-research.md | Research | Strategy | Full Build | Migration 030a |
| 17 | 17-build-org-lead.md | Org Lead | Strategy | Full Build | Migration 030b |
| 18 | 18-build-3pl-portal.md | 3PL Customer Portal | Operations | Full Build (Large) | Migration 030, 25 files, own session |
| 19 | 19-build-cfo.md | CFO | Finance | Verify/Enhance | Has Odoo integration — preserve |
| 20 | 20-build-sales.md | Sales Data | Sales | Verify/Enhance | Has HubSpot integration — preserve |
| 21 | 21-build-warehouse.md | Warehouse | Operations | Verify/Enhance | Has WMS tools — preserve |
| 22 | 22-build-video-editor.md | Video Editor | Operations | Verify/Enhance | 3 modes: Quote Clips, Power Clips, Cleanup. Fix demo zeros. |
| — | ~~18-build-str.md~~ | ~~STR Analyst~~ | ~~Strategy~~ | **Set Aside** | Files preserved, removed from UI |
| — | ~~22-build-videdit.md~~ | ~~Videdit~~ | — | **Dead** | Replaced by video-editor. Delete old prompt. |

---

## Agent Count by Department

| Department | Active Agents |
|------------|---------------|
| Finance | CFO, Collections, FinOps, Payables (4) |
| Sales | Sales Data, Sales Intel, Sales Coach, Marketing, SEO (5) |
| Operations | Warehouse, Supply Chain, WMS, Operations, 3PL Customer Portal, Video Editor (6) |
| People | HR, Support, Training (3) |
| Legal | Legal, Compliance (2) |
| Strategy | Research, Org Lead (2) |
| **Total** | **22 active** |

---

## Recommended Build Order

| Batch | Session | Agents | Complexity |
|-------|---------|--------|------------|
| 0 | Setup | Remove STR from demos | 10 min |
| 1 | Finance | Collections, FinOps, Payables | 3 agents, standard |
| 2 | Sales | Sales Intel, Sales Coach, Marketing | 3 agents, standard |
| 3 | Digital | SEO, Operations, Supply Chain | 3 agents, standard |
| 4 | Warehouse+ | WMS (upgrade), HR, Support | 3 agents, standard |
| 5 | Legal | Training, Legal, Compliance | 3 agents, standard |
| 6 | Strategy | Research, Org Lead | 2 agents, standard |
| 7 | 3PL Portal | 3PL Customer Portal | **Own session** — 25 files, largest build |
| 8 | Verify | CFO, Sales Data, Warehouse, Video Editor | 4 enhance/verify, preserve integrations |

---

## After Each Build

1. `node generate-agent-SLUG.js` (from project root)
2. `npm run build` (must pass with zero errors)
3. Copy migration SQL into Supabase SQL Editor and run
4. `git add -A && git commit -m "feat: build SLUG agent console" && git push`
5. Verify on Vercel deployment

## What Each Standard Agent Produces
- 1 Supabase migration (table + indexes + RLS)
- 1 API route (GET with tier enforcement + POST with AI actions)
- 1 Console page (200-350 lines with charts, tabs, sortable tables, AI modals)

## What the 3PL Portal Produces
- 1 Supabase migration (7 tables + indexes + RLS)
- 8 API routes (dashboard, inventory, orders, billing, chat, notifications, external API)
- 8 portal pages (dashboard, inventory, place order, order history, receiving, billing, support, settings)
- 1 portal layout with navigation
- 6 shared components (nav, chat, cart, payment modal, document upload, photo gallery)
- 2 utility libs (demo data, BOL generator)

## What Video Editor Produces
- Fix demo page KPIs (currently showing zeros)
- Enhanced console with full upload → process → results flow for all 3 modes
- Job history page
- Demo tab content for Quote Clips and Power Clips tabs
- Preserve existing worker/API integrations
