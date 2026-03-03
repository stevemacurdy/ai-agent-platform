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
    "id": "projects",
    "label": "Projects",
    "icon": "📋"
  },
  {
    "id": "resources",
    "label": "Resources",
    "icon": "👥"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Active Projects",
    "value": "12",
    "change": "3 near completion",
    "trend": "flat",
    "icon": "📋"
  },
  {
    "label": "Team Utilization",
    "value": "86%",
    "change": "+4% vs target",
    "trend": "up",
    "icon": "👥"
  },
  {
    "label": "On-Time Completion",
    "value": "91%",
    "change": "+3% improvement",
    "trend": "up",
    "icon": "✅"
  },
  {
    "label": "Equipment Uptime",
    "value": "97.8%",
    "change": "Above target",
    "trend": "up",
    "icon": "⚙️"
  }
];

const DEMO_TABLE = [
  {
    "project": "DC Expansion Phase 2",
    "client": "Cabela's",
    "progress": "78%",
    "team": 8,
    "deadline": "Apr 15"
  },
  {
    "project": "Conveyor Upgrade",
    "client": "Sportsman's WH",
    "progress": "45%",
    "team": 5,
    "deadline": "May 1"
  },
  {
    "project": "Rack Installation",
    "client": "Frito-Lay",
    "progress": "92%",
    "team": 6,
    "deadline": "Mar 20"
  },
  {
    "project": "Automation Retrofit",
    "client": "Summit Storage",
    "progress": "15%",
    "team": 4,
    "deadline": "Jun 30"
  },
  {
    "project": "Safety Compliance Audit",
    "client": "Valley Supply",
    "progress": "60%",
    "team": 3,
    "deadline": "Mar 30"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Frito-Lay rack install finishing early",
    "description": "At 92% with 10 days to deadline. Reassign 2 team members to Conveyor Upgrade.",
    "impact": "Accelerate Conveyor by 2 weeks"
  },
  {
    "priority": "medium",
    "title": "Resource conflict Mar 20–30",
    "description": "3 projects need welders simultaneously. Schedule shared resources now.",
    "impact": "Prevent delays"
  },
  {
    "priority": "low",
    "title": "Document Cabela's best practices",
    "description": "DC Expansion Phase 2 applying novel racking pattern. Document for future bids.",
    "impact": "Win similar projects"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'project', label: 'Project' },
  { key: 'client', label: 'Client' },
  { key: 'progress', label: 'Progress', align: 'center' as const },
  { key: 'team', label: 'Team Size', align: 'center' as const },
  { key: 'deadline', label: 'Deadline' }
];

export default function OperationsConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/operations?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Operations"
      agentSlug="operations"
      agentIcon="⚙️"
      agentColor="#4F46E5"
      department="Operations"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Active Projects"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
