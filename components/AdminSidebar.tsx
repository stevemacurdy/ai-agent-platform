'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavChild { id: string; label: string; href: string; icon: string }
interface NavItem { id: string; label: string; href: string; icon: string; children?: NavChild[] }

const NAV_ITEMS: NavItem[] = [
  { id: 'hub', label: 'Command Center', href: '/admin', icon: '🎯' },
  { id: 'dashboard', label: 'Agent Dashboard', href: '/admin/agents', icon: '🤖' },
  { id: 'users', label: 'Users & Roles', href: '/admin/users', icon: '👥' },
  { id: 'sales', label: 'Sales Reps', href: '/admin/sales-reps', icon: '💼', children: [
    { id: 'sales-crm', label: 'Sales CRM', href: '/admin/sales-crm', icon: '📊' },
    { id: 'sales-intel', label: 'Sales Intel', href: '/agents/sales/intel', icon: '🧠' },
    { id: 'sales-solo', label: 'Solo Rep Agent', href: '/agents/sales/solo', icon: '🎯' },
  ]},
  { id: 'cfo-console', label: 'CFO Console', href: '/agents/cfo/console', icon: '📈', children: [
    { id: 'cfo-tools', label: 'CFO Tools', href: '/agents/cfo/tools', icon: '🔧' },
    { id: 'payables', label: 'Payables', href: '/agents/cfo/payables', icon: '🧾' },
  ]},
  { id: 'finops', label: 'FinOps Suite', href: '/agents/cfo/finops', icon: '💰', children: [
    { id: 'finops-pro', label: 'FinOps Pro', href: '/agents/cfo/finops-pro', icon: '⚡' },
  ]},
  { id: 'integrations', label: 'Integrations', href: '/admin/integrations', icon: '🔗' },
  { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: '📊' },
  { id: 'agents-creator', label: 'Agent Creator', href: '/admin/agent-creator', icon: '🧬' },
  { id: 'bug-bash', label: 'Bug Bash', href: '/admin/bug-bash', icon: '🐛' },
]

interface SidebarProps {
  user: { email: string; role: string; full_name?: string } | null
  onSignOut: () => void
}

export default function AdminSidebar({ user, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ sales: true, 'cfo-console': true, finops: false })

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isGroupActive = (item: NavItem) => {
    if (isActive(item.href)) return true
    return item.children?.some(c => isActive(c.href)) || false
  }

  return (
    <aside className={`${open ? 'w-64' : 'w-16'} bg-[#0A0E15] border-r border-white/5 flex flex-col transition-all duration-200 flex-shrink-0 h-screen sticky top-0`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        {open && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-sm font-bold">W</div>
            <div>
              <div className="text-sm font-bold">WoulfAI</div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Admin Console</div>
            </div>
          </Link>
        )}
        <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white text-lg">
          {open ? '◁' : '▷'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const hasKids = item.children && item.children.length > 0
          const isExp = expanded[item.id]
          const groupActive = isGroupActive(item)

          return (
            <div key={item.id}>
              <div className="flex items-center">
                <Link href={item.href}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive(item.href) || groupActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className="text-base">{item.icon}</span>
                  {open && <span>{item.label}</span>}
                </Link>
                {hasKids && open && (
                  <button onClick={() => toggle(item.id)} className="px-2 py-2.5 text-gray-500 hover:text-white text-xs">
                    {isExp ? '▾' : '▸'}
                  </button>
                )}
              </div>
              {hasKids && isExp && open && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/5 pl-2">
                  {item.children!.map(child => (
                    <Link key={child.id} href={child.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                        isActive(child.href) ? 'bg-blue-500/10 text-blue-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}>
                      <span className="text-sm">{child.icon}</span>
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-white/5">
        {open && user && (
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
            <div className="text-[10px] text-gray-600">{user.role}</div>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <span>🏠</span>{open && <span>User Dashboard</span>}
          </Link>
          <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <span>🚪</span>{open && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
