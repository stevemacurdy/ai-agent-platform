// ─── HR Agent Data Layer ──────────────────────────────────
// Employee roster, PTO tracking, hiring pipeline,
// compliance deadlines, and workforce analytics.

import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface Employee { id: string; name: string; role: string; department: string; startDate: string; status: 'active' | 'on-leave' | 'terminated'; email: string; manager: string; ptoBalance: number; ptoUsed: number; nextReview: string; certifications: { name: string; expiry: string; status: 'valid' | 'expiring' | 'expired' }[]; }
export interface HiringReq { id: string; title: string; department: string; status: 'open' | 'screening' | 'interviewing' | 'offer' | 'filled'; priority: 'low' | 'medium' | 'high' | 'urgent'; postedDate: string; applicants: number; interviews: number; daysOpen: number; hiringManager: string; }
export interface HRData { source: 'live' | 'demo'; employees: Employee[]; hiring: HiringReq[]; summary: { totalEmployees: number; activeEmployees: number; onLeave: number; openPositions: number; urgentHires: number; avgTenure: number; expiringCerts: number; upcomingReviews: number; turnoverRate: number; ptoUtilization: number; }; recommendations: string[]; }

export async function getHRData(companyId: string): Promise<HRData> { return getDemoHR(); }

function getDemoHR(): HRData {
  const employees: Employee[] = [
    { id: 'emp-1', name: 'Marcus Torres', role: 'Lead Installer', department: 'Operations', startDate: '2022-03-15', status: 'active', email: 'mtorres@woulfgroup.com', manager: 'Steve Macurdy', ptoBalance: 12, ptoUsed: 3, nextReview: '2026-03-15', certifications: [{ name: 'OSHA 30', expiry: '2027-06-01', status: 'valid' }, { name: 'Forklift', expiry: '2026-04-15', status: 'expiring' }, { name: 'Welding', expiry: '2027-01-01', status: 'valid' }] },
    { id: 'emp-2', name: 'Kevin Park', role: 'Installer', department: 'Operations', startDate: '2023-06-01', status: 'active', email: 'kpark@woulfgroup.com', manager: 'Marcus Torres', ptoBalance: 10, ptoUsed: 5, nextReview: '2026-06-01', certifications: [{ name: 'OSHA 10', expiry: '2026-08-01', status: 'valid' }, { name: 'Forklift', expiry: '2026-03-10', status: 'expired' }] },
    { id: 'emp-3', name: 'Ryan Mitchell', role: 'Electrician', department: 'Operations', startDate: '2021-09-10', status: 'active', email: 'rmitchell@woulfgroup.com', manager: 'Steve Macurdy', ptoBalance: 15, ptoUsed: 2, nextReview: '2026-09-10', certifications: [{ name: 'Journeyman Electrician', expiry: '2028-01-01', status: 'valid' }, { name: 'OSHA 30', expiry: '2026-12-01', status: 'valid' }] },
    { id: 'emp-4', name: 'Sofia Ramirez', role: 'Project Coordinator', department: 'Admin', startDate: '2024-01-15', status: 'active', email: 'sramirez@woulfgroup.com', manager: 'Steve Macurdy', ptoBalance: 10, ptoUsed: 4, nextReview: '2026-07-15', certifications: [{ name: 'PMP', expiry: '2027-03-01', status: 'valid' }] },
    { id: 'emp-5', name: 'David Chen', role: 'Controls Tech', department: 'Engineering', startDate: '2023-11-01', status: 'active', email: 'dchen@woulfgroup.com', manager: 'Steve Macurdy', ptoBalance: 10, ptoUsed: 1, nextReview: '2026-05-01', certifications: [{ name: 'PLC Programming', expiry: '2027-11-01', status: 'valid' }] },
    { id: 'emp-6', name: 'Brandon Lee', role: 'Installer', department: 'Operations', startDate: '2025-08-15', status: 'active', email: 'blee@woulfgroup.com', manager: 'Marcus Torres', ptoBalance: 5, ptoUsed: 0, nextReview: '2026-08-15', certifications: [{ name: 'OSHA 10', expiry: '2027-08-01', status: 'valid' }] },
    { id: 'emp-7', name: 'Tyler Smith', role: 'Welder/Fabricator', department: 'Operations', startDate: '2022-07-20', status: 'active', email: 'tsmith@woulfgroup.com', manager: 'Marcus Torres', ptoBalance: 12, ptoUsed: 6, nextReview: '2026-07-20', certifications: [{ name: 'AWS Certified', expiry: '2026-07-20', status: 'expiring' }, { name: 'OSHA 30', expiry: '2027-02-01', status: 'valid' }] },
    { id: 'emp-8', name: 'James Wheeler', role: 'Installer', department: 'Operations', startDate: '2024-04-01', status: 'on-leave', email: 'jwheeler@woulfgroup.com', manager: 'Marcus Torres', ptoBalance: 8, ptoUsed: 8, nextReview: '2026-04-01', certifications: [{ name: 'OSHA 10', expiry: '2026-10-01', status: 'valid' }, { name: 'Aerial Lift', expiry: '2026-04-01', status: 'expiring' }] },
  ];

  const hiring: HiringReq[] = [
    { id: 'hr-1', title: 'Warehouse Installer', department: 'Operations', status: 'interviewing', priority: 'urgent', postedDate: '2026-02-01', applicants: 14, interviews: 3, daysOpen: 29, hiringManager: 'Steve Macurdy' },
    { id: 'hr-2', title: 'Warehouse Installer (2nd)', department: 'Operations', status: 'screening', priority: 'high', postedDate: '2026-02-15', applicants: 8, interviews: 0, daysOpen: 15, hiringManager: 'Steve Macurdy' },
    { id: 'hr-3', title: 'Sales Engineer', department: 'Sales', status: 'open', priority: 'medium', postedDate: '2026-02-20', applicants: 5, interviews: 0, daysOpen: 10, hiringManager: 'Steve Macurdy' },
  ];

  const expiringCerts = employees.flatMap(e => e.certifications).filter(c => c.status === 'expiring' || c.status === 'expired').length;
  const upcomingReviews = employees.filter(e => { const d = new Date(e.nextReview); const now = new Date(); return d.getTime() - now.getTime() < 30 * 86400000 && d.getTime() > now.getTime(); }).length;

  return {
    source: 'demo', employees, hiring,
    summary: {
      totalEmployees: employees.length, activeEmployees: employees.filter(e => e.status === 'active').length, onLeave: employees.filter(e => e.status === 'on-leave').length,
      openPositions: hiring.filter(h => h.status !== 'filled').length, urgentHires: hiring.filter(h => h.priority === 'urgent').length,
      avgTenure: 2.4, expiringCerts, upcomingReviews, turnoverRate: 8, ptoUtilization: Math.round(employees.reduce((s, e) => s + e.ptoUsed, 0) / employees.reduce((s, e) => s + (e.ptoBalance + e.ptoUsed), 0) * 100),
    },
    recommendations: [
      'Kevin Park forklift certification expired — schedule renewal immediately (cannot operate until recertified)',
      'Marcus Torres annual review due March 15 — prepare performance summary',
      'Urgent installer hire has 3 candidates in interview stage — make offer this week to start before FreshDirect project',
      'Tyler Smith AWS welding cert expiring July — schedule renewal for June',
      'James Wheeler on leave — confirm return date and project reassignment',
    ],
  };
}
