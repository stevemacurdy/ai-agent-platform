/**
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
