'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Plus, Mic, MicOff, Clock, Target, TrendingUp } from 'lucide-react';

interface Message { role: string; content: string; }
interface Session { id: string; date: string; preview: string; messages: Message[]; }

export default function SalesCoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startSession = async (type: 'call' | 'meeting' | 'email' | 'general') => {
    setStarted(true);
    setSending(true);
    const openers: Record<string, string> = {
      call: "I just finished a sales call and want to debrief.",
      meeting: "I just had a prospect meeting and want to break it down.",
      email: "I need help with a sales email I'm working on.",
      general: "I want to work on my sales skills.",
    };
    const userMsg = openers[type];
    try {
      const res = await fetch('/api/agents/sales/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMsg }] }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setMessages([
        { role: 'user', content: userMsg },
        { role: 'assistant', content: data.reply },
      ]);
    } catch {
      setMessages([
        { role: 'user', content: userMsg },
        { role: 'assistant', content: "Hey! Let's debrief. Walk me through what happened — who'd you talk to and what was the goal?" },
      ]);
    }
    setSending(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setSending(true);

    try {
      const res = await fetch('/api/agents/sales/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, session_id: sessionId }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, had a hiccup. Could you repeat that?" }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Transcribe via Whisper
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');
        formData.append('model', 'whisper-1');
        try {
          const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + (process.env.NEXT_PUBLIC_OPENAI_API_KEY || '') },
            body: formData,
          });
          const data = await res.json();
          if (data.text) setInput(prev => prev + ' ' + data.text);
        } catch {
          // Fallback: just note that recording was captured
          setInput(prev => prev + ' [Voice note recorded - transcription unavailable]');
        }
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      alert('Microphone access denied. Please allow microphone access to use voice input.');
    }
  };

  const newSession = () => {
    if (messages.length > 0) {
      setSessions(prev => [...prev, {
        id: sessionId || Date.now().toString(),
        date: new Date().toLocaleDateString(),
        preview: messages.find(m => m.role === 'user')?.content.slice(0, 60) || 'Session',
        messages: [...messages],
      }]);
    }
    setMessages([]);
    setSessionId(null);
    setStarted(false);
  };

  if (!started) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏆</div>
          <div>
            <h1 className="text-2xl font-bold">Sales Coach</h1>
            <p className="text-sm text-[#6B7280]">AI-powered post-call coaching & skills development</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[9px] text-[#9CA3AF] uppercase"><Clock className="w-3 h-3" /> Sessions This Week</div>
            <div className="text-2xl font-bold mt-1">{sessions.length}</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[9px] text-[#9CA3AF] uppercase"><Target className="w-3 h-3" /> Focus Areas</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">Discovery</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[9px] text-[#9CA3AF] uppercase"><TrendingUp className="w-3 h-3" /> Improvement</div>
            <div className="text-2xl font-bold mt-1 text-emerald-600">+12%</div>
          </div>
        </div>

        {/* Start New Session */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Start a Coaching Session</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'call' as const, icon: '📞', label: 'Call Debrief', desc: 'Review a sales call' },
              { type: 'meeting' as const, icon: '🤝', label: 'Meeting Review', desc: 'Break down a meeting' },
              { type: 'email' as const, icon: '✉️', label: 'Email Help', desc: 'Craft sales emails' },
              { type: 'general' as const, icon: '🎯', label: 'Skill Building', desc: 'Work on sales skills' },
            ].map(s => (
              <button key={s.type} onClick={() => startSession(s.type)}
                className="flex flex-col items-center gap-2 p-5 bg-white shadow-sm border border-[#E5E7EB] rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition text-center group">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-sm font-semibold text-white group-hover:text-blue-600 transition">{s.label}</span>
                <span className="text-[10px] text-[#9CA3AF]">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Sessions</h3>
            <div className="space-y-2">
              {sessions.slice(-5).reverse().map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <div className="text-sm text-white">{s.preview}...</div>
                    <div className="text-[10px] text-[#9CA3AF]">{s.date} · {s.messages.filter(m => m.role === 'user').length} exchanges</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">💡 How to Get the Most from Your Coach</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-[#6B7280]">
            <div>
              <div className="text-white font-medium mb-1">Be Honest</div>
              <p className="text-xs">The coach can only help if you tell it what really happened — including the uncomfortable parts.</p>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Share Details</div>
              <p className="text-xs">Specific quotes, reactions, and moments make coaching much more precise and useful.</p>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Use Voice</div>
              <p className="text-xs">Tap the mic to speak naturally instead of typing — it&apos;s faster and more like a real debrief.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active coaching session
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-lg">🏆</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">Sales Coach</div>
            <div className="text-[10px] text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Coaching Session Active
            </div>
          </div>
          <button onClick={newSession} className="flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm rounded-lg text-xs text-[#6B7280] hover:bg-gray-100 hover:text-[#1B2A4A] transition">
            <Plus className="w-3 h-3" /> New Session
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.filter(m => !(m === messages[0] && m.role === 'user')).map((msg, i) => (
            <div key={i} className={'flex gap-3 ' + (msg.role === 'user' ? 'justify-end' : '')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">🏆</span>
                </div>
              )}
              <div className={'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ' +
                (msg.role === 'user'
                  ? 'bg-[#1B2A4A] text-white rounded-br-sm'
                  : 'bg-white/[0.06] text-[#4B5563] rounded-bl-sm')}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#6B7280]" />
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🏆</span>
              </div>
              <div className="bg-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-[#E5E7EB]">
          <div className="flex gap-3">
            <button onClick={toggleRecording}
              className={'p-3 rounded-xl transition ' + (recording ? 'bg-rose-500 text-white animate-pulse' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100 hover:text-[#1B2A4A]')}>
              {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={recording ? 'Recording... click mic to stop' : 'Tell me about your call...'}
              rows={1}
              className="flex-1 px-4 py-3 bg-white border border-[#E5E7EB] shadow-sm rounded-xl text-sm text-white placeholder:text-[#6B7280] focus:border-amber-500 focus:outline-none resize-none"
              disabled={sending}
            />
            <button onClick={sendMessage} disabled={!input.trim() || sending}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-[10px] text-[#6B7280] mt-2 text-center">
            Your coaching sessions are confidential • Personality profiled after 5+ messages
          </div>
        </div>
      </div>
    </div>
  );
}
