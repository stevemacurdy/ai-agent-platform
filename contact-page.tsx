'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Bot, ArrowLeft, User } from 'lucide-react';

function EnterpriseChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    setStarted(true);
    setSending(true);
    try {
      const res = await fetch('/api/chat/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: "Hi, I'm interested in the enterprise plan." }] }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setMessages([
        { role: 'user', content: "Hi, I'm interested in the enterprise plan." },
        { role: 'assistant', content: data.reply },
      ]);
    } catch {
      setMessages([{ role: 'assistant', content: "Welcome! I'm excited to learn about your business and show you how AI can transform your operations. What's your name and what company are you with?" }]);
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
      const res = await fetch('/api/chat/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, session_id: sessionId }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "I apologize for the hiccup. Could you repeat that?" }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #233756)', boxShadow: '0 8px 24px rgba(27,42,74,0.3)' }}>
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4" style={{ color: '#1B2A4A', fontFamily: "'Outfit', sans-serif" }}>
          Enterprise Solutions<br />
          <span style={{ color: '#F5920B' }}>Consultation</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">
          Our AI Solutions Consultant will learn about your business, identify automation opportunities, and show you exactly how WoulfAI can transform your operations.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['Personalized ROI Analysis', 'Industry-Specific Insights', 'Custom Employee Recommendations', 'Implementation Roadmap'].map(tag => (
            <span key={tag} className="px-3.5 py-1.5 bg-white rounded-full text-xs font-medium text-gray-500 border border-gray-200">{tag}</span>
          ))}
        </div>
        <button onClick={startChat}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[15px] text-white transition-all hover:-translate-y-0.5"
          style={{ background: '#F5920B', boxShadow: '0 8px 32px rgba(245,146,11,0.35)' }}>
          <Bot className="w-5 h-5" /> Start Your Consultation
        </button>
        <div className="mt-6">
          <Link href="/contact" className="text-sm text-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Or fill out the contact form instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200/60 rounded-[20px] overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(27,42,74,0.1)' }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: '#1B2A4A' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(42,157,143,0.2)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">WoulfAI Solutions Consultant</div>
            <div className="text-[10px] flex items-center gap-1" style={{ color: '#2A9D8F' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2A9D8F' }} />
              Enterprise Consultation
            </div>
          </div>
          <Link href="/contact" className="ml-auto text-xs text-white/40 hover:text-white/70 transition">
            Switch to Form
          </Link>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-[500px] overflow-y-auto p-6 space-y-4" style={{ background: '#FAFBFC' }}>
          {messages.filter(m => !(m.role === 'user' && m.content === "Hi, I'm interested in the enterprise plan.")).map((msg, i) => (
            <div key={i} className={'flex gap-3 ' + (msg.role === 'user' ? 'justify-end' : '')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#1B2A4A' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ' +
                (msg.role === 'user'
                  ? 'text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm')}
                style={msg.role === 'user' ? { background: '#2A9D8F' } : {}}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#E5E7EB' }}>
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1B2A4A' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
              style={{ background: '#FAFBFC', border: '1.5px solid #E5E7EB', color: '#1A1A2E' }}
              onFocus={(e) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              disabled={sending}
            />
            <button onClick={sendMessage} disabled={!input.trim() || sending}
              className="px-4 py-3 rounded-xl text-white transition-all hover:-translate-y-px disabled:opacity-40"
              style={{ background: '#2A9D8F' }}>
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-2 text-center">
            Powered by WoulfAI &middot; Your data is kept confidential
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const params = useSearchParams();
  const isEnterprise = params.get('interest') === 'enterprise';
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', employees: '', interest: '', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          source: 'contact_form',
          interest: formData.interest,
          message: [
            formData.employees ? `Company size: ${formData.employees}` : '',
            formData.message,
          ].filter(Boolean).join('\n'),
        }),
      });

      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setError(data.error || 'Something went wrong. Please try again.');
    } catch (err) {
      setError('Connection error. Please try again.');
    }
    setSubmitting(false);
  };

  const inputStyle = { background: '#FFFFFF', border: '1.5px solid #E5E7EB', color: '#1A1A2E' };
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; },
  };

  return (
    <div className="min-h-screen" style={{ background: '#F4F5F7', color: '#1A1A2E', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`h1, h2, h3, h4 { font-family: 'Outfit', 'DM Sans', sans-serif; }`}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(27,42,74,0.97)', backdropFilter: 'blur(16px) saturate(1.6)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between h-[64px]">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={36} height={36} className="drop-shadow-lg group-hover:scale-105 transition-transform" />
            <span className="text-lg font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Woulf<span style={{ color: '#F5920B' }}>AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/solutions" className="text-sm text-white/60 hover:text-white transition-colors">Solutions</Link>
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/case-studies" className="text-sm text-white/60 hover:text-white transition-colors">Case Studies</Link>
            <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white px-4 py-2 transition-colors">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px"
              style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
              Hire Your AI Team
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {isEnterprise ? (
          <EnterpriseChat />
        ) : (
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Side - Info */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: '#2A9D8F' }}>Get in Touch</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: '#1B2A4A' }}>
                Let&apos;s Build Something<br />
                <span style={{ color: '#F5920B' }}>Amazing Together</span>
              </h1>
              <p className="mt-5 text-lg text-gray-500">
                Ready to transform your operations with AI? We&apos;re here to help you get started.
              </p>

              <div className="mt-12 space-y-6">
                {[
                  { icon: Mail, color: '#2A9D8F', label: 'Email Us', value: 'solutions@woulfgroup.com' },
                  { icon: Phone, color: '#F5920B', label: 'Call Us', value: '(801) 688-1745' },
                  { icon: MapPin, color: '#1B2A4A', label: 'Location', value: 'Grantsville, Utah' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}10` }}>
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px]" style={{ color: '#1B2A4A' }}>{item.label}</h3>
                      <p className="text-gray-500 text-[14px]">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-200/60" style={{ boxShadow: '0 1px 3px rgba(27,42,74,0.04)' }}>
                <h3 className="font-bold text-[15px] mb-4" style={{ color: '#1B2A4A' }}>Quick Actions</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link href="/contact?interest=enterprise" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#2A9D8F]/30 hover:shadow-md transition-all"
                    style={{ background: 'rgba(42,157,143,0.04)' }}>
                    <Bot className="w-5 h-5" style={{ color: '#2A9D8F' }} />
                    <span className="text-sm font-medium" style={{ color: '#1B2A4A' }}>AI Consultation</span>
                  </Link>
                  <Link href="/pricing" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#F5920B]/30 hover:shadow-md transition-all">
                    <MessageSquare className="w-5 h-5" style={{ color: '#F5920B' }} />
                    <span className="text-sm font-medium" style={{ color: '#1B2A4A' }}>View Pricing</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div>
              <div className="p-8 bg-white rounded-[20px] border border-gray-200/60" style={{ boxShadow: '0 4px 12px rgba(27,42,74,0.06)' }}>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(42,157,143,0.1)' }}>
                      <CheckCircle2 className="w-8 h-8" style={{ color: '#2A9D8F' }} />
                    </div>
                    <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1B2A4A' }}>Thank You!</h2>
                    <p className="text-gray-500 mb-6">
                      We&apos;ve received your message and will get back to you within 24 hours.
                    </p>
                    <Link href="/" className="font-semibold" style={{ color: '#F5920B' }}>Return to Homepage</Link>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-extrabold mb-6" style={{ color: '#1B2A4A' }}>Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Name *</label>
                          <input type="text" required value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                            style={inputStyle} {...focusHandlers} placeholder="John Smith" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Email *</label>
                          <input type="email" required value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                            style={inputStyle} {...focusHandlers} placeholder="john@company.com" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Company</label>
                          <input type="text" value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                            style={inputStyle} {...focusHandlers} placeholder="Company Name" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Company Size</label>
                          <select value={formData.employees}
                            onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                            style={inputStyle} {...focusHandlers}>
                            <option value="">Select...</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-500">201-500 employees</option>
                            <option value="500+">500+ employees</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>What are you interested in?</label>
                        <select value={formData.interest}
                          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                          style={inputStyle} {...focusHandlers}>
                          <option value="">Select an option...</option>
                          <option value="wms">AI WMS Employee &mdash; Warehouse Management</option>
                          <option value="sales">AI Sales Employee &mdash; CRM &amp; Coaching</option>
                          <option value="cfo">AI Financial Employee &mdash; Financial Automation</option>
                          <option value="marketing">AI Marketing Employee &mdash; Campaigns</option>
                          <option value="support">AI Support Employee &mdash; Customer Service</option>
                          <option value="multiple">Multiple AI Employees</option>
                          <option value="enterprise">Enterprise Solution</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1B2A4A' }}>Message</label>
                        <textarea value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all resize-none"
                          style={inputStyle}
                          onFocus={(e) => { e.target.style.borderColor = '#2A9D8F'; e.target.style.boxShadow = '0 0 0 3px rgba(42,157,143,0.1)'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                          placeholder="Tell us about your project or ask any questions..." />
                      </div>
                      {error && (
                        <div className="px-4 py-3 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(220,79,79,0.08)', color: '#DC4F4F', border: '1px solid rgba(220,79,79,0.15)' }}>
                          {error}
                        </div>
                      )}
                      <button type="submit" disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all hover:-translate-y-px disabled:opacity-60"
                        style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}>
                        {submitting ? 'Sending...' : <>Send Message <Send className="w-4 h-4" /></>}
                      </button>
                      <p className="text-xs text-gray-400 text-center">
                        By submitting, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/terms" className="underline">Terms of Service</Link>.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/woulf-badge.png" alt="Woulf Group" width={20} height={20} className="opacity-50" />
            <span className="text-[11px] text-gray-400">&copy; 2026 WoulfAI by Woulf Group</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-gray-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
