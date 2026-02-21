'use client';
import { useState } from 'react';
import { useTenant } from '@/lib/providers/tenant-provider';
import { getOps } from '@/lib/tenant-data';

export default function OperationsAgent() {
  const { currentCompany, isLoading } = useTenant();
  const data = getOps(currentCompany?.name);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{'⚙️'}</div>
        <div>
          <h1 className="text-2xl font-bold">Operations Agent</h1>
          <p className="text-sm text-gray-400">{isLoading ? 'Loading...' : currentCompany?.name || 'Select a company'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Active Projects</div><div className="text-2xl font-bold mt-1">{data.activeProjects}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">On-Time Rate</div><div className="text-2xl font-bold mt-1 text-emerald-400">{data.onTimeRate}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Crew Size</div><div className="text-2xl font-bold mt-1">{data.crewSize}</div></div>
        <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4"><div className="text-[9px] text-gray-500 uppercase">Budget Variance</div><div className={'text-2xl font-bold mt-1 ' + (data.budgetVariance.startsWith('-') ? 'text-emerald-400' : 'text-amber-400')}>{data.budgetVariance}</div></div>
      </div>

      <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Project Tracker</h3>
        <div className="space-y-4">
          {data.projects.map(p => (
            <div key={p.name} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white">{p.name}</span>
                  <span className={'text-[10px] px-2 py-0.5 rounded ' + (p.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-400' : p.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400')}>{p.status}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className={'h-2 rounded-full ' + (p.status === 'Complete' ? 'bg-emerald-500' : 'bg-blue-500')} style={{width: p.progress + '%'}}></div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                  <span>Due: {p.deadline}</span>
                  <span>{p.budget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
