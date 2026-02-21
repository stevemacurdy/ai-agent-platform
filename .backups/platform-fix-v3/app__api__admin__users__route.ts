import { NextRequest, NextResponse } from 'next/server'
import { userStore, createUser, updateUser, removeUser, safeUser, type UserRole } from '@/lib/auth-store'

export async function GET() {
  return NextResponse.json({
    users: userStore.map(u => ({
      ...safeUser(u),
      generatedPassword: u.status === 'invited' ? u.password : undefined,
    })),
    total: userStore.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'invite') {
      const { email, name, role, agents, companyId, companyName } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      const existing = userStore.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existing) return NextResponse.json({ error: 'User exists' }, { status: 409 })
      const result = createUser({ email, name, role, agents, companyId, companyName })
      return NextResponse.json({ success: true, user: safeUser(result.user), credentials: { email: result.user.email, password: result.password, inviteCode: result.inviteCode, loginUrl: '/login' } })
    }

    if (action === 'update_role') {
      const { userId, role, agents } = body
      const updated = updateUser(userId, { role, agents })
      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true, user: safeUser(updated) })
    }

    if (action === 'update_agents') {
      const { userId, agents } = body
      const updated = updateUser(userId, { agents })
      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true, user: safeUser(updated) })
    }

    if (action === 'suspend') {
      const { userId } = body
      const user = userStore.find(u => u.id === userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      user.status = user.status === 'suspended' ? 'active' : 'suspended'
      return NextResponse.json({ success: true, user: safeUser(user) })
    }

    if (action === 'remove') {
      const { userId } = body
      const success = removeUser(userId)
      if (!success) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ success: true })
    }

    if (action === 'reset_password') {
      const { userId } = body
      const user = userStore.find(u => u.id === userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      const WORDS = ['alpha','bravo','delta','echo','foxtrot','golf','hotel','nova','peak','ridge','slate']
      const w1 = WORDS[Math.floor(Math.random() * WORDS.length)]
      const w2 = WORDS[Math.floor(Math.random() * WORDS.length)]
      user.password = w1 + '-' + w2 + '-' + String(Math.floor(Math.random() * 90) + 10)
      return NextResponse.json({ success: true, newPassword: user.password })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
