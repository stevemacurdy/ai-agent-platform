'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/3pl-portal-data';
import type { Invoice, Portal3PLCustomer } from '@/lib/3pl-portal-data';

interface Props {
  invoice: Invoice;
  customer: Portal3PLCustomer;
  onClose: () => void;
  onPaid: () => void;
}

export default function PaymentModal({ invoice, customer, onClose, onPaid }: Props) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const convenienceFee = customer.auto_pay_enabled ? 0 : +(invoice.balance_due * (customer.convenience_fee_rate / 100)).toFixed(2);
  const discount = customer.auto_pay_enabled ? +(invoice.balance_due * (customer.auto_pay_discount / 100)).toFixed(2) : 0;
  const totalCharge = +(invoice.balance_due + convenienceFee - discount).toFixed(2);

  async function handlePay() {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => onPaid(), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Successful</h3>
            <p className="text-sm text-gray-500">Invoice {invoice.invoice_number} has been paid.</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Pay Invoice</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Invoice {invoice.invoice_number}</span>
                  <span className="font-medium">{formatCurrency(invoice.balance_due)}</span>
                </div>
                {convenienceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Convenience fee ({customer.convenience_fee_rate}%)</span>
                    <span className="text-gray-600">+{formatCurrency(convenienceFee)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Auto-pay discount ({customer.auto_pay_discount}%)</span>
                    <span className="text-green-600">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                  <span>Total to charge</span>
                  <span>{formatCurrency(totalCharge)}</span>
                </div>
              </div>

              {!customer.auto_pay_enabled && (
                <div className="bg-[#2A9D8F]/5 border border-[#2A9D8F]/20 rounded-xl p-4">
                  <p className="text-sm font-medium text-[#2A9D8F]">Save with Auto-Pay</p>
                  <p className="text-xs text-gray-600 mt-1">Enable auto-pay to get a {customer.auto_pay_discount}% discount instead of the convenience fee. You would save {formatCurrency(convenienceFee + discount)} on this invoice.</p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Card Number</label>
                <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]/20" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM / YY" className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
                  <input type="text" placeholder="CVC" className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#1B2A4A]" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button onClick={handlePay} disabled={processing}
                className="w-full py-3 bg-[#F5920B] text-white rounded-xl text-sm font-semibold hover:bg-[#E08209] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {processing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(totalCharge)}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
