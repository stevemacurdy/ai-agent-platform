'use client';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getAgentKPIs } from '@/lib/agent-kpi-data';

export default function WMSAgentPage() {
  const { currentCompany, isLoading } = useTenant();
  const kpis = getAgentKPIs(currentCompany?.name, 'wms');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{'🏭'}</div>
        <div>
          <h1 className="text-2xl font-bold">WMS Agent</h1>
          <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
            <div className="text-[9px] text-gray-500 uppercase">{k.label}</div>
            <div className="text-2xl font-bold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-400">Full WMS Agent dashboard coming soon.</p>
        <p className="text-xs text-gray-600 mt-1">KPIs above reflect {currentCompany?.name || 'your company'} data.</p>
      </div>
    </div>
  );
}
