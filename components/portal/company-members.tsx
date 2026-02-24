'use client';
import { useState, useEffect } from 'react';

interface Member {
  id: string;
  email: string;
  role: string;
  status: string;
  user_id: string | null;
  created_at: string;
}

interface Props {
  companyId: string;
  companyName: string;
  themeGradient: string;
}

export default function CompanyMembers({ companyId, companyName, themeGradient }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const loadMembers = async () => {
    try {
      const res = await fetch(`/api/portal/members?company_id=${companyId}&t=${Date.now()}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (e) {
      console.error('Load members error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, [companyId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/portal/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: data.isNewUser
            ? `Invite sent to ${inviteEmail} (new user — they'll need to register)`
            : `${inviteEmail} added to ${companyName}`
        });
        setInviteEmail('');
        setShowInvite(false);
        loadMembers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to invite' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (member: Member) => {
    if (!confirm(`Remove ${member.email} from ${companyName}?`)) return;
    try {
      await fetch(`/api/portal/members?id=${member.id}`, { method: 'DELETE' });
      loadMembers();
    } catch (e) {
      console.error('Remove error:', e);
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-amber-500/10 text-amber-400',
    member: 'bg-blue-500/10 text-blue-400',
    viewer: 'bg-gray-500/10 text-gray-400',
  };

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Team Members</h2>
          <p className="text-xs text-gray-500 mt-1">{members.length} member{members.length !== 1 ? 's' : ''} in {companyName}</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r ${themeGradient} hover:opacity-90 transition`}
        >
          {showInvite ? '✕ Cancel' : '+ Invite Member'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      {/* Invite Form */}
      {showInvite && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Invite New Member</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full bg-[#0A0E15] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-[#0A0E15] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className={`px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r ${themeGradient} hover:opacity-90 transition disabled:opacity-50`}
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-3">If the user doesn&apos;t have a WoulfAI account yet, they&apos;ll need to register first. Their membership will activate automatically.</p>
        </div>
      )}

      {/* Members List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500 text-sm">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 border border-white/5 rounded-xl">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-sm font-semibold text-white">No members yet</h3>
          <p className="text-xs text-gray-500 mt-1">Invite team members to give them access to {companyName}&apos;s agents</p>
        </div>
      ) : (
        <div className="space-y-1">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between bg-[#0A0E15] border border-white/5 rounded-lg px-4 py-3 hover:border-white/10 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                  {member.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm text-white">{member.email}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[member.status] || STATUS_COLORS.pending}`}>
                  {member.status}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role] || ROLE_COLORS.member}`}>
                  {member.role}
                </span>
                <button
                  onClick={() => handleRemove(member)}
                  className="text-gray-600 hover:text-red-400 transition ml-2 text-xs"
                  title="Remove member"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
