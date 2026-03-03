'use client';
import { useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
  actionLabel: string;
  actionDescription: string;
  accentColor?: string;
}

export default function ActionModal({ open, onClose, agentName, actionLabel, actionDescription, accentColor }: ActionModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, handleEsc]);

  if (!open) return null;

  const checks = [
    'Connect to your live data sources automatically',
    'Execute this action with one click',
    'Track results and measure impact over time',
    'Get AI recommendations tailored to your business',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Lock icon */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto" style={{ background: (accentColor || '#F5920B') + '15' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accentColor || '#F5920B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h3 className="text-lg font-extrabold text-center mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#1B2A4A' }}>
          {actionLabel}
        </h3>
        <p className="text-sm text-center mb-5" style={{ color: '#6B7280' }}>
          {actionDescription}
        </p>

        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
          With a WoulfAI account, {agentName} will:
        </p>
        <ul className="space-y-2.5 mb-6">
          {checks.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#4B5563' }}>
              <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 16 16" fill={accentColor || '#F5920B'}>
                <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm3.41 5.59a.75.75 0 00-1.06-1.06L7 7.88 5.65 6.53a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4-4z" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/register"
          className="block w-full text-center text-sm font-bold text-white py-3 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: '#F5920B', boxShadow: '0 4px 16px rgba(245,146,11,0.3)' }}
        >
          Start 14-Day Free Trial
        </Link>
        <Link
          href="/pricing"
          className="block text-center text-xs font-medium mt-3 py-2 transition-colors hover:text-orange-500"
          style={{ color: '#9CA3AF' }}
        >
          View pricing
        </Link>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
