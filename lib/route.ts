import { NextRequest, NextResponse } from 'next/server';
import { getCollectionsData } from '@/lib/collections-data';
import { verifyToken, getCompanyId } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  let companyId: string | undefined;
  let authenticated = false;

  if (user) {
    companyId = getCompanyId(req, user) || undefined;
    authenticated = true;
  }

  const view = req.nextUrl.searchParams.get('view') || 'dashboard';

  try {
    const data = await getCollectionsData(companyId as any);

    if (!authenticated && data.source === 'live') {
      const demoData = await getCollectionsData(undefined as any);
      return buildResponse(view, demoData, req);
    }

    return buildResponse(view, data, req);
  } catch (e: any) {
    console.error('Collections API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function buildResponse(view: string, data: any, req: NextRequest): NextResponse {
  switch (view) {
    case 'dashboard':
      return NextResponse.json({
        source: data.source,
        provider: data.provider,
        summary: data.summary,
        accounts: data.accounts.slice(0, 5),
        aging: data.aging,
      });

    case 'accounts':
      return NextResponse.json({
        source: data.source,
        accounts: data.accounts,
        summary: data.summary,
      });

    case 'account-detail': {
      const id = req.nextUrl.searchParams.get('id');
      const account = data.accounts.find((a: any) => a.id === id);
      if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      const workflows = data.workflows.filter((w: any) => w.accountId === id);
      return NextResponse.json({ source: data.source, account, workflows });
    }

    case 'aging':
      return NextResponse.json({
        source: data.source,
        aging: data.aging,
        totalAR: data.summary.totalAR,
      });

    case 'workflows':
      return NextResponse.json({
        source: data.source,
        workflows: data.workflows,
        totalPending: data.workflows.filter((w: any) => w.status === 'pending').length,
      });

    default:
      return NextResponse.json({ error: 'Invalid view. Use: dashboard, accounts, account-detail, aging, workflows' }, { status: 400 });
  }
}
