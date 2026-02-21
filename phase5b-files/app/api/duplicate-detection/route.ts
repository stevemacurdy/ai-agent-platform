import { NextRequest, NextResponse } from 'next/server';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function isAuth(req: NextRequest) { const e = req.headers.get('x-admin-email'); return e && ADMINS.includes(e.toLowerCase()); }

interface DuplicateMatch {
  id: string;
  expense1: any;
  expense2: any;
  matchType: 'exact' | 'probable' | 'possible';
  matchScore: number;
  matchReasons: string[];
  status: 'flagged' | 'dismissed' | 'confirmed_duplicate';
}

let dismissedPairs: Set<string> = new Set();

function pairKey(id1: string, id2: string) { return [id1, id2].sort().join(':'); }

function detectDuplicates(expenses: any[]): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (let i = 0; i < expenses.length; i++) {
    for (let j = i + 1; j < expenses.length; j++) {
      const a = expenses[i], b = expenses[j];
      const reasons: string[] = [];
      let score = 0;

      // Exact amount match
      if (a.amount === b.amount) { score += 40; reasons.push('Identical amount ($' + a.amount.toLocaleString() + ')'); }
      // Close amount (within 5%)
      else if (Math.abs(a.amount - b.amount) / Math.max(a.amount, b.amount) < 0.05) { score += 20; reasons.push('Similar amount (within 5%)'); }

      // Same vendor
      const vendorA = (a.vendorName || '').toLowerCase().trim();
      const vendorB = (b.vendorName || '').toLowerCase().trim();
      if (vendorA === vendorB && vendorA) { score += 35; reasons.push('Same vendor'); }
      else if (vendorA && vendorB && (vendorA.includes(vendorB) || vendorB.includes(vendorA))) { score += 20; reasons.push('Similar vendor name'); }

      // Same invoice number
      if (a.invoiceNumber && b.invoiceNumber && a.invoiceNumber === b.invoiceNumber) { score += 50; reasons.push('Identical invoice number'); }

      // Close dates (within 5 days)
      if (a.invoiceDate && b.invoiceDate) {
        const daysDiff = Math.abs(new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()) / (24 * 60 * 60 * 1000);
        if (daysDiff === 0) { score += 15; reasons.push('Same invoice date'); }
        else if (daysDiff <= 5) { score += 8; reasons.push('Invoice dates within 5 days'); }
      }

      // Same category
      if (a.category === b.category) { score += 5; reasons.push('Same category'); }

      if (score >= 50) {
        const key = pairKey(a.id, b.id);
        if (!dismissedPairs.has(key)) {
          matches.push({
            id: key,
            expense1: a,
            expense2: b,
            matchType: score >= 85 ? 'exact' : score >= 65 ? 'probable' : 'possible',
            matchScore: Math.min(100, score),
            matchReasons: reasons,
            status: 'flagged',
          });
        }
      }
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export async function GET(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  // Fetch expenses from AP API
  const baseUrl = request.nextUrl.origin;
  const email = request.headers.get('x-admin-email') || '';
  const apRes = await fetch(`${baseUrl}/api/ap`, { headers: { 'x-admin-email': email } });
  const apData = await apRes.json();

  const duplicates = detectDuplicates(apData.expenses || []);
  const potentialSavings = duplicates.filter(d => d.status === 'flagged').reduce((s, d) => s + Math.min(d.expense1.amount, d.expense2.amount), 0);

  return NextResponse.json({
    duplicates,
    totalFlagged: duplicates.length,
    potentialSavings,
    scannedCount: (apData.expenses || []).length,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();

  if (body.action === 'dismiss') {
    dismissedPairs.add(body.pairId);
    return NextResponse.json({ success: true });
  }
  if (body.action === 'confirm') {
    // In production, void the duplicate expense in AP
    return NextResponse.json({ success: true, message: 'Duplicate confirmed — expense flagged for void' });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
