'use client';
import SidebarNav from '@/components/dashboard/sidebar-nav';
export default function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-[#1B2A4A]">
      <SidebarNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
