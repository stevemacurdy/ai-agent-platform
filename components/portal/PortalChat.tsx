'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export default function PortalChat({ customerCode }: { customerCode: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your Clutch 3PL assistant. I can help you with inventory questions, order status, billing inquiries, and more. How can I help you today?', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/agents/3pl-portal/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-message', customerCode, message: input.trim(), history: messages }),
      });
      const data = await res.json();
      const aiMsg: Message = { role: 'assistant', content: data.reply || 'I\'m sorry, I encountered an issue. Please try again or click "Talk to a Human" above.', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      if (data.escalated) setEscalated(true);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date().toISOString() }]);
    }
    setLoading(false);
  }

  function handleEscalate() {
    setEscalated(true);
    setMessages(prev => [...prev, {
      role: 'system',
      content: 'I\'ve connected you with our support team. A representative will respond within 4 business hours. Your conversation history has been forwarded.',
      timestamp: new Date().toISOString(),
    }]);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2A9D8F] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Clutch 3PL Support</p>
            <p className="text-xs text-gray-500">{escalated ? 'Escalated to human support' : 'AI-powered assistant'}</p>
          </div>
        </div>
        {!escalated && (
          <button onClick={handleEscalate} className="text-xs font-medium text-[#1B2A4A] bg-[#1B2A4A]/5 hover:bg-[#1B2A4A]/10 px-3 py-1.5 rounded-lg transition-colors">
            Talk to a Human
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-[#1B2A4A] text-white rounded-br-md' :
              msg.role === 'system' ? 'bg-amber-50 text-amber-800 border border-amber-200 rounded-bl-md' :
              'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              {msg.content}
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={escalated ? 'A team member will respond soon...' : 'Ask about inventory, orders, billing...'}
            disabled={escalated}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#2A9D8F] focus:ring-1 focus:ring-[#2A9D8F]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || escalated}
            className="px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-[#1B2A4A]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
