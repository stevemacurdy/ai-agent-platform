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
    "id": "courses",
    "label": "Courses",
    "icon": "📚"
  },
  {
    "id": "compliance",
    "label": "Compliance",
    "icon": "✅"
  }
];

const DEMO_KPIS: KPICard[] = [
  {
    "label": "Courses Active",
    "value": "12",
    "change": "3 new this quarter",
    "trend": "up",
    "icon": "📚"
  },
  {
    "label": "Completion Rate",
    "value": "87%",
    "change": "+5% improvement",
    "trend": "up",
    "icon": "✅"
  },
  {
    "label": "Compliance",
    "value": "96%",
    "change": "2 overdue",
    "trend": "down",
    "icon": "⚠️"
  },
  {
    "label": "Avg Score",
    "value": "88/100",
    "change": "+3 points",
    "trend": "up",
    "icon": "🏆"
  }
];

const DEMO_TABLE = [
  {
    "course": "OSHA Safety Certification",
    "enrolled": 34,
    "completed": 28,
    "avgScore": "91%",
    "deadline": "Mar 31"
  },
  {
    "course": "Forklift Operations",
    "enrolled": 12,
    "completed": 10,
    "avgScore": "94%",
    "deadline": "Apr 15"
  },
  {
    "course": "Warehouse Best Practices",
    "enrolled": 30,
    "completed": 22,
    "avgScore": "86%",
    "deadline": "Ongoing"
  },
  {
    "course": "Customer Service Excellence",
    "enrolled": 20,
    "completed": 18,
    "avgScore": "89%",
    "deadline": "Ongoing"
  },
  {
    "course": "Leadership Development",
    "enrolled": 8,
    "completed": 5,
    "avgScore": "82%",
    "deadline": "May 1"
  }
];

const DEMO_RECS: Recommendation[] = [
  {
    "priority": "high",
    "title": "2 team members overdue on OSHA",
    "description": "Safety certification expires in 15 days. Send reminders and schedule make-up sessions.",
    "impact": "Maintain compliance"
  },
  {
    "priority": "medium",
    "title": "Launch Q2 training catalog",
    "description": "Prepare new courses for API integration training and advanced WMS operations.",
    "impact": "Upskill 15+ team members"
  },
  {
    "priority": "low",
    "title": "Gamify completion tracking",
    "description": "Teams with badges and leaderboards show 23% higher completion rates.",
    "impact": "+10% completion rate"
  }
];

const COLUMNS: TableColumn[] = [
  { key: 'course', label: 'Course' },
  { key: 'enrolled', label: 'Enrolled', align: 'center' as const },
  { key: 'completed', label: 'Completed', align: 'center' as const },
  { key: 'avgScore', label: 'Avg Score', align: 'center' as const },
  { key: 'deadline', label: 'Deadline' }
];

export default function TrainingConsole() {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/agents/training?view=${tab}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setData(d.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [tab]);

  return (
    <AgentConsole
      agentName="Training"
      agentSlug="training"
      agentIcon="🎓"
      agentColor="#8B5CF6"
      department="People"
      kpis={data?.kpis || DEMO_KPIS}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tableColumns={COLUMNS}
      tableData={data?.tableData || DEMO_TABLE}
      tableTitle="Active Courses"
      recommendations={data?.recommendations || DEMO_RECS}
      loading={loading}
      error={error}
    />
  );
}
