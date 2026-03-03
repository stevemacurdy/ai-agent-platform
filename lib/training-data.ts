// ─── Training Agent Data Layer ────────────────────────────
// Employee training programs, skill gaps, onboarding,
// certification tracking, and learning analytics.

import { createClient } from '@supabase/supabase-js';
function supabaseAdmin() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } }); }

export interface TrainingProgram { id: string; name: string; category: string; type: 'required' | 'recommended' | 'optional'; format: 'in-person' | 'online' | 'hybrid'; durationHours: number; enrolled: number; completed: number; completionRate: number; nextSession: string | null; instructor: string; }
export interface SkillGap { id: string; skill: string; department: string; currentLevel: number; targetLevel: number; gap: number; priority: 'low' | 'medium' | 'high'; affectedEmployees: number; suggestedTraining: string; }
export interface OnboardingStatus { id: string; employee: string; startDate: string; tasksTotal: number; tasksCompleted: number; percentComplete: number; daysRemaining: number; blockers: string[]; }
export interface TrainingData { source: 'live' | 'demo'; programs: TrainingProgram[]; skillGaps: SkillGap[]; onboarding: OnboardingStatus[]; summary: { totalPrograms: number; activeEnrollments: number; avgCompletionRate: number; overdueTrainings: number; skillGapsIdentified: number; highPriorityGaps: number; onboardingInProgress: number; trainingHoursThisMonth: number; complianceTrainingRate: number; }; recommendations: string[]; }

export async function getTrainingData(companyId: string): Promise<TrainingData> { return getDemoTraining(); }

function getDemoTraining(): TrainingData {
  const programs: TrainingProgram[] = [
    { id: 'tp-1', name: 'OSHA 10-Hour General Safety', category: 'Safety', type: 'required', format: 'in-person', durationHours: 10, enrolled: 8, completed: 6, completionRate: 75, nextSession: '2026-03-15', instructor: 'External — SafetyFirst Inc' },
    { id: 'tp-2', name: 'Forklift Operator Certification', category: 'Safety', type: 'required', format: 'in-person', durationHours: 8, enrolled: 5, completed: 4, completionRate: 80, nextSession: '2026-03-10', instructor: 'Marcus Torres' },
    { id: 'tp-3', name: 'Fall Protection Refresher', category: 'Safety', type: 'required', format: 'in-person', durationHours: 4, enrolled: 6, completed: 3, completionRate: 50, nextSession: '2026-03-12', instructor: 'External — Heights Safety' },
    { id: 'tp-4', name: 'PLC Programming Basics', category: 'Technical', type: 'recommended', format: 'online', durationHours: 16, enrolled: 3, completed: 1, completionRate: 33, nextSession: null, instructor: 'David Chen' },
    { id: 'tp-5', name: 'Project Management Essentials', category: 'Professional', type: 'optional', format: 'online', durationHours: 12, enrolled: 2, completed: 1, completionRate: 50, nextSession: null, instructor: 'Sofia Ramirez' },
    { id: 'tp-6', name: 'WMS Software Training', category: 'Technical', type: 'recommended', format: 'hybrid', durationHours: 8, enrolled: 4, completed: 2, completionRate: 50, nextSession: '2026-03-20', instructor: 'David Chen' },
    { id: 'tp-7', name: 'New Hire Orientation', category: 'Onboarding', type: 'required', format: 'in-person', durationHours: 4, enrolled: 1, completed: 0, completionRate: 0, nextSession: '2026-03-05', instructor: 'Sofia Ramirez' },
  ];

  const skillGaps: SkillGap[] = [
    { id: 'sg-1', skill: 'PLC/Controls Programming', department: 'Engineering', currentLevel: 3, targetLevel: 7, gap: 4, priority: 'high', affectedEmployees: 3, suggestedTraining: 'PLC Programming Basics + Advanced Automation course' },
    { id: 'sg-2', skill: 'Welding (TIG)', department: 'Operations', currentLevel: 5, targetLevel: 8, gap: 3, priority: 'medium', affectedEmployees: 2, suggestedTraining: 'Advanced TIG welding workshop — community college partnership' },
    { id: 'sg-3', skill: 'AutoCAD / Warehouse Design', department: 'Engineering', currentLevel: 4, targetLevel: 7, gap: 3, priority: 'high', affectedEmployees: 2, suggestedTraining: 'AutoCAD certification course + warehouse layout design seminar' },
    { id: 'sg-4', skill: 'Cold Storage Systems', department: 'Operations', currentLevel: 2, targetLevel: 6, gap: 4, priority: 'high', affectedEmployees: 4, suggestedTraining: 'Cold chain certification — required for FreshDirect project' },
    { id: 'sg-5', skill: 'Customer Communication', department: 'Operations', currentLevel: 5, targetLevel: 7, gap: 2, priority: 'low', affectedEmployees: 6, suggestedTraining: 'Client communication workshop — quarterly lunch & learn' },
  ];

  const onboarding: OnboardingStatus[] = [
    { id: 'ob-1', employee: 'Brandon Lee', startDate: '2025-08-15', tasksTotal: 18, tasksCompleted: 16, percentComplete: 89, daysRemaining: 5, blockers: ['Pending aerial lift certification'] },
  ];

  return {
    source: 'demo', programs, skillGaps, onboarding,
    summary: {
      totalPrograms: programs.length, activeEnrollments: programs.reduce((s, p) => s + (p.enrolled - p.completed), 0),
      avgCompletionRate: Math.round(programs.reduce((s, p) => s + p.completionRate, 0) / programs.length),
      overdueTrainings: 2, skillGapsIdentified: skillGaps.length, highPriorityGaps: skillGaps.filter(g => g.priority === 'high').length,
      onboardingInProgress: onboarding.length, trainingHoursThisMonth: 48, complianceTrainingRate: 75,
    },
    recommendations: [
      'Fall protection training only 50% complete — 3 crew members must finish before March 15 deadline',
      'Cold storage skill gap is critical for FreshDirect project starting March 15 — enroll team in certification ASAP',
      'Kevin Park forklift recertification scheduled March 10 — confirm attendance',
      'PLC programming gap limits automation project capability — invest in David Chen leading internal training',
      'Brandon Lee onboarding 89% complete — schedule aerial lift cert to close out',
    ],
  };
}
