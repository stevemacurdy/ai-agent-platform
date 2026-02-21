import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

interface VendorScore {
  vendorName: string;
  totalSpend: number;
  invoiceCount: number;
  avgPaymentDays: number;
  onTimeRate: number;
  reliabilityScore: number; // 0-100
  tier: 'preferred' | 'standard' | 'watch' | 'new';
  earlyPayDiscount: { eligible: boolean; potentialSavings: number; terms: string } | null;
  lastInvoiceDate: string;
  categories: string[];
}

// Simulated vendor data (built from AP history)
const vendorHistory: VendorScore[] = [
  { vendorName: 'ADP Payroll', totalSpend: 231000, invoiceCount: 6, avgPaymentDays: 0, onTimeRate: 100, reliabilityScore: 98, tier: 'preferred', earlyPayDiscount: null, lastInvoiceDate: '2026-02-14', categories: ['wages'] },
  { vendorName: 'CAT Financial', totalSpend: 22800, invoiceCount: 6, avgPaymentDays: 12, onTimeRate: 100, reliabilityScore: 95, tier: 'preferred', earlyPayDiscount: { eligible: true, potentialSavings: 228, terms: '2/10 net 30 — save 2% if paid within 10 days' }, lastInvoiceDate: '2026-02-01', categories: ['rent_lease_machinery'] },
  { vendorName: 'Google Ads', totalSpend: 25200, invoiceCount: 6, avgPaymentDays: 8, onTimeRate: 100, reliabilityScore: 92, tier: 'preferred', earlyPayDiscount: null, lastInvoiceDate: '2026-01-15', categories: ['advertising'] },
  { vendorName: 'National Grid', totalSpend: 10500, invoiceCount: 6, avgPaymentDays: 18, onTimeRate: 83, reliabilityScore: 78, tier: 'standard', earlyPayDiscount: null, lastInvoiceDate: '2026-02-05', categories: ['utilities'] },
  { vendorName: 'State Farm', totalSpend: 24800, invoiceCount: 4, avgPaymentDays: 5, onTimeRate: 100, reliabilityScore: 96, tier: 'preferred', earlyPayDiscount: { eligible: true, potentialSavings: 124, terms: '1% discount for annual pre-pay' }, lastInvoiceDate: '2026-01-01', categories: ['insurance'] },
  { vendorName: 'Smith & Associates', totalSpend: 8500, invoiceCount: 4, avgPaymentDays: 25, onTimeRate: 75, reliabilityScore: 65, tier: 'standard', earlyPayDiscount: null, lastInvoiceDate: '2026-01-20', categories: ['legal_professional'] },
  { vendorName: 'Delta Airlines', totalSpend: 2400, invoiceCount: 5, avgPaymentDays: 0, onTimeRate: 100, reliabilityScore: 88, tier: 'standard', earlyPayDiscount: null, lastInvoiceDate: '2026-01-08', categories: ['travel_meals'] },
  { vendorName: 'Clutch Client Co', totalSpend: 12400, invoiceCount: 1, avgPaymentDays: 0, onTimeRate: 100, reliabilityScore: 50, tier: 'new', earlyPayDiscount: null, lastInvoiceDate: '2026-02-01', categories: ['supplies'] },
  { vendorName: 'Staples', totalSpend: 850, invoiceCount: 3, avgPaymentDays: 5, onTimeRate: 100, reliabilityScore: 80, tier: 'standard', earlyPayDiscount: { eligible: true, potentialSavings: 17, terms: '2% reward on business account' }, lastInvoiceDate: '2026-02-08', categories: ['supplies', 'office_expense'] },
  { vendorName: 'Hampton Inn', totalSpend: 945, invoiceCount: 2, avgPaymentDays: 0, onTimeRate: 100, reliabilityScore: 75, tier: 'standard', earlyPayDiscount: null, lastInvoiceDate: '2026-01-14', categories: ['travel_meals'] },
];

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');

  if (view === 'preferred') {
    return NextResponse.json({ vendors: vendorHistory.filter(v => v.tier === 'preferred') });
  }
  if (view === 'discounts') {
    const eligible = vendorHistory.filter(v => v.earlyPayDiscount?.eligible);
    return NextResponse.json({
      vendors: eligible,
      totalPotentialSavings: eligible.reduce((s, v) => s + (v.earlyPayDiscount?.potentialSavings || 0), 0),
    });
  }
  if (view === 'watch') {
    return NextResponse.json({ vendors: vendorHistory.filter(v => v.reliabilityScore < 70) });
  }

  const totalSpend = vendorHistory.reduce((s, v) => s + v.totalSpend, 0);
  const avgReliability = Math.round(vendorHistory.reduce((s, v) => s + v.reliabilityScore, 0) / vendorHistory.length);
  const discountSavings = vendorHistory.filter(v => v.earlyPayDiscount?.eligible).reduce((s, v) => s + (v.earlyPayDiscount?.potentialSavings || 0), 0);

  return NextResponse.json({
    vendors: vendorHistory.sort((a, b) => b.totalSpend - a.totalSpend),
    summary: { totalVendors: vendorHistory.length, totalSpend, avgReliability, preferredCount: vendorHistory.filter(v => v.tier === 'preferred').length, discountSavings },
  });
}
