'use client';
import { useCompany } from '@/lib/company-context';
import Link from 'next/link';

const THEMES: Record<string, { gradient: string; icon: string }> = {
  'woulf-group': { gradient: 'from-blue-600 to-cyan-500', icon: '🐺' },
  'desert-peak-lodge': { gradient: 'from-amber-600 to-orange-500', icon: '🏔️' },
  'clutch-3pl': { gradient: 'from-purple-600 to-pink-500', icon: '⚡' },
  'woulfai': { gradient: 'from-emerald-600 to-teal-500', icon: '🤖' },
};

export default function CompanyBanner() {
  const { company, clearCompany } = useCompany();

  if (!company) return null;

  const theme = THEMES[company.slug] || { gradient: 'from-gray-600 to-gray-500', icon: '🏢' };

  return (
    <div className={`bg-gradient-to-r ${theme.gradient} px-4 py-2 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{theme.icon}</span>
        <span className="text-sm font-semibold text-white">{company.name}</span>
        <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">Company Mode</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href={`/portal?company=${company.slug}`} className="text-[11px] text-white/80 hover:text-white transition">
          ← Back to Portal
        </Link>
        <button onClick={clearCompany} className="text-[11px] text-white/60 hover:text-white transition">
          ✕ Exit
        </button>
      </div>
    </div>
  );
}
