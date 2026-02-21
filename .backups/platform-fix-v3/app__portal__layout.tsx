import PlatformShell from '@/components/layout/PlatformShell';
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>;
}