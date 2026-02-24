export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { getMarketingData } from '@/lib/marketing/marketing-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getMarketingData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, actionId, contentId, aiEngine } = body

    if (action === 'approve_action') {
      return NextResponse.json({ success: true, message: `Action ${actionId} approved` })
    }
    if (action === 'approve_content') {
      return NextResponse.json({ success: true, message: `Content ${contentId} approved for publishing` })
    }
    if (action === 'generate_strategy') {
      return NextResponse.json({ success: true, message: '30-day strategy generated via Gemini', engine: 'gemini' })
    }
    if (action === 'generate_blast') {
      return NextResponse.json({ success: true, message: 'Fast-blast content generated via Nano Banana', engine: 'nano_banana', count: 7 })
    }
    if (action === 'schedule_content') {
      return NextResponse.json({ success: true, message: `Content ${contentId} scheduled` })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
