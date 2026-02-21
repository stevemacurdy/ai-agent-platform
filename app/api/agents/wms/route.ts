import { NextRequest, NextResponse } from 'next/server'
import { getWmsData } from '@/lib/wms/wms-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getWmsData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, insightId, waveId, countId } = body

    if (action === 'approve_insight') return NextResponse.json({ success: true, message: `Insight ${insightId} approved` })
    if (action === 'release_wave') return NextResponse.json({ success: true, message: `Wave ${waveId} released to floor` })
    if (action === 'reconcile_count') return NextResponse.json({ success: true, message: `Count ${countId} reconciled` })
    if (action === 'create_po') return NextResponse.json({ success: true, message: 'Purchase order created in Odoo' })
    if (action === 'move_item') return NextResponse.json({ success: true, message: 'Transfer order created' })

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
