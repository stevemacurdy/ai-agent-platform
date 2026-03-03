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
    "id": "objectives",
    "label": "OKRs",
    "icon": "🎯"
  },
  {
    "id": "meetings",
    "label": "Meetings",
    "icon": "📅"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Company OKR Score",
    "value": "72%",
    "change": "On track for Q1",
    "trend": "up",
    "icon": "🎯"
  },
  {
    "label": "Team Health",
    "value": "8.4/10",
    "change": "+0.3 this month",
    "trend": "up",
    "icon": "💚"
  },
  {
    "label": "Active Initiatives",
    "value": "7",
    "change": "2 at risk",
    "trend": "down",
    "icon": "📋"
  },
  {
    "label": "Decision Velocity",
    "value": "3.2 days",
    "change": "-0.5 day improvement",
    "trend": "up",
    "icon": "⚡"
  }
];

const DEMO_TABLE = [
  {
    "objective": "Launch WoulfAI to 10 customers",
    "owner": "Steve",
    "progress": "40%",
    "status": "On Track",
    "deadline": "Mar 31"
  },
  {
    "objective": "Complete 3 warehouse projects",
    "owner": "Operations",
    "progress": "67%",
    "status": "On Track",
    "deadline": "Mar 31"
  },
  {
    "objective": "Achieve $1.2M quarterly revenue",
    "owner": "Sales",
    "progress": "55%",
    "status": "At Risk",
    "deadline": "Mar 31"
  },
  {
    "objective": "Hire 5 key positions",
    "owner": "HR",
    "progress": "60%",
    "status": "On Track",
    "deadline": "Mar 31"
  },
  {
    "objective": "Reduce operating costs 10%",
    "owner": "Finance",
    "progress": "35%",
    "status": "Behind",
    "deadline": "Mar 31"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Revenue target at risk",
    "description": "Q1 revenue at 55% with 4 weeks remaining. Accelerate close on 3 pipeline deals.",
    "impact": "Hit $1.2M target"
  },
  {
    "priority": "high",
    "title": "Operating costs reduction behind",
    "description": "Only 35% progress on 10% reduction goal. Prioritize vendor renegotiation.",
    "impact": "Save $120K"
  },
  {
    "priority": "medium",
    "title": "Schedule mid-quarter OKR review",
    "description": "All-hands review of progress can realign focus. Block 2 hours this Friday.",
    "impact": "Improve alignment"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'objective', label: 'Objective' },
  { key: 'owner', label: 'Owner' },
  { key: 'progress', label: 'Progress', align: 'center' as const },
  { key: 'status', label: 'Status' },
  { key: 'deadline', label: 'Deadline' }
];

export default function OrgLeadConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/org-lead?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Org Lead"
      agentSlug="org-lead"
      agentIcon="🧭"
      agentColor="#B45309"
      department="Strategy"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Q1 Objectives"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
