'use client';
import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: string;
  item_type: string;
  item_id: string;
  name: string;
  price: number;
}

// Generate or get cart session ID
function getCartSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('woulfai_cart_session');
  if (!id) {
    id = 'cart_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('woulfai_cart_session', id);
  }
  return id;
}

// Global event emitter for cart updates
const cartListeners: (() => void)[] = [];
export function onCartUpdate(fn: () => void) { cartListeners.push(fn); return () => { const i = cartListeners.indexOf(fn); if (i >= 0) cartListeners.splice(i, 1); }; }
export function emitCartUpdate() { cartListeners.forEach(fn => fn()); }

export function getSessionId() { return getCartSessionId(); }

export async function addToCart(item_type: string, item_id: string, name: string, price: number) {
  const session_id = getCartSessionId();
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, item_type, item_id, name, price }),
  });
  const data = await res.json();
  if (data.success) emitCartUpdate();
  return data;
}

export async function removeFromCart(item_id: string, item_type: string) {
  const session_id = getCartSessionId();
  await fetch('/api/cart', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, item_id, item_type }),
  });
  emitCartUpdate();
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    const sessionId = getCartSessionId();
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: { 'x-cart-session': sessionId },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
    return onCartUpdate(loadCart);
  }, [loadCart]);

  const handleRemove = async (item: CartItem) => {
    await removeFromCart(item.item_id, item.item_type);
  };

  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const hasContactSales = items.some(i => !i.price || i.price === 0);

  return (
    <>
      {/* Cart button - only show if items exist */}
      {items.length > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-24 z-[9998] w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-110 transition-all"
        >
          <ShoppingCart className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
            {items.length}
          </span>
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0E15] border-l border-white/10 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold">Your Package</h2>
                <span className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {items.length === 0 && (
                <div className="text-center py-12 text-sm text-gray-500">
                  Your cart is empty. Browse agents to build your package.
                </div>
              )}
              {items.map(item => (
                <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] text-gray-500 capitalize">{item.item_type}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.price > 0 ? (
                      <span className="text-sm font-mono font-bold text-white">${item.price}<span className="text-[10px] text-gray-500">/mo</span></span>
                    ) : (
                      <span className="text-xs text-gray-500">Contact Sales</span>
                    )}
                    <button onClick={() => handleRemove(item)} className="text-gray-600 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Estimated Monthly Total</span>
                  <span className="text-xl font-bold text-white">
                    ${total}<span className="text-sm text-gray-500">/mo</span>
                  </span>
                </div>
                {hasContactSales && (
                  <p className="text-[10px] text-gray-600">Some items require custom pricing. Our team will provide a full quote.</p>
                )}
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-xl font-medium text-sm hover:opacity-90 transition"
                >
                  Request Quote <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-[10px] text-gray-600">
                  Or <Link href="/register" className="text-blue-400 hover:text-blue-300">sign up</Link> to get started immediately
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
