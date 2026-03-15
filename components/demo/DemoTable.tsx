'use client';
import { useState, useMemo, Fragment } from 'react';
import type { DemoColumn } from '@/lib/demo-registry';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: '#DCFCE7', text: '#166534' },
  active: { bg: '#DCFCE7', text: '#166534' },
  healthy: { bg: '#DCFCE7', text: '#166534' },
  compliant: { bg: '#DCFCE7', text: '#166534' },
  completed: { bg: '#DCFCE7', text: '#166534' },
  connected: { bg: '#DCFCE7', text: '#166534' },
  current: { bg: '#DCFCE7', text: '#166534' },
  'on track': { bg: '#DCFCE7', text: '#166534' },
  low: { bg: '#DCFCE7', text: '#166534' },
  shipped: { bg: '#DCFCE7', text: '#166534' },
  'closed won': { bg: '#DCFCE7', text: '#166534' },

  overdue: { bg: '#FEE2E2', text: '#991B1B' },
  critical: { bg: '#FEE2E2', text: '#991B1B' },
  'non-compliant': { bg: '#FEE2E2', text: '#991B1B' },
  'at risk': { bg: '#FEE2E2', text: '#991B1B' },
  blocked: { bg: '#FEE2E2', text: '#991B1B' },
  high: { bg: '#FEE2E2', text: '#991B1B' },
  behind: { bg: '#FEE2E2', text: '#991B1B' },
  expired: { bg: '#FEE2E2', text: '#991B1B' },
  '90+': { bg: '#FEE2E2', text: '#991B1B' },

  pending: { bg: '#FEF3C7', text: '#92400E' },
  'in progress': { bg: '#FEF3C7', text: '#92400E' },
  partial: { bg: '#FEF3C7', text: '#92400E' },
  stale: { bg: '#FEF3C7', text: '#92400E' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  picking: { bg: '#FEF3C7', text: '#92400E' },
  '30': { bg: '#FEF3C7', text: '#92400E' },
  '60': { bg: '#FEF3C7', text: '#92400E' },
  maintenance: { bg: '#FEF3C7', text: '#92400E' },
  negotiation: { bg: '#FEF3C7', text: '#92400E' },

  open: { bg: '#DBEAFE', text: '#1E40AF' },
  new: { bg: '#DBEAFE', text: '#1E40AF' },
  draft: { bg: '#DBEAFE', text: '#1E40AF' },
  prospect: { bg: '#DBEAFE', text: '#1E40AF' },
  qualified: { bg: '#DBEAFE', text: '#1E40AF' },
  proposal: { bg: '#DBEAFE', text: '#1E40AF' },
  listed: { bg: '#DBEAFE', text: '#1E40AF' },

  scheduled: { bg: '#EDE9FE', text: '#5B21B6' },
  queued: { bg: '#EDE9FE', text: '#5B21B6' },
  packed: { bg: '#EDE9FE', text: '#5B21B6' },
};

function getStatusStyle(val: string): { bg: string; text: string } | null {
  const lower = String(val).toLowerCase().trim();
  return STATUS_COLORS[lower] || null;
}

interface DemoTableProps {
  columns: DemoColumn[];
  rows: Record<string, unknown>[];
  expandedFields?: string[];
  onAction?: (row: Record<string, unknown>) => void;
  agentName?: string;
}

export default function DemoTable({ columns, rows, expandedFields, onAction }: DemoTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filtered, sortKey, sortDir]);

  const allKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const columnKeys = columns.map(c => c.key);
  const extraKeys = expandedFields || allKeys.filter(k => !columnKeys.includes(k));

  return (
    <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: '#E5E7EB' }}>
      <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
        <h3 className="text-sm font-bold" style={{ color: '#1B2A4A' }}>Data</h3>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border outline-none focus:border-orange-300 transition-colors"
          style={{ borderColor: '#E5E7EB', color: '#4B5563', width: 180 }}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={"px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-left whitespace-nowrap " + (col.sortable ? "cursor-pointer select-none hover:text-gray-700" : "")}
                  style={{ color: '#9CA3AF' }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const isExpanded = expandedRow === i;
              return (
                <Fragment key={i}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : i)}
                    className={"border-t cursor-pointer transition-colors " + (isExpanded ? "bg-blue-50/40" : "hover:bg-gray-50")}
                    style={{ borderColor: '#F3F4F6' }}
                  >
                    {columns.map(col => {
                      const val = row[col.key];
                      const statusStyle = typeof val === 'string' ? getStatusStyle(val) : null;
                      return (
                        <td key={col.key} className="px-4 py-3" style={{ color: '#4B5563' }}>
                          {statusStyle ? (
                            <span
                              className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase whitespace-nowrap"
                              style={{ background: statusStyle.bg, color: statusStyle.text }}
                            >
                              {String(val)}
                            </span>
                          ) : typeof val === 'number' ? (
                            val.toLocaleString()
                          ) : (
                            String(val ?? '')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {isExpanded && extraKeys.length > 0 && (
                    <tr className="border-t" style={{ borderColor: '#F3F4F6' }}>
                      <td colSpan={columns.length} className="px-6 py-4" style={{ background: '#FAFBFC' }}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          {extraKeys.map(k => (
                            <div key={k}>
                              <span className="font-semibold capitalize" style={{ color: '#9CA3AF' }}>
                                {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                              </span>
                              <p style={{ color: '#4B5563' }}>{String(row[k] ?? 'N/A')}</p>
                            </div>
                          ))}
                        </div>
                        {onAction && (
                          <button
                            onClick={e => { e.stopPropagation(); onAction(row); }}
                            className="mt-3 text-xs font-bold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                            style={{ background: '#F5920B' }}
                          >
                            Take Action
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-xs" style={{ color: '#9CA3AF' }}>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
