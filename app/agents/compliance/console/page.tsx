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
    "id": "regulations",
    "label": "Regulations",
    "icon": "📜"
  },
  {
    "id": "audits",
    "label": "Audits",
    "icon": "🔍"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Compliance Rate",
    "value": "96%",
    "change": "+1% this month",
    "trend": "up",
    "icon": "✅"
  },
  {
    "label": "Open Findings",
    "value": "4",
    "change": "1 critical",
    "trend": "down",
    "icon": "⚠️"
  },
  {
    "label": "Upcoming Audits",
    "value": "2",
    "change": "Next: Apr 15",
    "trend": "flat",
    "icon": "🔍"
  },
  {
    "label": "Training Compliance",
    "value": "94%",
    "change": "3 overdue",
    "trend": "down",
    "icon": "🎓"
  }
];

const DEMO_TABLE = [
  {
    "area": "OSHA Workplace Safety",
    "status": "Compliant",
    "score": "98%",
    "lastAudit": "Jan 2026",
    "nextReview": "Jul 2026"
  },
  {
    "area": "Data Protection (CCPA)",
    "status": "Compliant",
    "score": "95%",
    "lastAudit": "Feb 2026",
    "nextReview": "Aug 2026"
  },
  {
    "area": "Environmental (EPA)",
    "status": "Action Needed",
    "score": "88%",
    "lastAudit": "Nov 2025",
    "nextReview": "Apr 2026"
  },
  {
    "area": "Fire Safety",
    "status": "Compliant",
    "score": "100%",
    "lastAudit": "Dec 2025",
    "nextReview": "Jun 2026"
  },
  {
    "area": "Insurance & Bonding",
    "status": "Renewal Due",
    "score": "92%",
    "lastAudit": "Oct 2025",
    "nextReview": "Mar 2026"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "EPA audit approaching",
    "description": "Environmental compliance at 88% — below threshold. Address waste disposal documentation.",
    "impact": "Pass April audit"
  },
  {
    "priority": "high",
    "title": "Insurance renewal due this month",
    "description": "General liability and workers comp policies expire Mar 31. Contact broker.",
    "impact": "Maintain coverage"
  },
  {
    "priority": "medium",
    "title": "Update data protection procedures",
    "description": "CCPA amendments took effect Jan 1. Review and update privacy notices.",
    "impact": "Stay current"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'area', label: 'Compliance Area' },
  { key: 'status', label: 'Status' },
  { key: 'score', label: 'Score', align: 'center' as const },
  { key: 'lastAudit', label: 'Last Audit' },
  { key: 'nextReview', label: 'Next Review' }
];

export default function ComplianceConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/compliance?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Compliance"
      agentSlug="compliance"
      agentIcon="🛡️"
      agentColor="#0F766E"
      department="Legal"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Compliance Status by Area"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
