'use client';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getAgentKPIs } from '@/lib/agent-kpi-data';

export default function ComplianceEmployeePage() {
  const { currentCompany, isLoading } = useTenant();
  const kpis = getAgentKPIs(currentCompany?.name, 'compliance');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{'🛡️'}</div>
        <div>
          <h1 className="text-2xl font-bold">Compliance Employee</h1>
          <p className="text-sm text-[#6B7280]">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
            <div className="text-[9px] text-[#9CA3AF] uppercase">{k.label}</div>
            <div className="text-2xl font-bold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center">
        <p className="text-sm text-[#6B7280]">Full Compliance Employee dashboard coming soon.</p>
        <p className="text-xs text-[#6B7280] mt-1">KPIs above reflect {currentCompany?.name || 'your company'} data.</p>
      </div>
    </div>
  );
}
