'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortalData } from '@/lib/portal-data-context';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '', icon: 'home' },
  { label: 'Inventory', href: '/inventory', icon: 'box' },
  { label: 'Place Order', href: '/orders/new', icon: 'cart' },
  { label: 'Orders', href: '/orders', icon: 'truck' },
  { label: 'Receiving', href: '/receiving', icon: 'download' },
  { label: 'Billing', href: '/billing', icon: 'dollar' },
  { label: 'Support', href: '/support', icon: 'chat' },
  { label: 'Settings', href: '/settings', icon: 'gear' },
];

const ICONS: Record<string, JSX.Element> = {
  home: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
  box: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  cart: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>,
  truck: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m17-5l-4-4H1m16 0v8a1 1 0 01-1 1h-1" /></svg>,
  download: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  dollar: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  chat: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  gear: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export default function PortalNav({ customerCode, customerName, basePath }: { customerCode: string; customerName: string; basePath?: string }) {
  const pathname = usePathname();
  const portalData = usePortalData();
  const displayName = portalData.customer?.customer_name || customerName;
  const base = basePath || `/portal/${customerCode}`;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1B2A4A] text-white min-h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#F5920B] flex items-center justify-center text-sm font-bold">3P</div>
            <span className="font-semibold text-sm tracking-wide opacity-80">Clutch 3PL</span>
          </div>
          <p className="text-white/60 text-xs mt-2 truncate">{displayName}</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const href = item.href ? `${base}${item.href}` : base;
            const active = item.href ? pathname === href : pathname === base;
            return (
              <Link key={item.label} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:bg-white/8 hover:text-white/90'}`}>
                {ICONS[item.icon]}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white/80 text-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </Link>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1B2A4A] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#F5920B] flex items-center justify-center text-xs font-bold">3P</div>
          <span className="text-sm font-medium">Clutch 3PL</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#1B2A4A] text-white p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-6">
              <p className="text-white/60 text-xs">{customerName}</p>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const href = item.href ? `${base}${item.href}` : base;
                const active = item.href ? pathname === href : pathname === base;
                return (
                  <Link key={item.label} href={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:bg-white/8 hover:text-white/90'}`}>
                    {ICONS[item.icon]}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around py-2 px-1">
        {NAV_ITEMS.slice(0, 5).map(item => {
          const href = item.href ? `${base}${item.href}` : base;
          const active = item.href ? pathname === href : pathname === base;
          return (
            <Link key={item.label} href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[10px] transition-colors ${active ? 'text-[#1B2A4A] font-medium' : 'text-gray-400'}`}>
              <span className={`${active ? 'text-[#1B2A4A]' : 'text-gray-400'}`}>{ICONS[item.icon]}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
