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
    "id": "team",
    "label": "Team Performance",
    "icon": "👥"
  },
  {
    "id": "coaching",
    "label": "Coaching Plans",
    "icon": "📋"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Team Quota Attainment",
    "value": "84%",
    "change": "+6% vs last month",
    "trend": "up",
    "icon": "🎯"
  },
  {
    "label": "Avg Deal Size",
    "value": "$125K",
    "change": "+$12K increase",
    "trend": "up",
    "icon": "💰"
  },
  {
    "label": "Win Rate",
    "value": "32%",
    "change": "+4% improvement",
    "trend": "up",
    "icon": "🏆"
  },
  {
    "label": "Coaching Sessions",
    "value": "18",
    "change": "This month",
    "trend": "flat",
    "icon": "📋"
  }
];

const DEMO_TABLE = [
  {
    "rep": "Alex Johnson",
    "quota": "112%",
    "deals": 8,
    "pipeline": "$420K",
    "focus": "Enterprise selling"
  },
  {
    "rep": "Maria Santos",
    "quota": "95%",
    "deals": 6,
    "pipeline": "$380K",
    "focus": "Closing techniques"
  },
  {
    "rep": "James Park",
    "quota": "78%",
    "deals": 4,
    "pipeline": "$290K",
    "focus": "Discovery calls"
  },
  {
    "rep": "Sarah Kim",
    "quota": "65%",
    "deals": 3,
    "pipeline": "$180K",
    "focus": "Pipeline building"
  },
  {
    "rep": "Tom Richards",
    "quota": "102%",
    "deals": 7,
    "pipeline": "$510K",
    "focus": "Account expansion"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Sarah Kim needs pipeline support",
    "description": "At 65% quota with thin pipeline. Schedule prospecting blitz this week.",
    "impact": "Add $200K pipeline"
  },
  {
    "priority": "medium",
    "title": "James Park — improve discovery",
    "description": "Good pipeline but low close rate. Role-play sessions on SPIN selling recommended.",
    "impact": "+15% win rate potential"
  },
  {
    "priority": "low",
    "title": "Share Alex's playbook with team",
    "description": "Alex is at 112% — document and share the enterprise approach with the team.",
    "impact": "Team-wide improvement"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'rep', label: 'Sales Rep' },
  { key: 'quota', label: 'Quota %', align: 'center' as const },
  { key: 'deals', label: 'Deals', align: 'center' as const },
  { key: 'pipeline', label: 'Pipeline', align: 'right' as const },
  { key: 'focus', label: 'Coaching Focus' }
];

export default function SalesCoachConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/sales-coach?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Sales Coach"
      agentSlug="sales-coach"
      agentIcon="🏆"
      agentColor="#059669"
      department="Sales"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Rep Performance"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
