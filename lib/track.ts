// Fire-and-forget click tracker — never blocks UI, never throws
export function trackClick(agentSlug: string, source: string) {
  try {
    fetch('/api/agents/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_slug: agentSlug,
        source,
        session_id: getSessionId(),
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  } catch {}
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = sessionStorage.getItem('woulfai_sid')
  if (!id) {
    id = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('woulfai_sid', id)
  }
  return id
}
