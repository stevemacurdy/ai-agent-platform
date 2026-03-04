'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DEMO_CUSTOMER, formatCurrency, formatDate } from '@/lib/3pl-portal-data';

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function SettingsPage() {
  const params = useParams();
  const customerCode = params.customerCode as string;
  const customer = DEMO_CUSTOMER;

  const [contactName, setContactName] = useState(customer.contact_name || '');
  const [contactEmail, setContactEmail] = useState(customer.contact_email || '');
  const [contactPhone, setContactPhone] = useState(customer.contact_phone || '');

  const [shipStreet, setShipStreet] = useState((customer.shipping_address as Record<string, string>)?.street || '');
  const [shipCity, setShipCity] = useState((customer.shipping_address as Record<string, string>)?.city || '');
  const [shipState, setShipState] = useState((customer.shipping_address as Record<string, string>)?.state || '');
  const [shipZip, setShipZip] = useState((customer.shipping_address as Record<string, string>)?.zip || '');

  const [autoPayEnabled, setAutoPayEnabled] = useState(customer.auto_pay_enabled);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(customer.api_webhook_url || '');
  const [saved, setSaved] = useState(false);

  const [notifOrders, setNotifOrders] = useState(true);
  const [notifShipping, setNotifShipping] = useState(true);
  const [notifReceiving, setNotifReceiving] = useState(true);
  const [notifInvoices, setNotifInvoices] = useState(true);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const maskedApiKey = customer.api_key
    ? customer.api_key.slice(0, 8) + '...' + customer.api_key.slice(-4)
    : 'wai_mws_xxxxxxxxxxxx';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account, payment methods, and integrations</p>
        </div>
        <button
          onClick={handleSave}
          className="shrink-0 px-5 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-semibold hover:bg-[#1B2A4A]/90 transition-colors flex items-center gap-2"
        >
          {saved ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Saved
            </>
          ) : 'Save Changes'}
        </button>
      </div>

      {/* Contact Information */}
      <SectionCard title="Contact Information" description="Update your primary contact details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Contact Name" value={contactName} onChange={setContactName} />
          <InputField label="Email" value={contactEmail} onChange={setContactEmail} type="email" />
          <InputField label="Phone" value={contactPhone} onChange={setContactPhone} type="tel" />
          <InputField label="Company" value={customer.customer_name} onChange={() => {}} disabled />
        </div>
      </SectionCard>

      {/* Shipping Address */}
      <SectionCard title="Default Shipping Address" description="Pre-filled when placing orders">
        <div className="grid grid-cols-1 gap-4">
          <InputField label="Street Address" value={shipStreet} onChange={setShipStreet} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="City" value={shipCity} onChange={setShipCity} />
            <InputField label="State" value={shipState} onChange={setShipState} />
            <InputField label="ZIP Code" value={shipZip} onChange={setShipZip} />
          </div>
        </div>
      </SectionCard>

      {/* Payment & Auto-Pay */}
      <SectionCard title="Payment Methods" description="Manage payment methods and auto-pay settings">
        <div className="space-y-5">
          {/* Saved Card */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-[#1B2A4A] rounded-md flex items-center justify-center">
                <span className="text-white text-[8px] font-bold tracking-wider">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                <p className="text-xs text-gray-500">Expires 12/28</p>
              </div>
            </div>
            <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-50 rounded-full">Default</span>
          </div>

          {/* Auto-Pay Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-Pay</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {autoPayEnabled
                  ? `Active — saving ${customer.auto_pay_discount}% on every invoice`
                  : `Enable to save ${customer.auto_pay_discount}% (no convenience fee)`}
              </p>
            </div>
            <button
              onClick={() => setAutoPayEnabled(!autoPayEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${autoPayEnabled ? 'bg-[#2A9D8F]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${autoPayEnabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <button className="text-sm text-[#1B2A4A] font-medium hover:underline">
            + Add Payment Method
          </button>
        </div>
      </SectionCard>

      {/* Contract Details (read-only) */}
      <SectionCard title="Contract Details" description="Contact support to make changes to your contract">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
            <p className="text-sm font-medium text-gray-900">{customer.contract_start ? formatDate(customer.contract_start) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">End Date</p>
            <p className="text-sm font-medium text-gray-900">{customer.contract_end ? formatDate(customer.contract_end) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Payment Terms</p>
            <p className="text-sm font-medium text-gray-900">{customer.payment_terms}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Monthly Minimum</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.monthly_minimum)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Storage Rate</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.storage_rate_pallet)}/pallet/mo</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Inbound Handling</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.handling_rate_in)}/pallet</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Outbound Handling</p>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(customer.handling_rate_out)}/pallet</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Convenience Fee</p>
            <p className="text-sm font-medium text-gray-900">{customer.convenience_fee_rate}%</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <a href="#" className="text-sm text-[#1B2A4A] font-medium hover:underline">View Full Contract (PDF)</a>
          <span className="text-gray-300">|</span>
          <a href="/terms" className="text-sm text-[#1B2A4A] font-medium hover:underline">Terms &amp; Conditions</a>
        </div>
      </SectionCard>

      {/* API Integration */}
      <SectionCard title="API Integration" description="Connect your order management software to submit orders automatically">
        <div className="space-y-5">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 font-mono text-gray-700">
                {showApiKey ? (customer.api_key || 'wai_mws_demo_key_12345678') : maskedApiKey}
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(customer.api_key || 'wai_mws_demo_key_12345678')}
                className="px-3 py-2.5 text-xs font-medium text-[#1B2A4A] bg-[#1B2A4A]/5 rounded-xl hover:bg-[#1B2A4A]/10 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Webhook URL */}
          <InputField label="Webhook URL (order status updates)" value={webhookUrl} onChange={setWebhookUrl} />

          {/* API Docs Link */}
          <div className="bg-[#1B2A4A]/5 rounded-xl p-4">
            <p className="text-sm font-medium text-[#1B2A4A]">Connect Your System</p>
            <p className="text-xs text-gray-600 mt-1 mb-3">
              Use our REST API to submit outbound orders directly from your order management software. Send a POST request with your API key to place orders without logging into the portal.
            </p>
            <div className="bg-[#1B2A4A] rounded-lg p-3 font-mono text-xs text-green-300 overflow-x-auto">
              <p className="text-gray-400"># Submit an order via API</p>
              <p>curl -X POST https://woulfai.com/api/agents/3pl-portal/api/orders \</p>
              <p className="pl-4">-H &quot;X-API-Key: YOUR_API_KEY&quot; \</p>
              <p className="pl-4">-H &quot;Content-Type: application/json&quot; \</p>
              <p className="pl-4">{'-d \'{"items":[{"sku":"WPI-5LB","quantity":50}],...}\''}</p>
            </div>
            <a href="#" className="inline-block mt-3 text-sm text-[#1B2A4A] font-medium hover:underline">
              View Full API Documentation &rarr;
            </a>
          </div>
        </div>
      </SectionCard>

      {/* Notification Preferences */}
      <SectionCard title="Notification Preferences" description="Choose which email notifications you receive">
        <div className="space-y-3">
          {[
            { label: 'Order Confirmations', desc: 'When orders are placed or status changes', value: notifOrders, toggle: setNotifOrders },
            { label: 'Shipping Updates', desc: 'When orders ship with tracking info', value: notifShipping, toggle: setNotifShipping },
            { label: 'Receiving Alerts', desc: 'When inbound inventory arrives at the warehouse', value: notifReceiving, toggle: setNotifReceiving },
            { label: 'Invoice Notifications', desc: 'When new invoices are posted or payment confirmations', value: notifInvoices, toggle: setNotifInvoices },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-500">{pref.desc}</p>
              </div>
              <button
                onClick={() => pref.toggle(!pref.value)}
                className={`relative w-10 h-5 rounded-full transition-colors ${pref.value ? 'bg-[#2A9D8F]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pref.value ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
          <h2 className="text-base font-semibold text-red-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Account</h2>
        </div>
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Request Account Closure</p>
            <p className="text-xs text-gray-500">Contact support to discuss account termination</p>
          </div>
          <button className="px-4 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
