export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const expenses: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'submit') {
      // Monthly send-off to CFO
      const batch = {
        id: 'batch-' + Date.now(),
        expenses: body.expenses || [],
        total: body.total || 0,
        totalMiles: body.totalMiles || 0,
        submittedBy: body.submittedBy || 'sales-rep',
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
      };
      expenses.push(batch);
      return NextResponse.json({ success: true, batchId: batch.id, message: 'Expenses submitted to CFO for review' });
    }

    if (action === 'upload_receipt') {
      return NextResponse.json({ success: true, receiptUrl: '/receipts/receipt-' + Date.now() + '.jpg', message: 'Receipt uploaded' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ batches: expenses, total: expenses.length });
}
