import PlatformShell from '@/components/layout/PlatformShell';
import AuthGuard from '@/components/auth/AuthGuard';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="any" fallbackUrl="/login"><PlatformShell>{children}</PlatformShell></AuthGuard>;
}
