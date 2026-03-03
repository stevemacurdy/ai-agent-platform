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
    "id": "rankings",
    "label": "Rankings",
    "icon": "📈"
  },
  {
    "id": "opportunities",
    "label": "Opportunities",
    "icon": "🎯"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Organic Traffic",
    "value": "28.4K",
    "change": "+15% vs last month",
    "trend": "up",
    "icon": "🌐"
  },
  {
    "label": "Keywords Top 10",
    "value": "142",
    "change": "+23 new rankings",
    "trend": "up",
    "icon": "🏆"
  },
  {
    "label": "Domain Authority",
    "value": "47",
    "change": "+3 this quarter",
    "trend": "up",
    "icon": "📊"
  },
  {
    "label": "Avg Position",
    "value": "14.2",
    "change": "-2.1 improvement",
    "trend": "up",
    "icon": "📈"
  }
];

const DEMO_TABLE = [
  {
    "keyword": "warehouse systems integration",
    "position": 3,
    "volume": "2,400",
    "traffic": 890,
    "trend": "↑ +2"
  },
  {
    "keyword": "warehouse automation solutions",
    "position": 7,
    "volume": "1,800",
    "traffic": 340,
    "trend": "↑ +5"
  },
  {
    "keyword": "3PL technology",
    "position": 12,
    "volume": "1,200",
    "traffic": 120,
    "trend": "↑ +3"
  },
  {
    "keyword": "warehouse management consulting",
    "position": 5,
    "volume": "980",
    "traffic": 280,
    "trend": "→ 0"
  },
  {
    "keyword": "AI warehouse operations",
    "position": 8,
    "volume": "720",
    "traffic": 160,
    "trend": "↑ +4"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Target \"warehouse automation\" cluster",
    "description": "Position 7 for high-volume keyword. Create pillar page to push into top 3.",
    "impact": "+500 monthly visits"
  },
  {
    "priority": "medium",
    "title": "Fix 12 broken backlinks",
    "description": "Competitor link rot creates opportunity. Reclaim links via updated content.",
    "impact": "+4 DA points"
  },
  {
    "priority": "low",
    "title": "Add schema markup",
    "description": "No structured data on service pages. Add FAQ and service schema for rich snippets.",
    "impact": "+15% CTR"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'keyword', label: 'Keyword' },
  { key: 'position', label: 'Position', align: 'center' as const },
  { key: 'volume', label: 'Volume', align: 'center' as const },
  { key: 'traffic', label: 'Traffic', align: 'center' as const },
  { key: 'trend', label: 'Trend' }
];

export default function SeoConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/seo?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="SEO"
      agentSlug="seo"
      agentIcon="🔎"
      agentColor="#0D9488"
      department="Sales"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Top Keyword Rankings"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
