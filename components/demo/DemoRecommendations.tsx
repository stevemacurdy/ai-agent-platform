'use client';
import type { DemoRecommendation } from '@/lib/demo-registry';

const PRIORITY_STYLES: Record<string, { bg: string; border: string; badge: string }> = {
  critical: { bg: '#FEF2F2', border: '#FECACA', badge: '#DC2626' },
  high: { bg: '#FFF7ED', border: '#FED7AA', badge: '#EA580C' },
  medium: { bg: '#FFFBEB', border: '#FDE68A', badge: '#D97706' },
  low: { bg: '#F0FDF4', border: '#BBF7D0', badge: '#16A34A' },
};

interface DemoRecommendationsProps {
  recommendations: DemoRecommendation[];
  onAction: (rec: DemoRecommendation) => void;
}

export default function DemoRecommendations({ recommendations, onAction }: DemoRecommendationsProps) {
  if (!recommendations.length) return null;

  return (
    <div className="rounded-xl border bg-white p-5" style={{ borderColor: '#E5E7EB' }}>
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#1B2A4A' }}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#059669' }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#059669' }} />
        </span>
        AI Recommendations
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium;
          return (
            <div
              key={i}
              className="p-4 rounded-lg border"
              style={{ background: style.bg, borderColor: style.border }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase text-white"
                      style={{ background: style.badge }}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{rec.title}</span>
                  </div>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{rec.description}</p>
                  {rec.impact && (
                    <p className="text-xs font-medium mt-1" style={{ color: style.badge }}>
                      Impact: {rec.impact}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onAction(rec)}
                  className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: style.badge }}
                >
                  {rec.action || 'Take Action'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
