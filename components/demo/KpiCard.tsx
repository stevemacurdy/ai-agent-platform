'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DemoKpi } from '@/lib/demo-registry';

interface KpiCardProps {
  kpi: DemoKpi;
  active?: boolean;
  onClick?: () => void;
  accentColor?: string;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatValue(value: number, prefix?: string, suffix?: string): string {
  let formatted: string;
  if (Math.abs(value) >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (Math.abs(value) >= 10_000) {
    formatted = (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else if (Math.abs(value) >= 1_000) {
    formatted = value.toLocaleString();
  } else if (Number.isInteger(value)) {
    formatted = value.toString();
  } else {
    formatted = value.toFixed(1);
  }
  return (prefix || '') + formatted + (suffix || '');
}

export default function KpiCard({ kpi, active, onClick, accentColor }: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const hasAnimated = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    startTime.current = performance.now();
    const duration = 1200;
    const target = kpi.value;

    function step(now: number) {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(Math.round(eased * target * 10) / 10);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    }
    animRef.current = requestAnimationFrame(step);
  }, [kpi.value]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animate(); },
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  const trendColor = kpi.trend === 'up' ? '#059669' : kpi.trend === 'down' ? '#DC2626' : '#9CA3AF';
  const trendArrow = kpi.trend === 'up' ? '\u2191' : kpi.trend === 'down' ? '\u2193' : '\u2192';
  const changeText = kpi.change > 0 ? '+' + kpi.change + '%' : kpi.change + '%';

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={"p-5 rounded-xl border bg-white transition-all duration-200 " + (onClick ? "cursor-pointer hover:shadow-md " : "")}
      style={{
        borderColor: active ? (accentColor || '#F5920B') : '#E5E7EB',
        boxShadow: active ? `0 0 0 3px ${(accentColor || '#F5920B')}33, 0 4px 16px rgba(0,0,0,0.08)` : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
          {kpi.label}
        </span>
        <span className="text-lg">{kpi.icon}</span>
      </div>
      <p className="text-2xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
        {formatValue(displayValue, kpi.prefix, kpi.suffix)}
      </p>
      {kpi.change !== 0 && (
        <p className="text-xs font-medium mt-1.5 flex items-center gap-1" style={{ color: trendColor }}>
          <span>{trendArrow}</span> {changeText}
        </p>
      )}
    </div>
  );
}
