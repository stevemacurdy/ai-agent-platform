'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QuizRenderer from './QuizRenderer';

interface Props {
  department: 'operations' | 'hr';
  title: string;
}

export default function LMSDashboard({ department, title }: Props) {
  const [data, setData] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeQuiz, setActiveQuiz] = useState<{ quizId: string; assignmentId?: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [safetyTopic, setSafetyTopic] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('woulfai_token') || '' : '';
  const hdrs: Record<string, string> = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  useEffect(() => {
    Promise.all([
      fetch(`/api/lms?view=dashboard&dept=${department}`, { headers: hdrs }).then(r => r.json()),
      fetch(`/api/lms?view=courses&dept=${department}`, { headers: hdrs }).then(r => r.json()),
    ]).then(([dash, crs]) => {
      setData(dash);
      setCourses(crs.courses || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [department]);

  const handleAi = async (action: string, payload?: any) => {
    setAiLoading(true); setAiResult(''); setModalAction(action); setModalOpen(true);
    try {
      const res = await fetch('/api/lms', { method: 'POST', headers: hdrs, body: JSON.stringify({ action, ...payload }) });
      const result = await res.json();
      setAiResult(result.content || result.summary || result.message || JSON.stringify(result, null, 2));
    } catch (e: any) { setAiResult('Error: ' + e.message); }
    setAiLoading(false);
  };

  if (loading) return (
    <div className="space-y-4 p-6">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
    </div>
  );

  // If taking a quiz, show quiz renderer full-screen
  if (activeQuiz) return (
    <div className="p-6">
      <QuizRenderer
        quizId={activeQuiz.quizId}
        assignmentId={activeQuiz.assignmentId}
        onComplete={() => {}}
        onBack={() => setActiveQuiz(null)}
      />
    </div>
  );

  const tabs = department === 'operations'
    ? [{ id: 'dashboard', label: 'Dashboard' }, { id: 'safety', label: 'Safety Meetings' }, { id: 'courses', label: 'Courses & Certs' }, { id: 'sops', label: 'SOPs' }]
    : [{ id: 'dashboard', label: 'Dashboard' }, { id: 'onboarding', label: 'Onboarding' }, { id: 'courses', label: 'Courses & Compliance' }, { id: 'completions', label: 'Completions' }];

  const assignments = data?.myAssignments || [];
  const certs = data?.myCerts || [];
  const expiringCerts = data?.expiringCerts || [];
  const meetings = data?.recentMeetings || [];

  // Cert chart data
  const certByType: Record<string, number> = {};
  certs.forEach((c: any) => {
    const t = c.equipment_type || c.lms_courses?.equipment_type || 'Other';
    certByType[t] = (certByType[t] || 0) + 1;
  });
  const certChartData = Object.entries(certByType).map(([name, count]) => ({ name, count }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1B2A4A]">{title}</h1>
          <p className="text-sm text-[#6B7280]">Powered by WoulfAI LMS Engine</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-[#6B7280] hover:text-[#1B2A4A]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: DASHBOARD ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Courses', value: data?.activeCourses || 0, color: '#2A9D8F' },
              { label: 'My Assignments', value: assignments.length, color: assignments.length > 0 ? '#F5920B' : '#059669' },
              { label: 'Active Certs', value: certs.length, color: '#2A9D8F' },
              { label: 'Expiring Soon', value: expiringCerts.length, color: expiringCerts.length > 0 ? '#DC2626' : '#059669' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <p className="text-xs text-[#6B7280] mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Pending assignments */}
          {assignments.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-4 py-3 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">My Pending Training</h3>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {assignments.map((a: any) => (
                  <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{a.lms_courses?.title || 'Course'}</p>
                      <p className="text-xs text-[#6B7280]">{a.lms_courses?.course_type} {a.reason ? `(${a.reason.replace('_', ' ')})` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.due_date && (
                        <span className={`text-xs ${new Date(a.due_date) < new Date() ? 'text-rose-600 font-semibold' : 'text-[#6B7280]'}`}>
                          Due: {new Date(a.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === 'assigned' ? 'bg-blue-50 text-blue-600' :
                        a.status === 'in_progress' ? 'bg-amber-50 text-amber-600' :
                        a.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-600'
                      }`}>{a.status}</span>
                      <button onClick={() => {
                        // Find quiz for this course
                        const course = courses.find((c: any) => c.id === a.course_id);
                        const quiz = course?.lms_quizzes?.find((q: any) => q.status === 'active');
                        if (quiz) setActiveQuiz({ quizId: quiz.id, assignmentId: a.id });
                      }} className="px-3 py-1.5 bg-[#2A9D8F] text-white text-xs rounded-lg hover:bg-[#2A9D8F]/90">
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring certs */}
          {expiringCerts.length > 0 && (
            <div className="bg-rose-50 rounded-xl border border-rose-200 p-4">
              <h3 className="text-sm font-semibold text-rose-800 mb-2">Certifications Expiring Within 90 Days</h3>
              <div className="space-y-2">
                {expiringCerts.map((c: any) => {
                  const days = Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span className="text-rose-700">{c.lms_courses?.title || c.equipment_type} ({c.cert_number})</span>
                      <span className="text-rose-600 font-semibold">{days} days remaining</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cert chart */}
          {certChartData.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Certifications by Type</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={certChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2A9D8F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SAFETY MEETINGS (Ops) / ONBOARDING (HR) ── */}
      {(activeTab === 'safety' || activeTab === 'onboarding') && (
        <div className="space-y-4">
          {activeTab === 'safety' && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">Generate Daily Safety Meeting</h3>
              <div className="flex gap-2">
                <input value={safetyTopic} onChange={e => setSafetyTopic(e.target.value)}
                  placeholder="e.g., Forklift blind spots, Dock plate safety, Stretch wrap ergonomics"
                  className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm" />
                <button onClick={() => handleAi('generate-safety-meeting', { topic: safetyTopic })}
                  className="px-4 py-2 bg-[#1B2A4A] text-white text-sm rounded-lg hover:bg-[#1B2A4A]/90">
                  Generate
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-4 py-3 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">
                {activeTab === 'safety' ? 'Recent Safety Meetings' : 'Onboarding Progress'}
              </h3>
            </div>
            {meetings.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                {meetings.map((m: any) => (
                  <div key={m.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#1B2A4A]">{m.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          m.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                        }`}>{m.status}</span>
                        <span className="text-xs text-[#6B7280]">{new Date(m.meeting_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {m.topic && <p className="text-xs text-[#6B7280]">{m.topic}</p>}
                    {m.lms_attendance && (
                      <p className="text-xs text-[#6B7280] mt-1">
                        Attendance: {m.lms_attendance.filter((a: any) => a.attended).length}/{m.lms_attendance.length}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-sm text-[#6B7280] text-center">No meetings yet. Generate your first safety meeting above.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: COURSES & CERTS ── */}
      {(activeTab === 'courses') && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">
                {department === 'operations' ? 'Equipment & Safety Courses' : 'Compliance Courses'}
              </h3>
            </div>
            {courses.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                {courses.map((c: any) => (
                  <div key={c.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{c.title}</p>
                        <p className="text-xs text-[#6B7280]">
                          {c.course_type.replace('_', ' ')}
                          {c.equipment_type ? ` | ${c.equipment_type.replace('_', ' ')}` : ''}
                          {c.cert_validity_months ? ` | Cert valid: ${c.cert_validity_months} months` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                          c.status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                        }`}>{c.status}</span>
                        {c.lms_quizzes?.some((q: any) => q.status === 'active') && (
                          <button onClick={() => {
                            const quiz = c.lms_quizzes.find((q: any) => q.status === 'active');
                            if (quiz) setActiveQuiz({ quizId: quiz.id });
                          }} className="px-3 py-1.5 bg-[#2A9D8F] text-white text-xs rounded-lg hover:bg-[#2A9D8F]/90">
                            Take Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-sm text-[#6B7280] text-center">No courses created yet.</p>
            )}
          </div>

          {/* Active certifications */}
          {certs.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-4 py-3 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">My Active Certifications</h3>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {certs.map((c: any) => {
                  const days = Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{c.lms_courses?.title || c.equipment_type}</p>
                        <p className="text-xs font-mono text-[#6B7280]">{c.cert_number}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          days > 90 ? 'bg-emerald-50 text-emerald-600' :
                          days > 30 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {days > 0 ? `${days}d remaining` : 'Expired'}
                        </span>
                        <p className="text-xs text-[#6B7280] mt-1">Expires: {new Date(c.expires_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SOPs (Ops) / COMPLETIONS (HR) ── */}
      {(activeTab === 'sops' || activeTab === 'completions') && (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#1B2A4A]">
              {activeTab === 'sops' ? 'Standard Operating Procedures' : 'My Completed Training'}
            </h3>
          </div>
          <p className="px-4 py-6 text-sm text-[#6B7280] text-center">
            {activeTab === 'sops'
              ? 'Upload SOPs to generate training quizzes automatically.'
              : 'Completed courses and certifications will appear here.'}
          </p>
        </div>
      )}

      {/* AI Result Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#1B2A4A]">{modalAction.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#1B2A4A]">x</button>
            </div>
            <div className="p-6">
              {aiLoading ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="w-5 h-5 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[#6B7280]">Generating...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[#4B5563] text-sm leading-relaxed">
                  {aiResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
