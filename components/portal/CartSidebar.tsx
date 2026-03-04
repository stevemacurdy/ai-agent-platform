'use client';

import { formatCurrency } from '@/lib/3pl-portal-data';
import type { CartItem } from '@/lib/3pl-portal-data';

interface Props {
  items: CartItem[];
  onUpdateQuantity: (inventoryId: string, quantity: number) => void;
  onRemove: (inventoryId: string) => void;
  onCheckout: () => void;
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ items, onUpdateQuantity, onRemove, onCheckout, open, onClose }: Props) {
  const totalWeight = items.reduce((s, i) => s + i.weight_per_unit * i.quantity, 0);
  const estimatedPallets = Math.max(1, Math.ceil(totalWeight / 2000));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Order Cart ({items.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              <p className="text-sm">Your cart is empty</p>
              <p className="text-xs mt-1">Browse inventory and add items</p>
            </div>
          ) : items.map(item => (
            <div key={item.inventory_id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.sku}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <button onClick={() => onRemove(item.inventory_id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded capitalize">{item.unit_type}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.inventory_id, Math.max(1, item.quantity - 1))} className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm">-</button>
                  <span className="text-sm font-medium w-10 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.inventory_id, Math.min(item.available, item.quantity + 1))} className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm">+</button>
                </div>
                <span className="text-xs text-gray-400 ml-auto">{(item.weight_per_unit * item.quantity).toFixed(0)} lbs</span>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xs text-gray-500">Items</p><p className="text-sm font-semibold">{items.reduce((s, i) => s + i.quantity, 0)}</p></div>
              <div><p className="text-xs text-gray-500">Weight</p><p className="text-sm font-semibold">{totalWeight.toFixed(0)} lbs</p></div>
              <div><p className="text-xs text-gray-500">Est. Pallets</p><p className="text-sm font-semibold">{estimatedPallets}</p></div>
            </div>
            <button onClick={onCheckout} className="w-full py-3 bg-[#F5920B] text-white rounded-xl text-sm font-semibold hover:bg-[#E08209] transition-colors shadow-sm">
              Continue to Shipping Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
