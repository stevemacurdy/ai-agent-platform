'use client';
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

interface ChatSession {
  id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  source: string;
  status: string;
  created_at: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function AdminChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({});

  const getAuthToken = async (): Promise<string | null> => {
    const sb = getSupabaseBrowser();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token || null;
  };

  const loadSessions = async () => {
    const token = await getAuthToken();
    if (!token) return;

    const res = await fetch('/api/chat/sessions', {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions || []);
    }
    setLoading(false);
  };

  const loadMessages = async (sessionId: string) => {
    if (sessionMessages[sessionId]) return;
    const token = await getAuthToken();
    if (!token) return;

    const res = await fetch('/api/chat/sessions?session_id=' + sessionId, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.ok) {
      const data = await res.json();
      setSessionMessages(prev => ({ ...prev, [sessionId]: data.messages || [] }));
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const toggleSession = (id: string) => {
    if (expandedSession === id) {
      setExpandedSession(null);
    } else {
      setExpandedSession(id);
      loadMessages(id);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chat Conversations</h1>
        <p className="text-sm text-[#6B7280] mt-1">AI sales chat sessions from website visitors</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#9CA3AF] text-sm">Loading conversations...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">💬</div>
          <div className="text-sm text-[#9CA3AF]">No chat sessions yet. They will appear here when visitors use the chat widget.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSession(s.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white shadow-sm transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-sm">
                    {s.visitor_name ? s.visitor_name[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {s.visitor_name || 'Anonymous Visitor'}
                      </span>
                      <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " +
                        (s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-500/10 text-[#9CA3AF]')}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {s.visitor_email && <span className="text-[10px] text-blue-600">{s.visitor_email}</span>}
                      <span className="text-[10px] text-[#6B7280]">{timeAgo(s.created_at)}</span>
                      <span className="text-[10px] text-[#6B7280]">via {s.source}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#6B7280]">
                  {expandedSession === s.id ? '▲' : '▼'}
                </span>
              </button>

              {expandedSession === s.id && (
                <div className="px-5 pb-4 border-t border-[#E5E7EB]">
                  <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
                    {(sessionMessages[s.id] || []).map(msg => (
                      <div key={msg.id} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={"max-w-[80%] px-4 py-2.5 rounded-2xl text-sm " +
                          (msg.role === 'user'
                            ? 'bg-blue-600/20 text-blue-200 rounded-br-md'
                            : 'bg-white/[0.04] text-[#6B7280] rounded-bl-md')}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {!(sessionMessages[s.id]) && (
                      <div className="text-center text-[#6B7280] text-xs py-4">Loading messages...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
