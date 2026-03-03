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
    "id": "pending",
    "label": "Pending",
    "icon": "⏳"
  },
  {
    "id": "scheduled",
    "label": "Scheduled",
    "icon": "📅"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Total Payables",
    "value": "$312,400",
    "change": "Due within 30 days",
    "trend": "flat",
    "icon": "💸"
  },
  {
    "label": "Pending Approval",
    "value": "14",
    "change": "3 urgent",
    "trend": "down",
    "icon": "⏳"
  },
  {
    "label": "Paid This Month",
    "value": "$287,600",
    "change": "+15% vs last month",
    "trend": "up",
    "icon": "✅"
  },
  {
    "label": "Early Pay Savings",
    "value": "$4,200",
    "change": "Captured this quarter",
    "trend": "up",
    "icon": "🎯"
  }
];

const DEMO_TABLE = [
  {
    "vendor": "Steel Supply Co",
    "invoice": "INV-4521",
    "amount": 34500,
    "dueDate": "Mar 15",
    "status": "Pending"
  },
  {
    "vendor": "Tech Solutions",
    "invoice": "INV-4522",
    "amount": 12800,
    "dueDate": "Mar 18",
    "status": "Approved"
  },
  {
    "vendor": "Fleet Services",
    "invoice": "INV-4523",
    "amount": 67200,
    "dueDate": "Mar 10",
    "status": "Urgent"
  },
  {
    "vendor": "Safety Equipment Inc",
    "invoice": "INV-4524",
    "amount": 8900,
    "dueDate": "Mar 22",
    "status": "Pending"
  },
  {
    "vendor": "Cloud Hosting Ltd",
    "invoice": "INV-4525",
    "amount": 15600,
    "dueDate": "Mar 20",
    "status": "Approved"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Fleet Services due in 2 days",
    "description": "Invoice INV-4523 for $67,200 due Mar 10. Approve now to avoid late fees.",
    "impact": "Avoid $2,016 late fee"
  },
  {
    "priority": "medium",
    "title": "Batch payment run available",
    "description": "5 approved invoices totaling $96,100 ready for payment. Schedule for Tuesday.",
    "impact": "Streamline processing"
  },
  {
    "priority": "low",
    "title": "Early payment opportunity",
    "description": "Steel Supply offers 2/10 net 30. Paying early saves $690.",
    "impact": "Save $690"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'vendor', label: 'Vendor' },
  { key: 'invoice', label: 'Invoice #' },
  { key: 'amount', label: 'Amount', align: 'right' as const, render: (val: any) => `$${(val as number).toLocaleString()}` },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'status', label: 'Status' }
];

export default function PayablesConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/payables?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Payables"
      agentSlug="payables"
      agentIcon="🧾"
      agentColor="#0891B2"
      department="Finance"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Pending Invoices"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
