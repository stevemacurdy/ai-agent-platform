'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getHR } from '@/lib/tenant-data';

const TABS = [
  { id: 'overview', name: 'Overview', icon: '👥' },
  { id: 'directory', name: 'Directory', icon: '📋' },
  { id: 'pto', name: 'PTO Requests', icon: '🏖️' },
];

export default function HRAgent() {
  const { currentCompany, isLoading } = useTenant();
  const [tab, setTab] = useState('overview');
  const data = getHR(currentCompany?.name);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{'👥'}</div>
        <div>
          <h1 className="text-2xl font-bold">HR Employee</h1>
          <p className="text-sm text-[#6B7280]">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Total Employees</div><div className="text-2xl font-bold mt-1">{data.totalEmployees}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Open Positions</div><div className="text-2xl font-bold mt-1 text-blue-600">{data.openPositions}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Avg Tenure</div><div className="text-2xl font-bold mt-1">{data.avgTenure}</div></div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4"><div className="text-[9px] text-[#9CA3AF] uppercase">Turnover Rate</div><div className="text-2xl font-bold mt-1 text-amber-600">{data.turnoverRate}</div></div>
      </div>

      <div className="flex gap-2 border-b border-[#E5E7EB] pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-[#1B2A4A] text-white' : 'bg-white shadow-sm text-[#6B7280] hover:bg-gray-100')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Team at a Glance</h3>
            <div className="space-y-2">
              {data.employees.slice(0, 4).map(e => (
                <div key={e.name} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm text-white">{e.name}</div><div className="text-[10px] text-[#9CA3AF]">{e.role} | {e.department}</div></div>
                  <span className={'text-[9px] px-1.5 py-0.5 rounded ' + (e.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>{e.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Pending PTO</h3>
            {data.ptoRequests.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] text-center py-4">No pending requests</p>
            ) : data.ptoRequests.map(p => (
              <div key={p.name + p.dates} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                <div><div className="text-sm text-white">{p.name}</div><div className="text-[10px] text-[#9CA3AF]">{p.dates}</div></div>
                <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'directory' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-[#E5E7EB]">
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Name</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Role</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Department</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Start Date</th>
            <th className="text-left px-4 py-3 text-xs text-[#9CA3AF]">Status</th>
          </tr></thead><tbody>
            {data.employees.map(e => (
              <tr key={e.name} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                <td className="px-4 py-3 text-sm text-white">{e.name}</td>
                <td className="px-4 py-3 text-sm text-[#4B5563]">{e.role}</td>
                <td className="px-4 py-3 text-sm text-[#6B7280]">{e.department}</td>
                <td className="px-4 py-3 text-xs text-[#9CA3AF]">{e.startDate}</td>
                <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded ' + (e.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>{e.status}</span></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {tab === 'pto' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">All PTO Requests</h3>
          {data.ptoRequests.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] text-center py-8">No PTO requests for this company.</p>
          ) : data.ptoRequests.map(p => (
            <div key={p.name + p.dates} className="flex justify-between items-center py-3 border-b border-white/[0.03] last:border-0">
              <div><div className="text-sm text-white">{p.name}</div><div className="text-[10px] text-[#9CA3AF]">{p.dates}</div></div>
              <div className="flex items-center gap-2">
                <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>{p.status}</span>
                {p.status === 'Pending' && <button className="px-3 py-1 bg-emerald-600 text-white rounded text-xs">Approve</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
