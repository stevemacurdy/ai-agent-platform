export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, safeUser, getEligibleRoles } from '@/lib/auth-store'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }
    const user = authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
    return NextResponse.json({ success: true, user: safeUser(user), eligibleRoles: getEligibleRoles(user) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
