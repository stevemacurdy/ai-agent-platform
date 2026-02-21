import { NextRequest, NextResponse } from 'next/server';

// In-memory user store (production: Supabase)
const registrations: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fullName, email, phone, username, password, company, address, city, state, zip, plan } = body;

  if (!fullName || !email || !username || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // Check duplicate
  if (registrations.find(r => r.email === email || r.username === username)) {
    return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 });
  }

  const user = {
    id: 'user-' + Date.now(),
    fullName, email, phone, username, company,
    address: [address, city, state, zip].filter(Boolean).join(', '),
    role: 'customer',
    plan: plan || 'starter',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  registrations.push(user);

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, plan: user.plan },
    message: 'Account created successfully',
  });
}
