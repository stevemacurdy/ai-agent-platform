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
          <h1 className="text-2xl font-bold">HR Agent</h1>
          <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Total Employees</div><div className="text-2xl font-bold mt-1">{data.totalEmployees}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Open Positions</div><div className="text-2xl font-bold mt-1 text-blue-400">{data.openPositions}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Avg Tenure</div><div className="text-2xl font-bold mt-1">{data.avgTenure}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Turnover Rate</div><div className="text-2xl font-bold mt-1 text-amber-400">{data.turnoverRate}</div></div>
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ' + (tab === t.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Team at a Glance</h3>
            <div className="space-y-2">
              {data.employees.slice(0, 4).map(e => (
                <div key={e.name} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                  <div><div className="text-sm text-white">{e.name}</div><div className="text-[10px] text-gray-500">{e.role} | {e.department}</div></div>
                  <span className={'text-[9px] px-1.5 py-0.5 rounded ' + (e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{e.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Pending PTO</h3>
            {data.ptoRequests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
            ) : data.ptoRequests.map(p => (
              <div key={p.name + p.dates} className="flex justify-between items-center py-2 border-b border-white/[0.03] last:border-0">
                <div><div className="text-sm text-white">{p.name}</div><div className="text-[10px] text-gray-500">{p.dates}</div></div>
                <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'directory' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-xs text-gray-500">Name</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Role</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Department</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Start Date</th>
            <th className="text-left px-4 py-3 text-xs text-gray-500">Status</th>
          </tr></thead><tbody>
            {data.employees.map(e => (
              <tr key={e.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm text-white">{e.name}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{e.role}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{e.department}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{e.startDate}</td>
                <td className="px-4 py-3"><span className={'text-[10px] px-2 py-0.5 rounded ' + (e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{e.status}</span></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}

      {tab === 'pto' && (
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">All PTO Requests</h3>
          {data.ptoRequests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No PTO requests for this company.</p>
          ) : data.ptoRequests.map(p => (
            <div key={p.name + p.dates} className="flex justify-between items-center py-3 border-b border-white/[0.03] last:border-0">
              <div><div className="text-sm text-white">{p.name}</div><div className="text-[10px] text-gray-500">{p.dates}</div></div>
              <div className="flex items-center gap-2">
                <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{p.status}</span>
                {p.status === 'Pending' && <button className="px-3 py-1 bg-emerald-600 text-white rounded text-xs">Approve</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
