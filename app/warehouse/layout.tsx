// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const NAV_ITEMS = [
  { href: '/warehouse', label: 'Dashboard', icon: '\ud83d\udcca' },
  { href: '/warehouse/receiving', label: 'Receiving', icon: '\ud83d\udce5' },
  { href: '/warehouse/pallets', label: 'Pallets', icon: '\ud83d\udce6' },
  { href: '/warehouse/inventory', label: 'Inventory', icon: '\ud83c\udfed' },
  { href: '/warehouse/orders', label: 'Orders', icon: '\ud83d\ude9a' },
  { href: '/warehouse/bol', label: 'Bills of Lading', icon: '\ud83d\udcc4' },
  { href: '/warehouse/purchase-orders', label: 'Purchase Orders', icon: '\ud83d\udccb' },
  { href: '/warehouse/asn', label: 'ASN Documents', icon: '\ud83d\udcce' },
  { href: '/warehouse/customers', label: 'Customers', icon: '\ud83d\udc65' },
];

export default function WarehouseLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) {
        window.location.href = '/login';
        return;
      }
      setUser({ email: session.user.email || '', role: '' });
      const { data: memberships } = await sb
        .from('company_members')
        .select('company_id, role, companies(id, name, portal_type)')
        .eq('user_id', session.user.id);
      if (memberships && memberships.length > 0) {
        const warehouseCo = memberships.find(
          m => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both'
        ) || memberships[0];
        setCompany({ id: warehouseCo.company_id, name: warehouseCo.companies?.name || 'Warehouse' });
        setUser(prev => prev ? { ...prev, role: warehouseCo.role } : prev);
      }
    };
    load();
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#0d0d14] border-r border-white/10 flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">W</div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{company?.name || 'Loading...'}</p>
                <p className="text-[10px] text-white/40">Warehouse Portal</p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/40 hover:text-white/80 transition-colors">
              {sidebarOpen ? '\u25c0' : '\u25b6'}
            </button>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/warehouse' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}>
                <span className="text-base">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/portal" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
            <span>\u2190</span>
            {sidebarOpen && <span>Back to WoulfAI Portal</span>}
          </Link>
          {sidebarOpen && user && (
            <p className="text-[10px] text-white/20 mt-2 px-3 truncate">{user.email}</p>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
