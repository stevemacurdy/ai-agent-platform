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
    "id": "campaigns",
    "label": "Campaigns",
    "icon": "🎯"
  },
  {
    "id": "content",
    "label": "Content",
    "icon": "📝"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Marketing Qualified Leads",
    "value": "234",
    "change": "+18% vs last month",
    "trend": "up",
    "icon": "🎯"
  },
  {
    "label": "Cost per Lead",
    "value": "$42",
    "change": "-$8 reduction",
    "trend": "up",
    "icon": "💰"
  },
  {
    "label": "Website Traffic",
    "value": "45.2K",
    "change": "+22% growth",
    "trend": "up",
    "icon": "🌐"
  },
  {
    "label": "Conversion Rate",
    "value": "3.8%",
    "change": "+0.4% improvement",
    "trend": "up",
    "icon": "📈"
  }
];

const DEMO_TABLE = [
  {
    "campaign": "Warehouse Automation Guide",
    "channel": "Content",
    "leads": 89,
    "spend": "$2,400",
    "roi": "320%"
  },
  {
    "campaign": "LinkedIn Ads - 3PL",
    "channel": "Paid",
    "leads": 45,
    "spend": "$4,800",
    "roi": "180%"
  },
  {
    "campaign": "Q1 Webinar Series",
    "channel": "Events",
    "leads": 67,
    "spend": "$1,200",
    "roi": "450%"
  },
  {
    "campaign": "Google Search - Warehouse",
    "channel": "SEM",
    "leads": 33,
    "spend": "$3,600",
    "roi": "140%"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Scale webinar series",
    "description": "Q1 webinars have 450% ROI — the highest across all channels. Schedule bi-weekly cadence.",
    "impact": "Add 130+ MQLs/quarter"
  },
  {
    "priority": "medium",
    "title": "Optimize Google SEM",
    "description": "ROI is lowest at 140%. Review keyword bids and pause low-converting terms.",
    "impact": "Save $1,200/month"
  },
  {
    "priority": "low",
    "title": "Create customer case study",
    "description": "Top prospects respond to social proof. Publish Cabela's case study.",
    "impact": "Boost conversion +0.5%"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'campaign', label: 'Campaign' },
  { key: 'channel', label: 'Channel' },
  { key: 'leads', label: 'Leads', align: 'center' as const },
  { key: 'spend', label: 'Spend', align: 'right' as const },
  { key: 'roi', label: 'ROI', align: 'center' as const }
];

export default function MarketingConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/marketing?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Marketing"
      agentSlug="marketing"
      agentIcon="📣"
      agentColor="#DB2777"
      department="Sales"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Active Campaigns"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
