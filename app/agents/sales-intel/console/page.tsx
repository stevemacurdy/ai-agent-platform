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
    "id": "prospects",
    "label": "Prospects",
    "icon": "🎯"
  },
  {
    "id": "signals",
    "label": "Signals",
    "icon": "📡"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Active Prospects",
    "value": "147",
    "change": "+23 this week",
    "trend": "up",
    "icon": "🎯"
  },
  {
    "label": "Engagement Score",
    "value": "72/100",
    "change": "+5 points",
    "trend": "up",
    "icon": "📈"
  },
  {
    "label": "Ready to Buy",
    "value": "12",
    "change": "High intent signals",
    "trend": "up",
    "icon": "🔥"
  },
  {
    "label": "Market Signals",
    "value": "34",
    "change": "8 new today",
    "trend": "up",
    "icon": "📡"
  }
];

const DEMO_TABLE = [
  {
    "company": "Global Logistics Corp",
    "score": 94,
    "signal": "Hiring warehouse mgr",
    "industry": "3PL",
    "revenue": "$2.1M"
  },
  {
    "company": "FastTrack Fulfillment",
    "score": 87,
    "signal": "Expanding to 3 sites",
    "industry": "E-commerce",
    "revenue": "$890K"
  },
  {
    "company": "Alpine Distribution",
    "score": 82,
    "signal": "RFP published",
    "industry": "Distribution",
    "revenue": "$1.5M"
  },
  {
    "company": "Metro Cold Storage",
    "score": 78,
    "signal": "Leadership change",
    "industry": "Cold Chain",
    "revenue": "$650K"
  },
  {
    "company": "Pinnacle Warehousing",
    "score": 71,
    "signal": "Website redesign",
    "industry": "Warehousing",
    "revenue": "$420K"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Engage Global Logistics Corp now",
    "description": "Score 94/100 — they just posted a warehouse manager job. Perfect timing for outreach.",
    "impact": "Potential $2.1M deal"
  },
  {
    "priority": "high",
    "title": "Respond to Alpine Distribution RFP",
    "description": "RFP published yesterday for warehouse systems integration. Submit proposal within 48 hours.",
    "impact": "Potential $1.5M deal"
  },
  {
    "priority": "medium",
    "title": "Nurture FastTrack Fulfillment",
    "description": "Expanding to 3 sites suggests growing pains. Send case study on multi-site deployments.",
    "impact": "Potential $890K deal"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'company', label: 'Company' },
  { key: 'score', label: 'Score', align: 'center' as const },
  { key: 'signal', label: 'Latest Signal' },
  { key: 'industry', label: 'Industry' },
  { key: 'revenue', label: 'Est. Revenue', align: 'right' as const }
];

export default function SalesIntelConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/sales-intel?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Sales Intel"
      agentSlug="sales-intel"
      agentIcon="🔍"
      agentColor="#2563EB"
      department="Sales"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Top Prospects"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
