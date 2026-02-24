export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

// Generates lending packet data (in production, would compile into PDF)
function generatePnL() {
  return {
    title: 'Year-to-Date Profit & Loss Statement',
    period: 'January 1 – February 16, 2026',
    revenue: {
      'Service Revenue': 145000,
      'Project Revenue': 28000,
      'SaaS Subscriptions': 4500,
      totalRevenue: 177500,
    },
    cogs: {
      'Direct Labor': 52000,
      'Materials & Supplies': 18400,
      'Equipment Rental': 7600,
      totalCOGS: 78000,
    },
    grossProfit: 99500,
    grossMargin: 56.1,
    operatingExpenses: {
      'Wages & Benefits': 38500,
      'Rent & Lease': 17000,
      'Insurance': 6200,
      'Utilities': 3780,
      'Advertising': 4200,
      'Legal & Professional': 2500,
      'Travel & Meals': 970,
      'Office & Supplies': 890,
      'Depreciation': 4200,
      totalOpEx: 78240,
    },
    operatingIncome: 21260,
    otherExpenses: {
      'Interest Expense': 8950,
      totalOther: 8950,
    },
    netIncome: 12310,
    netMargin: 6.9,
  };
}

function generateBalanceSheet() {
  return {
    title: 'Balance Sheet',
    asOf: 'February 16, 2026',
    assets: {
      current: {
        'Cash & Equivalents': 48000,
        'Accounts Receivable': 38995,
        'Inventory': 12500,
        'Prepaid Expenses': 4200,
        totalCurrent: 103695,
      },
      fixed: {
        'Equipment (net)': 281200,
        'Vehicles (net)': 44000,
        'Building (net)': 1200000,
        'Accumulated Depreciation': -185000,
        totalFixed: 1340200,
      },
      totalAssets: 1443895,
    },
    liabilities: {
      current: {
        'Accounts Payable': 15800,
        'Accrued Wages': 8500,
        'Current Portion — Long Term Debt': 48000,
        'Tax Reserves': 32340,
        totalCurrent: 104640,
      },
      longTerm: {
        'Mortgage': 1320000,
        'Equipment Loans': 46500,
        'SBA Loan': 195000,
        'Vehicle Loan': 28000,
        'Line of Credit': 42000,
        totalLongTerm: 1631500,
      },
      totalLiabilities: 1736140,
    },
    equity: {
      'Retained Earnings': -304555,
      'Current Year Earnings': 12310,
      totalEquity: -292245,
    },
    totalLiabilitiesAndEquity: 1443895,
  };
}

function generateCashFlow() {
  return {
    title: 'Cash Flow Statement',
    period: 'January 1 – February 16, 2026',
    operating: {
      'Net Income': 12310,
      'Depreciation': 4200,
      'Change in AR': -5200,
      'Change in AP': 2400,
      'Change in Inventory': -1800,
      netOperating: 11910,
    },
    investing: {
      'Equipment Purchases': 0,
      'Building Improvements': -3500,
      netInvesting: -3500,
    },
    financing: {
      'Loan Payments': -37630,
      'Line of Credit Draw': 5000,
      netFinancing: -32630,
    },
    netCashChange: -24220,
    beginningCash: 72220,
    endingCash: 48000,
  };
}

function generateExecutiveSummary() {
  return {
    companyName: 'Woulf Group',
    ein: 'XX-XXXXXXX',
    address: '500 Commerce Drive, SLC, UT',
    founded: '2018',
    industry: 'Warehouse Automation & General Contracting',
    employees: 24,
    annualRevenue: '$1.2M (2025)',
    projectsCompleted: '1,200+',
    totalSqFt: '4,000,000+',
    flagshipProject: '$300M (in progress)',
    creditScores: { business: 78, personal: 742 },
    loanPurpose: 'To be specified by applicant',
  };
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'preview') {
    return NextResponse.json({
      executiveSummary: generateExecutiveSummary(),
      pnl: generatePnL(),
      balanceSheet: generateBalanceSheet(),
      cashFlow: generateCashFlow(),
      generatedAt: new Date().toISOString(),
      sections: ['Executive Summary', 'YTD Profit & Loss', 'Balance Sheet', 'Cash Flow Statement', 'Tax Returns (attach separately)'],
    });
  }

  return NextResponse.json({
    available: true,
    sections: ['Executive Summary', 'YTD P&L', 'Balance Sheet', 'Cash Flow', 'Tax Returns'],
    lastGenerated: null,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  if (body.action === 'generate') {
    // In production: compile into PDF using puppeteer or similar
    const packet = {
      id: 'packet-' + Date.now(),
      generatedAt: new Date().toISOString(),
      generatedBy: request.headers.get('x-admin-email'),
      loanPurpose: body.loanPurpose || '',
      requestedAmount: body.requestedAmount || 0,
      sections: {
        executiveSummary: generateExecutiveSummary(),
        pnl: generatePnL(),
        balanceSheet: generateBalanceSheet(),
        cashFlow: generateCashFlow(),
      },
      status: 'generated',
    };

    return NextResponse.json({ packet, message: 'Lending packet generated. In production, this would be a downloadable PDF.' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
