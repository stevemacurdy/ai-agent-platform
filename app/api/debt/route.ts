export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

const loans = [
  { id: 'loan-1', lender: 'First National Bank', type: 'mortgage', original: 1500000, balance: 450000, rate: 6.875, monthly: 30000, origination: '2018-06-15', maturity: '2033-06-15', collateral: 'Warehouse building — 45,000 sqft', status: 'active' },
  { id: 'loan-2', lender: 'SBA - Chase', type: 'sba', original: 350000, balance: 180000, rate: 5.5, monthly: 4800, origination: '2020-03-01', maturity: '2030-03-01', collateral: 'Business assets', status: 'active' },
  { id: 'loan-3', lender: 'CAT Financial', type: 'equipment', original: 95000, balance: 42000, rate: 4.9, monthly: 1800, origination: '2022-08-15', maturity: '2027-08-15', collateral: '320F Excavator', status: 'active' },
  { id: 'loan-4', lender: 'Ford Motor Credit', type: 'vehicle', original: 58000, balance: 22000, rate: 3.9, monthly: 950, origination: '2023-01-10', maturity: '2028-01-10', collateral: 'F-250 Super Duty', status: 'active' },
  { id: 'loan-5', lender: 'Regional Credit Union', type: 'line_of_credit', original: 100000, balance: 35000, rate: 7.25, monthly: 1200, origination: '2024-06-01', maturity: '2029-06-01', collateral: 'Unsecured', status: 'active' },
];

const equipment = [
  { id: 'eq-1', name: 'CAT 320F Excavator', serial: 'CAT320F-88421', purchased: '2022-08-15', price: 95000, currentValue: 68000, depreciation: 'straight_line', life: 10, location: 'Main yard', project: 'Logicorp Warehouse', status: 'active' },
  { id: 'eq-2', name: 'Crown FC5200 Forklift', serial: 'CRN-FC-11209', purchased: '2021-03-20', price: 32000, currentValue: 21000, depreciation: 'straight_line', life: 7, location: 'Warehouse A', project: null, status: 'active' },
  { id: 'eq-3', name: 'Hytrol Belt Conveyor System', serial: 'HYT-190-BC', purchased: '2023-11-01', price: 145000, currentValue: 125000, depreciation: 'straight_line', life: 15, location: 'Warehouse B', project: 'GreenLeaf Supply', status: 'active' },
  { id: 'eq-4', name: 'Miller Welder BigBlue 400', serial: 'MLR-BB400-6621', purchased: '2020-06-12', price: 12000, currentValue: 6500, depreciation: 'declining_balance', life: 8, location: 'Fab shop', project: null, status: 'active' },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'loans') return NextResponse.json({ loans });
  if (view === 'equipment') return NextResponse.json({ equipment });

  const totalDebt = loans.reduce((s, l) => s + l.balance, 0);
  const totalMonthly = loans.reduce((s, l) => s + l.monthly, 0);
  const totalAssetValue = equipment.reduce((s, e) => s + e.currentValue, 0);
  const weightedRate = loans.reduce((s, l) => s + l.rate * (l.balance / totalDebt), 0);

  return NextResponse.json({
    loans,
    equipment,
    totalDebt,
    totalMonthly,
    totalAssetValue,
    weightedAvgRate: Math.round(weightedRate * 100) / 100,
    debtToAsset: Math.round((totalDebt / totalAssetValue) * 100) / 100,
    recommendation: totalMonthly > 30000 ? 'Consider refinancing the mortgage to reduce monthly burden' : 'Debt service is manageable',
  });
}
