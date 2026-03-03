// ─── Operations Agent Data Layer ──────────────────────────
// Active project tracking, resource allocation, crew
// scheduling, capacity planning, and operational KPIs.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Types ──────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'at-risk';
  startDate: string;
  targetEndDate: string;
  percentComplete: number;
  budget: number;
  spent: number;
  budgetVariance: number;
  projectManager: string;
  crewSize: number;
  location: string;
  milestones: { name: string; dueDate: string; status: 'done' | 'in-progress' | 'upcoming' | 'late' }[];
  risks: string[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  certifications: string[];
  currentProject: string | null;
  utilization: number;
  availability: 'available' | 'assigned' | 'on-leave' | 'partial';
  hourlyRate: number;
  hoursThisWeek: number;
}

export interface CapacityWeek {
  week: string;
  startDate: string;
  totalHoursAvailable: number;
  hoursAllocated: number;
  utilization: number;
  projectBreakdown: { project: string; hours: number }[];
  status: 'under' | 'optimal' | 'over';
}

export interface OperationsData {
  source: 'live' | 'demo';
  projects: Project[];
  crew: CrewMember[];
  capacity: CapacityWeek[];
  summary: {
    activeProjects: number;
    projectsAtRisk: number;
    totalRevenue: number;
    totalBudgetVariance: number;
    crewUtilization: number;
    availableCrew: number;
    totalCrew: number;
    avgProjectCompletion: number;
    onTimeRate: number;
    safetyIncidents: number;
  };
  recommendations: string[];
}

// ─── Main data fetcher ──────────────────────────────────

export async function getOperationsData(companyId: string): Promise<OperationsData> {
  // Future: pull from project management integration
  return getDemoOperations();
}

function getDemoOperations(): OperationsData {
  const projects: Project[] = [
    {
      id: 'proj-1', name: 'Logicorp Phase 2 — Mezzanine Build', client: 'Logicorp', status: 'in-progress',
      startDate: '2026-01-15', targetEndDate: '2026-04-15', percentComplete: 45, budget: 285000, spent: 142000, budgetVariance: -5200,
      projectManager: 'Steve Macurdy', crewSize: 8, location: 'Salt Lake City, UT',
      milestones: [
        { name: 'Steel fabrication complete', dueDate: '2026-02-15', status: 'done' },
        { name: 'Mezzanine framing installed', dueDate: '2026-03-01', status: 'done' },
        { name: 'Decking and railings', dueDate: '2026-03-20', status: 'in-progress' },
        { name: 'Electrical and fire suppression', dueDate: '2026-04-01', status: 'upcoming' },
        { name: 'Final inspection and handoff', dueDate: '2026-04-15', status: 'upcoming' },
      ],
      risks: ['Steel delivery delay possible from supplier', 'Electrical subcontractor availability TBD'],
    },
    {
      id: 'proj-2', name: 'FreshDirect — Cold Storage Racking', client: 'FreshDirect Logistics', status: 'planning',
      startDate: '2026-03-15', targetEndDate: '2026-05-30', percentComplete: 5, budget: 185000, spent: 8500, budgetVariance: 0,
      projectManager: 'Steve Macurdy', crewSize: 0, location: 'West Valley City, UT',
      milestones: [
        { name: 'Site survey and design', dueDate: '2026-03-20', status: 'in-progress' },
        { name: 'Material procurement', dueDate: '2026-04-01', status: 'upcoming' },
        { name: 'Installation Phase 1', dueDate: '2026-04-25', status: 'upcoming' },
        { name: 'Installation Phase 2', dueDate: '2026-05-15', status: 'upcoming' },
        { name: 'Commissioning', dueDate: '2026-05-30', status: 'upcoming' },
      ],
      risks: ['Cold storage materials have longer lead times', 'Need to hire 2 additional installers'],
    },
    {
      id: 'proj-3', name: 'Cabelas — Conveyor Upgrade Bay 3', client: 'Cabelas', status: 'at-risk',
      startDate: '2026-02-01', targetEndDate: '2026-03-15', percentComplete: 68, budget: 92000, spent: 78000, budgetVariance: 14800,
      projectManager: 'Steve Macurdy', crewSize: 5, location: 'Sidney, NE',
      milestones: [
        { name: 'Old conveyor removal', dueDate: '2026-02-10', status: 'done' },
        { name: 'Foundation and supports', dueDate: '2026-02-20', status: 'done' },
        { name: 'New conveyor installation', dueDate: '2026-03-05', status: 'late' },
        { name: 'Controls and testing', dueDate: '2026-03-12', status: 'upcoming' },
        { name: 'Go-live', dueDate: '2026-03-15', status: 'upcoming' },
      ],
      risks: ['$14.8K over budget due to unexpected foundation work', 'Conveyor parts from Hytrol 10 days late', 'Go-live deadline at risk — client wants penalty clause discussion'],
    },
    {
      id: 'proj-4', name: 'Sportsmans — Pick Module Optimization', client: 'Sportsmans Warehouse', status: 'in-progress',
      startDate: '2026-02-10', targetEndDate: '2026-03-25', percentComplete: 72, budget: 65000, spent: 44000, budgetVariance: -2200,
      projectManager: 'Steve Macurdy', crewSize: 4, location: 'Midvale, UT',
      milestones: [
        { name: 'Layout redesign approved', dueDate: '2026-02-15', status: 'done' },
        { name: 'Racking reconfiguration', dueDate: '2026-02-28', status: 'done' },
        { name: 'Pick path optimization', dueDate: '2026-03-10', status: 'in-progress' },
        { name: 'Label and signage update', dueDate: '2026-03-20', status: 'upcoming' },
        { name: 'Training and handoff', dueDate: '2026-03-25', status: 'upcoming' },
      ],
      risks: ['Minor — on track and under budget'],
    },
  ];

  const crew: CrewMember[] = [
    { id: 'crew-1', name: 'Marcus Torres', role: 'Lead Installer', certifications: ['OSHA 30', 'Forklift', 'Welding'], currentProject: 'Logicorp Phase 2', utilization: 100, availability: 'assigned', hourlyRate: 42, hoursThisWeek: 45 },
    { id: 'crew-2', name: 'Kevin Park', role: 'Installer', certifications: ['OSHA 10', 'Forklift'], currentProject: 'Logicorp Phase 2', utilization: 100, availability: 'assigned', hourlyRate: 32, hoursThisWeek: 42 },
    { id: 'crew-3', name: 'Ryan Mitchell', role: 'Electrician', certifications: ['Journeyman Electrician', 'OSHA 30'], currentProject: 'Cabelas Conveyor', utilization: 85, availability: 'partial', hourlyRate: 55, hoursThisWeek: 38 },
    { id: 'crew-4', name: 'David Chen', role: 'Controls Tech', certifications: ['PLC Programming', 'OSHA 10'], currentProject: 'Cabelas Conveyor', utilization: 100, availability: 'assigned', hourlyRate: 48, hoursThisWeek: 44 },
    { id: 'crew-5', name: 'James Wheeler', role: 'Installer', certifications: ['OSHA 10', 'Aerial Lift'], currentProject: 'Sportsmans Pick Module', utilization: 90, availability: 'assigned', hourlyRate: 30, hoursThisWeek: 40 },
    { id: 'crew-6', name: 'Sofia Ramirez', role: 'Project Coordinator', certifications: ['PMP', 'OSHA 10'], currentProject: null, utilization: 40, availability: 'partial', hourlyRate: 38, hoursThisWeek: 20 },
    { id: 'crew-7', name: 'Brandon Lee', role: 'Installer', certifications: ['OSHA 10', 'Forklift'], currentProject: null, utilization: 0, availability: 'available', hourlyRate: 28, hoursThisWeek: 0 },
    { id: 'crew-8', name: 'Tyler Smith', role: 'Welder/Fabricator', certifications: ['AWS Certified', 'OSHA 30'], currentProject: 'Logicorp Phase 2', utilization: 100, availability: 'assigned', hourlyRate: 45, hoursThisWeek: 44 },
  ];

  const capacity: CapacityWeek[] = [
    { week: 'Mar 3-7', startDate: '2026-03-03', totalHoursAvailable: 320, hoursAllocated: 285, utilization: 89, projectBreakdown: [{ project: 'Logicorp', hours: 120 }, { project: 'Cabelas', hours: 85 }, { project: 'Sportsmans', hours: 80 }], status: 'optimal' },
    { week: 'Mar 10-14', startDate: '2026-03-10', totalHoursAvailable: 320, hoursAllocated: 310, utilization: 97, projectBreakdown: [{ project: 'Logicorp', hours: 120 }, { project: 'Cabelas', hours: 110 }, { project: 'Sportsmans', hours: 80 }], status: 'over' },
    { week: 'Mar 17-21', startDate: '2026-03-17', totalHoursAvailable: 320, hoursAllocated: 260, utilization: 81, projectBreakdown: [{ project: 'Logicorp', hours: 120 }, { project: 'Sportsmans', hours: 60 }, { project: 'FreshDirect', hours: 80 }], status: 'optimal' },
    { week: 'Mar 24-28', startDate: '2026-03-24', totalHoursAvailable: 320, hoursAllocated: 200, utilization: 63, projectBreakdown: [{ project: 'Logicorp', hours: 120 }, { project: 'FreshDirect', hours: 80 }], status: 'under' },
  ];

  return {
    source: 'demo',
    projects,
    crew,
    capacity,
    summary: {
      activeProjects: projects.filter(p => p.status === 'in-progress' || p.status === 'at-risk').length,
      projectsAtRisk: projects.filter(p => p.status === 'at-risk').length,
      totalRevenue: projects.reduce((s, p) => s + p.budget, 0),
      totalBudgetVariance: projects.reduce((s, p) => s + p.budgetVariance, 0),
      crewUtilization: Math.round(crew.reduce((s, c) => s + c.utilization, 0) / crew.length),
      availableCrew: crew.filter(c => c.availability === 'available' || c.availability === 'partial').length,
      totalCrew: crew.length,
      avgProjectCompletion: Math.round(projects.reduce((s, p) => s + p.percentComplete, 0) / projects.length),
      onTimeRate: 75,
      safetyIncidents: 0,
    },
    recommendations: [
      'Cabelas conveyor project is at-risk and $14.8K over budget — escalate Hytrol parts delay and prepare client communication',
      'Week of Mar 10 is at 97% capacity — any slip will cause cascading delays',
      'Brandon Lee is unassigned — deploy to FreshDirect site survey starting Mar 15',
      'FreshDirect cold storage needs 2 additional installers — start recruiting or subcontracting now',
      'Zero safety incidents this month — recognize crew and maintain daily toolbox talks',
    ],
  };
}
