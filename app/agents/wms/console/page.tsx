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
    "id": "inventory",
    "label": "Inventory",
    "icon": "📦"
  },
  {
    "id": "operations",
    "label": "Operations",
    "icon": "⚙️"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Pick Accuracy",
    "value": "99.7%",
    "change": "+0.2% this week",
    "trend": "up",
    "icon": "🎯"
  },
  {
    "label": "Orders/Hour",
    "value": "156",
    "change": "+12 vs average",
    "trend": "up",
    "icon": "📈"
  },
  {
    "label": "Space Utilization",
    "value": "87%",
    "change": "Near capacity",
    "trend": "down",
    "icon": "📦"
  },
  {
    "label": "Cycle Time",
    "value": "4.2 min",
    "change": "-0.3 min",
    "trend": "up",
    "icon": "⏱"
  }
];

const DEMO_TABLE = [
  {
    "zone": "Zone A — Bulk Storage",
    "orders": 42,
    "pickers": 6,
    "utilization": "92%",
    "status": "Active"
  },
  {
    "zone": "Zone B — Pick & Pack",
    "orders": 78,
    "pickers": 12,
    "utilization": "88%",
    "status": "Active"
  },
  {
    "zone": "Zone C — Cold Storage",
    "orders": 15,
    "pickers": 3,
    "utilization": "71%",
    "status": "Active"
  },
  {
    "zone": "Zone D — Staging",
    "orders": 34,
    "pickers": 4,
    "utilization": "95%",
    "status": "Near Capacity"
  },
  {
    "zone": "Zone E — Returns",
    "orders": 8,
    "pickers": 2,
    "utilization": "45%",
    "status": "Low Volume"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Zone D approaching capacity",
    "description": "95% utilization in staging area. Redistribute to Zone E or schedule extra shifts.",
    "impact": "Prevent bottleneck"
  },
  {
    "priority": "medium",
    "title": "Optimize Zone C staffing",
    "description": "Cold storage at 71% utilization with 3 pickers. Reallocate 1 to Zone B during peak.",
    "impact": "Improve throughput 8%"
  },
  {
    "priority": "low",
    "title": "Implement wave picking in Zone B",
    "description": "Current sequential picking is suboptimal. Wave picking can increase orders/hour by 15%.",
    "impact": "+23 orders/hour"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'zone', label: 'Zone' },
  { key: 'orders', label: 'Orders', align: 'center' as const },
  { key: 'pickers', label: 'Pickers', align: 'center' as const },
  { key: 'utilization', label: 'Utilization', align: 'center' as const },
  { key: 'status', label: 'Status' }
];

export default function WmsConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/wms?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="WMS"
      agentSlug="wms"
      agentIcon="📦"
      agentColor="#EA580C"
      department="Operations"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Active Operations"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
