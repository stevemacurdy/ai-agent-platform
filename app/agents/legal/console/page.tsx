'use client';
import { useState, useEffect } from 'react';
import AgentConsole from '@/components/consoles/AgentConsole';
import type { KPICard, TableColumn, Recommendation, ConsoleTab } from '@/components/consoles/AgentConsole';
import { useTrackConsoleView } from '@/lib/hooks/useUsageTracking'

const TABS: ConsoleTab[] = [
  {
    "id": "dashboard",
    "label": "Dashboard",
    "icon": "📊"
  },
  {
    "id": "contracts",
    "label": "Contracts",
    "icon": "📄"
  },
  {
    "id": "risk",
    "label": "Risk",
    "icon": "⚠️"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Active Contracts",
    "value": "67",
    "change": "5 expiring soon",
    "trend": "flat",
    "icon": "📄"
  },
  {
    "label": "Pending Review",
    "value": "8",
    "change": "3 high priority",
    "trend": "down",
    "icon": "⏳"
  },
  {
    "label": "Compliance Score",
    "value": "94%",
    "change": "+2% this quarter",
    "trend": "up",
    "icon": "✅"
  },
  {
    "label": "Risk Items",
    "value": "3",
    "change": "1 critical",
    "trend": "down",
    "icon": "⚠️"
  }
];

const DEMO_TABLE = [
  {
    "contract": "MSA-2024-089",
    "counterparty": "Cabela's",
    "type": "Master Service",
    "value": "$2.4M",
    "action": "Renewal due Apr 1"
  },
  {
    "contract": "SOW-2024-156",
    "counterparty": "Frito-Lay",
    "type": "Statement of Work",
    "value": "$890K",
    "action": "Signature pending"
  },
  {
    "contract": "NDA-2024-234",
    "counterparty": "Global Logistics",
    "type": "NDA",
    "value": "N/A",
    "action": "Review terms"
  },
  {
    "contract": "SLA-2024-045",
    "counterparty": "Summit Storage",
    "type": "Service Level",
    "value": "$340K",
    "action": "Update SLA metrics"
  },
  {
    "contract": "VND-2024-078",
    "counterparty": "Steel Solutions",
    "type": "Vendor Agreement",
    "value": "$156K",
    "action": "Price renegotiation"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "Cabela's MSA renewal approaching",
    "description": "Master Service Agreement expires Apr 1. Begin renewal discussions immediately.",
    "impact": "Protect $2.4M contract"
  },
  {
    "priority": "high",
    "title": "Frito-Lay SOW awaiting signature",
    "description": "SOW-2024-156 has been pending for 5 days. Follow up with their legal team.",
    "impact": "Start $890K project"
  },
  {
    "priority": "medium",
    "title": "Update insurance certificates",
    "description": "3 vendor agreements require updated COIs. Current certificates expire in 45 days.",
    "impact": "Maintain compliance"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'contract', label: 'Contract' },
  { key: 'counterparty', label: 'Counterparty' },
  { key: 'type', label: 'Type' },
  { key: 'value', label: 'Value', align: 'right' as const },
  { key: 'action', label: 'Action Needed' }
];

export default function LegalConsole() {
  useTrackConsoleView('legal')
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/legal?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Legal"
      agentSlug="legal"
      agentIcon="⚖️"
      agentColor="#374151"
      department="Legal"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Contracts Requiring Action"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
