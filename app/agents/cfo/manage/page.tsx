'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function getAdminEmail(): string {
  try { return JSON.parse(localStorage.getItem('woulfai_session') || '{}')?.user?.email || 'admin' } catch { return 'admin' }
}

async function cfoRead(action: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch('/api/agents/cfo?' + qs);
  return res.json();
}

async function cfoWrite(action: string, data: any) {
  const res = await fetch('/api/agents/cfo/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-email': getAdminEmail() },
    body: JSON.stringify({ action, ...data }),
  });
  return res.json();
}

export default function CFOManagePage() {
  const [tab, setTab] = useState<'invoices' | 'contacts' | 'create'>('invoices')
  const [invoices, setInvoices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editInvoice, setEditInvoice] = useState<any>(null)
  const [editContact, setEditContact] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Create invoice form
  const [newPartnerId, setNewPartnerId] = useState('')
  const [newLines, setNewLines] = useState([{ name: '', quantity: 1, price_unit: 0 }])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const loadData = async () => {
    setLoading(true);
    const [invData, custData] = await Promise.all([
      cfoRead('invoices', { status: 'all' }),
      cfoRead('customers'),
    ]);
    setInvoices(invData.invoices || []);
    setCustomers(custData.customers || []);
    setLoading(false);
  };

  useEffect(() => { loadData() }, [])

  const handleUpdateInvoice = async () => {
    if (!editInvoice) return;
    const ref = (document.getElementById('inv-ref') as HTMLInputElement)?.value;
    const due = (document.getElementById('inv-due') as HTMLInputElement)?.value;
    const values: any = {};
    if (ref) values.ref = ref;
    if (due) values.invoice_date_due = due;
    const result = await cfoWrite('update-invoice', { invoiceId: editInvoice.id, values });
    if (result.success) { showToast('Invoice updated in Odoo'); setEditInvoice(null); loadData(); }
    else showToast('Error: ' + (result.error || 'Update failed'));
  };

  const handleUpdateContact = async () => {
    if (!editContact) return;
    const values: any = {};
    ['name', 'email', 'phone'].forEach(f => {
      const el = document.getElementById('contact-' + f) as HTMLInputElement;
      if (el?.value) values[f] = el.value;
    });
    const result = await cfoWrite('update-contact', { partnerId: editContact.id, values });
    if (result.success) { showToast('Contact updated in Odoo'); setEditContact(null); loadData(); }
    else showToast('Error: ' + (result.error || 'Update failed'));
  };

  const handleCreateInvoice = async () => {
    if (!newPartnerId || newLines.every(l => !l.name)) return;
    const validLines = newLines.filter(l => l.name && l.price_unit > 0);
    const result = await cfoWrite('create-invoice', { partnerId: parseInt(newPartnerId), lines: validLines });
    if (result.success) {
      showToast('Invoice #' + result.invoiceId + ' created in Odoo');
      setNewPartnerId(''); setNewLines([{ name: '', quantity: 1, price_unit: 0 }]);
      loadData();
    } else showToast('Error: ' + (result.error || 'Create failed'));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F4F5F7] text-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#2A9D8F] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-500/20 text-emerald-600 text-sm px-4 py-2 rounded-lg">{toast}</div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/agents/cfo" className="text-[#9CA3AF] hover:text-[#1B2A4A] text-sm">\u2190 CFO Dashboard</Link>
            <h1 className="text-xl font-bold">CFO Write-Back Console</h1>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Live Odoo</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'invoices' as const, label: 'Edit Invoices' },
            { key: 'contacts' as const, label: 'Edit Contacts' },
            { key: 'create' as const, label: '+ New Invoice' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
                (tab === t.key ? 'bg-blue-50 text-blue-600 border border-blue-500/20' : 'text-[#9CA3AF] hover:text-[#1B2A4A] hover:bg-white shadow-sm')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* INVOICES TAB */}
        {tab === 'invoices' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-[#9CA3AF] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4">Invoice</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-right py-3 px-4">Total</th>
                  <th className="text-right py-3 px-4">Balance</th>
                  <th className="text-left py-3 px-4">Due Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.name || i} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                    <td className="py-2.5 px-4 font-mono text-xs">{inv.name}</td>
                    <td className="py-2.5 px-4 text-[#6B7280]">{inv.partner_id?.[1] || '-'}</td>
                    <td className="py-2.5 px-4 text-right font-mono">${(inv.amount_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-right font-mono">${(inv.amount_residual || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-4 text-xs text-[#6B7280]">{inv.invoice_date_due || '-'}</td>
                    <td className="py-2.5 px-4">
                      <span className={'text-[10px] font-mono px-2 py-0.5 rounded ' +
                        (inv.payment_state === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50')}>
                        {inv.payment_state || 'draft'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={() => setEditInvoice(inv)} className="text-xs text-blue-600 hover:text-blue-600">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTACTS TAB */}
        {tab === 'contacts' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-[#9CA3AF] uppercase tracking-wider border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-white/[0.03] hover:bg-white shadow-sm">
                    <td className="py-2.5 px-4 font-medium">{c.name}</td>
                    <td className="py-2.5 px-4 text-[#6B7280] font-mono text-xs">{c.email || '-'}</td>
                    <td className="py-2.5 px-4 text-[#6B7280] text-xs">{c.phone || '-'}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button onClick={() => setEditContact(c)} className="text-xs text-blue-600 hover:text-blue-600">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CREATE INVOICE TAB */}
        {tab === 'create' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 max-w-2xl">
            <h3 className="font-semibold mb-4">Create Invoice in Odoo</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Customer</label>
                <select value={newPartnerId} onChange={e => setNewPartnerId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-2 block">Invoice Lines</label>
                {newLines.map((line, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={line.name} onChange={e => { const l = [...newLines]; l[i].name = e.target.value; setNewLines(l) }}
                      placeholder="Description" className="flex-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" />
                    <input type="number" value={line.quantity} onChange={e => { const l = [...newLines]; l[i].quantity = parseInt(e.target.value) || 1; setNewLines(l) }}
                      className="w-20 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" placeholder="Qty" />
                    <input type="number" value={line.price_unit || ''} onChange={e => { const l = [...newLines]; l[i].price_unit = parseFloat(e.target.value) || 0; setNewLines(l) }}
                      className="w-28 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" placeholder="Price" />
                    {newLines.length > 1 && (
                      <button onClick={() => setNewLines(newLines.filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-300 px-2">x</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setNewLines([...newLines, { name: '', quantity: 1, price_unit: 0 }])}
                  className="text-xs text-blue-600 hover:text-blue-600 mt-1">+ Add line</button>
              </div>
              <div className="bg-white shadow-sm border border-[#E5E7EB] rounded-lg p-3 flex justify-between text-sm">
                <span className="text-[#6B7280]">Total</span>
                <span className="font-mono font-bold">${newLines.reduce((s, l) => s + (l.quantity * l.price_unit), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <button onClick={handleCreateInvoice} disabled={!newPartnerId || newLines.every(l => !l.name)}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-40">
                Create Invoice in Odoo
              </button>
            </div>
          </div>
        )}

        {/* EDIT INVOICE MODAL */}
        {editInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditInvoice(null)}>
            <div className="bg-[#0D1117] border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold mb-4">Edit {editInvoice.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Reference / Notes</label>
                  <input id="inv-ref" defaultValue={editInvoice.ref || ''} placeholder="PO number, notes..."
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Due Date</label>
                  <input id="inv-due" type="date" defaultValue={editInvoice.invoice_date_due || ''}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" />
                </div>
                <button onClick={handleUpdateInvoice}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                  Save to Odoo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT CONTACT MODAL */}
        {editContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditContact(null)}>
            <div className="bg-[#0D1117] border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold mb-4">Edit Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Name</label>
                  <input id="contact-name" defaultValue={editContact.name || ''}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Email</label>
                  <input id="contact-email" defaultValue={editContact.email || ''}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Phone</label>
                  <input id="contact-phone" defaultValue={editContact.phone || ''}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E7EB] shadow-sm rounded-lg text-sm" />
                </div>
                <button onClick={handleUpdateContact}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                  Save to Odoo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
