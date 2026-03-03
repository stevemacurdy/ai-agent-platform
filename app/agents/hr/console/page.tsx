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
    "id": "hiring",
    "label": "Hiring",
    "icon": "🎯"
  },
  {
    "id": "retention",
    "label": "Retention",
    "icon": "💚"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Total Headcount",
    "value": "34",
    "change": "+3 this quarter",
    "trend": "up",
    "icon": "👥"
  },
  {
    "label": "Open Positions",
    "value": "5",
    "change": "2 critical",
    "trend": "down",
    "icon": "🎯"
  },
  {
    "label": "Retention Rate",
    "value": "92%",
    "change": "+2% vs industry",
    "trend": "up",
    "icon": "💚"
  },
  {
    "label": "Avg Tenure",
    "value": "3.2 yrs",
    "change": "Growing steadily",
    "trend": "up",
    "icon": "📈"
  }
];

const DEMO_TABLE = [
  {
    "position": "Senior Project Manager",
    "department": "Operations",
    "applicants": 24,
    "stage": "Final Interview",
    "daysOpen": 32
  },
  {
    "position": "Warehouse Technician",
    "department": "Operations",
    "applicants": 18,
    "stage": "Screening",
    "daysOpen": 14
  },
  {
    "position": "Sales Engineer",
    "department": "Sales",
    "applicants": 12,
    "stage": "Phone Screen",
    "daysOpen": 21
  },
  {
    "position": "Safety Coordinator",
    "department": "Operations",
    "applicants": 8,
    "stage": "Posted",
    "daysOpen": 7
  },
  {
    "position": "Marketing Coordinator",
    "department": "Marketing",
    "applicants": 31,
    "stage": "Screening",
    "daysOpen": 10
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Close Senior PM hire",
    "description": "In final interviews for 32 days. Top candidate may accept competing offer. Decision needed this week.",
    "impact": "Critical Operations role"
  },
  {
    "priority": "medium",
    "title": "Launch employee satisfaction survey",
    "description": "Q1 pulse survey overdue. Quick 5-question survey helps catch retention risks early.",
    "impact": "Protect 92% retention"
  },
  {
    "priority": "low",
    "title": "Update onboarding materials",
    "description": "Last updated 8 months ago. New hires report outdated info in first-week docs.",
    "impact": "Improve new hire experience"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'position', label: 'Position' },
  { key: 'department', label: 'Department' },
  { key: 'applicants', label: 'Applicants', align: 'center' as const },
  { key: 'stage', label: 'Stage' },
  { key: 'daysOpen', label: 'Days Open', align: 'center' as const }
];

export default function HrConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/hr?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="HR"
      agentSlug="hr"
      agentIcon="👥"
      agentColor="#9333EA"
      department="People"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Open Positions"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
