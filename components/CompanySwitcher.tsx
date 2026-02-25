'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface Company {
  id: string
  name: string
  slug: string
}

interface CompanySwitcherProps {
  open: boolean
  onSwitch?: (company: Company | null) => void
}

export default function CompanySwitcher({ open, onSwitch }: CompanySwitcherProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selected, setSelected] = useState<Company | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sb = getSupabaseBrowser()
    sb.from('companies').select('id, name, slug').order('name').then(({ data }) => {
      if (data) setCompanies(data)
      setLoading(false)
    })
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (company: Company | null) => {
    setSelected(company)
    setShowDropdown(false)
    onSwitch?.(company)
  }

  if (loading || companies.length === 0) return null
  if (!open) {
    return (
      <div className="px-3 py-2">
        <div
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center text-sm cursor-pointer hover:border-blue-500/30 transition-all"
          title={selected ? selected.name : 'All Companies'}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selected ? selected.name.charAt(0).toUpperCase() : '🏢'}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="px-3 py-2">
      <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 px-1">Company</div>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all text-sm"
      >
        <span className="text-base">{selected ? '🏢' : '🌐'}</span>
        <span className="flex-1 text-left text-gray-300 truncate">
          {selected ? selected.name : 'All Companies'}
        </span>
        <span className="text-gray-500 text-xs">▾</span>
      </button>

      {showDropdown && (
        <div className="mt-1 bg-[#0D1117] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 relative">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-all ${!selected ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400'}`}
          >
            🌐 All Companies
          </button>
          <div className="border-t border-white/5" />
          {companies.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-all ${selected?.id === c.id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400'}`}
            >
              🏢 {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
