import PlatformShell from '@/components/layout/PlatformShell';
import AuthGuard from '@/components/auth/AuthGuard';
import CompanyBanner from '@/components/portal/company-banner';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="any" fallbackUrl="/login"><PlatformShell><><CompanyBanner />{children}</></PlatformShell></AuthGuard>;
}
