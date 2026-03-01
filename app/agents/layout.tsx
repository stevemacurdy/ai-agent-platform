import PlatformShell from '@/components/layout/PlatformShell';
import CompanyBanner from '@/components/portal/company-banner';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PlatformShell><><CompanyBanner />{children}</></PlatformShell>;
}
