import PlatformShell from '@/components/layout/PlatformShell';
import AuthGuard from '@/components/auth/AuthGuard';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRole="any" fallbackUrl="/login"><PlatformShell>{children}</PlatformShell></AuthGuard>;
}
