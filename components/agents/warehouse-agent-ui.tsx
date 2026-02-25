// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';

interface KPI {
  label: string;
  value: string;
  color?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WarehouseAgentUIProps {
  title: string;
  icon: string;
  subtitle: string;
  apiPath: string;
  quickPrompts: string[];
  gradientFrom: string;
  gradientTo: string;
}

const COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  purple: 'text-purple-400',
  cyan: 'text-cyan-400',
  red: 'text-red-400',
  pink: 'text-pink-400',
};

export default function WarehouseAgentUI({
  title, icon, subtitle, apiPath, quickPrompts, gradientFrom, gradientTo,
}: WarehouseAgentUIProps) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [extraData, setExtraData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(apiPath)
      .then(r => r.json())
      .then(d => {
        if (d.kpis) setKpis(d.kpis);
        setExtraData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [apiPath]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || thinking) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages.slice(-10) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.error || 'Something went wrong.',
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect to the agent.' }]);
    }

    setThinking(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-white/40">{subtitle}</p>
        </div>
        <a
          href="/warehouse"
          className="ml-auto px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          Warehouse Portal →
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 h-20 animate-pulse" />
          ))
        ) : (
          kpis.map(k => (
            <div key={k.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-[10px] text-white/40 uppercase tracking-wider">{k.label}</div>
              <div className={`text-2xl font-bold mt-1 ${COLOR_MAP[k.color || 'blue'] || 'text-white'}`}>
                {k.value}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary panels from extra data */}
      {!loading && extraData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extraData.order_summary?.by_status && Object.keys(extraData.order_summary.by_status).length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Orders by Status</h3>
              <div className="space-y-2">
                {Object.entries(extraData.order_summary.by_status).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-white/70 capitalize">{status}</span>
                    <span className="text-sm font-mono text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {extraData.inventory_summary?.by_temperature_zone && Object.keys(extraData.inventory_summary.by_temperature_zone).length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Inventory by Zone</h3>
              <div className="space-y-2">
                {Object.entries(extraData.inventory_summary.by_temperature_zone).map(([zone, qty]: [string, any]) => (
                  <div key={zone} className="flex items-center justify-between">
                    <span className="text-sm text-white/70 capitalize">{zone}</span>
                    <span className="text-sm font-mono text-white">{qty.toLocaleString()} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Chat */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-sm font-semibold text-white/80">{title} AI</h2>
          <span className="text-[10px] text-white/30 ml-2">Queries live warehouse data</span>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !thinking && (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm mb-4">Ask me anything about warehouse operations.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600/30 border border-blue-500/30 text-white'
                  : 'bg-white/5 border border-white/10 text-white/90'
              }`}>
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</pre>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-white/30">Querying warehouse data...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about inventory, orders, BOLs, customers..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              disabled={thinking}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={thinking || !input.trim()}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
