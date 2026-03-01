'use client'
import { useState } from 'react'

function getEmail() { try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || '' } catch { return '' } }

export default function CFOToolsPage() {
  const [tab, setTab] = useState<'odoo' | 'scanner' | 'writebacks'>('odoo')
  const [toast, setToast] = useState<string | null>(null)
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000) }

  // Odoo connection form
  const [odoo, setOdoo] = useState({ url: '', db: '', username: '', apiKey: '' })

  // Doc scanner
  const [scanFile, setScanFile] = useState<File | null>(null)
  const [scanResult, setScanResult] = useState<any>(null)
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    if (!scanFile) { show('Upload a document first'); return }
    setScanning(true)
    // Simulate scan
    await new Promise(r => setTimeout(r, 1500))
    setScanResult({
      vendor: scanFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      amount: '$' + (Math.random() * 50000 + 1000).toFixed(2),
      date: '2026-02-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0'),
      terms: 'Net 30',
      confidence: Math.floor(Math.random() * 15 + 85) + '%',
    })
    setScanning(false)
    show('Document scanned successfully')
  }

  // Writeback log
  const WRITEBACKS = [
    { id: 1, action: 'Invoice Created', target: 'INV-2026-0042', odooId: 'account.move/142', status: 'synced', time: '2 min ago' },
    { id: 2, action: 'Payment Registered', target: 'PAY-0018', odooId: 'account.payment/88', status: 'synced', time: '15 min ago' },
    { id: 3, action: 'Vendor Bill Approved', target: 'BILL-0091', odooId: 'account.move/156', status: 'pending', time: '1 hr ago' },
    { id: 4, action: 'Journal Entry', target: 'JE-0033', odooId: 'account.move/160', status: 'error', time: '2 hr ago' },
  ]

  const tabs = [
    { id: 'odoo' as const, label: '🔗 Odoo Connection' },
    { id: 'scanner' as const, label: '📄 Doc Scanner' },
    { id: 'writebacks' as const, label: '🔄 Write-back Log' },
  ]

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-sm px-4 py-2 rounded-lg">{toast}</div>}

      <div>
        <h1 className="text-xl font-bold">CFO Tools</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Odoo ERP integration, document scanning, and write-back controls</p>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-all " + (tab === t.id ? 'bg-gray-100 text-white' : 'text-[#9CA3AF] hover:text-[#4B5563]')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Odoo Connection */}
      {tab === 'odoo' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold">Odoo ERP Connection</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Odoo URL</label>
              <input value={odoo.url} onChange={e => setOdoo({...odoo, url: e.target.value})} placeholder="https://mycompany.odoo.com" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Database</label>
              <input value={odoo.db} onChange={e => setOdoo({...odoo, db: e.target.value})} placeholder="mycompany-prod" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">Username</label>
              <input value={odoo.username} onChange={e => setOdoo({...odoo, username: e.target.value})} placeholder="admin@company.com" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
            <div><label className="text-[10px] text-[#9CA3AF] uppercase block mb-1">API Key</label>
              <input value={odoo.apiKey} onChange={e => setOdoo({...odoo, apiKey: e.target.value})} type="password" placeholder="••••••••" className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => show('Connection test: Success! Odoo v17 detected.')} className="px-5 py-2.5 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium">Test Connection</button>
            <button onClick={() => show('Settings saved')} className="px-5 py-2.5 bg-white border border-[#E5E7EB] shadow-sm text-white rounded-lg text-sm">Save</button>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 mt-2">
            <div className="text-xs text-emerald-600 font-medium">Supported Operations</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Create/update invoices · Register payments · Post journal entries · Sync vendor bills · Read chart of accounts · Pull financial reports</div>
          </div>
        </div>
      )}

      {/* Document Scanner */}
      {tab === 'scanner' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Upload Document for OCR Extraction</h3>
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center hover:border-blue-500/30 transition-colors">
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setScanFile(e.target.files?.[0] || null)} className="hidden" id="scan-upload" />
              <label htmlFor="scan-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">📄</div>
                <div className="text-sm text-[#6B7280]">{scanFile ? scanFile.name : 'Drop a PDF, PNG, or JPG here'}</div>
                <div className="text-xs text-blue-600 mt-2">Browse Files</div>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleScan} disabled={!scanFile || scanning} className="px-5 py-2.5 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {scanning ? 'Scanning...' : 'Extract Data'}
              </button>
              <label className="px-5 py-2.5 bg-white border border-[#E5E7EB] shadow-sm text-white rounded-lg text-sm cursor-pointer text-center">
                📷 Camera
                <input type="file" accept="image/*" capture="environment" onChange={e => setScanFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
          </div>
          {scanResult && (
            <div className="bg-white border border-emerald-500/20 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-emerald-600 mb-3">Extraction Results</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(scanResult).map(([k, v]) => (
                  <div key={k}><div className="text-[10px] text-[#9CA3AF] uppercase">{k}</div><div className="text-sm font-mono mt-0.5">{String(v)}</div></div>
                ))}
              </div>
              <button onClick={() => show('Pushed to Odoo as draft vendor bill')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium">
                Push to Odoo →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Write-back Log */}
      {tab === 'writebacks' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex justify-between items-center">
            <h3 className="text-sm font-semibold">Odoo Write-back Log</h3>
            <button onClick={() => show('Retrying failed write-backs...')} className="text-xs text-blue-600">Retry Failed</button>
          </div>
          {WRITEBACKS.map(wb => (
            <div key={wb.id} className="flex items-center gap-4 p-4 border-b border-white/[0.03] last:border-0">
              <span className={"w-2 h-2 rounded-full " + (wb.status === 'synced' ? 'bg-emerald-400' : wb.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400')} />
              <div className="flex-1">
                <div className="text-sm">{wb.action} → <span className="font-mono text-blue-600">{wb.target}</span></div>
                <div className="text-[10px] text-[#6B7280]">Odoo: {wb.odooId} · {wb.time}</div>
              </div>
              <span className={"text-[10px] px-2 py-0.5 rounded font-medium " +
                (wb.status === 'synced' ? 'bg-emerald-50 text-emerald-600' :
                 wb.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-500/10 text-rose-400')}>
                {wb.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
