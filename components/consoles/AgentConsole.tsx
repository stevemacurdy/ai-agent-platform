'use client';
import { ReactNode } from 'react';
import Link from 'next/link';

export interface KPICard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (val: any, row: any) => ReactNode;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact?: string;
}

export interface ConsoleTab {
  id: string;
  label: string;
  icon?: string;
}

interface Props {
  agentName: string;
  agentSlug: string;
  agentIcon: string;
  agentColor: string;
  department: string;
  kpis: KPICard[];
  tabs: ConsoleTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  tableColumns?: TableColumn[];
  tableData?: any[];
  tableTitle?: string;
  recommendations?: Recommendation[];
  loading?: boolean;
  error?: string | null;
  children?: ReactNode;
}

const pColors: Record<string, {bg:string;text:string;border:string}> = {
  high: { bg: 'rgba(239,68,68,0.08)', text: '#DC2626', border: 'rgba(239,68,68,0.2)' },
  medium: { bg: 'rgba(245,146,11,0.08)', text: '#F5920B', border: 'rgba(245,146,11,0.2)' },
  low: { bg: 'rgba(42,157,143,0.08)', text: '#2A9D8F', border: 'rgba(42,157,143,0.2)' },
};

export default function AgentConsole({
  agentName, agentSlug, agentIcon, agentColor, department,
  kpis, tabs, activeTab, onTabChange,
  tableColumns, tableData, tableTitle,
  recommendations, loading, error, children,
}: Props) {
  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{agentIcon}</span>
            <h1 className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
              {agentName} Console
            </h1>
          </div>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{department} Department</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider"
            style={{ background: agentColor + '15', color: agentColor }}>Live</span>
          <Link href={`/agents/${agentSlug}`} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: '#F4F5F7', color: '#6B7280' }}>← Back</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="p-4 rounded-xl border" style={{ background: '#fff', borderColor: '#E5E7EB' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
              {kpi.icon && <span className="mr-1">{kpi.icon}</span>}{kpi.label}
            </p>
            <p className="text-2xl font-extrabold mt-1" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>{kpi.value}</p>
            {kpi.change && (
              <p className="text-xs mt-1 font-medium" style={{ color: kpi.trend === 'up' ? '#2A9D8F' : kpi.trend === 'down' ? '#DC2626' : '#9CA3AF' }}>
                {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} {kpi.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {tabs.length > 1 && (
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: '#F4F5F7' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => onTabChange(t.id)}
              className="px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === t.id ? '#fff' : 'transparent',
                color: activeTab === t.id ? '#1B2A4A' : '#9CA3AF',
                boxShadow: activeTab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>{t.icon && <span className="mr-1">{t.icon}</span>}{t.label}</button>
          ))}
        </div>
      )}

      {children}

      {tableColumns && tableData && tableData.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#fff', borderColor: '#E5E7EB' }}>
          {tableTitle && <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E7EB' }}><h3 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>{tableTitle}</h3></div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#F9FAFB' }}>
                {tableColumns.map(c => <th key={c.key} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9CA3AF', textAlign: (c.align || 'left') as any }}>{c.label}</th>)}
              </tr></thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50" style={{ borderColor: '#F3F4F6' }}>
                    {tableColumns.map(c => <td key={c.key} className="px-4 py-3" style={{ color: '#4B5563', textAlign: (c.align || 'left') as any }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="rounded-xl border p-5" style={{ background: '#fff', borderColor: '#E5E7EB' }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#1B2A4A' }}>🤖 AI Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((r, i) => {
              const pc = pColors[r.priority];
              return (
                <div key={i} className="p-3 rounded-lg border" style={{ background: pc.bg, borderColor: pc.border }}>
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-0.5" style={{ background: pc.border, color: pc.text }}>{r.priority}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{r.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{r.description}</p>
                      {r.impact && <p className="text-xs mt-1 font-medium" style={{ color: pc.text }}>Impact: {r.impact}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(245,146,11,0.06)', border: '1px solid rgba(245,146,11,0.12)' }}>
        <p className="text-xs" style={{ color: '#F5920B' }}>
          📊 Showing demo data — <Link href="/settings/integrations" className="underline font-medium">connect your tools</Link> for live insights
        </p>
      </div>
    </div>
  );
}
