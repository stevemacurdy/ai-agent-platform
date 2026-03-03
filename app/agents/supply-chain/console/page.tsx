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
    "id": "vendors",
    "label": "Vendors",
    "icon": "🏭"
  },
  {
    "id": "logistics",
    "label": "Logistics",
    "icon": "🚛"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "On-Time Delivery",
    "value": "94.2%",
    "change": "+1.8% improvement",
    "trend": "up",
    "icon": "🚛"
  },
  {
    "label": "Active Vendors",
    "value": "47",
    "change": "3 under review",
    "trend": "flat",
    "icon": "🏭"
  },
  {
    "label": "Avg Lead Time",
    "value": "8.3 days",
    "change": "-0.7 days",
    "trend": "up",
    "icon": "⏱"
  },
  {
    "label": "Cost Savings",
    "value": "$34K",
    "change": "This quarter",
    "trend": "up",
    "icon": "💰"
  }
];

const DEMO_TABLE = [
  {
    "vendor": "Steel Solutions Inc",
    "onTime": "98%",
    "quality": "A+",
    "leadTime": "5 days",
    "status": "Preferred"
  },
  {
    "vendor": "Pacific Parts Co",
    "onTime": "92%",
    "quality": "A",
    "leadTime": "7 days",
    "status": "Active"
  },
  {
    "vendor": "Metro Components",
    "onTime": "85%",
    "quality": "B+",
    "leadTime": "12 days",
    "status": "Under Review"
  },
  {
    "vendor": "Summit Materials",
    "onTime": "96%",
    "quality": "A",
    "leadTime": "6 days",
    "status": "Active"
  },
  {
    "vendor": "Valley Plastics",
    "onTime": "78%",
    "quality": "B",
    "leadTime": "14 days",
    "status": "Warning"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Review Valley Plastics relationship",
    "description": "78% on-time rate with 14-day lead time. Consider alternative vendors for critical parts.",
    "impact": "Reduce delays 20%"
  },
  {
    "priority": "medium",
    "title": "Negotiate bulk pricing with Steel Solutions",
    "description": "Top performer at 98% on-time. Volume discount potential for Q2 commitment.",
    "impact": "Save ~$12K/quarter"
  },
  {
    "priority": "low",
    "title": "Diversify single-source components",
    "description": "4 critical parts have only 1 vendor. Add backup suppliers for resilience.",
    "impact": "Reduce supply risk"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'vendor', label: 'Vendor' },
  { key: 'onTime', label: 'On-Time %', align: 'center' as const },
  { key: 'quality', label: 'Quality Score', align: 'center' as const },
  { key: 'leadTime', label: 'Lead Time', align: 'center' as const },
  { key: 'status', label: 'Status' }
];

export default function SupplyChainConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/supply-chain?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Supply Chain"
      agentSlug="supply-chain"
      agentIcon="🔗"
      agentColor="#7C3AED"
      department="Operations"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Vendor Performance"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
