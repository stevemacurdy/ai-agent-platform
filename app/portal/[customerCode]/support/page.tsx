'use client';

import { useParams } from 'next/navigation';
import PortalChat from '@/components/portal/PortalChat';

export default function SupportPage() {
  const params = useParams();
  const customerCode = params.customerCode as string;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Customer Support</h1>
          <p className="text-sm text-gray-500 mt-1">Chat with our AI assistant or request human support</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            AI Assistant Online
          </span>
        </div>
      </div>

      {/* Quick Help Topics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Inventory Questions', icon: '📦', desc: 'Stock levels, SKU lookup, expiration' },
          { label: 'Order Status', icon: '🚛', desc: 'Tracking, shipping updates' },
          { label: 'Billing Help', icon: '💳', desc: 'Invoice breakdown, payments' },
          { label: 'Receiving Info', icon: '📥', desc: 'Inbound shipments, photos' },
        ].map((topic) => (
          <div key={topic.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
            <span className="text-2xl">{topic.icon}</span>
            <p className="text-sm font-medium text-gray-900 mt-2">{topic.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{topic.desc}</p>
          </div>
        ))}
      </div>

      {/* Chat Widget */}
      <PortalChat customerCode={customerCode} />
    </div>
  );
}
