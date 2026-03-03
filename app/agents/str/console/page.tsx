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
    "id": "properties",
    "label": "Properties",
    "icon": "🏠"
  },
  {
    "id": "market",
    "label": "Market Data",
    "icon": "📈"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Portfolio Value",
    "value": "$4.2M",
    "change": "+6% appreciation",
    "trend": "up",
    "icon": "🏠"
  },
  {
    "label": "Avg Occupancy",
    "value": "78%",
    "change": "+3% vs last quarter",
    "trend": "up",
    "icon": "📈"
  },
  {
    "label": "Monthly Revenue",
    "value": "$38K",
    "change": "+$4K increase",
    "trend": "up",
    "icon": "💰"
  },
  {
    "label": "Avg Daily Rate",
    "value": "$245",
    "change": "+$18 increase",
    "trend": "up",
    "icon": "💵"
  }
];

const DEMO_TABLE = [
  {
    "property": "Mountain View Cabin",
    "occupancy": "85%",
    "adr": "$320",
    "revenue": "$8,160",
    "rating": "4.9"
  },
  {
    "property": "Downtown Loft",
    "occupancy": "92%",
    "adr": "$195",
    "revenue": "$5,382",
    "rating": "4.7"
  },
  {
    "property": "Lake House Retreat",
    "occupancy": "65%",
    "adr": "$410",
    "revenue": "$7,995",
    "rating": "4.8"
  },
  {
    "property": "Urban Studio",
    "occupancy": "88%",
    "adr": "$125",
    "revenue": "$3,300",
    "rating": "4.5"
  },
  {
    "property": "Ranch Getaway",
    "occupancy": "72%",
    "adr": "$285",
    "revenue": "$6,156",
    "rating": "4.6"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Optimize Lake House pricing",
    "description": "65% occupancy with highest ADR. Dynamic pricing could boost occupancy to 80%.",
    "impact": "+$2,460/month"
  },
  {
    "priority": "medium",
    "title": "Urban Studio needs updates",
    "description": "Lowest rating at 4.5. Guest reviews cite dated furniture. $2K refresh could boost to 4.7+.",
    "impact": "+8% occupancy"
  },
  {
    "priority": "low",
    "title": "Seasonal pricing adjustment",
    "description": "Spring break approaching. Increase Mountain View and Lake House rates by 15%.",
    "impact": "+$1,800/month"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'property', label: 'Property' },
  { key: 'occupancy', label: 'Occupancy', align: 'center' as const },
  { key: 'adr', label: 'ADR', align: 'right' as const },
  { key: 'revenue', label: 'Revenue', align: 'right' as const },
  { key: 'rating', label: 'Rating', align: 'center' as const }
];

export default function StrConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/str?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="STR Analyst"
      agentSlug="str"
      agentIcon="🏠"
      agentColor="#BE185D"
      department="Strategy"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Property Performance"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
