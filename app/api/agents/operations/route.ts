import { NextRequest, NextResponse } from 'next/server'
import { getOpsData } from '@/lib/ops/ops-data'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getOpsData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    if (action === 'approve_insight') return NextResponse.json({ success: true, message: 'Insight approved — action dispatched' })
    if (action === 'submit_report') return NextResponse.json({ success: true, message: 'Field report submitted' })
    if (action === 'advance_wo') return NextResponse.json({ success: true, message: 'Work order advanced' })
    if (action === 'requisition_materials') return NextResponse.json({ success: true, message: 'Material requisition submitted to WMS' })
    if (action === 'reassign_crew') return NextResponse.json({ success: true, message: 'Crew reassignment confirmed' })
    if (action === 'schedule_maintenance') return NextResponse.json({ success: true, message: 'Maintenance scheduled' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
