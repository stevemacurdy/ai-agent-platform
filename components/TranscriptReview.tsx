'use client'
import { useState } from 'react'
import type { TranscriptAnalysis } from './AudioRecorder'

interface TranscriptReviewProps {
  transcript: string
  analysis: TranscriptAnalysis | null
  analyzing: boolean
  onEdit: (text: string) => void
  onFinalize: () => void
  onReanalyze: () => void
  onSyncMentor: () => void
  onSyncCRM: () => void
  onResearchContact: (name: string) => void
}

export default function TranscriptReview({
  transcript, analysis, analyzing, onEdit, onFinalize,
  onReanalyze, onSyncMentor, onSyncCRM, onResearchContact
}: TranscriptReviewProps) {
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState(transcript)
  const [viewTab, setViewTab] = useState<'transcript' | 'summary' | 'actions' | 'personality'>('transcript')

  const saveEdit = () => {
    onEdit(editText)
    setEditMode(false)
  }

  const priorityColor = (p: string) => p === 'high' ? 'text-rose-400 bg-rose-500/10' : p === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 bg-gray-500/10'

  return (
    <div className="space-y-4">
      {/* Analysis Status */}
      {analyzing && (
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <div>
            <div className="text-sm font-medium text-purple-400">Analyzing conversation...</div>
            <div className="text-[10px] text-gray-500">Extracting notes, action items, personality signals</div>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/[0.02] rounded-lg p-0.5">
        {[
          { id: 'transcript' as const, label: 'Transcript', icon: '📝' },
          { id: 'summary' as const, label: 'Meeting Notes', icon: '📋' },
          { id: 'actions' as const, label: 'Action Items', icon: '✅' },
          { id: 'personality' as const, label: 'Personality Intel', icon: '🧠' },
        ].map(t => (
          <button key={t.id} onClick={() => setViewTab(t.id)}
            className={"flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all " +
              (viewTab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300')}>
            <span>{t.icon}</span><span>{t.label}</span>
            {t.id === 'actions' && analysis && analysis.actionItems.length > 0 && (
              <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">{analysis.actionItems.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* TRANSCRIPT VIEW */}
      {viewTab === 'transcript' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[9px] text-gray-500 uppercase">Full Transcript</div>
            <button onClick={() => { setEditMode(!editMode); setEditText(transcript) }}
              className="text-[10px] text-blue-400 hover:text-blue-300">
              {editMode ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>
          {editMode ? (
            <div className="space-y-3">
              <textarea value={editText} onChange={e => setEditText(e.target.value)}
                className="w-full h-64 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 leading-relaxed resize-none focus:border-blue-500/30 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-500">Save Changes</button>
                <button onClick={onReanalyze} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10">Re-analyze</button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">{transcript || 'No transcript available'}</div>
          )}
        </div>
      )}

      {/* MEETING NOTES */}
      {viewTab === 'summary' && analysis && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <div className="text-[9px] text-gray-500 uppercase mb-2">Meeting Summary</div>
            <div className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <div className="text-[9px] text-gray-500 uppercase mb-2">Key Topics Discussed</div>
            <div className="flex flex-wrap gap-2">
              {analysis.keyTopics.map((topic, i) => (
                <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">{topic}</span>
              ))}
            </div>
          </div>
          {/* Mentor Auto-Answers */}
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span>🎓</span>
              <div className="text-sm font-bold text-purple-400">Sales Mentor Auto-Analysis</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={analysis.mentorAnswers.wantedProposal ? 'text-emerald-400' : 'text-gray-500'}>
                  {analysis.mentorAnswers.wantedProposal ? '✓ Yes' : analysis.mentorAnswers.wantedProposal === false ? '✗ No' : '— Unknown'}
                </span>
                <span className="text-gray-500">Wanted a proposal?</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={analysis.mentorAnswers.gaveGoAhead ? 'text-emerald-400' : 'text-gray-500'}>
                  {analysis.mentorAnswers.gaveGoAhead ? '✓ Yes' : analysis.mentorAnswers.gaveGoAhead === false ? '✗ No' : '— Unknown'}
                </span>
                <span className="text-gray-500">Gave go-ahead?</span>
              </div>
              {analysis.mentorAnswers.modifications && <div className="col-span-2 text-gray-400"><span className="text-amber-400">Modifications: </span>{analysis.mentorAnswers.modifications}</div>}
              {analysis.mentorAnswers.concerns && <div className="col-span-2 text-gray-400"><span className="text-rose-400">Concerns: </span>{analysis.mentorAnswers.concerns}</div>}
              {analysis.mentorAnswers.nextSteps && <div className="col-span-2 text-gray-400"><span className="text-blue-400">Next Steps: </span>{analysis.mentorAnswers.nextSteps}</div>}
            </div>
            <button onClick={onSyncMentor}
              className="mt-3 px-4 py-2 bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-600/30">
              Push to Sales Mentor →
            </button>
          </div>
        </div>
      )}

      {/* ACTION ITEMS */}
      {viewTab === 'actions' && analysis && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <div className="text-[9px] text-gray-500 uppercase mb-3">Extracted Action Items</div>
          {analysis.actionItems.length === 0 ? (
            <div className="text-xs text-gray-600 py-4 text-center">No action items detected</div>
          ) : (
            <div className="space-y-2">
              {analysis.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
                  <div className="w-5 h-5 mt-0.5 rounded border-2 border-gray-600 flex items-center justify-center text-xs shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs text-gray-300">{item.task}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500">Assignee: {item.assignee}</span>
                      {item.deadline && <span className="text-[10px] text-gray-500">Due: {item.deadline}</span>}
                      <span className={"text-[9px] px-1.5 py-0.5 rounded font-medium " + priorityColor(item.priority)}>{item.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PERSONALITY INTEL */}
      {viewTab === 'personality' && analysis && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <div className="text-[9px] text-gray-500 uppercase mb-3">Behavioral Profile Update</div>
            <div className="flex items-center gap-3 mb-3">
              <div className={"text-sm font-bold " + (analysis.personalitySignals.type === 'Driver' ? 'text-rose-400' : analysis.personalitySignals.type === 'Analytical' ? 'text-blue-400' : analysis.personalitySignals.type === 'Expressive' ? 'text-amber-400' : 'text-emerald-400')}>
                {analysis.personalitySignals.type}
              </div>
              <div className="text-[10px] text-gray-500">{Math.round(analysis.personalitySignals.confidence * 100)}% confidence</div>
              <div className="flex-1 bg-white/5 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: (analysis.personalitySignals.confidence * 100) + '%' }} />
              </div>
            </div>
            <div className="space-y-1">
              {analysis.personalitySignals.signals.map((sig, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-blue-400">→</span>
                  <span className="text-gray-400">{sig}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Contacts Detected */}
          {analysis.newContacts.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
              <div className="text-[9px] text-amber-400 uppercase mb-3">New Contacts Mentioned</div>
              {analysis.newContacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <div className="text-xs font-medium text-gray-300">{c.name}</div>
                    <div className="text-[10px] text-gray-500">{c.role}{c.company ? ' at ' + c.company : ''}</div>
                  </div>
                  <button onClick={() => onResearchContact(c.name)}
                    className="px-3 py-1.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded text-[10px] font-medium hover:bg-amber-600/20">
                    🔍 Research
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Finalize Actions */}
      {analysis && !analyzing && (
        <div className="flex gap-2 pt-2">
          <button onClick={onFinalize}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500">
            ✓ Finalize & Store
          </button>
          <button onClick={onSyncCRM}
            className="px-4 py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/20">
            📤 Push to CRM
          </button>
          <button onClick={onSyncMentor}
            className="px-4 py-2.5 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-600/20">
            🎓 Sync to Mentor
          </button>
        </div>
      )}
    </div>
  )
}
