'use client';

import { useParams } from 'next/navigation';
import PortalNav from '@/components/portal/PortalNav';
import { PortalProvider } from '@/lib/portal-context';
import { PortalDataProvider, usePortalData } from '@/lib/portal-data-context';

function LivePortalShell({ customerCode, children }: { customerCode: string; children: React.ReactNode }) {
  const { customer, loading, error, mode } = usePortalData();
  const customerName = customer?.customer_name || 'Loading...';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-[3px] mx-auto mb-4"
            style={{ borderColor: '#E5E7EB', borderTopColor: '#2A9D8F', animation: 'spin 0.8s linear infinite' }} />
          <p className="text-sm text-gray-400">Loading portal data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {error && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-xs text-amber-700">
            Using demo data — live connection unavailable ({error})
          </p>
        </div>
      )}
      <PortalNav customerCode={customerCode} customerName={customerName} basePath={`/p/${customerCode}`} />
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function LivePortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const customerCode = params.customerCode as string;

  return (
    <PortalProvider customerCode={customerCode} isLive={true}>
      <PortalDataProvider mode="live" customerCode={customerCode}>
        <LivePortalShell customerCode={customerCode}>
          {children}
        </LivePortalShell>
      </PortalDataProvider>
    </PortalProvider>
  );
}
