/**
 * ============================================================
 *  WoulfAI — Batch 3: Multi-Tenant Data Switching
 * ============================================================
 *  When the company switcher changes, agent dashboards now show
 *  DIFFERENT data per company. Architecture:
 *
 *  lib/tenant-data.ts   → central mock data per company
 *  useTenantData() hook → returns data for current company
 *  Agent pages updated  → CFO, Sales, Portal, HR, Operations
 *
 *  Run:  node batch3-multi-tenant.js
 *  Then: npm run build && vercel --prod
 */

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
let created = 0;

function write(fp, content) {
  const full = path.join(ROOT, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (fs.existsSync(full)) {
    const bd = path.join(ROOT, '.backups', 'batch3');
    fs.mkdirSync(bd, { recursive: true });
    fs.copyFileSync(full, path.join(bd, fp.replace(/\//g, '__')));
  }
  fs.writeFileSync(full, content, 'utf8');
  created++;
  console.log('  \u2713 ' + fp);
}

console.log('');
console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
console.log('  \u2551  WoulfAI \u2014 Batch 3: Multi-Tenant Data          \u2551');
console.log('  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
console.log('');

const AP = fs.existsSync(path.join(ROOT, 'src/app')) ? 'src/' : '';

// ============================================================
// FILE 1: Central tenant data layer
// ============================================================
console.log('  [1/8] Central tenant data layer');

write(AP + 'lib/tenant-data.ts', `/**
 * Multi-tenant mock data layer.
 * Each company has its own dataset per agent.
 * Replace with real Supabase/API queries when integrations go live.
 */

export interface CompanyFinance {
  totalRevenue: number; monthlyBurn: number; cashOnHand: number; arOutstanding: number;
  apOutstanding: number; healthScore: number; invoices: { id: string; vendor: string; amount: number; status: string; due: string }[];
  cashflow: { month: string; inflow: number; outflow: number }[];
}

export interface CompanySales {
  pipelineValue: number; wonThisMonth: number; activeDeals: number; winRate: number; avgDealSize: number;
  stages: { name: string; deals: { company: string; value: number; owner: string; age: string; risk: string }[] }[];
  contacts: { name: string; company: string; role: string; sentiment: string; lastContact: string }[];
}

export interface CompanyHR {
  totalEmployees: number; openPositions: number; avgTenure: string; turnoverRate: string;
  employees: { name: string; role: string; department: string; startDate: string; status: string }[];
  ptoRequests: { name: string; dates: string; status: string }[];
}

export interface CompanyOps {
  activeProjects: number; onTimeRate: string; crewSize: number; budgetVariance: string;
  projects: { name: string; status: string; progress: number; deadline: string; budget: string }[];
}

export interface CompanyPortal {
  totalSkus: number; lowStock: number; pendingAsns: number;
  inventory: { sku: string; name: string; qty: number; lot: string; exp: string; location: string; weight: number; freightClass: string }[];
  shipments: { id: string; type: string; items: number; carrier: string; status: string }[];
  balance: number; storageFee: number; lastPayment: number;
}

const WOULF_GROUP: {
  finance: CompanyFinance; sales: CompanySales; hr: CompanyHR; ops: CompanyOps; portal: CompanyPortal;
} = {
  finance: {
    totalRevenue: 2847000, monthlyBurn: 186000, cashOnHand: 1245000, arOutstanding: 342000,
    apOutstanding: 178000, healthScore: 87,
    invoices: [
      { id: 'INV-2026-001', vendor: 'Steel Supply Co', amount: 24500, status: 'Overdue', due: '2026-02-10' },
      { id: 'INV-2026-002', vendor: 'Tech Solutions', amount: 8900, status: 'Paid', due: '2026-02-15' },
      { id: 'INV-2026-003', vendor: 'Safety Equipment Inc', amount: 12300, status: 'Pending', due: '2026-03-01' },
      { id: 'INV-2026-004', vendor: 'Frito-Lay Distribution', amount: 67800, status: 'Paid', due: '2026-01-28' },
      { id: 'INV-2026-005', vendor: 'Conveyor Parts LLC', amount: 15600, status: 'Pending', due: '2026-03-10' },
    ],
    cashflow: [
      { month: 'Oct', inflow: 285000, outflow: 198000 },
      { month: 'Nov', inflow: 312000, outflow: 205000 },
      { month: 'Dec', inflow: 267000, outflow: 213000 },
      { month: 'Jan', inflow: 298000, outflow: 186000 },
      { month: 'Feb', inflow: 324000, outflow: 192000 },
    ],
  },
  sales: {
    pipelineValue: 652000, wonThisMonth: 143000, activeDeals: 7, winRate: 67, avgDealSize: 93000,
    stages: [
      { name: 'Discovery', deals: [
        { company: 'Cabelas Distribution', value: 185000, owner: 'Sarah M.', age: '8d', risk: 'low' },
        { company: 'Sportsman WH Reno', value: 92000, owner: 'Mike R.', age: '3d', risk: 'low' },
      ]},
      { name: 'Proposal', deals: [
        { company: 'Amazon SLC Fulfillment', value: 220000, owner: 'Sarah M.', age: '18d', risk: 'medium' },
      ]},
      { name: 'Negotiation', deals: [
        { company: 'Frito-Lay West', value: 195000, owner: 'James K.', age: '28d', risk: 'high' },
      ]},
      { name: 'Closed Won', deals: [
        { company: 'Purple Mattress WH', value: 88000, owner: 'Mike R.', age: '2d', risk: 'low' },
        { company: 'Overstock Fulfillment', value: 55000, owner: 'James K.', age: '5d', risk: 'low' },
      ]},
    ],
    contacts: [
      { name: 'Jennifer Walsh', company: 'Cabelas', role: 'VP Operations', sentiment: 'Positive', lastContact: '2 days ago' },
      { name: 'David Chen', company: 'Amazon SLC', role: 'Warehouse Director', sentiment: 'Neutral', lastContact: '5 days ago' },
      { name: 'Amanda Torres', company: 'Frito-Lay', role: 'Supply Chain VP', sentiment: 'Cautious', lastContact: '1 day ago' },
    ],
  },
  hr: {
    totalEmployees: 32, openPositions: 3, avgTenure: '2.8 yrs', turnoverRate: '8%',
    employees: [
      { name: 'Jake Morrison', role: 'Lead Integrator', department: 'Engineering', startDate: '2023-06-15', status: 'Active' },
      { name: 'Maria Santos', role: 'Project Manager', department: 'Operations', startDate: '2024-01-10', status: 'Active' },
      { name: 'Tyler Reed', role: 'Field Technician', department: 'Installation', startDate: '2024-08-22', status: 'Active' },
      { name: 'Samantha Liu', role: 'Controls Engineer', department: 'Engineering', startDate: '2023-11-05', status: 'Active' },
      { name: 'Marcus Johnson', role: 'Warehouse Specialist', department: 'Operations', startDate: '2025-03-18', status: 'Probation' },
    ],
    ptoRequests: [
      { name: 'Jake Morrison', dates: 'Mar 10-14', status: 'Approved' },
      { name: 'Tyler Reed', dates: 'Mar 3-4', status: 'Pending' },
    ],
  },
  ops: {
    activeProjects: 8, onTimeRate: '91%', crewSize: 24, budgetVariance: '-2.1%',
    projects: [
      { name: 'Cabelas DC Conveyor Install', status: 'In Progress', progress: 72, deadline: '2026-04-15', budget: '$245K' },
      { name: 'Sportsman WH Racking Phase 2', status: 'In Progress', progress: 45, deadline: '2026-05-30', budget: '$180K' },
      { name: 'Frito-Lay Sortation Upgrade', status: 'Planning', progress: 10, deadline: '2026-07-01', budget: '$320K' },
      { name: 'Purple Mattress Mezzanine', status: 'Complete', progress: 100, deadline: '2026-02-28', budget: '$95K' },
    ],
  },
  portal: {
    totalSkus: 1247, lowStock: 2, pendingAsns: 3,
    inventory: [
      { sku: 'WG-CONV-100', name: 'Conveyor Belt 24in', qty: 47, lot: 'LOT-2026-001', exp: '2029-01-01', location: 'A-12-3', weight: 45, freightClass: '85' },
      { sku: 'WG-RACK-200', name: 'Pallet Rack Beam 96in', qty: 230, lot: 'LOT-2026-003', exp: '2030-01-01', location: 'B-04-1', weight: 28, freightClass: '70' },
      { sku: 'WG-CTRL-050', name: 'PLC Controller Unit', qty: 12, lot: 'LOT-2026-012', exp: '2028-06-15', location: 'C-01-2', weight: 3.2, freightClass: '60' },
      { sku: 'WG-SENS-075', name: 'Photo Eye Sensor', qty: 340, lot: 'LOT-2026-045', exp: '2029-03-01', location: 'C-08-4', weight: 0.2, freightClass: '50' },
    ],
    shipments: [
      { id: 'SHP-001', type: 'Outbound', items: 12, carrier: 'FedEx Freight', status: 'In Transit' },
      { id: 'SHP-002', type: 'Inbound ASN', items: 45, carrier: 'Old Dominion', status: 'Arriving Tomorrow' },
    ],
    balance: 4250, storageFee: 1850, lastPayment: 2100,
  },
};

const CLUTCH_3PL: typeof WOULF_GROUP = {
  finance: {
    totalRevenue: 1456000, monthlyBurn: 112000, cashOnHand: 687000, arOutstanding: 198000,
    apOutstanding: 94000, healthScore: 79,
    invoices: [
      { id: 'C3-INV-001', vendor: 'ShipStation', amount: 4200, status: 'Paid', due: '2026-02-05' },
      { id: 'C3-INV-002', vendor: 'Warehouse Supplies Inc', amount: 8700, status: 'Pending', due: '2026-03-01' },
      { id: 'C3-INV-003', vendor: 'Pallet Recyclers', amount: 2100, status: 'Overdue', due: '2026-02-12' },
      { id: 'C3-INV-004', vendor: 'Forklift Leasing Co', amount: 3800, status: 'Pending', due: '2026-03-15' },
    ],
    cashflow: [
      { month: 'Oct', inflow: 142000, outflow: 108000 },
      { month: 'Nov', inflow: 156000, outflow: 115000 },
      { month: 'Dec', inflow: 189000, outflow: 124000 },
      { month: 'Jan', inflow: 134000, outflow: 109000 },
      { month: 'Feb', inflow: 167000, outflow: 112000 },
    ],
  },
  sales: {
    pipelineValue: 287000, wonThisMonth: 62000, activeDeals: 5, winRate: 58, avgDealSize: 57000,
    stages: [
      { name: 'Discovery', deals: [
        { company: 'BrewHaus Beverages', value: 45000, owner: 'Lisa T.', age: '6d', risk: 'low' },
      ]},
      { name: 'Proposal', deals: [
        { company: 'Natura Supplements', value: 78000, owner: 'Lisa T.', age: '14d', risk: 'medium' },
        { company: 'PetFresh Direct', value: 52000, owner: 'Alex W.', age: '9d', risk: 'low' },
      ]},
      { name: 'Negotiation', deals: [
        { company: 'GlowUp Cosmetics', value: 112000, owner: 'Lisa T.', age: '21d', risk: 'medium' },
      ]},
      { name: 'Closed Won', deals: [
        { company: 'FitFuel Nutrition', value: 62000, owner: 'Alex W.', age: '3d', risk: 'low' },
      ]},
    ],
    contacts: [
      { name: 'Rachel Green', company: 'BrewHaus', role: 'Logistics Manager', sentiment: 'Positive', lastContact: '1 day ago' },
      { name: 'Tom Bradley', company: 'Natura', role: 'COO', sentiment: 'Neutral', lastContact: '4 days ago' },
      { name: 'Kim Nguyen', company: 'GlowUp', role: 'VP Supply Chain', sentiment: 'Positive', lastContact: '2 days ago' },
    ],
  },
  hr: {
    totalEmployees: 18, openPositions: 2, avgTenure: '1.9 yrs', turnoverRate: '12%',
    employees: [
      { name: 'Carlos Reyes', role: 'Warehouse Manager', department: 'Operations', startDate: '2024-03-12', status: 'Active' },
      { name: 'Brittany Cole', role: 'Shipping Coordinator', department: 'Logistics', startDate: '2024-09-01', status: 'Active' },
      { name: 'Derek Simmons', role: 'Inventory Specialist', department: 'Operations', startDate: '2025-01-15', status: 'Active' },
      { name: 'Nina Patel', role: 'Account Manager', department: 'Sales', startDate: '2024-07-22', status: 'Active' },
    ],
    ptoRequests: [
      { name: 'Carlos Reyes', dates: 'Mar 17-21', status: 'Pending' },
      { name: 'Brittany Cole', dates: 'Mar 7', status: 'Approved' },
    ],
  },
  ops: {
    activeProjects: 4, onTimeRate: '86%', crewSize: 14, budgetVariance: '+1.3%',
    projects: [
      { name: 'BrewHaus Cold Storage Buildout', status: 'In Progress', progress: 55, deadline: '2026-04-01', budget: '$78K' },
      { name: 'Zona 2 Pick Module Install', status: 'In Progress', progress: 80, deadline: '2026-03-15', budget: '$42K' },
      { name: 'FitFuel Kitting Station', status: 'Complete', progress: 100, deadline: '2026-02-20', budget: '$18K' },
      { name: 'GlowUp Returns Processing', status: 'Planning', progress: 5, deadline: '2026-06-01', budget: '$35K' },
    ],
  },
  portal: {
    totalSkus: 3842, lowStock: 7, pendingAsns: 5,
    inventory: [
      { sku: 'C3-BEV-001', name: 'BrewHaus IPA 12pk', qty: 2400, lot: 'BH-2026-088', exp: '2026-08-15', location: 'COLD-A-01', weight: 9.5, freightClass: '70' },
      { sku: 'C3-SUP-010', name: 'Natura Vitamin D 60ct', qty: 890, lot: 'NT-2026-045', exp: '2027-12-01', location: 'DRY-B-12', weight: 0.3, freightClass: '55' },
      { sku: 'C3-PET-022', name: 'PetFresh Kibble 30lb', qty: 145, lot: 'PF-2026-012', exp: '2027-06-30', location: 'DRY-C-08', weight: 30, freightClass: '85' },
      { sku: 'C3-COS-005', name: 'GlowUp Serum 1oz', qty: 5200, lot: 'GU-2026-110', exp: '2028-01-01', location: 'TEMP-A-03', weight: 0.15, freightClass: '50' },
      { sku: 'C3-FIT-018', name: 'FitFuel Protein Bar 24pk', qty: 38, lot: 'FF-2026-067', exp: '2026-11-10', location: 'DRY-D-01', weight: 2.8, freightClass: '60' },
    ],
    shipments: [
      { id: 'C3-SHP-101', type: 'Outbound', items: 240, carrier: 'UPS Freight', status: 'Shipped' },
      { id: 'C3-SHP-102', type: 'Inbound ASN', items: 800, carrier: 'SAIA', status: 'Arriving Today' },
      { id: 'C3-SHP-103', type: 'Outbound', items: 56, carrier: 'FedEx Ground', status: 'Packing' },
    ],
    balance: 12800, storageFee: 4200, lastPayment: 6500,
  },
};

const WOULFAI_SAAS: typeof WOULF_GROUP = {
  finance: {
    totalRevenue: 489000, monthlyBurn: 67000, cashOnHand: 312000, arOutstanding: 48000,
    apOutstanding: 23000, healthScore: 92,
    invoices: [
      { id: 'WAI-INV-001', vendor: 'Vercel Pro', amount: 320, status: 'Paid', due: '2026-02-01' },
      { id: 'WAI-INV-002', vendor: 'Supabase Pro', amount: 250, status: 'Paid', due: '2026-02-01' },
      { id: 'WAI-INV-003', vendor: 'OpenAI API', amount: 4800, status: 'Pending', due: '2026-03-01' },
      { id: 'WAI-INV-004', vendor: 'Anthropic API', amount: 3200, status: 'Pending', due: '2026-03-01' },
    ],
    cashflow: [
      { month: 'Oct', inflow: 52000, outflow: 58000 },
      { month: 'Nov', inflow: 68000, outflow: 62000 },
      { month: 'Dec', inflow: 87000, outflow: 65000 },
      { month: 'Jan', inflow: 112000, outflow: 67000 },
      { month: 'Feb', inflow: 134000, outflow: 68000 },
    ],
  },
  sales: {
    pipelineValue: 445000, wonThisMonth: 89000, activeDeals: 9, winRate: 72, avgDealSize: 49000,
    stages: [
      { name: 'Discovery', deals: [
        { company: 'Meridian Logistics', value: 65000, owner: 'Steve M.', age: '4d', risk: 'low' },
        { company: 'Apex Fulfillment', value: 48000, owner: 'Steve M.', age: '7d', risk: 'low' },
      ]},
      { name: 'Proposal', deals: [
        { company: 'Summit 3PL Group', value: 120000, owner: 'Steve M.', age: '12d', risk: 'medium' },
        { company: 'Velocity Warehousing', value: 72000, owner: 'Steve M.', age: '9d', risk: 'low' },
      ]},
      { name: 'Negotiation', deals: [
        { company: 'Pacific Coast Dist.', value: 95000, owner: 'Steve M.', age: '19d', risk: 'medium' },
      ]},
      { name: 'Closed Won', deals: [
        { company: 'RapidShip Co', value: 49000, owner: 'Steve M.', age: '1d', risk: 'low' },
        { company: 'NexGen Warehouse', value: 40000, owner: 'Steve M.', age: '4d', risk: 'low' },
      ]},
    ],
    contacts: [
      { name: 'Brian Foster', company: 'Meridian', role: 'CTO', sentiment: 'Positive', lastContact: '1 day ago' },
      { name: 'Sandra Cho', company: 'Summit 3PL', role: 'VP Ops', sentiment: 'Positive', lastContact: '3 days ago' },
      { name: 'Marcus Webb', company: 'Pacific Coast', role: 'CEO', sentiment: 'Neutral', lastContact: '2 days ago' },
    ],
  },
  hr: {
    totalEmployees: 6, openPositions: 4, avgTenure: '0.8 yrs', turnoverRate: '0%',
    employees: [
      { name: 'Steve Macurdy', role: 'CEO / Lead Integrator', department: 'Executive', startDate: '2024-01-01', status: 'Active' },
      { name: 'AI Agent: Claude', role: 'Development Partner', department: 'Engineering', startDate: '2025-01-01', status: 'Active' },
      { name: 'Rachel Kim', role: 'Frontend Developer', department: 'Engineering', startDate: '2025-09-15', status: 'Active' },
      { name: 'Jordan Hayes', role: 'Sales Development', department: 'Sales', startDate: '2025-11-01', status: 'Active' },
    ],
    ptoRequests: [],
  },
  ops: {
    activeProjects: 3, onTimeRate: '95%', crewSize: 6, budgetVariance: '-0.5%',
    projects: [
      { name: 'Platform v2 Launch', status: 'In Progress', progress: 78, deadline: '2026-03-15', budget: '$0 (internal)' },
      { name: 'Mobile App Release', status: 'In Progress', progress: 35, deadline: '2026-05-01', budget: '$0 (internal)' },
      { name: 'Enterprise Tier Launch', status: 'Planning', progress: 15, deadline: '2026-06-01', budget: '$12K' },
    ],
  },
  portal: {
    totalSkus: 0, lowStock: 0, pendingAsns: 0,
    inventory: [],
    shipments: [],
    balance: 0, storageFee: 0, lastPayment: 0,
  },
};

type CompanyDataSet = typeof WOULF_GROUP;

const DATA_MAP: Record<string, CompanyDataSet> = {
  'Woulf Group': WOULF_GROUP,
  'woulf-group': WOULF_GROUP,
  'Clutch 3PL': CLUTCH_3PL,
  'clutch-3pl': CLUTCH_3PL,
  'WoulfAI': WOULFAI_SAAS,
  'woulfai': WOULFAI_SAAS,
};

export function getCompanyData(companyName: string | undefined): CompanyDataSet {
  if (!companyName) return WOULF_GROUP;
  return DATA_MAP[companyName] || WOULF_GROUP;
}

export function getFinance(companyName: string | undefined): CompanyFinance {
  return getCompanyData(companyName).finance;
}

export function getSales(companyName: string | undefined): CompanySales {
  return getCompanyData(companyName).sales;
}

export function getHR(companyName: string | undefined): CompanyHR {
  return getCompanyData(companyName).hr;
}

export function getOps(companyName: string | undefined): CompanyOps {
  return getCompanyData(companyName).ops;
}

export function getPortal(companyName: string | undefined): CompanyPortal {
  return getCompanyData(companyName).portal;
}
`);

// ============================================================
// FILE 2: CFO Agent — company-aware
// ============================================================
console.log('  [2/8] CFO Agent (company-aware)');

write(AP + 'app/agents/cfo/page.tsx', `'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getFinance } from '@/lib/tenant-data';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '\uD83D\uDCCA' },
  { id: 'invoices', name: 'Invoices', icon: '\uD83D\uDCCB' },
  { id: 'cashflow', name: 'Cash Flow', icon: '\uD83D\uDCB0' },
  { id: 'collections', name: 'Collections', icon: '\uD83D\uDCDE' },
];

function fmt(n: number) { return n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n/1000).toFixed(0) + 'K' : '$' + n; }

export default function CFOAgent() {
  const { currentCompany, isLoading } = useTenant();
  const [tab, setTab] = useState('overview');
  const data = getFinance(currentCompany?.name);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{'\uD83D\uDCB0'}</div>
          <div>
            <h1 className="text-2xl font-bold">CFO Agent</h1>
            <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">+ New Invoice</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Revenue', value: fmt(data.totalRevenue), color: '' },
          { label: 'Monthly Burn', value: fmt(data.monthlyBurn), color: '' },
          { label: 'Cash on Hand', value: fmt(data.cashOnHand), color: 'text-emerald-400' },
          { label: 'AR Outstanding', value: fmt(data.arOutstanding), color: 'text-amber-400' },
          { label: 'AP Outstanding', value: fmt(data.apOutstanding), color: 'text-red-400' },
          { label: 'Health Score', value: data.healthScore + '/100', color: data.healthScore >= 85 ? 'text-emerald-400' : 'text-amber-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{k.label}</div>
            <div className={'text-xl font-mono font-bold mt-1 ' + k.color}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Cash Flow Trend</h3>
            <div className="space-y-2">
              {data.cashflow.map(cf => (
                <div key={cf.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8">{cf.month}</span>
                  <div className="flex-1 flex gap-1">
                    <div className="bg-emerald-500/30 h-4 rounded" style={{width: (cf.inflow / 4000).toFixed(0) + '%'}}></div>
                    <div className="bg-red-500/30 h-4 rounded" style={{width: (cf.outflow / 4000).toFixed(0) + '%'}}></div>
                  </div>
                  <span className="text-[10px] text-gray-500 w-20 text-right">{'$' + (cf.inflow/1000).toFixed(0) + 'K / $' + (cf.outflow/1000).toFixed(0) + 'K'}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/50"></span> Inflow</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/50"></span> Outflow</span>
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Invoices</h3>
            <div className="space-y-2">
              {data.invoices.slice(0, 4).map(inv => (
                <div key={inv.id} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <div className="text-sm text-white">{inv.vendor}</div>
                    <div className="text-[10px] text-gray-500">{inv.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{'$' + inv.amount.toLocaleString()}</div>
                    <span className={'text-[9px] px-1.5 py-0.5 rounded ' + (inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : inv.status === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-xs text-gray-500">Invoice</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Vendor</th>
            <th className="text-right px-4 py-3 text-xs text-gray-500">Amount</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Due</th>
          </tr></thead><tbody>
            {data.invoices.map(inv => (
              <tr key={inv.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-mono text-blue-400">{inv.id}</td>
                <td className="px-4 py-3 text-sm text-white">{inv.vendor}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{'$' + inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded ' + (inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : inv.status === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400')}>{inv.status}</span></td>
                <td className="px-4 py-3 text-xs text-gray-500">{inv.due}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {tab === 'cashflow' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Monthly Cash Flow</h3>
          {data.cashflow.map(cf => {
            const net = cf.inflow - cf.outflow;
            return (
              <div key={cf.month} className="flex items-center gap-4 py-3 border-b border-white/[0.03] last:border-0">
                <span className="text-sm text-gray-400 w-10">{cf.month}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400">In: {'$' + (cf.inflow/1000).toFixed(0) + 'K'}</span>
                    <span className="text-red-400">Out: {'$' + (cf.outflow/1000).toFixed(0) + 'K'}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{width: Math.min((cf.inflow / (cf.inflow + cf.outflow)) * 100, 100) + '%'}}></div>
                  </div>
                </div>
                <span className={'text-sm font-mono w-16 text-right ' + (net >= 0 ? 'text-emerald-400' : 'text-red-400')}>{(net >= 0 ? '+' : '') + '$' + (net/1000).toFixed(0) + 'K'}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'collections' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Overdue Invoices</h3>
          {data.invoices.filter(i => i.status === 'Overdue').length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No overdue invoices. Looking good!</p>
          ) : (
            <div className="space-y-3">
              {data.invoices.filter(i => i.status === 'Overdue').map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <div>
                    <div className="text-sm text-white font-medium">{inv.vendor}</div>
                    <div className="text-[10px] text-gray-500">{inv.id} | Due: {inv.due}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-red-400">{'$' + inv.amount.toLocaleString()}</span>
                    <button className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-500">Send Reminder</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`);

// ============================================================
// FILE 3: Sales Agent — company-aware
// ============================================================
console.log('  [3/8] Sales Agent (company-aware)');

// Read current sales page and patch it to use tenant data
const salesPath = path.join(ROOT, AP + 'app/agents/sales/page.tsx');
if (fs.existsSync(salesPath)) {
  let content = fs.readFileSync(salesPath, 'utf8');
  // Add import if not present
  if (!content.includes('tenant-data')) {
    content = content.replace(
      "import { useTenant }",
      "import { getSales } from '@/lib/tenant-data';\nimport { useTenant }"
    );
    // Replace the hardcoded PIPELINE_STAGES usage with tenant data
    // Add data hook after useTenant
    content = content.replace(
      "const [activeTab, setActiveTab] = useState('pipeline');",
      "const [activeTab, setActiveTab] = useState('pipeline');\n  const salesData = getSales(currentCompany?.name);"
    );
    // Replace KPI calculations
    content = content.replace(
      /const totalPipeline = PIPELINE_STAGES.*?;/,
      "const totalPipeline = salesData.pipelineValue;"
    );
    content = content.replace(
      /const wonDeals = PIPELINE_STAGES.*?;/,
      "const wonDeals = salesData.stages.find(s => s.name === 'Closed Won')?.deals || [];"
    );
    content = content.replace(
      /const wonValue = wonDeals.*?;/,
      "const wonValue = salesData.wonThisMonth;"
    );
    // Replace pipeline rendering to use salesData
    content = content.replace(
      /{PIPELINE_STAGES\.map\(stage/g,
      "{salesData.stages.map(stage"
    );
    content = content.replace(
      /{CONTACTS\.map\(/g,
      "{salesData.contacts.map("
    );
    // Fix active deals count
    content = content.replace(
      /PIPELINE_STAGES\.flatMap\(s => s\.deals\)\.length/g,
      "salesData.activeDeals"
    );
    // Fix win rate
    content = content.replace(
      /<div className="text-xl font-mono font-bold mt-1">67%<\/div>/,
      '<div className="text-xl font-mono font-bold mt-1">{salesData.winRate}%</div>'
    );
    // Fix avg deal size
    content = content.replace(
      /<div className="text-xl font-mono font-bold mt-1">\$93K<\/div>/,
      '<div className="text-xl font-mono font-bold mt-1">{\'$\' + (salesData.avgDealSize/1000).toFixed(0) + \'K\'}</div>'
    );

    fs.writeFileSync(salesPath, content, 'utf8');
    console.log('  \u2713 app/agents/sales/page.tsx (patched with tenant data)');
  } else {
    console.log('  \u2713 app/agents/sales/page.tsx (already patched)');
  }
} else {
  console.log('  \u26A0 Sales page not found');
}

// ============================================================
// FILE 4: HR Agent — company-aware
// ============================================================
console.log('  [4/8] HR Agent (company-aware)');

write(AP + 'app/agents/hr/page.tsx', `'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getHR } from '@/lib/tenant-data';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '\uD83D\uDC65' },
  { id: 'directory', name: 'Directory', icon: '\uD83D\uDCCB' },
  { id: 'pto', name: 'PTO Requests', icon: '\uD83C\uDFD6\uFE0F' },
];

export default function HRAgent() {
  const { currentCompany, isLoading } = useTenant();
  const [tab, setTab] = useState('overview');
  const data = getHR(currentCompany?.name);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{'\uD83D\uDC65'}</div>
        <div>
          <h1 className="text-2xl font-bold">HR Agent</h1>
          <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total Employees</div><div className="text-2xl font-bold mt-1">{data.totalEmployees}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Open Positions</div><div className="text-2xl font-bold mt-1 text-blue-400">{data.openPositions}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Avg Tenure</div><div className="text-2xl font-bold mt-1">{data.avgTenure}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Turnover Rate</div><div className="text-2xl font-bold mt-1 text-amber-400">{data.turnoverRate}</div></div>
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Team at a Glance</h3>
            <div className="space-y-2">
              {data.employees.slice(0, 4).map(e => (
                <div key={e.name} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm text-white">{e.name}</div><div className="text-[10px] text-gray-500">{e.role} | {e.department}</div></div>
                  <span className={'text-[9px] px-1.5 py-0.5 rounded ' + (e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{e.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Pending PTO</h3>
            {data.ptoRequests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
            ) : data.ptoRequests.map(p => (
              <div key={p.name + p.dates} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                <div><div className="text-sm text-white">{p.name}</div><div className="text-[10px] text-gray-500">{p.dates}</div></div>
                <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'directory' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-xs text-gray-500">Name</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Role</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Department</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Start Date</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
          </tr></thead><tbody>
            {data.employees.map(e => (
              <tr key={e.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm text-white">{e.name}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{e.role}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{e.department}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{e.startDate}</td>
                <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded ' + (e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{e.status}</span></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {tab === 'pto' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">All PTO Requests</h3>
          {data.ptoRequests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No PTO requests for this company.</p>
          ) : data.ptoRequests.map(p => (
            <div key={p.name + p.dates} className="flex justify-between items-center py-3 border-b border-white/[0.03] last:border-0">
              <div><div className="text-sm text-white">{p.name}</div><div className="text-[10px] text-gray-500">{p.dates}</div></div>
              <div className="flex items-center gap-2">
                <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{p.status}</span>
                {p.status === 'Pending' && <button className="px-3 py-1 bg-emerald-600 text-white rounded text-xs">Approve</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// ============================================================
// FILE 5: Operations Agent — company-aware
// ============================================================
console.log('  [5/8] Operations Agent (company-aware)');

write(AP + 'app/agents/operations/page.tsx', `'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getOps } from '@/lib/tenant-data';

export default function OperationsAgent() {
  const { currentCompany, isLoading } = useTenant();
  const data = getOps(currentCompany?.name);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{'\u2699\uFE0F'}</div>
        <div>
          <h1 className="text-2xl font-bold">Operations Agent</h1>
          <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Active Projects</div><div className="text-2xl font-bold mt-1">{data.activeProjects}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">On-Time Rate</div><div className="text-2xl font-bold mt-1 text-emerald-400">{data.onTimeRate}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Crew Size</div><div className="text-2xl font-bold mt-1">{data.crewSize}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Budget Variance</div><div className={'text-2xl font-bold mt-1 ' + (data.budgetVariance.startsWith('-') ? 'text-emerald-400' : 'text-amber-400')}>{data.budgetVariance}</div></div>
      </div>

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Project Tracker</h3>
        <div className="space-y-4">
          {data.projects.map(p => (
            <div key={p.name} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white">{p.name}</span>
                  <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400')}>{p.status}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className={'h-2 rounded-full ' + (p.status === 'Complete' ? 'bg-emerald-500' : 'bg-blue-500')} style={{width: p.progress + '%'}}></div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                  <span>Due: {p.deadline}</span>
                  <span>{p.budget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

// ============================================================
// FILE 6: Customer Portal — company-aware
// ============================================================
console.log('  [6/8] Customer Portal (company-aware)');

// Patch the existing portal page to import tenant data
const portalPath = path.join(ROOT, AP + 'app/portal/page.tsx');
if (fs.existsSync(portalPath)) {
  let content = fs.readFileSync(portalPath, 'utf8');
  if (!content.includes('tenant-data')) {
    // Add import
    content = content.replace(
      "import { useTenant }",
      "import { getPortal } from '@/lib/tenant-data';\nimport { useTenant }"
    );
    // Add data hook after useTenant
    content = content.replace(
      "const [activeTab, setActiveTab] = useState('overview');",
      "const [activeTab, setActiveTab] = useState('overview');\n  const tenantPortal = getPortal(currentCompany?.name);"
    );
    // Patch overview KPIs to use tenantPortal
    content = content.replace(
      /<div className="text-2xl font-bold mt-1">1,247<\/div>/,
      '<div className="text-2xl font-bold mt-1">{tenantPortal.totalSkus.toLocaleString()}</div>'
    );
    content = content.replace(
      /<div className="text-2xl font-bold mt-1 text-amber-400">2<\/div>/,
      '<div className="text-2xl font-bold mt-1 text-amber-400">{tenantPortal.lowStock}</div>'
    );
    content = content.replace(
      /<div className="text-2xl font-bold mt-1 text-blue-400">2<\/div>/,
      '<div className="text-2xl font-bold mt-1 text-blue-400">{tenantPortal.pendingAsns}</div>'
    );
    // Replace MOCK_INVENTORY references in the inventory table
    content = content.replace(
      /\{MOCK_INVENTORY\.map\(/g,
      '{tenantPortal.inventory.map('
    );
    // Replace balance/fee KPIs in billing
    content = content.replace(
      /<div className="text-2xl font-bold mt-1">\$4,250<\/div>/,
      '<div className="text-2xl font-bold mt-1">{\'$\' + tenantPortal.balance.toLocaleString()}</div>'
    );
    content = content.replace(
      /<div className="text-2xl font-bold mt-1">\$1,850<\/div>/,
      '<div className="text-2xl font-bold mt-1">{\'$\' + tenantPortal.storageFee.toLocaleString()}</div>'
    );
    content = content.replace(
      /<div className="text-2xl font-bold mt-1 text-emerald-400">\$2,100<\/div>/,
      '<div className="text-2xl font-bold mt-1 text-emerald-400">{\'$\' + tenantPortal.lastPayment.toLocaleString()}</div>'
    );

    fs.writeFileSync(portalPath, content, 'utf8');
    console.log('  \u2713 app/portal/page.tsx (patched with tenant data)');
  } else {
    console.log('  \u2713 app/portal/page.tsx (already patched)');
  }
} else {
  console.log('  \u26A0 Portal page not found');
}

// ============================================================
// FILE 7: Generic agent template for remaining agents
// ============================================================
console.log('  [7/8] Generic agent KPI component');

write(AP + 'lib/agent-kpi-data.ts', `/**
 * Generic KPI data per company for agents that don't have
 * full custom pages yet. When you build out each agent,
 * move its data to tenant-data.ts with a full dataset.
 */
import { getCompanyData } from './tenant-data';

interface GenericAgentKPIs {
  [agentSlug: string]: { label: string; value: string }[];
}

const WOULF_KPIS: GenericAgentKPIs = {
  'seo': [{ label: 'Keywords Tracked', value: '847' }, { label: 'Page 1 Rankings', value: '23' }, { label: 'Organic Traffic', value: '12.4K/mo' }, { label: 'Domain Authority', value: '34' }],
  'marketing': [{ label: 'Active Campaigns', value: '4' }, { label: 'Monthly Reach', value: '45K' }, { label: 'Leads Generated', value: '89' }, { label: 'Cost/Lead', value: '$12.40' }],
  'wms': [{ label: 'Total SKUs', value: '1,247' }, { label: 'Order Accuracy', value: '99.2%' }, { label: 'Pick Rate', value: '142/hr' }, { label: 'Dock Doors Active', value: '6/8' }],
  'compliance': [{ label: 'Policies Active', value: '18' }, { label: 'Audits Due', value: '2' }, { label: 'Violations', value: '0' }, { label: 'Score', value: '97/100' }],
  'legal': [{ label: 'Active Contracts', value: '23' }, { label: 'Pending Review', value: '4' }, { label: 'Risk Score', value: 'Low' }, { label: 'Compliance', value: '98%' }],
  'supply-chain': [{ label: 'Active Vendors', value: '42' }, { label: 'Pending Orders', value: '7' }, { label: 'Avg Lead Time', value: '6.2 days' }, { label: 'Cost Savings', value: '$12.4K' }],
  'org-lead': [{ label: 'Team Size', value: '32' }, { label: 'Departments', value: '5' }, { label: 'Open Requests', value: '7' }, { label: 'Satisfaction', value: '4.2/5' }],
};

const CLUTCH_KPIS: GenericAgentKPIs = {
  'seo': [{ label: 'Keywords Tracked', value: '312' }, { label: 'Page 1 Rankings', value: '8' }, { label: 'Organic Traffic', value: '3.2K/mo' }, { label: 'Domain Authority', value: '19' }],
  'marketing': [{ label: 'Active Campaigns', value: '2' }, { label: 'Monthly Reach', value: '12K' }, { label: 'Leads Generated', value: '34' }, { label: 'Cost/Lead', value: '$18.90' }],
  'wms': [{ label: 'Total SKUs', value: '3,842' }, { label: 'Order Accuracy', value: '98.7%' }, { label: 'Pick Rate', value: '98/hr' }, { label: 'Dock Doors Active', value: '4/6' }],
  'compliance': [{ label: 'Policies Active', value: '12' }, { label: 'Audits Due', value: '1' }, { label: 'Violations', value: '0' }, { label: 'Score', value: '91/100' }],
  'legal': [{ label: 'Active Contracts', value: '9' }, { label: 'Pending Review', value: '2' }, { label: 'Risk Score', value: 'Low' }, { label: 'Compliance', value: '95%' }],
  'supply-chain': [{ label: 'Active Vendors', value: '18' }, { label: 'Pending Orders', value: '3' }, { label: 'Avg Lead Time', value: '8.1 days' }, { label: 'Cost Savings', value: '$4.2K' }],
  'org-lead': [{ label: 'Team Size', value: '18' }, { label: 'Departments', value: '3' }, { label: 'Open Requests', value: '4' }, { label: 'Satisfaction', value: '3.8/5' }],
};

const WOULFAI_KPIS: GenericAgentKPIs = {
  'seo': [{ label: 'Keywords Tracked', value: '2,100' }, { label: 'Page 1 Rankings', value: '41' }, { label: 'Organic Traffic', value: '28K/mo' }, { label: 'Domain Authority', value: '42' }],
  'marketing': [{ label: 'Active Campaigns', value: '6' }, { label: 'Monthly Reach', value: '120K' }, { label: 'Leads Generated', value: '245' }, { label: 'Cost/Lead', value: '$8.20' }],
  'wms': [{ label: 'Total SKUs', value: '0' }, { label: 'Order Accuracy', value: 'N/A' }, { label: 'Pick Rate', value: 'N/A' }, { label: 'Dock Doors Active', value: 'N/A' }],
  'compliance': [{ label: 'Policies Active', value: '8' }, { label: 'Audits Due', value: '0' }, { label: 'Violations', value: '0' }, { label: 'Score', value: '100/100' }],
  'legal': [{ label: 'Active Contracts', value: '4' }, { label: 'Pending Review', value: '1' }, { label: 'Risk Score', value: 'Low' }, { label: 'Compliance', value: '100%' }],
  'supply-chain': [{ label: 'Active Vendors', value: '8' }, { label: 'Pending Orders', value: '2' }, { label: 'Avg Lead Time', value: '3.1 days' }, { label: 'Cost Savings', value: '$1.8K' }],
  'org-lead': [{ label: 'Team Size', value: '6' }, { label: 'Departments', value: '3' }, { label: 'Open Requests', value: '12' }, { label: 'Satisfaction', value: '4.5/5' }],
};

export function getAgentKPIs(companyName: string | undefined, agentSlug: string): { label: string; value: string }[] {
  if (!companyName || companyName === 'Woulf Group') return WOULF_KPIS[agentSlug] || [];
  if (companyName === 'Clutch 3PL') return CLUTCH_KPIS[agentSlug] || [];
  if (companyName === 'WoulfAI') return WOULFAI_KPIS[agentSlug] || [];
  return WOULF_KPIS[agentSlug] || [];
}
`);

// ============================================================
// FILE 8: Update remaining agents to use getAgentKPIs
// ============================================================
console.log('  [8/8] Patch remaining agents with tenant KPIs');

const SIMPLE_AGENTS = ['seo', 'marketing', 'wms', 'org-lead', 'compliance', 'legal', 'supply-chain'];
const AGENT_NAMES = {
  'seo': { name: 'SEO Agent', icon: '\uD83D\uDD0D' },
  'marketing': { name: 'Marketing Agent', icon: '\uD83D\uDCE3' },
  'wms': { name: 'WMS Agent', icon: '\uD83C\uDFED' },
  'org-lead': { name: 'Organization Lead', icon: '\uD83C\uDFAF' },
  'compliance': { name: 'Compliance Agent', icon: '\uD83D\uDEE1\uFE0F' },
  'legal': { name: 'Legal Agent', icon: '\u2696\uFE0F' },
  'supply-chain': { name: 'Supply Chain Agent', icon: '\uD83D\uDD17' },
};

let patched = 0;
SIMPLE_AGENTS.forEach(slug => {
  const agentDir = slug === 'supply-chain' ? 'supply-chain' : slug;
  const filePath = path.join(ROOT, AP + 'app/agents/' + agentDir + '/page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('agent-kpi-data') && !content.includes('tenant-data')) {
      // Rewrite with tenant-aware version
      const info = AGENT_NAMES[slug];
      const newContent = `'use client';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getAgentKPIs } from '@/lib/agent-kpi-data';

export default function ${info.name.replace(/[^a-zA-Z]/g, '')}Page() {
  const { currentCompany, isLoading } = useTenant();
  const kpis = getAgentKPIs(currentCompany?.name, '${slug}');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{'${info.icon}'}</div>
        <div>
          <h1 className="text-2xl font-bold">${info.name}</h1>
          <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{k.label}</div>
            <div className="text-2xl font-bold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-400">Full ${info.name} dashboard coming soon.</p>
        <p className="text-xs text-gray-600 mt-1">KPIs above reflect {currentCompany?.name || 'your company'} data.</p>
      </div>
    </div>
  );
}
`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      patched++;
      console.log('  \u2713 app/agents/' + agentDir + '/page.tsx (tenant-aware)');
    }
  }
});

console.log('');
console.log('  ======================================================');
console.log('  \u2713 Created/Updated ' + created + ' files + patched ' + patched + ' agents');
console.log('  ======================================================');
console.log('');
console.log('  Multi-tenant data switching is now LIVE:');
console.log('    Woulf Group  \u2192 Warehouse systems integrator data');
console.log('    Clutch 3PL   \u2192 3PL fulfillment data');
console.log('    WoulfAI      \u2192 SaaS startup data');
console.log('');
console.log('  Updated agents:');
console.log('    CFO        \u2192 Full rewrite with company finance data');
console.log('    Sales      \u2192 Patched pipeline/contacts per company');
console.log('    HR         \u2192 Full rewrite with company employee data');
console.log('    Operations \u2192 Full rewrite with company project data');
console.log('    Portal     \u2192 Patched inventory/billing per company');
console.log('    SEO, Marketing, WMS, Org Lead, Compliance, Legal, Supply Chain');
console.log('              \u2192 KPIs change per company');
console.log('');
console.log('  Next: npm run build && vercel --prod');
console.log('');
