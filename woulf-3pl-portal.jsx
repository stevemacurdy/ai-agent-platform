import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Package, Truck, FileText, DollarSign, Settings, Menu, X, ChevronRight, ChevronDown, Search, Plus, Upload, Eye, Clock, CheckCircle, AlertCircle, ShoppingCart, Trash2, MapPin, Phone, Mail, Download, Filter, MoreHorizontal, ArrowLeft, ArrowRight, Box, Layers, BarChart3, Link2, ExternalLink, RefreshCw, Check, Info, AlertTriangle, Edit3, Copy, Hash, Calendar, Weight, Boxes, Tag } from "lucide-react";

// ─── MOCK DATA ──────────────────────────────────────────────
const ORG = { id: "a001", name: "Acme Foods Co.", slug: "acme-foods", branding: { primary: "#1a56db", accent: "#f59e0b" } };
const WAREHOUSE = { id: "w001", name: "WOULF Warehouse A", address: { street: "1200 Industrial Pkwy", city: "Salt Lake City", state: "UT", zip: "84104" } };

const MOCK_PALLETS = [
  { id: "p001", sku: "ACM-OAT-5LB", product_name: "Organic Steel Cut Oats 5lb", lot_number: "L2025-0412", qty_each: 240, uom: "bag", weight_total: 1200, status: "available", received_at: "2025-12-10T14:30:00Z" },
  { id: "p002", sku: "ACM-GRN-2LB", product_name: "Quinoa Grain Blend 2lb", lot_number: "L2025-0388", qty_each: 400, uom: "bag", weight_total: 800, status: "available", received_at: "2025-12-08T09:15:00Z" },
  { id: "p003", sku: "ACM-OIL-1GL", product_name: "Avocado Oil 1 Gallon", lot_number: "L2025-0501", qty_each: 48, uom: "jug", weight_total: 384, status: "available", received_at: "2026-01-05T11:00:00Z" },
  { id: "p004", sku: "ACM-HNY-12OZ", product_name: "Raw Wildflower Honey 12oz", lot_number: "L2025-0477", qty_each: 144, uom: "bottle", weight_total: 108, status: "hold", received_at: "2025-12-20T16:45:00Z" },
  { id: "p005", sku: "ACM-OAT-5LB", product_name: "Organic Steel Cut Oats 5lb", lot_number: "L2025-0413", qty_each: 240, uom: "bag", weight_total: 1200, status: "available", received_at: "2025-12-10T14:35:00Z" },
  { id: "p006", sku: "ACM-NUT-1LB", product_name: "Mixed Nut Butter 1lb", lot_number: "L2026-0022", qty_each: 192, uom: "jar", weight_total: 192, status: "available", received_at: "2026-01-15T08:20:00Z" },
  { id: "p007", sku: "ACM-FLAX-3LB", product_name: "Ground Flaxseed 3lb", lot_number: "L2026-0031", qty_each: 160, uom: "bag", weight_total: 480, status: "allocated", received_at: "2026-01-22T13:10:00Z" },
  { id: "p008", sku: "ACM-CHOC-8OZ", product_name: "Dark Cacao Powder 8oz", lot_number: "L2026-0045", qty_each: 288, uom: "can", weight_total: 144, status: "available", received_at: "2026-02-01T10:00:00Z" },
];

const MOCK_ORDERS = [
  { id: "ORD-2026-0041", status: "shipped", destination: { name: "Whole Foods - Denver", city: "Denver, CO" }, lines: 3, created_at: "2026-02-10", submitted_at: "2026-02-10" },
  { id: "ORD-2026-0038", status: "picking", destination: { name: "Sprouts HQ", city: "Phoenix, AZ" }, lines: 2, created_at: "2026-02-12", submitted_at: "2026-02-12" },
  { id: "ORD-2026-0035", status: "delivered", destination: { name: "Natural Grocers #14", city: "Boulder, CO" }, lines: 1, created_at: "2026-01-28", submitted_at: "2026-01-28" },
  { id: "ORD-2026-0029", status: "delivered", destination: { name: "Costco Region 7", city: "Seattle, WA" }, lines: 5, created_at: "2026-01-15", submitted_at: "2026-01-15" },
];

const MOCK_ASNS = [
  { id: "ASN-001", reference: "PO-88412", status: "received", expected: "2026-01-20", docs: 2, created_at: "2026-01-15" },
  { id: "ASN-002", reference: "PO-88590", status: "receiving", expected: "2026-02-14", docs: 1, created_at: "2026-02-10" },
  { id: "ASN-003", reference: "PO-88601", status: "submitted", expected: "2026-02-20", docs: 1, created_at: "2026-02-13" },
];

const MOCK_BILLING_EVENTS = [
  { id: "be1", event_type: "storage", amount: 840.00, description: "Monthly pallet storage (8 pallets × $105)", occurred_at: "2026-02-01" },
  { id: "be2", event_type: "inbound", amount: 125.00, description: "Inbound receiving — ASN PO-88590 (3 pallets)", occurred_at: "2026-02-14" },
  { id: "be3", event_type: "outbound", amount: 95.00, description: "Pick & pack — ORD-2026-0041", occurred_at: "2026-02-10" },
  { id: "be4", event_type: "handling", amount: 45.00, description: "Label application — 48 units ACM-OIL-1GL", occurred_at: "2026-02-08" },
  { id: "be5", event_type: "outbound", amount: 75.00, description: "Pick & pack — ORD-2026-0038", occurred_at: "2026-02-12" },
];

const MOCK_INVOICES = [
  { id: "INV-2026-012", period: "Jan 1–31, 2026", total: 2145.00, status: "paid", created_at: "2026-02-01" },
  { id: "INV-2025-011", period: "Dec 1–31, 2025", total: 1890.00, status: "paid", created_at: "2026-01-01" },
  { id: "INV-2025-010", period: "Nov 1–30, 2025", total: 1720.00, status: "paid", created_at: "2025-12-01" },
];

// ─── HELPERS ────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n);
const cx = (...cls) => cls.filter(Boolean).join(" ");
const uid = () => Math.random().toString(36).slice(2, 9);

const STATUS_COLORS = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  allocated: "bg-blue-50 text-blue-700 border-blue-200",
  picked: "bg-violet-50 text-violet-700 border-violet-200",
  shipped: "bg-sky-50 text-sky-700 border-sky-200",
  hold: "bg-amber-50 text-amber-700 border-amber-200",
  damaged: "bg-red-50 text-red-700 border-red-200",
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  picking: "bg-violet-50 text-violet-700 border-violet-200",
  packed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  receiving: "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  void: "bg-gray-50 text-gray-500 border-gray-200",
};

const Badge = ({ status }) => (
  <span className={cx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize", STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200")}>
    {status}
  </span>
);

const ORDER_FLOW = ["submitted", "picking", "packed", "shipped", "delivered"];

// ─── STYLES ─────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --brand: #1a56db;
  --brand-light: #dbeafe;
  --brand-dark: #1e40af;
  --surface: #ffffff;
  --surface-raised: #f8fafc;
  --border: #e2e8f0;
  --border-focus: #93c5fd;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --sidebar-bg: #0f172a;
  --sidebar-text: #cbd5e1;
  --sidebar-active: rgba(255,255,255,0.08);
  --sidebar-hover: rgba(255,255,255,0.04);
  --radius: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', system-ui, sans-serif; color: var(--text-primary); background: #f1f5f9; }

.portal-layout { display: flex; height: 100vh; overflow: hidden; }

/* Sidebar */
.sidebar {
  width: 260px; min-width: 260px; background: var(--sidebar-bg);
  display: flex; flex-direction: column; overflow-y: auto;
  border-right: 1px solid rgba(255,255,255,0.06);
}
.sidebar-brand {
  padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; gap: 12px;
}
.sidebar-brand-icon {
  width: 36px; height: 36px; border-radius: 8px; background: var(--brand);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: white; font-size: 14px; letter-spacing: -0.5px;
}
.sidebar-brand h1 { color: white; font-size: 15px; font-weight: 600; letter-spacing: -0.2px; }
.sidebar-brand span { color: var(--text-muted); font-size: 11px; display: block; margin-top: 1px; }

.sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
.sidebar-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  border-radius: 6px; color: var(--sidebar-text); font-size: 13.5px;
  font-weight: 450; cursor: pointer; transition: all 0.15s; position: relative;
  text-decoration: none; border: none; background: none; width: 100%; text-align: left;
}
.sidebar-item:hover { background: var(--sidebar-hover); color: #e2e8f0; }
.sidebar-item.active { background: var(--sidebar-active); color: white; font-weight: 550; }
.sidebar-item.active::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 20px; background: var(--brand); border-radius: 0 3px 3px 0;
}
.sidebar-item svg { width: 18px; height: 18px; opacity: 0.65; }
.sidebar-item.active svg { opacity: 1; }
.sidebar-badge {
  margin-left: auto; background: var(--brand); color: white; font-size: 11px;
  font-weight: 600; padding: 1px 7px; border-radius: 10px;
}
.sidebar-section { padding: 20px 12px 6px; font-size: 10.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }

/* Main content */
.main-content { flex: 1; overflow-y: auto; background: #f1f5f9; }
.topbar {
  position: sticky; top: 0; z-index: 20; background: white;
  border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px;
  display: flex; align-items: center; justify-content: space-between;
}
.topbar-title { font-size: 16px; font-weight: 600; letter-spacing: -0.3px; }
.topbar-actions { display: flex; align-items: center; gap: 8px; }
.page-body { padding: 24px 28px 40px; }

/* Cards */
.card {
  background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.card-header {
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.card-header h3 { font-size: 14px; font-weight: 600; }
.card-body { padding: 20px; }

/* Stat cards */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 18px 20px; box-shadow: var(--shadow-sm);
}
.stat-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.stat-value { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; color: var(--text-primary); }
.stat-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* Table */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead { background: var(--surface-raised); }
th { padding: 10px 16px; text-align: left; font-weight: 600; font-size: 11.5px;
  text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary);
  border-bottom: 1px solid var(--border); white-space: nowrap; }
td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
tr:hover td { background: #fafbfd; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
  border-radius: 7px; font-size: 13px; font-weight: 550; cursor: pointer;
  transition: all 0.15s; border: 1px solid transparent; font-family: inherit;
  white-space: nowrap;
}
.btn-primary { background: var(--brand); color: white; border-color: var(--brand-dark); }
.btn-primary:hover { background: var(--brand-dark); }
.btn-secondary { background: white; color: var(--text-primary); border-color: var(--border); }
.btn-secondary:hover { background: var(--surface-raised); border-color: #cbd5e1; }
.btn-ghost { background: transparent; color: var(--text-secondary); }
.btn-ghost:hover { background: var(--surface-raised); color: var(--text-primary); }
.btn-danger { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.btn-danger:hover { background: #fee2e2; }
.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-icon { padding: 6px; }

/* Forms */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 12.5px; font-weight: 550; color: var(--text-secondary); margin-bottom: 5px; }
.form-input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 7px;
  font-size: 13.5px; font-family: inherit; transition: border 0.15s; background: white;
  color: var(--text-primary);
}
.form-input:focus { outline: none; border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
select.form-input { appearance: auto; }
textarea.form-input { resize: vertical; min-height: 80px; }

/* Drawer / Modal */
.drawer-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.35); z-index: 50;
  backdrop-filter: blur(2px); animation: fadeIn 0.15s;
}
.drawer {
  position: fixed; right: 0; top: 0; bottom: 0; width: min(560px, 92vw);
  background: white; z-index: 51; box-shadow: -8px 0 30px rgba(0,0,0,0.12);
  display: flex; flex-direction: column; animation: slideIn 0.2s ease-out;
}
.drawer-header {
  padding: 18px 24px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.drawer-header h2 { font-size: 16px; font-weight: 600; }
.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
.drawer-footer {
  padding: 16px 24px; border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-shrink: 0;
}

/* Modal centered */
.modal {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: min(640px, 92vw); max-height: 85vh; background: white; z-index: 51;
  border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; animation: popIn 0.2s ease-out;
}
.modal-body { flex: 1; overflow-y: auto; padding: 24px; }

/* Timeline */
.timeline { display: flex; align-items: center; gap: 0; padding: 0; margin: 16px 0; }
.timeline-step {
  display: flex; flex-direction: column; align-items: center; flex: 1; position: relative;
}
.timeline-dot {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center; background: white; z-index: 1;
}
.timeline-dot.done { background: var(--brand); border-color: var(--brand); }
.timeline-dot.active { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(26,86,219,0.15); }
.timeline-dot svg { width: 14px; height: 14px; }
.timeline-label { font-size: 10.5px; font-weight: 500; color: var(--text-muted); margin-top: 6px; text-transform: capitalize; }
.timeline-step.done .timeline-label { color: var(--brand); font-weight: 600; }
.timeline-step.active .timeline-label { color: var(--text-primary); font-weight: 600; }
.timeline-line {
  position: absolute; top: 14px; left: 50%; width: 100%; height: 2px;
  background: var(--border); z-index: 0;
}
.timeline-line.done { background: var(--brand); }
.timeline-step:last-child .timeline-line { display: none; }

/* Cart badge */
.cart-fab {
  position: fixed; bottom: 24px; right: 24px; z-index: 40;
  background: var(--brand); color: white; border: none;
  padding: 14px 22px; border-radius: 50px; font-size: 14px; font-weight: 600;
  cursor: pointer; box-shadow: 0 4px 20px rgba(26,86,219,0.35);
  display: flex; align-items: center; gap: 8px; font-family: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
}
.cart-fab:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(26,86,219,0.4); }

/* Upload zone */
.upload-zone {
  border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 32px;
  text-align: center; cursor: pointer; transition: all 0.15s; background: var(--surface-raised);
}
.upload-zone:hover { border-color: var(--brand); background: #f0f7ff; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes popIn { from { transform: translate(-50%, -48%) scale(0.97); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }

/* Responsive */
@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .sidebar { display: none; }
}
@media (max-width: 600px) {
  .stats-row { grid-template-columns: 1fr; }
  .page-body { padding: 16px; }
}

/* Scrollbar */
.main-content::-webkit-scrollbar { width: 6px; }
.main-content::-webkit-scrollbar-track { background: transparent; }
.main-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.drawer-body::-webkit-scrollbar { width: 5px; }
.drawer-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }

/* Tabs */
.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 20px; }
.tab {
  padding: 10px 18px; font-size: 13px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s;
  background: none; border-top: none; border-left: none; border-right: none; font-family: inherit;
}
.tab:hover { color: var(--text-primary); }
.tab.active { color: var(--brand); border-bottom-color: var(--brand); font-weight: 600; }

/* Empty state */
.empty-state {
  text-align: center; padding: 48px 24px; color: var(--text-muted);
}
.empty-state svg { width: 48px; height: 48px; margin: 0 auto 12px; opacity: 0.3; }
.empty-state h4 { font-size: 15px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
.empty-state p { font-size: 13px; }

/* Pick type selector */
.pick-options { display: flex; gap: 8px; margin: 12px 0; }
.pick-option {
  flex: 1; padding: 12px; border: 1.5px solid var(--border); border-radius: var(--radius);
  cursor: pointer; text-align: center; transition: all 0.15s; background: white;
  font-family: inherit;
}
.pick-option:hover { border-color: #93c5fd; }
.pick-option.selected { border-color: var(--brand); background: #f0f7ff; }
.pick-option .pick-icon { font-size: 20px; margin-bottom: 4px; }
.pick-option .pick-label { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.pick-option .pick-desc { font-size: 11px; color: var(--text-muted); }

.integration-card {
  border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px;
  display: flex; align-items: center; gap: 16px; transition: border 0.15s;
}
.integration-card:hover { border-color: #93c5fd; }
`;

// ─── SUB-COMPONENTS ─────────────────────────────────────────
const SearchInput = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative" }}>
    <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }} />
    <input className="form-input" style={{ paddingLeft: 32, maxWidth: 280 }} placeholder={placeholder || "Search…"} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const OrderTimeline = ({ status }) => {
  const idx = ORDER_FLOW.indexOf(status);
  return (
    <div className="timeline">
      {ORDER_FLOW.map((step, i) => (
        <div key={step} className={cx("timeline-step", i < idx && "done", i === idx && "active")}>
          <div className={cx("timeline-dot", i < idx && "done", i === idx && "active")}>
            {i < idx ? <Check style={{ color: "white" }} /> : null}
          </div>
          <span className="timeline-label">{step}</span>
          {i < ORDER_FLOW.length - 1 && <div className={cx("timeline-line", i < idx && "done")} />}
        </div>
      ))}
    </div>
  );
};

const ASNTimeline = ({ status }) => {
  const FLOW = ["submitted", "scheduled", "receiving", "received", "closed"];
  const idx = FLOW.indexOf(status);
  return (
    <div className="timeline">
      {FLOW.map((step, i) => (
        <div key={step} className={cx("timeline-step", i < idx && "done", i === idx && "active")}>
          <div className={cx("timeline-dot", i < idx && "done", i === idx && "active")}>
            {i < idx ? <Check style={{ color: "white" }} /> : null}
          </div>
          <span className="timeline-label">{step}</span>
          {i < FLOW.length - 1 && <div className={cx("timeline-line", i < idx && "done")} />}
        </div>
      ))}
    </div>
  );
};

// ─── PAGE: DASHBOARD ────────────────────────────────────────
const DashboardPage = ({ pallets, orders, cart }) => {
  const available = pallets.filter(p => p.status === "available").length;
  const activeOrders = orders.filter(o => !["delivered", "canceled"].includes(o.status)).length;
  const runningCharges = MOCK_BILLING_EVENTS.reduce((s, e) => s + e.amount, 0);
  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Pallets in Warehouse</div>
          <div className="stat-value">{pallets.length}</div>
          <div className="stat-sub">{available} available</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Orders</div>
          <div className="stat-value">{activeOrders}</div>
          <div className="stat-sub">{orders.length} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Running Charges</div>
          <div className="stat-value">{fmt(runningCharges)}</div>
          <div className="stat-sub">Since last invoice</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending ASNs</div>
          <div className="stat-value">{MOCK_ASNS.filter(a => !["received", "closed"].includes(a.status)).length}</div>
          <div className="stat-sub">{MOCK_ASNS.length} total</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-header"><h3>Recent Orders</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Destination</th><th>Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 4).map(o => (
                  <tr key={o.id}>
                    <td className="mono" style={{ fontWeight: 500 }}>{o.id}</td>
                    <td>{o.destination.name}</td>
                    <td><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Inbound Shipments</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ASN</th><th>Reference</th><th>Status</th></tr></thead>
              <tbody>
                {MOCK_ASNS.map(a => (
                  <tr key={a.id}>
                    <td className="mono" style={{ fontWeight: 500 }}>{a.id}</td>
                    <td className="mono">{a.reference}</td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── PAGE: INVENTORY ────────────────────────────────────────
const InventoryPage = ({ pallets, cart, setCart, setDrawer }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = [...pallets];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => p.sku.toLowerCase().includes(s) || p.product_name.toLowerCase().includes(s) || p.lot_number.toLowerCase().includes(s));
    }
    if (statusFilter !== "all") list = list.filter(p => p.status === statusFilter);
    return list;
  }, [pallets, search, statusFilter]);

  const totalWeight = filtered.reduce((s, p) => s + p.weight_total, 0);
  const totalQty = filtered.reduce((s, p) => s + p.qty_each, 0);

  return (
    <>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Total Pallets</div><div className="stat-value">{filtered.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Units</div><div className="stat-value">{fmtNum(totalQty)}</div></div>
        <div className="stat-card"><div className="stat-label">Total Weight</div><div className="stat-value">{fmtNum(totalWeight)} lb</div></div>
        <div className="stat-card"><div className="stat-label">Unique SKUs</div><div className="stat-value">{new Set(filtered.map(p => p.sku)).size}</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search SKU, product, lot…" />
            <select className="form-input" style={{ width: "auto" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="hold">Hold</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>SKU</th><th>Product</th><th>Lot</th><th>Qty</th><th>UOM</th><th>Weight (lb)</th><th>Status</th><th>Received</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const inCart = cart.some(c => c.palletId === p.id);
                return (
                  <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setDrawer({ type: "pallet", data: p })}>
                    <td className="mono" style={{ fontWeight: 500, color: "var(--brand)" }}>{p.sku}</td>
                    <td>{p.product_name}</td>
                    <td className="mono">{p.lot_number}</td>
                    <td style={{ fontWeight: 600 }}>{fmtNum(p.qty_each)}</td>
                    <td>{p.uom}</td>
                    <td>{fmtNum(p.weight_total)}</td>
                    <td><Badge status={p.status} /></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(p.received_at)}</td>
                    <td>
                      {p.status === "available" && (
                        <button className={cx("btn btn-sm", inCart ? "btn-secondary" : "btn-primary")}
                          onClick={e => { e.stopPropagation(); if (!inCart) setDrawer({ type: "pallet", data: p }); }}>
                          {inCart ? "In Cart" : "Ship"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ─── DRAWER: PALLET DETAIL ──────────────────────────────────
const PalletDrawer = ({ pallet, cart, setCart, onClose }) => {
  const [pickType, setPickType] = useState("full_pallet");
  const [qtyUnits, setQtyUnits] = useState("");
  const [qtyWeight, setQtyWeight] = useState("");

  const addToCart = () => {
    const item = {
      id: uid(),
      palletId: pallet.id,
      sku: pallet.sku,
      product_name: pallet.product_name,
      lot_number: pallet.lot_number,
      uom: pallet.uom,
      pickType,
      qtyUnits: pickType === "units" ? parseInt(qtyUnits) || 0 : pickType === "full_pallet" ? pallet.qty_each : null,
      qtyWeight: pickType === "weight" ? parseFloat(qtyWeight) || 0 : pickType === "full_pallet" ? pallet.weight_total : null,
    };
    setCart(prev => [...prev, item]);
    onClose();
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h2>Pallet Detail</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">
          {/* Pallet photo placeholder */}
          <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius)", padding: 32, textAlign: "center", marginBottom: 20, border: "1px solid var(--border)" }}>
            <Box size={40} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Pallet photo / label scan</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              ["SKU", pallet.sku], ["Product", pallet.product_name],
              ["Lot #", pallet.lot_number], ["Quantity", `${fmtNum(pallet.qty_each)} ${pallet.uom}s`],
              ["Weight", `${fmtNum(pallet.weight_total)} lb`], ["Status", pallet.status],
              ["Received", fmtDate(pallet.received_at)], ["Warehouse", WAREHOUSE.name],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {pallet.status === "available" && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Create Shipment</div>
              <div className="pick-options">
                {[
                  { type: "full_pallet", icon: "📦", label: "Full Pallet", desc: "Ship entire pallet" },
                  { type: "units", icon: "🔢", label: "By Units", desc: `Pick ${pallet.uom}s` },
                  { type: "weight", icon: "⚖️", label: "By Weight", desc: "Pick by lb" },
                ].map(opt => (
                  <button key={opt.type} className={cx("pick-option", pickType === opt.type && "selected")} onClick={() => setPickType(opt.type)}>
                    <div className="pick-icon">{opt.icon}</div>
                    <div className="pick-label">{opt.label}</div>
                    <div className="pick-desc">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {pickType === "units" && (
                <div className="form-group">
                  <label className="form-label">Quantity ({pallet.uom}s) — Max {fmtNum(pallet.qty_each)}</label>
                  <input className="form-input" type="number" min="1" max={pallet.qty_each} value={qtyUnits} onChange={e => setQtyUnits(e.target.value)} placeholder={`Enter # of ${pallet.uom}s`} />
                </div>
              )}
              {pickType === "weight" && (
                <div className="form-group">
                  <label className="form-label">Weight (lb) — Max {fmtNum(pallet.weight_total)}</label>
                  <input className="form-input" type="number" min="0.1" max={pallet.weight_total} step="0.1" value={qtyWeight} onChange={e => setQtyWeight(e.target.value)} placeholder="Enter weight in lbs" />
                </div>
              )}
            </>
          )}
        </div>
        {pallet.status === "available" && (
          <div className="drawer-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={addToCart}>
              <ShoppingCart size={15} /> Add to Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── PAGE: INBOUND ──────────────────────────────────────────
const InboundPage = ({ setDrawer }) => {
  const [showNew, setShowNew] = useState(false);
  const [newRef, setNewRef] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => { setSubmitted(true); setTimeout(() => { setShowNew(false); setSubmitted(false); setNewRef(""); setNewDate(""); setNewNotes(""); }, 1500); };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>Inbound Shipments (ASNs)</h3>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={15} /> New ASN
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ASN ID</th><th>Reference</th><th>Expected</th><th>Documents</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {MOCK_ASNS.map(a => (
                <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => setDrawer({ type: "asn", data: a })}>
                  <td className="mono" style={{ fontWeight: 500 }}>{a.id}</td>
                  <td className="mono">{a.reference}</td>
                  <td>{fmtDate(a.expected)}</td>
                  <td>{a.docs} file{a.docs !== 1 ? "s" : ""}</td>
                  <td><Badge status={a.status} /></td>
                  <td><ChevronRight size={16} style={{ color: "var(--text-muted)" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New ASN Modal */}
      {showNew && (
        <>
          <div className="drawer-overlay" onClick={() => setShowNew(false)} />
          <div className="modal">
            <div className="drawer-header">
              <h2>Submit New ASN</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNew(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {submitted ? (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <CheckCircle size={48} style={{ color: "#16a34a", margin: "0 auto 12px" }} />
                  <div style={{ fontSize: 16, fontWeight: 600 }}>ASN Submitted</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Your inbound shipment has been registered.</div>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Reference / PO Number</label>
                    <input className="form-input" value={newRef} onChange={e => setNewRef(e.target.value)} placeholder="e.g. PO-88610" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Arrival Date</label>
                    <input className="form-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="form-input" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Special handling instructions, dock preferences, etc." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Upload ASN Documents</label>
                    <div className="upload-zone">
                      <Upload size={24} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Drop files here or click to browse</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>PDF, Excel, CSV — up to 25 MB</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {!submitted && (
              <div className="drawer-footer">
                <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={!newRef}>
                  <Truck size={15} /> Submit ASN
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

// ─── DRAWER: ASN DETAIL ─────────────────────────────────────
const ASNDrawer = ({ asn, onClose }) => (
  <>
    <div className="drawer-overlay" onClick={onClose} />
    <div className="drawer">
      <div className="drawer-header">
        <h2>ASN {asn.id}</h2>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="drawer-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[["Reference", asn.reference], ["Expected Arrival", fmtDate(asn.expected)], ["Created", fmtDate(asn.created_at)], ["Status", asn.status]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{k === "Status" ? <Badge status={v} /> : v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Status Timeline</div>
        <ASNTimeline status={asn.status} />
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 24 }}>Documents ({asn.docs})</div>
        <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius)", padding: 16, border: "1px solid var(--border)" }}>
          {[...Array(asn.docs)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < asn.docs - 1 ? "1px solid var(--border)" : "none" }}>
              <FileText size={16} style={{ color: "var(--brand)" }} />
              <span style={{ fontSize: 13, flex: 1 }}>ASN-document-{i + 1}.pdf</span>
              <button className="btn btn-ghost btn-sm"><Download size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

// ─── PAGE: ORDERS ───────────────────────────────────────────
const OrdersPage = ({ orders, setDrawer }) => {
  const [search, setSearch] = useState("");
  const filtered = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.id.toLowerCase().includes(s) || o.destination.name.toLowerCase().includes(s);
  });

  return (
    <div className="card">
      <div className="card-header">
        <SearchInput value={search} onChange={setSearch} placeholder="Search orders…" />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order ID</th><th>Destination</th><th>Items</th><th>Status</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setDrawer({ type: "order", data: o })}>
                <td className="mono" style={{ fontWeight: 500, color: "var(--brand)" }}>{o.id}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{o.destination.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.destination.city}</div>
                </td>
                <td>{o.lines} line{o.lines !== 1 ? "s" : ""}</td>
                <td><Badge status={o.status} /></td>
                <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(o.created_at)}</td>
                <td><ChevronRight size={16} style={{ color: "var(--text-muted)" }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── DRAWER: ORDER DETAIL ───────────────────────────────────
const OrderDrawer = ({ order, onClose }) => (
  <>
    <div className="drawer-overlay" onClick={onClose} />
    <div className="drawer">
      <div className="drawer-header">
        <h2>Order {order.id}</h2>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="drawer-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[["Destination", order.destination.name], ["City", order.destination.city], ["Created", fmtDate(order.created_at)], ["Lines", `${order.lines} items`]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Order Progress</div>
        <OrderTimeline status={order.status} />
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 24 }}>Documents</div>
        <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius)", padding: 16, border: "1px solid var(--border)" }}>
          {["BOL", "Purchase Order"].map((doc, i) => (
            <div key={doc} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i === 0 ? "1px solid var(--border)" : "none" }}>
              <FileText size={16} style={{ color: "var(--brand)" }} />
              <span style={{ fontSize: 13, flex: 1 }}>{order.id}-{doc.replace(/ /g, "-")}.pdf</span>
              <button className="btn btn-ghost btn-sm"><Download size={14} /></button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20 }}>
          <button className="btn btn-secondary" style={{ width: "100%" }}>
            <Upload size={15} /> Upload Additional Document
          </button>
        </div>
      </div>
    </div>
  </>
);

// ─── PAGE: BILLING ──────────────────────────────────────────
const BillingPage = () => {
  const [tab, setTab] = useState("current");
  const running = MOCK_BILLING_EVENTS.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-label">Charges Since Last Invoice</div>
          <div className="stat-value">{fmt(running)}</div>
          <div className="stat-sub">5 events this period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Invoice</div>
          <div className="stat-value">{fmt(2145)}</div>
          <div className="stat-sub">Jan 2026 — Paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding Balance</div>
          <div className="stat-value" style={{ color: "#16a34a" }}>{fmt(0)}</div>
          <div className="stat-sub">All invoices current</div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: "0 20px" }}>
          <div className="tabs">
            <button className={cx("tab", tab === "current" && "active")} onClick={() => setTab("current")}>Current Charges</button>
            <button className={cx("tab", tab === "history" && "active")} onClick={() => setTab("history")}>Invoice History</button>
          </div>
        </div>

        {tab === "current" ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
              <tbody>
                {MOCK_BILLING_EVENTS.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(e.occurred_at)}</td>
                    <td><Badge status={e.event_type} /></td>
                    <td>{e.description}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{fmt(e.amount)}</td>
                  </tr>
                ))}
                <tr style={{ background: "var(--surface-raised)" }}>
                  <td colSpan={3} style={{ fontWeight: 600 }}>Period Total</td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{fmt(running)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Invoice</th><th>Period</th><th>Amount</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {MOCK_INVOICES.map(inv => (
                  <tr key={inv.id}>
                    <td className="mono" style={{ fontWeight: 500, color: "var(--brand)" }}>{inv.id}</td>
                    <td>{inv.period}</td>
                    <td style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{fmt(inv.total)}</td>
                    <td><Badge status={inv.status} /></td>
                    <td><button className="btn btn-ghost btn-sm"><Download size={14} /> PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

// ─── PAGE: INTEGRATIONS ─────────────────────────────────────
const IntegrationsPage = () => {
  const integrations = [
    { provider: "netsuite", name: "Oracle NetSuite", desc: "Sync orders, inventory, and invoices with NetSuite ERP", status: "disconnected", icon: "🔗" },
    { provider: "salesforce", name: "Salesforce", desc: "Push order data and customer records to Salesforce CRM", status: "coming_soon", icon: "☁️" },
    { provider: "odoo", name: "Odoo", desc: "Connect with Odoo ERP for full supply chain visibility", status: "coming_soon", icon: "🔧" },
    { provider: "hubspot", name: "HubSpot", desc: "Sync customer and deal information with HubSpot", status: "coming_soon", icon: "🧲" },
  ];

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Connect your ERP, CRM, or operating system to automatically sync orders, inventory updates, and billing data. Once connected, your warehouse operations flow seamlessly into your existing tools.
        </p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {integrations.map(int => (
          <div key={int.provider} className="integration-card">
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "1px solid var(--border)" }}>
              {int.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{int.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{int.desc}</div>
            </div>
            {int.status === "coming_soon" ? (
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Coming soon</span>
            ) : (
              <button className="btn btn-primary btn-sm">
                <Link2 size={14} /> Connect
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header"><h3>API Access</h3></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
            Need a custom integration? Use our REST API to connect any system. Your API credentials are scoped to your organization and support read/write access to inventory, orders, and billing.
          </p>
          <div style={{ background: "var(--sidebar-bg)", color: "#e2e8f0", borderRadius: "var(--radius)", padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            <div style={{ color: "var(--text-muted)", marginBottom: 4 }}># Your API endpoint</div>
            <div>https://api.woulf.com/v1/portal/{ORG.slug}</div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 12 }}>
            <Copy size={14} /> Generate API Key
          </button>
        </div>
      </div>
    </>
  );
};

// ─── CHECKOUT FLOW ──────────────────────────────────────────
const CheckoutDrawer = ({ cart, setCart, pallets, onClose, onOrderCreated }) => {
  const [step, setStep] = useState(1); // 1: review, 2: BOL, 3: PO, 4: confirm
  const [dest, setDest] = useState({ name: "", street: "", city: "", state: "", zip: "", phone: "", email: "" });
  const [poNumber, setPoNumber] = useState("");
  const [freightClass, setFreightClass] = useState("70");
  const [submitted, setSubmitted] = useState(false);

  const removeItem = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const handleSubmitOrder = () => {
    setSubmitted(true);
    setTimeout(() => {
      const newOrder = {
        id: `ORD-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        status: "submitted",
        destination: { name: dest.name, city: `${dest.city}, ${dest.state}` },
        lines: cart.length,
        created_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      };
      onOrderCreated(newOrder);
      setCart([]);
    }, 1800);
  };

  const wh = WAREHOUSE;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" style={{ width: "min(640px, 95vw)" }}>
        <div className="drawer-header">
          <div>
            <h2>{submitted ? "Order Submitted" : ["Review Cart", "Bill of Lading", "Purchase Order", "Confirm & Submit"][step - 1]}</h2>
            {!submitted && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Step {step} of 4</div>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          {submitted ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <CheckCircle size={56} style={{ color: "#16a34a", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>Order Submitted Successfully</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6, maxWidth: 360, margin: "6px auto 0" }}>
                Your order has been received and sent to the warehouse pick queue. BOL and PO documents have been generated and attached.
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn btn-secondary"><Download size={14} /> Download BOL</button>
                <button className="btn btn-secondary"><Download size={14} /> Download PO</button>
              </div>
            </div>
          ) : step === 1 ? (
            <>
              {cart.length === 0 ? (
                <div className="empty-state">
                  <ShoppingCart size={48} />
                  <h4>Cart is empty</h4>
                  <p>Add items from Inventory to start an order.</p>
                </div>
              ) : (
                <div>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                      <Box size={20} style={{ color: "var(--brand)", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.product_name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                          <span className="mono">{item.sku}</span> · Lot {item.lot_number} ·{" "}
                          {item.pickType === "full_pallet" ? "Full pallet" : item.pickType === "units" ? `${fmtNum(item.qtyUnits)} ${item.uom}s` : `${fmtNum(item.qtyWeight)} lb`}
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-icon" onClick={() => removeItem(item.id)}><Trash2 size={15} style={{ color: "#dc2626" }} /></button>
                    </div>
                  ))}
                  <div style={{ textAlign: "right", marginTop: 12, fontSize: 13, color: "var(--text-secondary)" }}>
                    {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
                  </div>
                </div>
              )}
            </>
          ) : step === 2 ? (
            <>
              <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius)", padding: 16, marginBottom: 20, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Ship From</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{wh.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{wh.address.street}, {wh.address.city}, {wh.address.state} {wh.address.zip}</div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Ship To (Destination)</div>
              <div className="form-group">
                <label className="form-label">Company / Receiver Name</label>
                <input className="form-input" value={dest.name} onChange={e => setDest({ ...dest, name: e.target.value })} placeholder="Whole Foods - Denver" />
              </div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="form-input" value={dest.street} onChange={e => setDest({ ...dest, street: e.target.value })} placeholder="2900 W 44th Ave" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={dest.city} onChange={e => setDest({ ...dest, city: e.target.value })} placeholder="Denver" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={dest.state} onChange={e => setDest({ ...dest, state: e.target.value })} placeholder="CO" />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP</label>
                  <input className="form-input" value={dest.zip} onChange={e => setDest({ ...dest, zip: e.target.value })} placeholder="80211" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input className="form-input" value={dest.phone} onChange={e => setDest({ ...dest, phone: e.target.value })} placeholder="(303) 555-0142" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input className="form-input" value={dest.email} onChange={e => setDest({ ...dest, email: e.target.value })} placeholder="receiving@example.com" />
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Freight Classification</div>
              <div className="form-group">
                <label className="form-label">NMFC Freight Class</label>
                <select className="form-input" value={freightClass} onChange={e => setFreightClass(e.target.value)}>
                  <option value="50">Class 50 — Clean freight, fits on standard pallet</option>
                  <option value="55">Class 55</option>
                  <option value="60">Class 60</option>
                  <option value="65">Class 65</option>
                  <option value="70">Class 70 — Food items, auto-selected</option>
                  <option value="77.5">Class 77.5</option>
                  <option value="85">Class 85</option>
                  <option value="92.5">Class 92.5</option>
                  <option value="100">Class 100</option>
                </select>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Info size={12} /> Auto-selected based on product type. Override if needed.
                </div>
              </div>

              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--radius)", padding: 12, marginTop: 8, fontSize: 12, color: "#92400e", display: "flex", gap: 8 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>Items from cart will be listed on the BOL. The BOL document will be auto-generated and attached to your order.</div>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Purchase Order</div>
              <div className="form-group">
                <label className="form-label">PO Number</label>
                <input className="form-input" value={poNumber} onChange={e => setPoNumber(e.target.value)} placeholder="Leave blank to auto-generate" />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>If blank, system will assign PO-{new Date().getFullYear()}-XXXX</div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>PO Line Items (from cart)</div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                <table>
                  <thead><tr><th>SKU</th><th>Product</th><th>Pick</th><th>Qty</th></tr></thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id}>
                        <td className="mono" style={{ fontSize: 12 }}>{item.sku}</td>
                        <td style={{ fontSize: 12.5 }}>{item.product_name}</td>
                        <td><Badge status={item.pickType === "full_pallet" ? "available" : item.pickType === "units" ? "allocated" : "hold"} /></td>
                        <td style={{ fontSize: 12.5 }}>
                          {item.pickType === "full_pallet" ? "Full pallet" : item.pickType === "units" ? `${fmtNum(item.qtyUnits)} ${item.uom}s` : `${fmtNum(item.qtyWeight)} lb`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius)", padding: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Ship From</div>
                  <div style={{ fontSize: 12.5, marginTop: 4 }}>{wh.name}<br />{wh.address.city}, {wh.address.state}</div>
                </div>
                <div style={{ background: "var(--surface-raised)", borderRadius: "var(--radius)", padding: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Ship To</div>
                  <div style={{ fontSize: 12.5, marginTop: 4 }}>{dest.name || "—"}<br />{dest.city ? `${dest.city}, ${dest.state}` : "—"}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--radius)", padding: 16, marginBottom: 20, display: "flex", gap: 12 }}>
                <CheckCircle size={20} style={{ color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "#15803d" }}>Ready to Submit</div>
                  <div style={{ fontSize: 12.5, color: "#166534", marginTop: 2 }}>Your order will be sent to the warehouse pick queue. BOL and PO documents will be generated automatically.</div>
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Order Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  ["Items", `${cart.length} line${cart.length !== 1 ? "s" : ""}`],
                  ["PO Number", poNumber || "(auto-generated)"],
                  ["Ship To", dest.name || "—"],
                  ["Freight Class", `Class ${freightClass}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Documents to Generate</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Bill of Lading (BOL)", "Purchase Order (PO)"].map(doc => (
                  <div key={doc} style={{ flex: 1, background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} style={{ color: "var(--brand)" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{doc}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!submitted && (
          <div className="drawer-footer">
            {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={14} /> Back</button>}
            <div style={{ flex: 1 }} />
            {step < 4 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={step === 1 && cart.length === 0 || (step === 2 && !dest.name)}>
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmitOrder}>
                <Check size={14} /> Submit Order
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ─── PAGE: SETTINGS / USERS ─────────────────────────────────
const UsersPage = () => {
  const members = [
    { name: "Sarah Chen", email: "sarah@acmefoods.com", role: "org_admin", last: "Today" },
    { name: "Marcus Rivera", email: "marcus@acmefoods.com", role: "member", last: "Yesterday" },
    { name: "Priya Patel", email: "priya@acmefoods.com", role: "member", last: "Feb 10" },
  ];
  return (
    <div className="card">
      <div className="card-header">
        <h3>Team Members</h3>
        <button className="btn btn-primary btn-sm"><Plus size={14} /> Invite User</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Active</th><th></th></tr></thead>
          <tbody>
            {members.map(m => (
              <tr key={m.email}>
                <td style={{ fontWeight: 500 }}>{m.name}</td>
                <td className="mono" style={{ fontSize: 12 }}>{m.email}</td>
                <td><Badge status={m.role === "org_admin" ? "allocated" : "available"} /></td>
                <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.last}</td>
                <td><button className="btn btn-ghost btn-sm"><MoreHorizontal size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────
export default function WOULFPortal() {
  const [page, setPage] = useState("dashboard");
  const [drawer, setDrawer] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [showCheckout, setShowCheckout] = useState(false);

  const closeDrawer = () => setDrawer(null);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "inbound", label: "Inbound", icon: Truck },
    { key: "orders", label: "Orders", icon: Layers },
    { key: "billing", label: "Billing", icon: DollarSign },
  ];
  const settingsItems = [
    { key: "integrations", label: "Integrations", icon: Link2 },
    { key: "users", label: "Team", icon: Settings },
  ];

  const handleOrderCreated = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setTimeout(() => {
      setShowCheckout(false);
      setPage("orders");
    }, 2200);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="portal-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">AF</div>
            <div>
              <h1>{ORG.name}</h1>
              <span>WOULF Logistics Portal</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <button key={item.key} className={cx("sidebar-item", page === item.key && "active")} onClick={() => setPage(item.key)}>
                <item.icon /> {item.label}
                {item.key === "orders" && orders.filter(o => !["delivered","canceled"].includes(o.status)).length > 0 && (
                  <span className="sidebar-badge">{orders.filter(o => !["delivered","canceled"].includes(o.status)).length}</span>
                )}
              </button>
            ))}
            <div className="sidebar-section">Settings</div>
            {settingsItems.map(item => (
              <button key={item.key} className={cx("sidebar-item", page === item.key && "active")} onClick={() => setPage(item.key)}>
                <item.icon /> {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", fontWeight: 600 }}>SC</div>
              <div>
                <div style={{ color: "white", fontSize: 12.5, fontWeight: 500 }}>Sarah Chen</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11 }}>Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <div className="topbar">
            <span className="topbar-title">
              {navItems.find(n => n.key === page)?.label || settingsItems.find(n => n.key === page)?.label || "Portal"}
            </span>
            <div className="topbar-actions">
              {page === "inventory" && (
                <button className="btn btn-primary btn-sm" onClick={() => setPage("inbound")}>
                  <Plus size={14} /> New Inbound
                </button>
              )}
            </div>
          </div>
          <div className="page-body">
            {page === "dashboard" && <DashboardPage pallets={MOCK_PALLETS} orders={orders} cart={cart} />}
            {page === "inventory" && <InventoryPage pallets={MOCK_PALLETS} cart={cart} setCart={setCart} setDrawer={setDrawer} />}
            {page === "inbound" && <InboundPage setDrawer={setDrawer} />}
            {page === "orders" && <OrdersPage orders={orders} setDrawer={setDrawer} />}
            {page === "billing" && <BillingPage />}
            {page === "integrations" && <IntegrationsPage />}
            {page === "users" && <UsersPage />}
          </div>
        </main>
      </div>

      {/* Cart FAB */}
      {cart.length > 0 && !showCheckout && (
        <button className="cart-fab" onClick={() => setShowCheckout(true)}>
          <ShoppingCart size={18} />
          {cart.length} item{cart.length !== 1 ? "s" : ""} — Checkout
        </button>
      )}

      {/* Drawers */}
      {drawer?.type === "pallet" && <PalletDrawer pallet={drawer.data} cart={cart} setCart={setCart} onClose={closeDrawer} />}
      {drawer?.type === "asn" && <ASNDrawer asn={drawer.data} onClose={closeDrawer} />}
      {drawer?.type === "order" && <OrderDrawer order={drawer.data} onClose={closeDrawer} />}

      {/* Checkout */}
      {showCheckout && <CheckoutDrawer cart={cart} setCart={setCart} pallets={MOCK_PALLETS} onClose={() => setShowCheckout(false)} onOrderCreated={handleOrderCreated} />}
    </>
  );
}
