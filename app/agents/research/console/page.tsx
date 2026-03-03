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
    "id": "market",
    "label": "Market Analysis",
    "icon": "📈"
  },
  {
    "id": "competitors",
    "label": "Competitors",
    "icon": "🏢"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Market Size",
    "value": "$12.4B",
    "change": "+8% CAGR",
    "trend": "up",
    "icon": "📈"
  },
  {
    "label": "Tracked Competitors",
    "value": "24",
    "change": "2 new entrants",
    "trend": "down",
    "icon": "🏢"
  },
  {
    "label": "Industry Reports",
    "value": "8",
    "change": "This quarter",
    "trend": "flat",
    "icon": "📑"
  },
  {
    "label": "Trend Score",
    "value": "78/100",
    "change": "Favorable outlook",
    "trend": "up",
    "icon": "🔮"
  }
];

const DEMO_TABLE = [
  {
    "competitor": "WareTech Solutions",
    "focus": "WMS Software",
    "threat": "High",
    "recentMove": "Raised $45M Series C",
    "ourAdvantage": "Full-service integration"
  },
  {
    "competitor": "LogiPro Systems",
    "focus": "Automation",
    "threat": "Medium",
    "recentMove": "New robotics partner",
    "ourAdvantage": "Client relationships"
  },
  {
    "competitor": "FlexStore Inc",
    "focus": "Consulting",
    "threat": "Medium",
    "recentMove": "Expanded to 5 states",
    "ourAdvantage": "6-country presence"
  },
  {
    "competitor": "SmartDC",
    "focus": "AI Analytics",
    "threat": "Low",
    "recentMove": "Beta launch",
    "ourAdvantage": "Production-ready platform"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Counter WareTech fundraise",
    "description": "WareTech raised $45M — expect aggressive marketing push. Strengthen key client relationships.",
    "impact": "Defend $4M+ revenue"
  },
  {
    "priority": "medium",
    "title": "Publish quarterly industry report",
    "description": "Thought leadership content differentiates. Focus on AI + warehouse automation trends.",
    "impact": "Build brand authority"
  },
  {
    "priority": "low",
    "title": "Monitor SmartDC beta closely",
    "description": "AI analytics competitor in beta. Their approach may influence market expectations.",
    "impact": "Stay ahead of trends"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'competitor', label: 'Competitor' },
  { key: 'focus', label: 'Focus Area' },
  { key: 'threat', label: 'Threat Level', align: 'center' as const },
  { key: 'recentMove', label: 'Recent Move' },
  { key: 'ourAdvantage', label: 'Our Advantage' }
];

export default function ResearchConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/research?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Research"
      agentSlug="research"
      agentIcon="🔬"
      agentColor="#6366F1"
      department="Strategy"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Competitive Landscape"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
