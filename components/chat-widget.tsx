'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hey there! I'm Woulf, WoulfAI's sales assistant. I can help you find the right AI agents for your business. What kind of work are you looking to automate?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pulse, setPulse] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (open) setPulse(false);
  }, [open]);

  // Pulse animation timeout
  useEffect(() => {
    const timer = setTimeout(() => setPulse(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          session_id: sessionId,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      }
      if (data.session_id) {
        setSessionId(data.session_id);
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. You can reach our team at solutions@woulfgroup.com or (801) 688-1745.",
      }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[380px] max-h-[520px] bg-[#0A0E15] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Woulf</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-[10px] text-gray-400">AI Sales Assistant</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px] max-h-[340px]">
            {messages.map((msg, i) => (
              <div key={i} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={"max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed " +
                  (msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white/[0.06] text-gray-300 rounded-bl-md border border-white/5')}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {['What agents do you offer?', 'Pricing info', 'I need a demo'].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-[11px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/20 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none transition"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="p-2.5 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-600">Powered by WoulfAI</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={"fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all duration-200 " +
          (open
            ? 'bg-white/10 border border-white/20 rotate-0'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-110')}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {pulse && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
            )}
          </>
        )}
      </button>
    </>
  );
}
