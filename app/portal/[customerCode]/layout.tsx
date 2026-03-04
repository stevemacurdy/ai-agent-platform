'use client';

import { useParams } from 'next/navigation';
import PortalNav from '@/components/portal/PortalNav';
import { PortalProvider } from '@/lib/portal-context';
import { PortalDataProvider } from '@/lib/portal-data-context';
import { DEMO_CUSTOMER } from '@/lib/3pl-portal-data';

export default function PortalCustomerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const isDemo = customerCode === 'MWS-001';
  const customerName = isDemo ? DEMO_CUSTOMER.customer_name : customerCode;

  return (
    <PortalProvider customerCode={customerCode} isLive={!isDemo}>
      <PortalDataProvider mode={isDemo ? 'demo' : 'live'} customerCode={customerCode}>
        <div className="min-h-screen bg-[#F4F5F7]">
          <PortalNav customerCode={customerCode} customerName={customerName} />
          <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </PortalDataProvider>
    </PortalProvider>
  );
}
