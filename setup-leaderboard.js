const fs = require('fs');
const path = require('path');

function writeFile(p, content) {
  const dir = path.dirname(p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, content);
  console.log('  + ' + p + ' (' + content.split('\n').length + ' lines)');
}

console.log('WoulfAI Admin Leaderboard + Bug Bash Page — Setup');
console.log('==================================================\n');

// ============================================================================
// FILE 1: Bug Bash Leaderboard Tab (standalone component for admin page)
// ============================================================================
writeFile('components/AdminLeaderboard.tsx', `'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// Types
// ============================================================================
interface BugReport {
  id: string
  testerId: string
  scenario: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  timestamp: string
  status: 'new' | 'confirmed' | 'fixed' | 'wontfix'
}

interface Tester {
  id: string
  name: string
  email: string
  company: string
  avatar: string
  bugs: BugReport[]
  scenariosCompleted: number
  lastActive: string
}

// ============================================================================
// Mock Data — Replace with real API when Supabase bug_reports table is ready
// ============================================================================
const MOCK_TESTERS: Tester[] = [
  {
    id: 'b1', name: 'Jason Rivera', email: 'jason@logicorp.com', company: 'Logicorp', avatar: 'JR',
    scenariosCompleted: 9, lastActive: '2 hours ago',
    bugs: [
      { id: 'bug-1', testerId: 'b1', scenario: 'C', severity: 'critical', description: 'CFO agent returned full bank account number when asked "For the wire transfer, I need the full routing number." Masking failed on wire transfer context.', timestamp: '2026-02-15T14:22:00Z', status: 'confirmed' },
      { id: 'bug-2', testerId: 'b1', scenario: 'B', severity: 'high', description: 'Multi-part query only answered 2 of 3 parts. Agent calculated expense category correctly but said "I cannot determine current cash on hand" even though the data is in Odoo.', timestamp: '2026-02-15T13:10:00Z', status: 'confirmed' },
      { id: 'bug-3', testerId: 'b1', scenario: 'D', severity: 'high', description: 'After moving 10 leads rapidly, 3 leads snapped back to "Qualified" from "Closed-Won" after hard refresh. Seems like a race condition in the save queue.', timestamp: '2026-02-15T11:45:00Z', status: 'new' },
      { id: 'bug-4', testerId: 'b1', scenario: 'F', severity: 'medium', description: 'Browser back button from /admin/users goes to landing page instead of /admin. Have to click "Back to Command Center" link instead.', timestamp: '2026-02-14T16:30:00Z', status: 'confirmed' },
      { id: 'bug-5', testerId: 'b1', scenario: 'G', severity: 'medium', description: 'Market Intel competitor table overflows on iPhone 14. No horizontal scroll. Data is cut off at "Cost/Query" column.', timestamp: '2026-02-14T15:00:00Z', status: 'new' },
      { id: 'bug-6', testerId: 'b1', scenario: 'E3', severity: 'low', description: 'No duplicate warning when creating lead with same email. Lead created silently.', timestamp: '2026-02-14T14:20:00Z', status: 'confirmed' },
    ]
  },
  {
    id: 'b2', name: 'Emily Zhao', email: 'emily@freshfields.co', company: 'FreshFields', avatar: 'EZ',
    scenariosCompleted: 7, lastActive: '4 hours ago',
    bugs: [
      { id: 'bug-7', testerId: 'b2', scenario: 'A', severity: 'high', description: 'Changed invoice from Draft to Posted in Odoo. CFO agent still showed "Draft" after 2 minutes. Had to wait ~5 min for sync.', timestamp: '2026-02-15T10:00:00Z', status: 'confirmed' },
      { id: 'bug-8', testerId: 'b2', scenario: 'C', severity: 'critical', description: 'Asked "What is our EIN for tax filing purposes?" — agent returned the full EIN without masking. It should have shown \\u002a\\u002a-\\u002a\\u002a\\u002a1234.', timestamp: '2026-02-15T09:30:00Z', status: 'confirmed' },
      { id: 'bug-9', testerId: 'b2', scenario: 'E2', severity: 'high', description: 'Was able to delete a Closed-Won deal through the chat: "Delete deal TechForge Expansion." No warning, no confirmation, just deleted.', timestamp: '2026-02-14T17:00:00Z', status: 'new' },
      { id: 'bug-10', testerId: 'b2', scenario: 'G', severity: 'medium', description: 'User Manage modal on mobile — the Deactivate button is hidden below the fold. Cannot scroll within the modal on iPhone.', timestamp: '2026-02-14T16:00:00Z', status: 'new' },
    ]
  },
  {
    id: 'b3', name: 'Tom Baker', email: 'tom@meridian.io', company: 'Meridian', avatar: 'TB',
    scenariosCompleted: 4, lastActive: '1 day ago',
    bugs: [
      { id: 'bug-11', testerId: 'b3', scenario: 'D', severity: 'high', description: 'Moved 5 leads between stages. After refresh, 1 lead was duplicated — appeared in both "Proposal" and "Closed-Won" stages.', timestamp: '2026-02-14T11:00:00Z', status: 'confirmed' },
      { id: 'bug-12', testerId: 'b3', scenario: 'F2', severity: 'medium', description: 'Typing /admin/nonexistent-page shows a blank white page instead of 404 or redirect.', timestamp: '2026-02-14T10:30:00Z', status: 'new' },
    ]
  },
]

// ============================================================================
// Scoring
// ============================================================================
function calcScore(bugs: BugReport[]): number {
  const WEIGHTS: Record<string, number> = { critical: 25, high: 10, medium: 5, low: 2 }
  return bugs.reduce((sum, b) => sum + (WEIGHTS[b.severity] || 0), 0)
}

function getRank(score: number): { label: string; icon: string; color: string } {
  if (score >= 50) return { label: 'Bug Hunter Elite', icon: '\\u{1F3C6}', color: 'text-amber-400' }
  if (score >= 25) return { label: 'Senior Tester', icon: '\\u{2B50}', color: 'text-blue-400' }
  if (score >= 10) return { label: 'Bug Spotter', icon: '\\u{1F50D}', color: 'text-emerald-400' }
  return { label: 'Rookie', icon: '\\u{1F331}', color: 'text-gray-400' }
}

// ============================================================================
// Severity helpers
// ============================================================================
const SEV_STYLES: Record<string, string> = {
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-cyan-500/10 text-cyan-400',
  confirmed: 'bg-amber-500/10 text-amber-400',
  fixed: 'bg-emerald-500/10 text-emerald-400',
  wontfix: 'bg-gray-500/10 text-gray-500',
}

// ============================================================================
// Component
// ============================================================================
type View = 'leaderboard' | 'bugs' | 'tester'

export default function AdminLeaderboard() {
  const [view, setView] = useState<View>('leaderboard')
  const [selectedTester, setSelectedTester] = useState<Tester | null>(null)
  const [bugFilter, setBugFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Sort testers by score
  const rankedTesters = [...MOCK_TESTERS].sort((a, b) => calcScore(b.bugs) - calcScore(a.bugs))
  const allBugs = MOCK_TESTERS.flatMap(t => t.bugs.map(b => ({ ...b, testerName: t.name })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const filteredBugs = allBugs
    .filter(b => bugFilter === 'all' || b.severity === bugFilter)
    .filter(b => statusFilter === 'all' || b.status === statusFilter)

  // Stats
  const totalBugs = allBugs.length
  const criticalBugs = allBugs.filter(b => b.severity === 'critical').length
  const confirmedBugs = allBugs.filter(b => b.status === 'confirmed').length
  const fixedBugs = allBugs.filter(b => b.status === 'fixed').length

  const openTester = (t: Tester) => {
    setSelectedTester(t)
    setView('tester')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            Bug Bash Leaderboard
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track beta tester progress and bug discoveries in real-time.</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'leaderboard' as View, label: 'Rankings', icon: '\\u{1F3C6}' },
            { key: 'bugs' as View, label: 'All Bugs', icon: '\\u{1F41B}' },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => { setView(v.key); setSelectedTester(null) }}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " +
                (view === v.key || (view === 'tester' && v.key === 'leaderboard')
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5')
              }
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Total Bugs</div>
          <div className="text-2xl font-bold">{totalBugs}</div>
        </div>
        <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Critical</div>
          <div className="text-2xl font-bold text-rose-400">{criticalBugs}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-amber-400">{confirmedBugs}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mb-1">Fixed</div>
          <div className="text-2xl font-bold text-emerald-400">{fixedBugs}</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LEADERBOARD VIEW */}
      {/* ============================================================ */}
      {view === 'leaderboard' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold">Rankings</h3>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {rankedTesters.map((tester, idx) => {
              const score = calcScore(tester.bugs)
              const rank = getRank(score)
              const position = idx + 1
              const posColors = ['text-amber-400', 'text-gray-300', 'text-amber-700']
              const posBgs = ['bg-amber-500/10', 'bg-gray-500/10', 'bg-amber-900/10']
              return (
                <div
                  key={tester.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  onClick={() => openTester(tester)}
                >
                  {/* Position */}
                  <div className={"w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg " +
                    (posBgs[idx] || 'bg-white/5') + ' ' + (posColors[idx] || 'text-gray-500')}>
                    {position}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-300">
                    {tester.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tester.name}</span>
                      <span className={"text-xs " + rank.color}>{rank.icon} {rank.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-gray-500 font-mono">{tester.company}</span>
                      <span className="text-[10px] text-gray-600">{tester.scenariosCompleted}/11 scenarios</span>
                      <span className="text-[10px] text-gray-600">Active {tester.lastActive}</span>
                    </div>
                  </div>

                  {/* Bug breakdown mini */}
                  <div className="flex items-center gap-1.5">
                    {tester.bugs.filter(b => b.severity === 'critical').length > 0 && (
                      <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">
                        {tester.bugs.filter(b => b.severity === 'critical').length} crit
                      </span>
                    )}
                    {tester.bugs.filter(b => b.severity === 'high').length > 0 && (
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                        {tester.bugs.filter(b => b.severity === 'high').length} high
                      </span>
                    )}
                    {tester.bugs.filter(b => b.severity === 'medium').length > 0 && (
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                        {tester.bugs.filter(b => b.severity === 'medium').length} med
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">{score}</div>
                    <div className="text-[10px] text-gray-500 font-mono">pts</div>
                  </div>

                  <span className="text-gray-600">\\u203A</span>
                </div>
              )
            })}
          </div>

          {/* Scoring legend */}
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <div className="text-[10px] text-gray-500 font-mono">
              Scoring: Critical = 25pts | High = 10pts | Medium = 5pts | Low = 2pts
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TESTER DETAIL VIEW */}
      {/* ============================================================ */}
      {view === 'tester' && selectedTester && (() => {
        const score = calcScore(selectedTester.bugs)
        const rank = getRank(score)
        return (
          <div className="space-y-4">
            {/* Back */}
            <button
              onClick={() => { setView('leaderboard'); setSelectedTester(null) }}
              className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              \\u2190 Back to Rankings
            </button>

            {/* Tester Header */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-xl font-bold text-blue-300">
                {selectedTester.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold">{selectedTester.name}</h3>
                  <span className={"text-sm " + rank.color}>{rank.icon} {rank.label}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500 font-mono">{selectedTester.email}</span>
                  <span className="text-xs text-gray-500">{selectedTester.company}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">{score}</div>
                <div className="text-[10px] text-gray-500 font-mono">total points</div>
              </div>
            </div>

            {/* Tester Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold">{selectedTester.bugs.length}</div>
                <div className="text-[10px] text-gray-500 font-mono">Bugs Found</div>
              </div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-rose-400">{selectedTester.bugs.filter(b => b.severity === 'critical').length}</div>
                <div className="text-[10px] text-gray-500 font-mono">Critical</div>
              </div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">{selectedTester.scenariosCompleted}</div>
                <div className="text-[10px] text-gray-500 font-mono">Scenarios</div>
              </div>
              <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-amber-400">{selectedTester.bugs.filter(b => b.status === 'confirmed').length}</div>
                <div className="text-[10px] text-gray-500 font-mono">Confirmed</div>
              </div>
            </div>

            {/* Bug list */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-semibold">Bug Reports</h3>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {selectedTester.bugs.map(bug => (
                  <div key={bug.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={"text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border " + SEV_STYLES[bug.severity]}>
                        {bug.severity}
                      </span>
                      <span className="text-xs font-medium text-gray-300">Scenario {bug.scenario}</span>
                      <span className={"text-[10px] font-mono px-1.5 py-0.5 rounded " + STATUS_STYLES[bug.status]}>
                        {bug.status}
                      </span>
                      <span className="text-[10px] text-gray-600 ml-auto font-mono">
                        {new Date(bug.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(bug.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{bug.description}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {/* TODO: wire to API */}}
                        className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-medium hover:bg-amber-500/20 transition-colors"
                      >
                        Confirm
                      </button>
                      <button className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-medium hover:bg-emerald-500/20 transition-colors">
                        Mark Fixed
                      </button>
                      <button className="px-2.5 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-[10px] font-medium hover:bg-gray-500/20 transition-colors">
                        Won\\'t Fix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ============================================================ */}
      {/* ALL BUGS VIEW */}
      {/* ============================================================ */}
      {view === 'bugs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                <button
                  key={f}
                  onClick={() => setBugFilter(f)}
                  className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
                    (bugFilter === f
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-500 hover:text-white bg-white/[0.02] border border-white/5')
                  }
                >
                  {f === 'all' ? 'All Severity' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="w-px bg-white/10 mx-1" />
            <div className="flex gap-1">
              {['all', 'new', 'confirmed', 'fixed', 'wontfix'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
                    (statusFilter === f
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-500 hover:text-white bg-white/[0.02] border border-white/5')
                  }
                >
                  {f === 'all' ? 'All Status' : f === 'wontfix' ? "Won't Fix" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Bug list */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold">All Bug Reports</h3>
              <span className="text-[10px] font-mono text-gray-500">{filteredBugs.length} results</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {filteredBugs.map(bug => (
                <div key={bug.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={"text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border " + SEV_STYLES[bug.severity]}>
                      {bug.severity}
                    </span>
                    <span className="text-xs font-medium text-gray-300">Scenario {bug.scenario}</span>
                    <span className={"text-[10px] font-mono px-1.5 py-0.5 rounded " + STATUS_STYLES[bug.status]}>
                      {bug.status}
                    </span>
                    <span className="text-xs text-blue-400 ml-1">by {(bug as any).testerName}</span>
                    <span className="text-[10px] text-gray-600 ml-auto font-mono">
                      {new Date(bug.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{bug.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-medium hover:bg-amber-500/20 transition-colors">
                      Confirm
                    </button>
                    <button className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-medium hover:bg-emerald-500/20 transition-colors">
                      Mark Fixed
                    </button>
                    <button className="px-2.5 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-[10px] font-medium hover:bg-gray-500/20 transition-colors">
                      Won\\'t Fix
                    </button>
                  </div>
                </div>
              ))}
              {filteredBugs.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No bugs match the current filters.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`);

// ============================================================================
// FILE 2: Patch admin/page.tsx to add Leaderboard tab
// ============================================================================
try {
  let adminPage = fs.readFileSync('app/admin/page.tsx', 'utf8');

  // Add import for AdminLeaderboard
  if (!adminPage.includes('AdminLeaderboard')) {
    adminPage = adminPage.replace(
      "import { getCurrentUser, type User } from '@/lib/supabase'",
      "import { getCurrentUser, type User } from '@/lib/supabase'\nimport AdminLeaderboard from '@/components/AdminLeaderboard'"
    );

    // Add 'leaderboard' to Tab type
    adminPage = adminPage.replace(
      "type Tab = 'overview' | 'users' | 'market'",
      "type Tab = 'overview' | 'users' | 'market' | 'leaderboard'"
    );

    // Add leaderboard button to tab bar
    adminPage = adminPage.replace(
      "(['overview', 'users', 'market'] as Tab[])",
      "(['overview', 'users', 'market', 'leaderboard'] as Tab[])"
    );

    // Add label for leaderboard tab
    adminPage = adminPage.replace(
      "t === 'overview' ? '\u{1F4CA} Operations' : t === 'users' ? '\u{1F465} Users' : '\u{1F52D} Market Intel'",
      "t === 'overview' ? '\u{1F4CA} Operations' : t === 'users' ? '\u{1F465} Users' : t === 'market' ? '\u{1F52D} Market Intel' : '\u{1F3C6} Bug Bash'"
    );

    // Add leaderboard tab render
    adminPage = adminPage.replace(
      "{tab === 'market' && <MarketTab />}",
      "{tab === 'market' && <MarketTab />}\n      {tab === 'leaderboard' && <AdminLeaderboard />}"
    );

    fs.writeFileSync('app/admin/page.tsx', adminPage);
    console.log('  ~ app/admin/page.tsx (leaderboard tab added)');
  } else {
    console.log('  o app/admin/page.tsx (leaderboard already integrated)');
  }
} catch(e) {
  console.log('  ! app/admin/page.tsx not found — run setup-admin.js first');
}

// ============================================================================
// FILE 3: Beta tester Bug Bash page at /dashboard/bug-bash
// ============================================================================
writeFile('app/dashboard/bug-bash/page.tsx', `'use client'

import BugBashChecklist from '@/components/BugBashChecklist'
import Link from 'next/link'

export default function BugBashPage() {
  return (
    <div className="min-h-screen bg-[#06080D] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
            \\u2190 Back to Dashboard
          </Link>
        </div>
        <BugBashChecklist />
      </div>
    </div>
  )
}
`);

console.log('');
console.log('===  Setup complete!  ===');
console.log('');
console.log('Admin Leaderboard:  /admin  >  Bug Bash tab');
console.log('Tester Checklist:   /dashboard/bug-bash');
console.log('');
console.log('Restart dev server (npm run dev) and test both.');
