'use client';
import { useState } from 'react';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '🎓' },
  { id: 'courses', name: 'Courses', icon: '📚' },
  { id: 'certs', name: 'Certifications', icon: '🏅' },
  { id: 'skills', name: 'Skills Matrix', icon: '📊' },
];

const COURSES = [
  { name: 'Warehouse Safety Fundamentals', category: 'Safety', duration: '2h', enrolled: 24, completed: 18, status: 'active' },
  { name: 'Forklift Certification Prep', category: 'Operations', duration: '4h', enrolled: 12, completed: 8, status: 'active' },
  { name: 'Customer Service Excellence', category: 'Soft Skills', duration: '1.5h', enrolled: 30, completed: 30, status: 'completed' },
  { name: 'Inventory Management Best Practices', category: 'Operations', duration: '3h', enrolled: 15, completed: 5, status: 'active' },
  { name: 'Leadership Development 101', category: 'Leadership', duration: '6h', enrolled: 8, completed: 2, status: 'active' },
  { name: 'Hazardous Materials Handling', category: 'Safety', duration: '3h', enrolled: 20, completed: 20, status: 'completed' },
  { name: 'New Hire Orientation', category: 'Onboarding', duration: '1h', enrolled: 6, completed: 0, status: 'draft' },
];

const CERTS = [
  { name: 'OSHA 10-Hour General', holder: 'Marcus Rivera', expires: '2026-08-15', status: 'active' },
  { name: 'Forklift Operator', holder: 'James Chen', expires: '2026-03-20', status: 'expiring' },
  { name: 'OSHA 10-Hour General', holder: 'Sarah Kim', expires: '2026-11-01', status: 'active' },
  { name: 'Hazmat Handler', holder: 'David Park', expires: '2025-12-30', status: 'expired' },
  { name: 'CPR / First Aid', holder: 'Lisa Tran', expires: '2026-06-15', status: 'active' },
  { name: 'Forklift Operator', holder: 'Tom Bradley', expires: '2026-01-10', status: 'expired' },
  { name: 'Food Safety (ServSafe)', holder: 'Ana Morales', expires: '2027-02-28', status: 'active' },
];

const SKILLS = [
  { name: 'Marcus Rivera', role: 'Warehouse Lead', skills: { safety: 95, operations: 88, leadership: 72, tech: 60 } },
  { name: 'James Chen', role: 'Forklift Operator', skills: { safety: 80, operations: 92, leadership: 45, tech: 55 } },
  { name: 'Sarah Kim', role: 'Inventory Specialist', skills: { safety: 70, operations: 85, leadership: 50, tech: 90 } },
  { name: 'David Park', role: 'Receiving Clerk', skills: { safety: 65, operations: 78, leadership: 30, tech: 70 } },
  { name: 'Lisa Tran', role: 'Shift Supervisor', skills: { safety: 90, operations: 82, leadership: 88, tech: 65 } },
];

const statusColor = (s: string) => {
  switch (s) {
    case 'active': return 'bg-emerald-50 text-emerald-600';
    case 'completed': return 'bg-blue-50 text-blue-600';
    case 'draft': return 'bg-gray-500/10 text-[#6B7280]';
    case 'expiring': return 'bg-amber-50 text-amber-600';
    case 'expired': return 'bg-rose-500/10 text-rose-400';
    default: return 'bg-gray-500/10 text-[#6B7280]';
  }
};

export default function TrainingAgent() {
  const [tab, setTab] = useState('overview');

  const activeCourses = COURSES.filter(c => c.status === 'active').length;
  const totalEnrolled = COURSES.reduce((s, c) => s + c.enrolled, 0);
  const totalCompleted = COURSES.reduce((s, c) => s + c.completed, 0);
  const expiringCerts = CERTS.filter(c => c.status === 'expiring' || c.status === 'expired').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">🎓</div>
        <div>
          <h1 className="text-2xl font-bold">Training Employee</h1>
          <p className="text-sm text-[#6B7280]">Team training programs, certifications & skills tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Active Courses</div>
          <div className="text-2xl font-bold mt-1">{activeCourses}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Enrolled</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{totalEnrolled}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Completions</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{totalCompleted}</div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="text-[9px] text-[#9CA3AF] uppercase">Certs Expiring</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{expiringCerts}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E5E7EB] pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Active Courses</h3>
            <div className="space-y-2">
              {COURSES.filter(c => c.status === 'active').map(c => (
                <div key={c.name} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm text-white">{c.name}</div><div className="text-[10px] text-[#9CA3AF]">{c.category} · {c.duration}</div></div>
                  <div className="text-right"><div className="text-sm font-mono">{c.completed}/{c.enrolled}</div><div className="text-[10px] text-[#9CA3AF]">completed</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Certification Alerts</h3>
            <div className="space-y-2">
              {CERTS.filter(c => c.status !== 'active').map(c => (
                <div key={c.name + c.holder} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm text-white">{c.holder}</div><div className="text-[10px] text-[#9CA3AF]">{c.name}</div></div>
                  <span className={'text-[10px] px-2 py-0.5 rounded-full font-medium ' + statusColor(c.status)}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Courses */}
      {tab === 'courses' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E5E7EB] text-[10px] text-[#9CA3AF] uppercase">
              <th className="text-left px-4 py-3">Course</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Duration</th><th className="text-left px-4 py-3">Progress</th><th className="text-left px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {COURSES.map(c => (
                <tr key={c.name} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{c.category}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{c.duration}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white shadow-sm rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: (c.enrolled > 0 ? (c.completed / c.enrolled) * 100 : 0) + '%' }} /></div>
                      <span className="text-[10px] text-[#9CA3AF]">{c.completed}/{c.enrolled}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded-full font-medium ' + statusColor(c.status)}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certifications */}
      {tab === 'certs' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E5E7EB] text-[10px] text-[#9CA3AF] uppercase">
              <th className="text-left px-4 py-3">Certification</th><th className="text-left px-4 py-3">Holder</th><th className="text-left px-4 py-3">Expires</th><th className="text-left px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {CERTS.map((c, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{c.holder}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{c.expires}</td>
                  <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded-full font-medium ' + statusColor(c.status)}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Skills Matrix */}
      {tab === 'skills' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="space-y-4">
            {SKILLS.map(s => (
              <div key={s.name} className="border-b border-white/[0.03] pb-4 last:border-0">
                <div className="flex justify-between mb-2"><div><div className="text-sm font-semibold">{s.name}</div><div className="text-[10px] text-[#9CA3AF]">{s.role}</div></div></div>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(s.skills).map(([skill, val]) => (
                    <div key={skill}>
                      <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1"><span className="capitalize">{skill}</span><span>{val}%</span></div>
                      <div className="h-2 bg-white shadow-sm rounded-full overflow-hidden"><div className={'h-full rounded-full ' + (val >= 80 ? 'bg-emerald-500' : val >= 60 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: val + '%' }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
