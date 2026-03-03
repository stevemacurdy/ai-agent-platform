'use client';
import { useState, useEffect } from 'react';
import AgentConsole from '@/components/consoles/AgentConsole';
import type { KPICard, TableColumn, Recommendation, ConsoleTab } from '@/components/consoles/AgentConsole';

const TABS: ConsoleTab[] = [
  {
    "id": "dashboard",
    "label": "Dashboard",
    "icon": "📊"
  },
  {
    "id": "budgets",
    "label": "Budgets",
    "icon": "💰"
  },
  {
    "id": "forecasts",
    "label": "Forecasts",
    "icon": "🔮"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Monthly Revenue",
    "value": "$1.24M",
    "change": "+8% vs forecast",
    "trend": "up",
    "icon": "💰"
  },
  {
    "label": "Operating Margin",
    "value": "34.2%",
    "change": "+1.5% vs Q3",
    "trend": "up",
    "icon": "📈"
  },
  {
    "label": "Burn Rate",
    "value": "$89K/mo",
    "change": "Within budget",
    "trend": "flat",
    "icon": "🔥"
  },
  {
    "label": "Runway",
    "value": "18 months",
    "change": "Stable",
    "trend": "flat",
    "icon": "🛣️"
  }
];

const DEMO_TABLE = [
  {
    "category": "Payroll",
    "budget": 420000,
    "actual": 415000,
    "variance": "+$5K",
    "status": "On Track"
  },
  {
    "category": "Infrastructure",
    "budget": 85000,
    "actual": 92000,
    "variance": "-$7K",
    "status": "Over"
  },
  {
    "category": "Marketing",
    "budget": 65000,
    "actual": 58000,
    "variance": "+$7K",
    "status": "Under"
  },
  {
    "category": "Operations",
    "budget": 145000,
    "actual": 142000,
    "variance": "+$3K",
    "status": "On Track"
  },
  {
    "category": "R&D",
    "budget": 120000,
    "actual": 118000,
    "variance": "+$2K",
    "status": "On Track"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Infrastructure overspend alert",
    "description": "Cloud costs exceeded budget by $7K. Review auto-scaling policies and unused instances.",
    "impact": "Save $7K/month"
  },
  {
    "priority": "medium",
    "title": "Reallocate marketing underspend",
    "description": "Marketing is $7K under budget. Consider investing in paid acquisition or content.",
    "impact": "Optimize ROI"
  },
  {
    "priority": "low",
    "title": "Negotiate vendor contracts",
    "description": "3 annual contracts up for renewal. Historical data suggests 12% savings available.",
    "impact": "Save ~$18K/year"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'category', label: 'Category' },
  { key: 'budget', label: 'Budget', align: 'right' as const, render: (val: any) => `$${(val as number).toLocaleString()}` },
  { key: 'actual', label: 'Actual', align: 'right' as const, render: (val: any) => `$${(val as number).toLocaleString()}` },
  { key: 'variance', label: 'Variance', align: 'right' as const },
  { key: 'status', label: 'Status' }
];

export default function FinopsConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/finops?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="FinOps"
      agentSlug="finops"
      agentIcon="📊"
      agentColor="#7C3AED"
      department="Finance"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Budget vs Actual"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
