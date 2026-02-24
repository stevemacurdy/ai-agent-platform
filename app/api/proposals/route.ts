export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const proposals: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectValue, contactName, contactCompany, description } = body;

    const proposal = {
      id: 'prop-' + Date.now(),
      projectName, projectValue, contactName, contactCompany, description,
      status: 'generated',
      pdfUrl: '/proposals/proposal-' + Date.now() + '.pdf',
      createdAt: new Date().toISOString(),
    };
    proposals.push(proposal);

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Proposal generated. Ready to send to CRM.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ proposals, total: proposals.length });
}
