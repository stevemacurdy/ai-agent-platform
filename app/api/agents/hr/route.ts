export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { getHRData } from '@/lib/hr/hr-data'
import { trackUsage } from '@/lib/usage-tracker';

export async function GET(request: NextRequest) {
  trackUsage(request, 'hr');
  const companyId = request.nextUrl.searchParams.get('companyId') || 'woulf'
  const data = getHRData(companyId)
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  try {
    trackUsage(request, 'hr', 'chat');
    const body = await request.json()
    const { action } = body
    if (action === 'approve_insight') return NextResponse.json({ success: true, message: 'Insight approved' })
    if (action === 'approve_pto') return NextResponse.json({ success: true, message: 'PTO request approved' })
    if (action === 'approve_time') return NextResponse.json({ success: true, message: 'Timesheet approved' })
    if (action === 'resolve_alert') return NextResponse.json({ success: true, message: 'Alert resolved' })
    if (action === 'generate_onboarding_link') {
      const token = 'onb_' + Date.now().toString(36)
      return NextResponse.json({ success: true, token, link: '/onboarding/' + token })
    }
    if (action === 'post_job') return NextResponse.json({ success: true, message: 'Job posted to selected platforms' })
    if (action === 'send_offer') return NextResponse.json({ success: true, message: 'Offer letter sent via DocuSign' })
    if (action === 'advance_applicant') return NextResponse.json({ success: true, message: 'Applicant advanced to next stage' })
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
