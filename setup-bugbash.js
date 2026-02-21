const fs = require('fs');
const path = require('path');

function writeFile(p, content) {
  const dir = path.dirname(p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, content);
  console.log('  + ' + p + ' (' + content.split('\n').length + ' lines)');
}

console.log('WoulfAI Bug Bash Components — Setup');
console.log('====================================\n');

// ============================================================================
// FILE 1: Beta Dashboard Checklist Component
// ============================================================================
writeFile('components/BugBashChecklist.tsx', `'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  scenario: string
  agent: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  completed: boolean
  bugsFound: number
}

const INITIAL_TASKS: Task[] = [
  { id: 'A', scenario: 'A', agent: 'CFO', severity: 'high', title: 'Invoice Status Integrity', description: 'Compare invoice status in Odoo vs CFO Agent response. Test Draft, Posted, and Cancelled states.', completed: false, bugsFound: 0 },
  { id: 'B', scenario: 'B', agent: 'CFO', severity: 'high', title: 'Complex Multi-Part Query', description: 'Ask: "What was our highest expense category in Q4, and how does it compare to our current cash on hand?"', completed: false, bugsFound: 0 },
  { id: 'C', scenario: 'C', agent: 'CFO', severity: 'critical', title: 'Data Masking (Security)', description: 'Try to get the agent to reveal bank account numbers, Tax IDs, or routing numbers.', completed: false, bugsFound: 0 },
  { id: 'C2', scenario: 'C2', agent: 'CFO', severity: 'critical', title: 'Cross-Tenant Data Leak', description: 'Try to access another organization\\'s financial data through the agent.', completed: false, bugsFound: 0 },
  { id: 'D', scenario: 'D', agent: 'Sales', severity: 'high', title: 'Pipeline State Persistence', description: 'Move 10 leads rapidly between stages, then hard-refresh. Do they stay?', completed: false, bugsFound: 0 },
  { id: 'E1', scenario: 'E1', agent: 'Sales', severity: 'medium', title: 'Invalid User Assignment', description: 'Assign a lead to a non-existent user or deactivated team member.', completed: false, bugsFound: 0 },
  { id: 'E2', scenario: 'E2', agent: 'Sales', severity: 'high', title: 'Delete Closed-Won Deals', description: 'Try to delete a Closed-Won deal. System should block this.', completed: false, bugsFound: 0 },
  { id: 'E3', scenario: 'E3', agent: 'Sales', severity: 'medium', title: 'Duplicate Lead Detection', description: 'Create leads with duplicate emails. Does the system warn you?', completed: false, bugsFound: 0 },
  { id: 'F', scenario: 'F', agent: 'Nav', severity: 'medium', title: 'Back Button Loop', description: 'Navigate 4 levels deep, then use browser back button. Any loops or blank pages?', completed: false, bugsFound: 0 },
  { id: 'F2', scenario: 'F2', agent: 'Nav', severity: 'medium', title: 'Direct URL Access', description: 'Type admin URLs directly. Test with and without being logged in.', completed: false, bugsFound: 0 },
  { id: 'G', scenario: 'G', agent: 'Nav', severity: 'medium', title: 'Mobile Responsiveness', description: 'Test all pages on mobile. Check tables, modals, and touch targets.', completed: false, bugsFound: 0 },
]

const SEV_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  high: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  low: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
}

const AGENT_ICONS: Record<string, string> = {
  CFO: '💰',
  Sales: '🎯',
  Nav: '🧭',
}

export default function BugBashChecklist() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [reportModal, setReportModal] = useState<string | null>(null)
  const [reportText, setReportText] = useState('')
  const [reportSent, setReportSent] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('woulfai_bugbash_progress')
      if (saved) {
        const parsed = JSON.parse(saved)
        setTasks(prev => prev.map(t => {
          const s = parsed.find((p: any) => p.id === t.id)
          return s ? { ...t, completed: s.completed, bugsFound: s.bugsFound } : t
        }))
      }
    } catch {}
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('woulfai_bugbash_progress', JSON.stringify(
      tasks.map(t => ({ id: t.id, completed: t.completed, bugsFound: t.bugsFound }))
    ))
  }, [tasks])

  const completed = tasks.filter(t => t.completed).length
  const totalBugs = tasks.reduce((sum, t) => sum + t.bugsFound, 0)
  const progress = Math.round((completed / tasks.length) * 100)

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const addBug = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, bugsFound: t.bugsFound + 1 } : t))
  }

  const handleReport = () => {
    // Simulate sending
    setReportSent(true)
    setTimeout(() => {
      setReportSent(false)
      setReportModal(null)
      setReportText('')
      if (reportModal) addBug(reportModal)
    }, 2000)
  }

  // Rank badge
  const getRank = () => {
    if (totalBugs >= 10) return { label: 'Bug Hunter Elite', icon: '🏆', color: 'text-amber-400' }
    if (totalBugs >= 5) return { label: 'Senior Tester', icon: '⭐', color: 'text-blue-400' }
    if (totalBugs >= 1) return { label: 'Bug Spotter', icon: '🔍', color: 'text-emerald-400' }
    return { label: 'Rookie', icon: '🌱', color: 'text-gray-400' }
  }

  const rank = getRank()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            🐛 Bug Bash Challenge
          </h2>
          <p className="text-sm text-gray-500 mt-1">Complete all scenarios. Report every bug you find.</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-lg">{rank.icon}</span>
            <span className={"text-sm font-bold " + rank.color}>{rank.label}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{totalBugs} bugs found</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{completed}/{tasks.length} scenarios completed</span>
          <span className="text-sm font-mono text-blue-400">{progress}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: progress + '%',
              background: progress === 100
                ? 'linear-gradient(90deg, #10B981, #06B6D4)'
                : 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            }}
          />
        </div>
        {progress === 100 && (
          <div className="mt-3 text-center">
            <span className="text-emerald-400 font-bold text-sm">🎉 All scenarios complete! You are a Bug Bash Champion!</span>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map(task => {
          const sev = SEV_COLORS[task.severity]
          const isExpanded = expandedTask === task.id
          return (
            <div key={task.id} className={"bg-[#0A0E15] border rounded-xl transition-all " + (task.completed ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5 hover:border-white/10')}>
              <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleComplete(task.id) }}
                  className={"w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-all " +
                    (task.completed ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'border-white/10 hover:border-white/20')}
                >
                  {task.completed && '✓'}
                </button>

                {/* Agent icon */}
                <span className="text-lg">{AGENT_ICONS[task.agent] || '📋'}</span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={"text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border " + sev.bg + ' ' + sev.text + ' ' + sev.border}>
                      {task.severity}
                    </span>
                    <span className={"text-sm font-medium " + (task.completed ? 'line-through text-gray-500' : '')}>{task.title}</span>
                  </div>
                </div>

                {/* Bug count */}
                {task.bugsFound > 0 && (
                  <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    {task.bugsFound} bug{task.bugsFound > 1 ? 's' : ''}
                  </span>
                )}

                {/* Expand arrow */}
                <span className={"text-gray-500 transition-transform " + (isExpanded ? 'rotate-180' : '')}>▾</span>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                  <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportModal(task.id)}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium hover:bg-rose-500/20 transition-colors"
                    >
                      🐛 Report Issue
                    </button>
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      {task.completed ? 'Mark Incomplete' : '✓ Mark Complete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Report Issue Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setReportModal(null); setReportText('') }}>
          <div className="bg-[#0D1117] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            {reportSent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-bold text-emerald-400">Success: Report Sent to Command Center</h3>
                <p className="text-sm text-gray-500 mt-2">Bug logged. Keep hunting!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Report Issue — Scenario {reportModal}</h3>
                  <button onClick={() => { setReportModal(null); setReportText('') }} className="text-gray-500 hover:text-white">✕</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Severity</label>
                    <select className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                      <option value="critical">Critical — Security / Data Loss</option>
                      <option value="high">High — Feature Broken</option>
                      <option value="medium">Medium — UI Glitch / Slow</option>
                      <option value="low">Low — Cosmetic / Suggestion</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">What happened?</label>
                    <textarea
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      rows={4}
                      placeholder="Describe what you did, what you expected, and what actually happened..."
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-none"
                    />
                  </div>
                  <button
                    onClick={handleReport}
                    disabled={!reportText.trim()}
                    className="w-full py-2.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Bug Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
`);

console.log('\n✅ Bug Bash Checklist component installed!');
console.log('\nUsage: Import in any page:');
console.log('  import BugBashChecklist from "@/components/BugBashChecklist"');
console.log('  <BugBashChecklist />');
console.log('');
console.log('Suggested: Add to the beta tester dashboard or create');
console.log('a dedicated /dashboard/bug-bash page.');
