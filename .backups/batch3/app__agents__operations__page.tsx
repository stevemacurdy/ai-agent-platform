'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';

const KPIS = [
  {
    "label": "Active Projects",
    "value": "8",
    "trend": "+1"
  },
  {
    "label": "On-Time Rate",
    "value": "91%",
    "trend": "+2%"
  },
  {
    "label": "Crew Members",
    "value": "24"
  },
  {
    "label": "Budget Variance",
    "value": "-2.1%"
  }
];

const MODULES = [
  {
    "id": "projects",
    "name": "Project Tracker",
    "description": "Monitor all active projects with real-time status, budget tracking, and milestone management.",
    "features": [
      "Gantt chart view",
      "Budget vs actual",
      "Milestone alerts",
      "Photo documentation",
      "Client reporting"
    ]
  },
  {
    "id": "crews",
    "name": "Crew Scheduler",
    "description": "Assign crews to projects, track certifications, and manage availability.",
    "features": [
      "Drag-and-drop scheduling",
      "Certification tracking",
      "Overtime alerts",
      "Shift management"
    ]
  },
  {
    "id": "equipment",
    "name": "Equipment Manager",
    "description": "Track equipment location, maintenance schedules, and utilization rates.",
    "features": [
      "GPS tracking",
      "Maintenance alerts",
      "Utilization reports",
      "Depreciation tracking"
    ]
  },
  {
    "id": "safety",
    "name": "Safety Dashboard",
    "description": "OSHA compliance tracking, incident reports, and safety training records.",
    "features": [
      "Incident reporting",
      "Safety training log",
      "OSHA compliance",
      "Near-miss tracking"
    ]
  }
];

export default function OperationsAgentPage() {
  const { currentCompany, isLoading } = useTenant();
  const [activeModule, setActiveModule] = useState(MODULES[0]?.id || '');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="text-4xl">⚙️</div>
          <div>
            <h1 className="text-2xl font-bold">Operations Agent</h1>
            <p className="text-sm text-gray-400">
              {isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">LIVE</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition">Submit</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Edit</button>
          <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">Download</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIS.map((kpi, i) => (
          <div key={i} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{kpi.label}</div>
            <div className="text-xl font-mono font-bold mt-1">{kpi.value}</div>
            {kpi.trend && <div className="text-[10px] text-emerald-400 mt-1">{kpi.trend}</div>}
          </div>
        ))}
      </div>

      {/* Module Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModule(m.id)}
            className={"px-4 py-2 rounded-lg text-sm transition " + (activeModule === m.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Module Content */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6">
        {MODULES.filter(m => m.id === activeModule).map(m => (
          <div key={m.id}>
            <h2 className="text-lg font-semibold mb-2">{m.name}</h2>
            <p className="text-sm text-gray-400 mb-4">{m.description}</p>
            <div className="grid grid-cols-2 gap-3">
              {m.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!currentCompany && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-8 text-center">
          <div className="text-3xl mb-3">⚙️</div>
          <p className="text-sm text-gray-500">Select a company from the sidebar to load data.</p>
        </div>
      )}
    </div>
  );
}
