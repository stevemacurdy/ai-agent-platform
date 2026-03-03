'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UsageData {
  current: number;
  limit: number;
  percentage: number;
  tier: string;
}

export default function UsageBanner() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/usage-stats')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.usage) setUsage(d.usage);
      })
      .catch(() => {});
  }, []);

  if (!usage || dismissed || usage.percentage < 50) return null;

  const level = usage.percentage >= 100 ? 'exceeded'
    : usage.percentage >= 90 ? 'critical'
    : usage.percentage >= 75 ? 'warning'
    : 'info';

  const colors: Record<string, { bg: string; text: string; border: string }> = {
    info: { bg: 'rgba(42,157,143,0.06)', text: '#2A9D8F', border: 'rgba(42,157,143,0.15)' },
    warning: { bg: 'rgba(245,146,11,0.06)', text: '#F5920B', border: 'rgba(245,146,11,0.15)' },
    critical: { bg: 'rgba(239,68,68,0.06)', text: '#DC2626', border: 'rgba(239,68,68,0.15)' },
    exceeded: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626', border: 'rgba(239,68,68,0.25)' },
  };

  const c = colors[level];
  const messages: Record<string, string> = {
    info: `You've used ${usage.percentage}% of your monthly actions (${usage.current}/${usage.limit}).`,
    warning: `⚠️ ${usage.percentage}% of monthly actions used (${usage.current}/${usage.limit}). Consider upgrading.`,
    critical: `🔴 ${usage.percentage}% used! Only ${usage.limit - usage.current} actions remaining this month.`,
    exceeded: `🚫 Monthly action limit reached (${usage.current}/${usage.limit}). Upgrade to continue.`,
  };

  return (
    <div className="mx-6 mt-4 p-3 rounded-xl flex items-center justify-between gap-3"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <p className="text-xs font-medium" style={{ color: c.text }}>
        {messages[level]}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        {level !== 'info' && (
          <Link href="/pricing" className="text-[10px] px-3 py-1.5 rounded-lg font-bold text-white"
            style={{ background: c.text }}>
            Upgrade
          </Link>
        )}
        <button onClick={() => setDismissed(true)} className="text-xs px-2 py-1 rounded" style={{ color: c.text }}>✕</button>
      </div>
    </div>
  );
}
