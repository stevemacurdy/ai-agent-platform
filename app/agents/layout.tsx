import PlatformShell from '@/components/layout/PlatformShell';
import CompanyBanner from '@/components/portal/company-banner';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PlatformShell>
      <div className="bg-[#F4F5F7] text-[#1B2A4A] min-h-screen">
        <CompanyBanner />
        {children}
      </div>
    </PlatformShell>
  );
}
