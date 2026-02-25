// phase-b-invite-flow.js — Run from project root
// B11: Company member invite flow (full UI)
var fs = require('fs');

function mkdirp(dir) { fs.mkdirSync(dir, { recursive: true }); }
var applied = 0;

// ============================================================================
// 1. Migration file
// ============================================================================
console.log('\n--- 1. Migration: invites table ---');
mkdirp('supabase/migrations');
var migration = `-- supabase/migrations/003_invites_table.sql
-- Created: 2026-02-25
-- Description: Persistent invites table replacing in-memory store

CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'employee',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_slugs TEXT[] DEFAULT '{}',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage invites"
    ON invites FOR ALL
    USING (public.current_user_role() IN ('super_admin', 'admin'))
    WITH CHECK (public.current_user_role() IN ('super_admin', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Company admins can view own company invites"
    ON invites FOR SELECT
    USING (company_id IN (SELECT unnest(public.current_user_company_ids())));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_company_id ON invites(company_id);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
`;
fs.writeFileSync('supabase/migrations/003_invites_table.sql', migration);
console.log('  OK: supabase/migrations/003_invites_table.sql');
applied++;

// ============================================================================
// 2. Rewrite /api/admin/invites/route.ts — Supabase-backed
// ============================================================================
console.log('\n--- 2. Rewrite invites API ---');

// Backup old
mkdirp('archive/backups/phase-b');
if (fs.existsSync('app/api/admin/invites/route.ts')) {
  fs.copyFileSync('app/api/admin/invites/route.ts', 'archive/backups/phase-b/invites-route.ts');
}

var invitesRoute = `export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  if (!token) return null;
  const sb = sbAdmin();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['super_admin', 'admin', 'company_admin'].includes(profile.role)) return null;
  return user;
}

export async function POST(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, ...data } = await req.json();
  const sb = sbAdmin();

  if (action === 'create') {
    const { email, full_name, role = 'employee', company_id, agent_slugs = [], message = '' } = data;
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const token = crypto.randomBytes(32).toString('hex');

    // Check for existing pending invite
    const { data: existing } = await sb
      .from('invites')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'A pending invite already exists for this email' }, { status: 409 });
    }

    const { data: invite, error } = await sb.from('invites').insert({
      email: email.toLowerCase(),
      full_name: full_name || '',
      role,
      company_id: company_id || null,
      agent_slugs,
      message,
      token,
      invited_by: adminUser.id,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send invite via Supabase Auth
    const { error: authError } = await sb.auth.admin.inviteUserByEmail(email.toLowerCase(), {
      data: { full_name, role, invite_token: token },
      redirectTo: (process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com') + '/invite/' + token,
    });

    if (authError) {
      // If user already exists in auth, that's ok — just means they need to accept the invite
      if (!authError.message.includes('already been registered')) {
        console.error('[INVITE] Auth invite error:', authError.message);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com';
    const inviteLink = baseUrl + '/invite/' + token;

    return NextResponse.json({
      success: true,
      invite: { id: invite.id, token, role, email: invite.email, expires_at: invite.expires_at },
      link: inviteLink,
    });
  }

  if (action === 'revoke') {
    const { invite_id } = data;
    if (!invite_id) return NextResponse.json({ error: 'invite_id required' }, { status: 400 });

    const { error } = await sb
      .from('invites')
      .update({ status: 'revoked' })
      .eq('id', invite_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'resend') {
    const { invite_id } = data;
    if (!invite_id) return NextResponse.json({ error: 'invite_id required' }, { status: 400 });

    const { data: invite } = await sb
      .from('invites')
      .select('*')
      .eq('id', invite_id)
      .single();

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite not found or not pending' }, { status: 404 });
    }

    // Resend auth invite
    await sb.auth.admin.inviteUserByEmail(invite.email, {
      data: { full_name: invite.full_name, role: invite.role, invite_token: invite.token },
      redirectTo: (process.env.NEXT_PUBLIC_APP_URL || 'https://www.woulfai.com') + '/invite/' + invite.token,
    });

    // Extend expiry
    await sb.from('invites').update({
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    }).eq('id', invite_id);

    return NextResponse.json({ success: true, message: 'Invite resent' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = sbAdmin();
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const company_id = url.searchParams.get('company_id');

  // Lookup by token (for invite acceptance page)
  if (token) {
    const { data: invite } = await sb
      .from('invites')
      .select('*, companies(name, slug)')
      .eq('token', token)
      .single();

    if (!invite) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ invite });
  }

  // List invites (optionally filtered by company)
  let query = sb.from('invites')
    .select('*, companies(name, slug)')
    .order('created_at', { ascending: false });

  if (company_id) {
    query = query.eq('company_id', company_id);
  }

  const { data: invites, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    invites: invites || [],
    total: invites?.length || 0,
    pending: invites?.filter((i: any) => i.status === 'pending').length || 0,
  });
}
`;

fs.writeFileSync('app/api/admin/invites/route.ts', invitesRoute);
console.log('  OK: app/api/admin/invites/route.ts (rewritten with Supabase)');
applied++;

// ============================================================================
// 3. InviteModal component
// ============================================================================
console.log('\n--- 3. InviteModal component ---');

var inviteModal = \`'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Company { id: string; name: string; slug: string }

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedCompanyId?: string
}

export default function InviteModal({ isOpen, onClose, onSuccess, preselectedCompanyId }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('employee')
  const [companyId, setCompanyId] = useState(preselectedCompanyId || '')
  const [companies, setCompanies] = useState<Company[]>([])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      getSupabaseBrowser().from('companies').select('id, name, slug').order('name').then(({ data }) => {
        if (data) setCompanies(data)
      })
      setEmail('')
      setFullName('')
      setRole('employee')
      setCompanyId(preselectedCompanyId || '')
      setResult(null)
    }
  }, [isOpen, preselectedCompanyId])

  if (!isOpen) return null

  const handleSend = async () => {
    if (!email.trim()) return
    setSending(true)
    setResult(null)

    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token

      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (token || ''),
        },
        body: JSON.stringify({
          action: 'create',
          email: email.trim(),
          full_name: fullName.trim(),
          role,
          company_id: companyId || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: 'Invite sent to ' + email })
        setTimeout(() => { onSuccess(); onClose() }, 1500)
      } else {
        setResult({ ok: false, message: data.error || 'Failed to send invite' })
      }
    } catch (err: any) {
      setResult({ ok: false, message: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0D1117] border border-white/10 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-4">Invite Team Member</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="employee">Employee</option>
              <option value="company_admin">Company Admin</option>
              <option value="beta_tester">Beta Tester</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Company</label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              <option value="">No company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {result && (
            <div className={\\\`px-3 py-2 rounded-lg text-sm \\\${result.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}\\\`}>
              {result.message}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !email.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            {sending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  )
}
\`;

fs.writeFileSync('components/InviteModal.tsx', inviteModal);
console.log('  OK: components/InviteModal.tsx');
applied++;

// ============================================================================
// 4. InviteList component — pending invites with resend/revoke
// ============================================================================
console.log('\n--- 4. InviteList component ---');

var inviteList = \`'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Invite {
  id: string
  email: string
  full_name: string
  role: string
  status: string
  created_at: string
  expires_at: string
  companies?: { name: string; slug: string } | null
}

interface InviteListProps {
  companyId?: string
  refreshTrigger?: number
}

export default function InviteList({ companyId, refreshTrigger }: InviteListProps) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  const loadInvites = async () => {
    setLoading(true)
    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      const url = '/api/admin/invites' + (companyId ? '?company_id=' + companyId : '')
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + (token || '') },
      })
      const data = await res.json()
      setInvites(data.invites || [])
    } catch (e) {
      console.error('Load invites error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadInvites() }, [companyId, refreshTrigger])

  const handleAction = async (action: string, inviteId: string) => {
    try {
      const sb = getSupabaseBrowser()
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (token || ''),
        },
        body: JSON.stringify({ action, invite_id: inviteId }),
      })
      loadInvites()
    } catch (e) {
      console.error('Action error:', e)
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'accepted': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'revoked': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'expired': return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  if (loading) return <div className="text-gray-500 text-sm py-4">Loading invites...</div>
  if (invites.length === 0) return <div className="text-gray-500 text-sm py-4">No invites yet</div>

  return (
    <div className="space-y-2">
      {invites.map(inv => (
        <div key={inv.id} className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{inv.email}</div>
            <div className="text-xs text-gray-500">
              {inv.full_name ? inv.full_name + ' \\u00B7 ' : ''}{inv.role}
              {inv.companies ? ' \\u00B7 ' + inv.companies.name : ''}
            </div>
          </div>
          <span className={\\\`px-2 py-0.5 rounded text-xs border \\\${statusColor(inv.status)}\\\`}>
            {inv.status}
          </span>
          {inv.status === 'pending' && (
            <div className="flex gap-1">
              <button
                onClick={() => handleAction('resend', inv.id)}
                className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                title="Resend invite email"
              >
                Resend
              </button>
              <button
                onClick={() => handleAction('revoke', inv.id)}
                className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-all"
                title="Revoke invite"
              >
                Revoke
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
\`;

fs.writeFileSync('components/InviteList.tsx', inviteList);
console.log('  OK: components/InviteList.tsx');
applied++;

// ============================================================================
// 5. Rewrite invite acceptance page
// ============================================================================
console.log('\n--- 5. Invite acceptance page ---');

var acceptPage = \`'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    fullName: '', password: '', confirmPassword: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/invites?token=' + token)
        if (!res.ok) { setError('Invalid or expired invite link'); setLoading(false); return }
        const data = await res.json()
        const inv = data.invite
        if (inv.status === 'accepted') { setError('This invite has already been accepted'); setLoading(false); return }
        if (inv.status === 'revoked') { setError('This invite has been revoked'); setLoading(false); return }
        if (new Date(inv.expires_at) < new Date()) { setError('This invite has expired'); setLoading(false); return }
        setInvite(inv)
        setForm(prev => ({ ...prev, fullName: inv.full_name || '' }))
      } catch { setError('Failed to load invite') }
      setLoading(false)
    }
    load()
  }, [token])

  const handleSubmit = async () => {
    setFormError('')
    if (!form.fullName || form.password.length < 8) { setFormError('Name required, password min 8 characters'); return }
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match'); return }
    setSubmitting(true)

    try {
      // Register via Supabase
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invite.email,
          password: form.password,
          displayName: form.fullName,
          inviteToken: token,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Registration failed')
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login?invited=true'), 2000)
    } catch (err: any) {
      setFormError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">\\u26A0\\uFE0F</div>
        <h1 className="text-xl font-bold text-white mb-2">Invite Issue</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">
          Go to Login
        </Link>
      </div>
    </div>
  )

  if (success) return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">\\u2705</div>
        <h1 className="text-xl font-bold text-white mb-2">Welcome!</h1>
        <p className="text-gray-400">Account created. Redirecting to login...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#06080D] flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-white/10 rounded-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-3">W</div>
          <h1 className="text-xl font-bold text-white">Join WoulfAI</h1>
          <p className="text-sm text-gray-400 mt-1">You've been invited as <span className="text-blue-400">{invite.role}</span></p>
          {invite.companies && (
            <p className="text-xs text-gray-500 mt-1">Company: {invite.companies.name}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input type="email" value={invite.email} disabled
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
            <input type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Password * (min 8 characters)</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirm Password *</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500/50 focus:outline-none" />
          </div>

          {formError && (
            <div className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">{formError}</div>
          )}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-all">
            {submitting ? 'Creating Account...' : 'Accept Invite & Create Account'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
\`;

mkdirp('app/invite/[token]');
fs.writeFileSync('app/invite/[token]/page.tsx', acceptPage);
console.log('  OK: app/invite/[token]/page.tsx (rewritten)');
applied++;

// ============================================================================
console.log('\\n========================================');
console.log('Applied: ' + applied + ' items');
console.log('========================================');
console.log('\\nManual steps:');
console.log('  1. Run 003_invites_table.sql in Supabase SQL Editor');
console.log('  2. npm run build');
console.log('  3. git add -A && git commit -m "Phase B11: invite flow with Supabase persistence"');
console.log('  4. vercel --prod && git push');
