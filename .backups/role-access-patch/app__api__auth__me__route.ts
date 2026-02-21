import { NextRequest, NextResponse } from 'next/server'
import { findUserById, safeUser } from '@/lib/auth-store'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    const user = findUserById(userId)
    if (!user || user.status === 'suspended') {
      return NextResponse.json({ success: false, error: 'Session invalid' }, { status: 401 })
    }
    return NextResponse.json({ success: true, user: safeUser(user) })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
