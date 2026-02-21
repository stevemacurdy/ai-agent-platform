import { NextRequest, NextResponse } from 'next/server'
import { getSeoData } from '@/lib/seo/seo-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getSeoData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, actionId, companyId } = body

    if (action === 'approve') {
      // In production: update SeoAction status in DB
      return NextResponse.json({ success: true, message: `Action ${actionId} approved and queued for deployment` })
    }

    if (action === 'reject') {
      return NextResponse.json({ success: true, message: `Action ${actionId} rejected` })
    }

    if (action === 'deploy') {
      return NextResponse.json({ success: true, message: `Action ${actionId} deployed successfully` })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
