'use client';

import { useParams } from 'next/navigation';
import PortalNav from '@/components/portal/PortalNav';
import { DEMO_CUSTOMER } from '@/lib/3pl-portal-data';

export default function PortalCustomerLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const customerName = DEMO_CUSTOMER.customer_name; // In production, fetch from API

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <PortalNav customerCode={customerCode} customerName={customerName} />
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
