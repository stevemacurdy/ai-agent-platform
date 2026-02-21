'use client';
import React from 'react';
import SidebarNav from '@/components/dashboard/sidebar-nav';

export default function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#060910]">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}