import PlatformShell from '@/components/layout/PlatformShell';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" fallbackUrl="/login">
      <PlatformShell>{children}</PlatformShell>
    </AuthGuard>
  );
}
