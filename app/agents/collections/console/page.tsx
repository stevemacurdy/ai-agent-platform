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
    "id": "aging",
    "label": "AR Aging",
    "icon": "📅"
  },
  {
    "id": "followups",
    "label": "Follow-ups",
    "icon": "📞"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Total Outstanding",
    "value": "$847,250",
    "change": "+12% vs last month",
    "trend": "up",
    "icon": "💰"
  },
  {
    "label": "Collection Rate",
    "value": "78%",
    "change": "+3% improvement",
    "trend": "up",
    "icon": "📈"
  },
  {
    "label": "Avg Days to Collect",
    "value": "34",
    "change": "-2 days",
    "trend": "up",
    "icon": "⏱"
  },
  {
    "label": "Overdue Accounts",
    "value": "23",
    "change": "4 new this week",
    "trend": "down",
    "icon": "🔴"
  }
];

const DEMO_TABLE = [
  {
    "account": "Acme Logistics",
    "amount": 45200,
    "days": 67,
    "status": "Overdue",
    "lastContact": "2 days ago"
  },
  {
    "account": "Metro Warehouse",
    "amount": 28750,
    "days": 45,
    "status": "Overdue",
    "lastContact": "1 week ago"
  },
  {
    "account": "Pacific Distribution",
    "amount": 92100,
    "days": 32,
    "status": "Due Soon",
    "lastContact": "3 days ago"
  },
  {
    "account": "Summit Storage",
    "amount": 15800,
    "days": 21,
    "status": "Current",
    "lastContact": "Today"
  },
  {
    "account": "Valley Supply",
    "amount": 67500,
    "days": 53,
    "status": "Overdue",
    "lastContact": "5 days ago"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Escalate Metro Warehouse",
    "description": "No contact in 7 days with $28,750 overdue. Auto-escalation recommended.",
    "impact": "Recover $28,750"
  },
  {
    "priority": "medium",
    "title": "Send batch payment reminders",
    "description": "8 accounts approaching 30-day mark. Automated reminders can prevent escalation.",
    "impact": "Prevent $124K aging"
  },
  {
    "priority": "low",
    "title": "Offer early payment discount",
    "description": "Valley Supply has strong history. 2% discount for immediate payment likely effective.",
    "impact": "Accelerate $67,500"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'account', label: 'Account' },
  { key: 'amount', label: 'Amount', align: 'right' as const, render: (val: any) => `$${(val as number).toLocaleString()}` },
  { key: 'days', label: 'Days Overdue', align: 'center' as const },
  { key: 'status', label: 'Status' },
  { key: 'lastContact', label: 'Last Contact' }
];

export default function CollectionsConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/collections?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Collections"
      agentSlug="collections"
      agentIcon="💳"
      agentColor="#DC2626"
      department="Finance"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Accounts Receivable Aging"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
