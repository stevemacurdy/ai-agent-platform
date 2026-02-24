export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'

// In production: look up OnboardingSession by token in DB
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  // Demo: return mock onboarding data
  return NextResponse.json({
    success: true,
    session: {
      token,
      employeeName: token.includes('Priya') ? 'Priya Patel' : token.includes('Jake') ? 'Jake Morrison' : 'New Hire',
      companyName: 'Woulf Group',
      progress: token.includes('Jake') ? 75 : 42,
      steps: [
        { id: 'welcome', label: 'Welcome', status: 'completed' },
        { id: 'personal', label: 'Personal Info', status: 'completed' },
        { id: 'id_scan', label: 'ID Verification', status: token.includes('Jake') ? 'completed' : 'in_progress' },
        { id: 'photo', label: 'Profile Photo', status: token.includes('Jake') ? 'completed' : 'pending' },
        { id: 'emergency', label: 'Emergency Contacts', status: token.includes('Jake') ? 'completed' : 'pending' },
        { id: 'banking', label: 'Direct Deposit', status: token.includes('Jake') ? 'completed' : 'pending' },
        { id: 'w4', label: 'W-4', status: token.includes('Jake') ? 'in_progress' : 'pending' },
        { id: 'i9', label: 'I-9', status: 'pending' },
        { id: 'handbook', label: 'Handbook', status: 'pending' },
        { id: 'policies', label: 'Policies', status: 'pending' },
        { id: 'benefits', label: 'Benefits', status: 'pending' },
        { id: 'complete', label: 'Complete', status: 'pending' },
      ],
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // In production: save step data, advance progress
  return NextResponse.json({ success: true, message: 'Step saved' })
}
