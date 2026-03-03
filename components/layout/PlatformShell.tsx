'use client';
import { useState } from 'react';
import SidebarNav from '@/components/dashboard/sidebar-nav';

export default function PlatformShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-[#1B2A4A]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
        <SidebarNav />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-white border-r border-[#E5E7EB] overflow-y-auto z-50 shadow-xl">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[#6B7280] hover:text-[#1B2A4A] p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB] bg-white sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[#6B7280] hover:text-[#1B2A4A] p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-md flex items-center justify-center text-white font-bold text-[10px]">W</div>
            <span className="text-sm font-bold text-[#1B2A4A]">WoulfAI</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
