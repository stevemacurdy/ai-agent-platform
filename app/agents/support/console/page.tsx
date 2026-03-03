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
    "id": "tickets",
    "label": "Tickets",
    "icon": "🎫"
  },
  {
    "id": "satisfaction",
    "label": "CSAT",
    "icon": "⭐"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Open Tickets",
    "value": "18",
    "change": "4 urgent",
    "trend": "down",
    "icon": "🎫"
  },
  {
    "label": "Avg Response Time",
    "value": "2.4 hrs",
    "change": "-0.8 hrs improvement",
    "trend": "up",
    "icon": "⏱"
  },
  {
    "label": "Resolution Rate",
    "value": "94%",
    "change": "+2% this week",
    "trend": "up",
    "icon": "✅"
  },
  {
    "label": "CSAT Score",
    "value": "4.6/5",
    "change": "Excellent",
    "trend": "up",
    "icon": "⭐"
  }
];

const DEMO_TABLE = [
  {
    "ticket": "TKT-1234",
    "subject": "Integration sync failing",
    "priority": "Urgent",
    "assignee": "Mike C.",
    "age": "2 hrs"
  },
  {
    "ticket": "TKT-1233",
    "subject": "Billing discrepancy",
    "priority": "High",
    "assignee": "Sarah L.",
    "age": "4 hrs"
  },
  {
    "ticket": "TKT-1232",
    "subject": "Feature request: exports",
    "priority": "Low",
    "assignee": "Unassigned",
    "age": "1 day"
  },
  {
    "ticket": "TKT-1231",
    "subject": "Login issues after update",
    "priority": "Medium",
    "assignee": "Tom R.",
    "age": "6 hrs"
  },
  {
    "ticket": "TKT-1230",
    "subject": "Dashboard not loading",
    "priority": "High",
    "assignee": "Mike C.",
    "age": "3 hrs"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Integration sync issue escalating",
    "description": "TKT-1234 affecting data flow. Customer is Enterprise tier — prioritize resolution.",
    "impact": "Prevent churn risk"
  },
  {
    "priority": "medium",
    "title": "Create knowledge base for login issues",
    "description": "3 login tickets this week. FAQ article would deflect future tickets.",
    "impact": "Reduce tickets 15%"
  },
  {
    "priority": "low",
    "title": "Assign unassigned tickets",
    "description": "2 tickets unassigned for 24+ hours. Auto-assign based on category.",
    "impact": "Improve response time"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'ticket', label: 'Ticket' },
  { key: 'subject', label: 'Subject' },
  { key: 'priority', label: 'Priority' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'age', label: 'Age' }
];

export default function SupportConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/support?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Support"
      agentSlug="support"
      agentIcon="🎧"
      agentColor="#0EA5E9"
      department="People"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Recent Tickets"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
