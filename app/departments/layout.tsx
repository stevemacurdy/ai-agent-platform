import AuthGuard from '@/components/auth/AuthGuard';

export default function DepartmentsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
