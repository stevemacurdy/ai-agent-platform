export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';

const ADMINS = ['steve@woulfgroup.com', 'stevemacurdy@gmail.com', 'admin'];
function getAdmin(req: NextRequest): string | null {
  const h = req.headers.get('x-admin-email');
  return h && ADMINS.includes(h.toLowerCase()) ? h : null;
}

export async function POST(request: NextRequest) {
  if (!getAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const body = await request.json();
  try {
    const odoo = getOdooClient();
    switch (body.action) {
      case 'update-invoice': {
        if (!body.invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
        const ok = await odoo.updateInvoice(body.invoiceId, body.values);
        return NextResponse.json({ success: ok });
      }
      case 'update-contact': {
        if (!body.partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
        const ok = await odoo.updateContact(body.partnerId, body.values);
        return NextResponse.json({ success: ok });
      }
      case 'create-invoice': {
        if (!body.partnerId || !body.lines?.length) return NextResponse.json({ error: 'partnerId and lines required' }, { status: 400 });
        const id = await odoo.createInvoice(body.partnerId, body.lines);
        return NextResponse.json({ success: true, invoiceId: id });
      }
      case 'get-partner': {
        if (!body.partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
        const partner = await odoo.getPartnerDetail(body.partnerId);
        return NextResponse.json({ partner });
      }
      case 'get-invoice-lines': {
        if (!body.invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
        const lines = await odoo.getInvoiceLines(body.invoiceId);
        return NextResponse.json({ lines });
      }
      case 'get-attachments': {
        if (!body.model || !body.resId) return NextResponse.json({ error: 'model and resId required' }, { status: 400 });
        // @ts-ignore
        const attachments = await odoo.getAttachments(body.model, body.resId);
        return NextResponse.json({ attachments });
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('CFO Write API error:', error);
    return NextResponse.json({ error: error.message || 'Write failed' }, { status: 500 });
  }
}
