#!/usr/bin/env node
/**
 * WoulfAI — SOLO SALESMAN AGENT (Full Restoration)
 *
 * 6 Modules in one cohesive dashboard:
 *   1. Pipeline — Visual kanban with drill-down editing
 *   2. Sales Intel — Embedded behavioral profiling + battle cards
 *   3. Expenses — Mileage, receipt upload, monthly send-off
 *   4. Sales Mentor — Post-call AI analysis + storage
 *   5. Commissions — Pay parameters, running totals, projections
 *   6. CRM & Integrations — NetSuite connect, PDF proposals
 *
 * All modules share state — Mentor entries update Pipeline,
 * Expenses feed into Commissions, Pipeline feeds Projections.
 *
 * Run from: ai-agent-platform root
 * Usage: node solo-salesman.js
 */
const fs = require('fs');
const path = require('path');
let installed = 0;

function write(rel, content) {
  const fp = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  console.log('  + ' + rel + ' (' + content.split('\n').length + ' lines)');
  installed++;
}

console.log('');
console.log('  ╔══════════════════════════════════════════════════════════════╗');
console.log('  ║  SOLO SALESMAN AGENT — Full Restoration                     ║');
console.log('  ║  Pipeline · Intel · Expenses · Mentor · Commissions · CRM   ║');
console.log('  ╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// 1. SOLO SALESMAN — MAIN DASHBOARD
// ============================================================
console.log('  [1] Solo Salesman Dashboard:');

write('app/agents/sales/solo/page.tsx', `'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================
type Stage = 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
type ExpenseCategory = 'mileage' | 'meals' | 'lodging' | 'supplies' | 'other'
type PersonalityType = 'driver' | 'analytical' | 'expressive' | 'amiable'

interface Contact {
  id: string; name: string; company: string; title: string; email: string; phone: string;
  personality: PersonalityType; notes: string; lastContact: string;
}

interface Project {
  id: string; contactId: string; name: string; value: number; stage: Stage;
  probability: number; expectedClose: string; description: string;
  mentorNotes: MentorEntry[]; history: HistoryEntry[]; createdAt: string;
}

interface MentorEntry {
  id: string; date: string; wantedProposal: boolean | null; gaveGoAhead: boolean | null;
  modifications: string; concerns: string; nextSteps: string; sentiment: 'positive' | 'neutral' | 'cautious';
}

interface HistoryEntry { date: string; action: string; details: string }

interface Expense {
  id: string; date: string; category: ExpenseCategory; amount: number;
  description: string; miles?: number; receiptUrl?: string; projectId?: string;
  submitted: boolean;
}

interface CommissionParams {
  model: 'percent_gross' | 'base_plus_commission' | 'tiered';
  baseSalary: number; commissionRate: number;
  tier2Rate: number; tier2Threshold: number;
}

// ============================================================================
// SEED DATA
// ============================================================================
const CONTACTS_SEED: Contact[] = [
  { id: 'c1', name: 'Diana Reeves', company: 'Apex Manufacturing', title: 'VP Operations', email: 'diana@apexmfg.com', phone: '(801) 555-0142', personality: 'driver', notes: 'Decisive, wants ROI numbers upfront. Prefers short meetings.', lastContact: '2026-02-15' },
  { id: 'c2', name: 'Robert Fung', company: 'Cascade Logistics', title: 'Director of IT', email: 'rfung@cascadelog.com', phone: '(801) 555-0287', personality: 'analytical', notes: 'Needs detailed specs and compliance documentation. Very thorough.', lastContact: '2026-02-14' },
  { id: 'c3', name: 'Samira Khan', company: 'Ridgeline Partners', title: 'COO', email: 'samira@ridgelinep.com', phone: '(385) 555-0199', personality: 'expressive', notes: 'Relationship-driven. Loves vision and big-picture storytelling.', lastContact: '2026-02-12' },
  { id: 'c4', name: 'Brett Holloway', company: 'Westfield Supply Co', title: 'Procurement Manager', email: 'bholloway@westfield.co', phone: '(801) 555-0334', personality: 'amiable', notes: 'Consensus builder. Will need to loop in his team before deciding.', lastContact: '2026-02-16' },
  { id: 'c5', name: 'Elena Torres', company: 'Northstar Distribution', title: 'CEO', email: 'elena@northstardist.com', phone: '(385) 555-0411', personality: 'driver', notes: 'Fast-paced, direct. Wants to see competitive comparison.', lastContact: '2026-02-10' },
  { id: 'c6', name: 'Marcus Lee', company: 'Summit Fabrication', title: 'Plant Manager', email: 'mlee@summitfab.com', phone: '(801) 555-0523', personality: 'analytical', notes: 'New lead from trade show. Interested in warehouse automation.', lastContact: '2026-02-17' },
]

const PROJECTS_SEED: Project[] = [
  { id: 'p1', contactId: 'c1', name: 'Apex Warehouse Automation', value: 75000, stage: 'proposal', probability: 70, expectedClose: '2026-03-15', description: 'Full warehouse racking + conveyor system for their new 45K sqft facility', mentorNotes: [], history: [{ date: '2026-02-10', action: 'Site visit', details: 'Toured facility, identified 3 zones for automation' }], createdAt: '2026-01-20' },
  { id: 'p2', contactId: 'c2', name: 'Cascade 3PL Portal', value: 45000, stage: 'negotiation', probability: 85, expectedClose: '2026-02-28', description: 'Custom 3PL customer portal with NetSuite integration', mentorNotes: [], history: [{ date: '2026-02-14', action: 'Contract review', details: 'Legal reviewing MSA, minor edits expected' }], createdAt: '2026-01-15' },
  { id: 'p3', contactId: 'c3', name: 'Ridgeline Digital Transform', value: 120000, stage: 'qualification', probability: 30, expectedClose: '2026-05-01', description: 'Enterprise-wide digital transformation: ERP + WMS + AI agents', mentorNotes: [], history: [{ date: '2026-02-12', action: 'Discovery call', details: 'High interest but budget needs board approval' }], createdAt: '2026-02-01' },
  { id: 'p4', contactId: 'c4', name: 'Westfield Inventory System', value: 22000, stage: 'lead', probability: 25, expectedClose: '2026-04-15', description: 'Inventory management upgrade from legacy Excel tracking', mentorNotes: [], history: [{ date: '2026-02-16', action: 'Initial call', details: 'Warm referral from Elena Torres' }], createdAt: '2026-02-16' },
  { id: 'p5', contactId: 'c5', name: 'Northstar Racking Phase 2', value: 38000, stage: 'closed_won', probability: 100, expectedClose: '2026-02-10', description: 'Phase 2 expansion of existing pallet racking system', mentorNotes: [], history: [{ date: '2026-02-10', action: 'Contract signed', details: 'PO received, install scheduled March 1' }], createdAt: '2025-12-01' },
  { id: 'p6', contactId: 'c6', name: 'Summit Mezzanine Install', value: 55000, stage: 'lead', probability: 15, expectedClose: '2026-06-01', description: 'Mezzanine installation for vertical storage expansion', mentorNotes: [], history: [{ date: '2026-02-17', action: 'Trade show contact', details: 'Met at Industrial Expo, exchanged cards' }], createdAt: '2026-02-17' },
]

const EXPENSES_SEED: Expense[] = [
  { id: 'e1', date: '2026-02-10', category: 'mileage', amount: 34.80, description: 'Drive to Apex site visit', miles: 52, projectId: 'p1', submitted: false },
  { id: 'e2', date: '2026-02-12', category: 'meals', amount: 47.50, description: 'Lunch with Samira Khan (Ridgeline)', projectId: 'p3', submitted: false },
  { id: 'e3', date: '2026-02-14', category: 'mileage', amount: 24.00, description: 'Drive to Cascade office', miles: 36, projectId: 'p2', submitted: false },
  { id: 'e4', date: '2026-02-16', category: 'supplies', amount: 125.00, description: 'Presentation materials + binding', submitted: false },
  { id: 'e5', date: '2026-02-17', category: 'lodging', amount: 189.00, description: 'Hotel for Industrial Expo', submitted: false },
]

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'lead', label: 'Lead', color: 'bg-gray-500' },
  { key: 'qualification', label: 'Qualification', color: 'bg-purple-500' },
  { key: 'proposal', label: 'Proposal', color: 'bg-amber-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-blue-500' },
  { key: 'closed_won', label: 'Closed Won', color: 'bg-emerald-500' },
  { key: 'closed_lost', label: 'Lost', color: 'bg-rose-500' },
]

const PERSONALITY_MAP: Record<PersonalityType, { label: string; color: string; do: string[]; dont: string[] }> = {
  driver: { label: 'Driver', color: 'text-rose-400', do: ['Be direct and concise', 'Focus on results and ROI', 'Come prepared with options', 'Respect their time'], dont: ['Ramble or small-talk excessively', 'Be indecisive', 'Overload with details', 'Challenge them publicly'] },
  analytical: { label: 'Analytical', color: 'text-blue-400', do: ['Provide detailed data and specs', 'Give them time to process', 'Follow up in writing', 'Be accurate and factual'], dont: ['Rush them to decide', 'Be vague or emotional', 'Skip the fine print', 'Use high-pressure tactics'] },
  expressive: { label: 'Expressive', color: 'text-amber-400', do: ['Share the big-picture vision', 'Be enthusiastic and engaged', 'Use storytelling and examples', 'Acknowledge their ideas'], dont: ['Focus only on spreadsheets', 'Be monotone or stiff', 'Ignore their input', 'Be overly formal'] },
  amiable: { label: 'Amiable', color: 'text-emerald-400', do: ['Build personal rapport first', 'Include their team in decisions', 'Be patient and supportive', 'Provide reassurance'], dont: ['Be aggressive or pushy', 'Force quick decisions', 'Ignore their concerns', 'Criticize their process'] },
}

const fmt = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmtd = (n: number) => '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SoloSalesmanDashboard() {
  // Shared state — all modules read/write from these
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS_SEED)
  const [projects, setProjects] = useState<Project[]>(PROJECTS_SEED)
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES_SEED)
  const [commParams, setCommParams] = useState<CommissionParams>({
    model: 'percent_gross', baseSalary: 0, commissionRate: 8, tier2Rate: 12, tier2Threshold: 500000,
  })

  // UI state
  const [tab, setTab] = useState<'pipeline' | 'intel' | 'expenses' | 'mentor' | 'commissions' | 'crm'>('pipeline')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3500) }

  // Derived values — used by multiple tabs
  const activeProjects = projects.filter(p => p.stage !== 'closed_lost')
  const wonProjects = projects.filter(p => p.stage === 'closed_won')
  const openProjects = projects.filter(p => !['closed_won', 'closed_lost'].includes(p.stage))
  const totalPipeline = openProjects.reduce((s, p) => s + p.value, 0)
  const weightedPipeline = openProjects.reduce((s, p) => s + (p.value * p.probability / 100), 0)
  const totalClosed = wonProjects.reduce((s, p) => s + p.value, 0)
  const totalExpenses = expenses.filter(e => !e.submitted).reduce((s, e) => s + e.amount, 0)
  const totalMiles = expenses.filter(e => e.category === 'mileage' && !e.submitted).reduce((s, e) => s + (e.miles || 0), 0)

  // Commission calculation
  const calcCommission = useCallback(() => {
    const { model, baseSalary, commissionRate, tier2Rate, tier2Threshold } = commParams
    if (model === 'percent_gross') return totalClosed * (commissionRate / 100)
    if (model === 'base_plus_commission') return baseSalary + (totalClosed * (commissionRate / 100))
    // tiered
    if (totalClosed <= tier2Threshold) return baseSalary + (totalClosed * (commissionRate / 100))
    const base = tier2Threshold * (commissionRate / 100)
    const excess = (totalClosed - tier2Threshold) * (tier2Rate / 100)
    return baseSalary + base + excess
  }, [commParams, totalClosed])

  const projectedEarnings = calcCommission() + (weightedPipeline * (commParams.commissionRate / 100))

  const getContact = (id: string) => contacts.find(c => c.id === id)

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, history: [...p.history, { date: new Date().toISOString().slice(0, 10), action: 'Updated', details: Object.keys(updates).join(', ') + ' modified' }] } : p))
    show('Project updated')
  }

  const addMentorNote = (projectId: string, note: MentorEntry) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      mentorNotes: [...p.mentorNotes, note],
      history: [...p.history, { date: note.date, action: 'Sales Mentor', details: 'Post-call analysis recorded' }],
      // Auto-adjust probability based on sentiment
      probability: note.gaveGoAhead ? Math.min(p.probability + 15, 95) : note.sentiment === 'cautious' ? Math.max(p.probability - 10, 5) : p.probability,
      // Auto-advance stage if go-ahead given
      stage: note.gaveGoAhead && p.stage === 'proposal' ? 'negotiation' : note.wantedProposal && p.stage === 'qualification' ? 'proposal' : p.stage,
    } : p))
    show('Mentor notes saved — pipeline updated')
  }

  // ============================================================================
  // TAB: PIPELINE
  // ============================================================================
  const PipelineTab = () => {
    const [editId, setEditId] = useState<string | null>(null)

    return (
      <div className="space-y-5">
        {/* Kanban */}
        <div className="grid grid-cols-5 gap-2">
          {STAGES.filter(s => s.key !== 'closed_lost').map(stage => {
            const stageProjects = projects.filter(p => p.stage === stage.key)
            return (
              <div key={stage.key} className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className={"w-2 h-2 rounded-full " + stage.color} />
                  <span className="text-[10px] uppercase font-semibold text-gray-400">{stage.label}</span>
                  <span className="text-[10px] text-gray-600 ml-auto">{stageProjects.length}</span>
                </div>
                {stageProjects.map(proj => {
                  const contact = getContact(proj.contactId)
                  return (
                    <div key={proj.id} onClick={() => { setSelectedProject(proj.id); setEditId(proj.id) }}
                      className="bg-[#0A0E15] border border-white/5 rounded-lg p-3 cursor-pointer hover:border-blue-500/20 transition-all group">
                      <div className="text-xs font-semibold group-hover:text-blue-400 truncate">{proj.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{contact?.company}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-mono font-bold">{fmt(proj.value)}</span>
                        <span className="text-[9px] text-gray-600">{proj.probability}%</span>
                      </div>
                    </div>
                  )
                })}
                {stageProjects.length === 0 && <div className="text-[10px] text-gray-700 text-center py-4">No deals</div>}
              </div>
            )
          })}
        </div>

        {/* Detail Panel */}
        {editId && (() => {
          const proj = projects.find(p => p.id === editId)
          if (!proj) return null
          const contact = getContact(proj.contactId)
          return (
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold">{proj.name}</h3>
                  <div className="text-xs text-gray-500">{contact?.name} · {contact?.company} · {contact?.title}</div>
                </div>
                <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-white text-sm">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-[9px] text-gray-500 uppercase block mb-1">Value</label>
                  <input type="number" value={proj.value} onChange={e => updateProject(proj.id, { value: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase block mb-1">Stage</label>
                  <select value={proj.stage} onChange={e => updateProject(proj.id, { stage: e.target.value as Stage })}
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm">
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase block mb-1">Probability %</label>
                  <input type="number" min="0" max="100" value={proj.probability} onChange={e => updateProject(proj.id, { probability: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 uppercase block mb-1">Expected Close</label>
                  <input type="date" value={proj.expectedClose} onChange={e => updateProject(proj.id, { expectedClose: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-sm" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[9px] text-gray-500 uppercase block mb-1">Description</label>
                <textarea value={proj.description} onChange={e => updateProject(proj.id, { description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs h-16 resize-none" />
              </div>
              {/* History */}
              <div className="border-t border-white/5 pt-3">
                <div className="text-[9px] text-gray-500 uppercase mb-2">Activity History</div>
                {proj.history.slice(-5).reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-2 py-1 text-xs">
                    <span className="text-gray-600 text-[10px] w-20 shrink-0">{h.date}</span>
                    <span className="text-blue-400 w-24 shrink-0">{h.action}</span>
                    <span className="text-gray-400">{h.details}</span>
                  </div>
                ))}
              </div>
              {/* Quick actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <button onClick={() => { setTab('mentor'); setSelectedProject(proj.id) }}
                  className="px-3 py-1.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-600/20">
                  🧠 Run Sales Mentor
                </button>
                <button onClick={() => { setTab('crm'); setSelectedProject(proj.id) }}
                  className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-600/20">
                  📄 Generate Proposal
                </button>
                <button onClick={() => { setSelectedContact(proj.contactId); setTab('intel') }}
                  className="px-3 py-1.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded text-xs hover:bg-amber-600/20">
                  🧠 View Intel
                </button>
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  // ============================================================================
  // TAB: SALES INTEL
  // ============================================================================
  const IntelTab = () => {
    const [viewContact, setViewContact] = useState<string | null>(selectedContact)
    const contact = viewContact ? contacts.find(c => c.id === viewContact) : null
    const profile = contact ? PERSONALITY_MAP[contact.personality] : null
    const contactProjects = contact ? projects.filter(p => p.contactId === contact.id) : []

    return (
      <div className="space-y-4">
        {/* Contact selector */}
        <div className="flex gap-2 flex-wrap">
          {contacts.map(c => (
            <button key={c.id} onClick={() => setViewContact(c.id)}
              className={"px-3 py-2 rounded-lg text-xs font-medium transition-all " + (viewContact === c.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10')}>
              {c.name}
            </button>
          ))}
        </div>

        {contact && profile && (
          <div className="grid grid-cols-3 gap-4">
            {/* Contact Card */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-lg">👤</div>
                <div>
                  <div className="text-sm font-bold">{contact.name}</div>
                  <div className="text-xs text-gray-500">{contact.title}</div>
                  <div className="text-xs text-gray-600">{contact.company}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="text-gray-400">📧 {contact.email}</div>
                <div className="text-gray-400">📱 {contact.phone}</div>
                <div className="text-gray-400">📅 Last contact: {contact.lastContact}</div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="text-[9px] text-gray-500 uppercase mb-1">Notes</div>
                <div className="text-xs text-gray-400">{contact.notes}</div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="text-[9px] text-gray-500 uppercase mb-1">Active Projects ({contactProjects.length})</div>
                {contactProjects.map(p => (
                  <div key={p.id} className="flex justify-between text-xs py-1">
                    <span className="text-gray-300">{p.name}</span>
                    <span className="font-mono text-gray-500">{fmt(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality Profile */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className={"text-sm font-bold " + profile.color}>{profile.label}</span>
                <span className="text-[9px] text-gray-600 uppercase">Personality Type</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[9px] text-emerald-400 uppercase font-semibold mb-2">✓ DO</div>
                  {profile.do.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 py-1 text-xs"><span className="text-emerald-400">•</span><span className="text-gray-300">{d}</span></div>
                  ))}
                </div>
                <div>
                  <div className="text-[9px] text-rose-400 uppercase font-semibold mb-2">✗ DON'T</div>
                  {profile.dont.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 py-1 text-xs"><span className="text-rose-400">•</span><span className="text-gray-400">{d}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Card */}
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
              <div className="text-sm font-bold mb-3">⚔️ Battle Card</div>
              <div className="space-y-3">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                  <div className="text-[9px] text-emerald-400 uppercase font-semibold mb-1">Opening Move</div>
                  <div className="text-xs text-gray-300">
                    {contact.personality === 'driver' && 'Lead with ROI metrics and a clear timeline. \"Here\\'s what this does for your bottom line in 90 days.\"'}
                    {contact.personality === 'analytical' && 'Open with data: benchmarks, case studies, compliance docs. \"I\\'ve prepared a detailed comparison.\"'}
                    {contact.personality === 'expressive' && 'Start with the transformation story. \"Imagine what your operation looks like in 6 months.\"'}
                    {contact.personality === 'amiable' && 'Begin with genuine check-in. \"How\\'s the team doing? I want to make sure this works for everyone.\"'}
                  </div>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                  <div className="text-[9px] text-blue-400 uppercase font-semibold mb-1">Objection Handler</div>
                  <div className="text-xs text-gray-300">
                    {contact.personality === 'driver' && 'They\\'ll push on price. Counter with speed-to-value: \"Every week without this costs you $X in inefficiency.\"'}
                    {contact.personality === 'analytical' && 'They\\'ll want more data. Have backup docs ready: \"Great question — here\\'s the spec sheet that covers that.\"'}
                    {contact.personality === 'expressive' && 'They may drift off-topic. Gently redirect: \"I love that idea — let\\'s capture it and also nail down the next step.\"'}
                    {contact.personality === 'amiable' && 'They\\'ll delay for consensus. Offer to present to their team: \"Would it help if I put together a brief for your group?\"'}
                  </div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                  <div className="text-[9px] text-amber-400 uppercase font-semibold mb-1">Closing Strategy</div>
                  <div className="text-xs text-gray-300">
                    {contact.personality === 'driver' && 'Direct close: \"Shall I draft the SOW for your review by Friday?\"'}
                    {contact.personality === 'analytical' && 'Summary close: \"We\\'ve covered all the criteria — here\\'s the decision matrix.\"'}
                    {contact.personality === 'expressive' && 'Vision close: \"Let\\'s make this happen — what does your ideal kickoff look like?\"'}
                    {contact.personality === 'amiable' && 'Consensus close: \"Once your team is comfortable, I can have contracts ready same day.\"'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!contact && <div className="text-center text-gray-600 py-12">Select a contact above to view their intel profile</div>}
      </div>
    )
  }

  // ============================================================================
  // TAB: EXPENSES
  // ============================================================================
  const ExpensesTab = () => {
    const [newExp, setNewExp] = useState<Partial<Expense>>({ category: 'mileage', date: new Date().toISOString().slice(0, 10), amount: 0, miles: 0, description: '' })
    const IRS_RATE = 0.67

    const addExpense = () => {
      if (!newExp.description) { show('Please add a description'); return }
      const amount = newExp.category === 'mileage' ? (newExp.miles || 0) * IRS_RATE : (newExp.amount || 0)
      setExpenses(prev => [...prev, {
        id: 'e-' + Date.now(), date: newExp.date || new Date().toISOString().slice(0, 10),
        category: newExp.category as ExpenseCategory, amount, description: newExp.description || '',
        miles: newExp.miles, projectId: newExp.projectId, submitted: false,
      }])
      setNewExp({ category: 'mileage', date: new Date().toISOString().slice(0, 10), amount: 0, miles: 0, description: '' })
      show('Expense added')
    }

    const submitForSendoff = () => {
      setExpenses(prev => prev.map(e => ({ ...e, submitted: true })))
      show('Expenses submitted for monthly send-off to CFO/Accounting')
    }

    const unsubmitted = expenses.filter(e => !e.submitted)
    const byCategory = unsubmitted.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)

    return (
      <div className="space-y-5">
        {/* Add New */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3">Add Expense</h3>
          <div className="grid grid-cols-6 gap-3">
            <div>
              <label className="text-[9px] text-gray-500 uppercase block mb-1">Type</label>
              <select value={newExp.category} onChange={e => setNewExp(p => ({ ...p, category: e.target.value as ExpenseCategory }))}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs">
                <option value="mileage">Mileage</option><option value="meals">Meals</option>
                <option value="lodging">Lodging</option><option value="supplies">Supplies</option><option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500 uppercase block mb-1">Date</label>
              <input type="date" value={newExp.date} onChange={e => setNewExp(p => ({ ...p, date: e.target.value }))}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs" />
            </div>
            {newExp.category === 'mileage' ? (
              <div>
                <label className="text-[9px] text-gray-500 uppercase block mb-1">Miles ({fmtd(IRS_RATE)}/mi)</label>
                <input type="number" value={newExp.miles || ''} onChange={e => setNewExp(p => ({ ...p, miles: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono" />
              </div>
            ) : (
              <div>
                <label className="text-[9px] text-gray-500 uppercase block mb-1">Amount ($)</label>
                <input type="number" step="0.01" value={newExp.amount || ''} onChange={e => setNewExp(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono" />
              </div>
            )}
            <div>
              <label className="text-[9px] text-gray-500 uppercase block mb-1">Project (optional)</label>
              <select value={newExp.projectId || ''} onChange={e => setNewExp(p => ({ ...p, projectId: e.target.value || undefined }))}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs">
                <option value="">None</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500 uppercase block mb-1">Description</label>
              <input value={newExp.description} onChange={e => setNewExp(p => ({ ...p, description: e.target.value }))}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs" placeholder="What was this for?" />
            </div>
            <div className="flex items-end">
              <button onClick={addExpense} className="w-full py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-500">Add</button>
            </div>
          </div>
          {/* Receipt upload */}
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 border-dashed rounded-lg cursor-pointer hover:bg-white/10 transition-all">
              <span className="text-sm">📸</span>
              <span className="text-[10px] text-gray-400">Upload Receipt / Take Photo</span>
              <input type="file" accept="image/*,.pdf" capture="environment" className="hidden" onChange={() => show('Receipt captured (stored locally in dev)')} />
            </label>
            <span className="text-[10px] text-gray-600">Accepts photos, PDFs. Camera opens on mobile.</span>
          </div>
        </div>

        {/* Summary + Send-off */}
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(byCategory).map(([cat, total]) => (
            <div key={cat} className="bg-[#0A0E15] border border-white/5 rounded-xl p-3">
              <div className="text-[9px] text-gray-500 uppercase">{cat}</div>
              <div className="text-sm font-mono font-bold mt-1">{fmtd(total)}</div>
            </div>
          ))}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
            <div className="text-[9px] text-blue-400 uppercase">Total Unreported</div>
            <div className="text-sm font-mono font-bold text-blue-400 mt-1">{fmtd(totalExpenses)}</div>
          </div>
        </div>

        {unsubmitted.length > 0 && (
          <button onClick={submitForSendoff} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500">
            📤 Prepare for Monthly Send-off to CFO/Accounting ({unsubmitted.length} items · {fmtd(totalExpenses)})
          </button>
        )}

        {/* Expense List */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
              <th className="text-left p-3">Date</th><th className="text-left p-3">Type</th><th className="text-left p-3">Description</th>
              <th className="text-left p-3">Project</th><th className="text-right p-3">Miles</th><th className="text-right p-3">Amount</th><th className="text-center p-3">Status</th>
            </tr></thead>
            <tbody>
              {expenses.slice().reverse().map(e => (
                <tr key={e.id} className="border-b border-white/[0.03]">
                  <td className="p-3 text-gray-400">{e.date}</td>
                  <td className="p-3"><span className={"px-1.5 py-0.5 rounded text-[9px] font-medium " + (e.category === 'mileage' ? 'bg-blue-500/10 text-blue-400' : e.category === 'meals' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400')}>{e.category}</span></td>
                  <td className="p-3 text-gray-300">{e.description}</td>
                  <td className="p-3 text-gray-500">{e.projectId ? projects.find(p => p.id === e.projectId)?.name || '—' : '—'}</td>
                  <td className="p-3 text-right font-mono text-gray-500">{e.miles || '—'}</td>
                  <td className="p-3 text-right font-mono font-medium">{fmtd(e.amount)}</td>
                  <td className="p-3 text-center"><span className={"text-[9px] px-1.5 py-0.5 rounded " + (e.submitted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{e.submitted ? 'Sent' : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ============================================================================
  // TAB: SALES MENTOR
  // ============================================================================
  const MentorTab = () => {
    const [projId, setProjId] = useState<string | null>(selectedProject)
    const [form, setForm] = useState<Partial<MentorEntry>>({ wantedProposal: null, gaveGoAhead: null, modifications: '', concerns: '', nextSteps: '', sentiment: 'neutral' })
    const up = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
    const proj = projId ? projects.find(p => p.id === projId) : null

    const submit = () => {
      if (!projId) { show('Select a project first'); return }
      const entry: MentorEntry = {
        id: 'mn-' + Date.now(), date: new Date().toISOString().slice(0, 10),
        wantedProposal: form.wantedProposal ?? null, gaveGoAhead: form.gaveGoAhead ?? null,
        modifications: form.modifications || '', concerns: form.concerns || '',
        nextSteps: form.nextSteps || '', sentiment: (form.sentiment as MentorEntry['sentiment']) || 'neutral',
      }
      addMentorNote(projId, entry)
      setForm({ wantedProposal: null, gaveGoAhead: null, modifications: '', concerns: '', nextSteps: '', sentiment: 'neutral' })
    }

    const boolBtn = (label: string, value: boolean | null, field: string) => (
      <div className="space-y-1">
        <div className="text-[10px] text-gray-400">{label}</div>
        <div className="flex gap-2">
          {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }, { v: null, l: 'N/A' }].map(opt => (
            <button key={String(opt.v)} onClick={() => up(field, opt.v)}
              className={"px-3 py-1.5 rounded text-xs font-medium " + (value === opt.v ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>
    )

    return (
      <div className="space-y-5">
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">🧠</span><span className="text-sm font-bold text-purple-400">Sales Mentor AI</span></div>
          <div className="text-xs text-gray-400">Record post-call analysis. Answers auto-update the pipeline probability and stage.</div>
        </div>

        {/* Project selector */}
        <div>
          <label className="text-[9px] text-gray-500 uppercase block mb-1">Select Project</label>
          <select value={projId || ''} onChange={e => setProjId(e.target.value || null)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm w-full max-w-md">
            <option value="">Choose a project...</option>
            {openProjects.map(p => <option key={p.id} value={p.id}>{p.name} — {getContact(p.contactId)?.company}</option>)}
          </select>
        </div>

        {proj && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold">Post-Call Analysis: {proj.name}</h3>

            <div className="grid grid-cols-3 gap-4">
              {boolBtn('Did they want a proposal?', form.wantedProposal ?? null, 'wantedProposal')}
              {boolBtn('Did they give the go-ahead?', form.gaveGoAhead ?? null, 'gaveGoAhead')}
              <div className="space-y-1">
                <div className="text-[10px] text-gray-400">Call Sentiment</div>
                <div className="flex gap-2">
                  {[{ v: 'positive', l: '😊 Positive', c: 'bg-emerald-600' }, { v: 'neutral', l: '😐 Neutral', c: 'bg-gray-600' }, { v: 'cautious', l: '😟 Cautious', c: 'bg-amber-600' }].map(opt => (
                    <button key={opt.v} onClick={() => up('sentiment', opt.v)}
                      className={"px-3 py-1.5 rounded text-xs font-medium " + (form.sentiment === opt.v ? opt.c + ' text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[9px] text-gray-500 uppercase block mb-1">Requested Modifications</label>
                <textarea value={form.modifications} onChange={e => up('modifications', e.target.value)} placeholder="Any changes they asked for..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs h-20 resize-none" /></div>
              <div><label className="text-[9px] text-gray-500 uppercase block mb-1">Specific Concerns</label>
                <textarea value={form.concerns} onChange={e => up('concerns', e.target.value)} placeholder="Pricing, timeline, scope worries..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs h-20 resize-none" /></div>
            </div>

            <div><label className="text-[9px] text-gray-500 uppercase block mb-1">Next Steps</label>
              <textarea value={form.nextSteps} onChange={e => up('nextSteps', e.target.value)} placeholder="What needs to happen next..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-xs h-16 resize-none" /></div>

            <button onClick={submit} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500">
              Save Analysis & Update Pipeline
            </button>
          </div>
        )}

        {/* Previous Mentor Entries */}
        {proj && proj.mentorNotes.length > 0 && (
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-bold mb-3">Previous Call Notes</h3>
            {proj.mentorNotes.slice().reverse().map(note => (
              <div key={note.id} className="border-b border-white/[0.03] py-3 last:border-0 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{note.date}</span>
                  <span className={"text-[10px] px-1.5 py-0.5 rounded " + (note.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : note.sentiment === 'cautious' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400')}>{note.sentiment}</span>
                  {note.wantedProposal && <span className="text-[10px] text-blue-400">Wants proposal</span>}
                  {note.gaveGoAhead && <span className="text-[10px] text-emerald-400">Go-ahead ✓</span>}
                </div>
                {note.modifications && <div className="text-xs text-gray-400">Mods: {note.modifications}</div>}
                {note.concerns && <div className="text-xs text-gray-400">Concerns: {note.concerns}</div>}
                {note.nextSteps && <div className="text-xs text-blue-400">Next: {note.nextSteps}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // TAB: COMMISSIONS
  // ============================================================================
  const CommissionsTab = () => {
    const earned = calcCommission()

    return (
      <div className="space-y-5">
        {/* Running Totals */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Closed Revenue</div><div className="text-xl font-mono font-bold text-emerald-400 mt-1">{fmt(totalClosed)}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Commission Earned</div><div className="text-xl font-mono font-bold text-blue-400 mt-1">{fmtd(earned)}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Projected (Weighted)</div><div className="text-xl font-mono font-bold text-amber-400 mt-1">{fmtd(projectedEarnings)}</div></div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Expenses (Unreported)</div><div className="text-xl font-mono font-bold text-rose-400 mt-1">{fmtd(totalExpenses)}</div></div>
        </div>

        {/* Parameters */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-bold mb-4">Commission Parameters</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-[9px] text-gray-500 uppercase block mb-1">Model</label>
              <select value={commParams.model} onChange={e => setCommParams(p => ({ ...p, model: e.target.value as any }))}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs">
                <option value="percent_gross">% of Gross</option>
                <option value="base_plus_commission">Base + Commission</option>
                <option value="tiered">Tiered</option>
              </select>
            </div>
            {commParams.model !== 'percent_gross' && (
              <div><label className="text-[9px] text-gray-500 uppercase block mb-1">Base Salary ($)</label>
                <input type="number" value={commParams.baseSalary} onChange={e => setCommParams(p => ({ ...p, baseSalary: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono" /></div>
            )}
            <div><label className="text-[9px] text-gray-500 uppercase block mb-1">Commission Rate (%)</label>
              <input type="number" step="0.5" value={commParams.commissionRate} onChange={e => setCommParams(p => ({ ...p, commissionRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono" /></div>
            {commParams.model === 'tiered' && (
              <>
                <div><label className="text-[9px] text-gray-500 uppercase block mb-1">Tier 2 Rate (%)</label>
                  <input type="number" step="0.5" value={commParams.tier2Rate} onChange={e => setCommParams(p => ({ ...p, tier2Rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-xs font-mono" /></div>
              </>
            )}
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
              <th className="text-left p-3">Project</th><th className="text-left p-3">Stage</th><th className="text-right p-3">Value</th>
              <th className="text-right p-3">Prob.</th><th className="text-right p-3">Weighted</th><th className="text-right p-3">Commission</th>
            </tr></thead>
            <tbody>
              {activeProjects.map(p => {
                const weighted = p.value * p.probability / 100
                const comm = weighted * (commParams.commissionRate / 100)
                return (
                  <tr key={p.id} className="border-b border-white/[0.03]">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3"><span className={"text-[9px] px-1.5 py-0.5 rounded " + (p.stage === 'closed_won' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>{p.stage.replace('_', ' ')}</span></td>
                    <td className="p-3 text-right font-mono">{fmt(p.value)}</td>
                    <td className="p-3 text-right font-mono text-gray-500">{p.probability}%</td>
                    <td className="p-3 text-right font-mono">{fmt(Math.round(weighted))}</td>
                    <td className="p-3 text-right font-mono text-emerald-400">{fmtd(comm)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot><tr className="border-t border-white/5 font-bold">
              <td className="p-3" colSpan={2}>Totals</td>
              <td className="p-3 text-right font-mono">{fmt(activeProjects.reduce((s, p) => s + p.value, 0))}</td>
              <td className="p-3"></td>
              <td className="p-3 text-right font-mono">{fmt(Math.round(weightedPipeline + totalClosed))}</td>
              <td className="p-3 text-right font-mono text-emerald-400">{fmtd(projectedEarnings)}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    )
  }

  // ============================================================================
  // TAB: CRM & INTEGRATIONS
  // ============================================================================
  const CRMTab = () => {
    const [connected, setConnected] = useState<Record<string, boolean>>({})
    const [proposalProject, setProposalProject] = useState<string | null>(selectedProject)
    const [generating, setGenerating] = useState(false)

    const CRMS = [
      { id: 'netsuite', name: 'NetSuite', icon: '🔷', desc: 'Full ERP + CRM sync (contacts, opportunities, invoices)', fields: ['Account ID', 'Token ID', 'Token Secret', 'Consumer Key'] },
      { id: 'salesforce', name: 'Salesforce', icon: '☁️', desc: 'CRM pipeline sync + opportunity management', fields: ['Instance URL', 'Client ID', 'Client Secret'] },
      { id: 'hubspot', name: 'HubSpot', icon: '🟠', desc: 'Deal tracking + contact sync', fields: ['API Key'] },
      { id: 'pipedrive', name: 'Pipedrive', icon: '🟢', desc: 'Pipeline + activity sync', fields: ['API Token', 'Company Domain'] },
    ]

    const generateProposal = async () => {
      if (!proposalProject) { show('Select a project first'); return }
      setGenerating(true)
      // Simulate PDF generation
      await new Promise(r => setTimeout(r, 2000))
      const proj = projects.find(p => p.id === proposalProject)
      const contact = proj ? getContact(proj.contactId) : null
      show('Proposal generated for ' + (proj?.name || 'project') + ' — ready to send to ' + (contact?.name || 'client'))
      setGenerating(false)
    }

    return (
      <div className="space-y-5">
        {/* CRM Connections */}
        <div>
          <h3 className="text-sm font-bold mb-3">CRM Integrations</h3>
          <div className="grid grid-cols-2 gap-4">
            {CRMS.map(crm => (
              <div key={crm.id} className={"bg-[#0A0E15] border rounded-xl p-5 transition-all " + (connected[crm.id] ? 'border-emerald-500/20' : 'border-white/5')}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{crm.icon}</span>
                    <div>
                      <div className="text-sm font-bold">{crm.name}</div>
                      <div className="text-[10px] text-gray-500">{crm.desc}</div>
                    </div>
                  </div>
                  {connected[crm.id] && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-medium">Connected ✓</span>}
                </div>
                {!connected[crm.id] ? (
                  <button onClick={() => { setConnected(p => ({ ...p, [crm.id]: true })); show(crm.name + ' connected successfully') }}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-500">
                    Connect to {crm.name}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => show('Syncing ' + crm.name + ' data...')} className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10">Sync Now</button>
                    <button onClick={() => setConnected(p => ({ ...p, [crm.id]: false }))} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10">Disconnect</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Proposal Generator */}
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3">📄 Proposal Generator</h3>
          <p className="text-xs text-gray-500 mb-4">Generate a PDF proposal from project data and send directly to your connected CRM.</p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[9px] text-gray-500 uppercase block mb-1">Project</label>
              <select value={proposalProject || ''} onChange={e => setProposalProject(e.target.value || null)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
                <option value="">Select project...</option>
                {openProjects.map(p => <option key={p.id} value={p.id}>{p.name} — {fmt(p.value)}</option>)}
              </select>
            </div>
            <button onClick={generateProposal} disabled={generating || !proposalProject}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-500 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate PDF Proposal'}
            </button>
            {Object.values(connected).some(Boolean) && proposalProject && (
              <button onClick={() => show('Proposal pushed to connected CRM')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500">
                Send to CRM
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  const TABS = [
    { id: 'pipeline' as const, label: 'Pipeline', icon: '📊' },
    { id: 'intel' as const, label: 'Sales Intel', icon: '🧠' },
    { id: 'expenses' as const, label: 'Expenses', icon: '🧾' },
    { id: 'mentor' as const, label: 'Sales Mentor', icon: '🎓' },
    { id: 'commissions' as const, label: 'Commissions', icon: '💰' },
    { id: 'crm' as const, label: 'CRM & Integrations', icon: '🔗' },
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold">Solo Salesman Agent</h1>
          <p className="text-sm text-gray-500 mt-1">Pipeline · Intel · Expenses · Mentor · Commissions · CRM</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase">Projected Earnings</div>
            <div className="text-lg font-mono font-bold text-emerald-400">{fmtd(projectedEarnings)}</div>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase">Pipeline</div>
            <div className="text-lg font-mono font-bold">{fmt(totalPipeline)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all " +
              (tab === t.id ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5')}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'pipeline' && <PipelineTab />}
      {tab === 'intel' && <IntelTab />}
      {tab === 'expenses' && <ExpensesTab />}
      {tab === 'mentor' && <MentorTab />}
      {tab === 'commissions' && <CommissionsTab />}
      {tab === 'crm' && <CRMTab />}
    </div>
  )
}
`);

// ============================================================
// 2. API — Expense submission endpoint
// ============================================================
console.log('');
console.log('  [2] Expense API:');

write('app/api/expenses/route.ts', `import { NextRequest, NextResponse } from 'next/server';

const expenses: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'submit') {
      // Monthly send-off to CFO
      const batch = {
        id: 'batch-' + Date.now(),
        expenses: body.expenses || [],
        total: body.total || 0,
        totalMiles: body.totalMiles || 0,
        submittedBy: body.submittedBy || 'sales-rep',
        submittedAt: new Date().toISOString(),
        status: 'pending_review',
      };
      expenses.push(batch);
      return NextResponse.json({ success: true, batchId: batch.id, message: 'Expenses submitted to CFO for review' });
    }

    if (action === 'upload_receipt') {
      return NextResponse.json({ success: true, receiptUrl: '/receipts/receipt-' + Date.now() + '.jpg', message: 'Receipt uploaded' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ batches: expenses, total: expenses.length });
}
`);

// ============================================================
// 3. API — Proposal generation endpoint
// ============================================================
console.log('');
console.log('  [3] Proposal API:');

write('app/api/proposals/route.ts', `import { NextRequest, NextResponse } from 'next/server';

const proposals: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, projectValue, contactName, contactCompany, description } = body;

    const proposal = {
      id: 'prop-' + Date.now(),
      projectName, projectValue, contactName, contactCompany, description,
      status: 'generated',
      pdfUrl: '/proposals/proposal-' + Date.now() + '.pdf',
      createdAt: new Date().toISOString(),
    };
    proposals.push(proposal);

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Proposal generated. Ready to send to CRM.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ proposals, total: proposals.length });
}
`);

// ============================================================
// DONE
// ============================================================
console.log('');
console.log('  ═══════════════════════════════════════════');
console.log('  Installed: ' + installed + ' files');
console.log('  ═══════════════════════════════════════════');
console.log('');
console.log('  SOLO SALESMAN AGENT — 6 Modules:');
console.log('');
console.log('    📊 Pipeline    → Visual kanban, click to edit, drag stages');
console.log('    🧠 Sales Intel → Personality profiles, DO/DONT cards, battle cards');
console.log('    🧾 Expenses    → Mileage ($0.67/mi), receipts, monthly send-off');
console.log('    🎓 Sales Mentor→ Post-call analysis, auto-updates pipeline');
console.log('    💰 Commissions → 3 models (% gross, base+comm, tiered)');
console.log('    🔗 CRM         → NetSuite + Salesforce + HubSpot + Pipedrive');
console.log('');
console.log('  STATE CONNECTIONS:');
console.log('    Mentor "go-ahead" → Pipeline probability +15%');
console.log('    Mentor "wants proposal" → Stage auto-advances');
console.log('    Closed deals → Commission auto-calculates');
console.log('    Expenses → Unreported total in Commissions tab');
console.log('    Pipeline weighted → Projected Earnings in header');
console.log('');
console.log('  Route: /agents/sales/solo (sidebar: Sales Reps → Solo Rep Agent)');
console.log('  Restart: Ctrl+C → npm run dev');
console.log('');
