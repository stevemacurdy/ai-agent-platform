// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function AsnPage() {
  const [asns, setAsns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Upload form
  const [uploadOrderId, setUploadOrderId] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;

      const { data: memberships } = await sb
        .from('company_members').select('company_id, companies(portal_type)').eq('user_id', session.user.id);
      const wh = memberships?.find(m => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both') || memberships?.[0];
      if (!wh) return;

      const cId = wh.company_id;
      setCompanyId(cId);

      const [asnRes, ordRes] = await Promise.all([
        sb.from('asn_documents').select('*, warehouse_orders(order_number)').eq('company_id', cId).order('created_at', { ascending: false }).limit(100),
        sb.from('warehouse_orders').select('id, order_number, status').eq('company_id', cId).order('created_at', { ascending: false }).limit(50),
      ]);

      setAsns(asnRes.data || []);
      setOrders(ordRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const uploadAsn = async () => {
    if (!companyId || !selectedFile) return;
    setUploading(true);

    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `asn/${companyId}/${Date.now()}-${selectedFile.name}`;

      const { data: uploadData, error: uploadErr } = await sb.storage
        .from('warehouse-files')
        .upload(filePath, selectedFile, { contentType: selectedFile.type });

      let fileUrl = '';
      if (uploadErr) {
        // If storage bucket doesn't exist yet, store without file URL
        console.warn('Storage upload failed (bucket may not exist):', uploadErr.message);
        fileUrl = '';
      } else {
        const { data: urlData } = sb.storage.from('warehouse-files').getPublicUrl(filePath);
        fileUrl = urlData?.publicUrl || '';
      }

      const asnNumber = `ASN-${Date.now().toString(36).toUpperCase()}`;

      const { data: asn, error: asnErr } = await sb
        .from('asn_documents')
        .insert({
          company_id: companyId,
          order_id: uploadOrderId || null,
          asn_number: asnNumber,
          file_name: selectedFile.name,
          file_url: fileUrl,
          file_size: selectedFile.size,
          notes: uploadNotes || null,
          uploaded_by: session.user.id,
        })
        .select('*, warehouse_orders(order_number)')
        .single();

      if (asnErr) throw asnErr;

      if (asn) {
        setAsns(prev => [asn, ...prev]);
      }

      // Reset form
      setSelectedFile(null);
      setUploadOrderId('');
      setUploadNotes('');
      setShowUpload(false);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error('ASN upload failed:', err);
      alert('Failed to upload ASN: ' + (err.message || 'Unknown error'));
    }
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">ASN Documents</h1>
          <p className="text-sm text-white/40 mt-1">Advanced Shipping Notices — {asns.length} documents</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors">
          {showUpload ? 'Cancel' : '+ Upload ASN'}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Upload ASN Document</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">Link to Order (optional)</label>
              <select value={uploadOrderId} onChange={(e) => setUploadOrderId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="" className="bg-gray-900">No linked order</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id} className="bg-gray-900">
                    {o.order_number} ({o.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Notes</label>
              <input type="text" value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Optional notes about this ASN"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">File (PDF, CSV, Excel, or image)</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  selectedFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                }`}>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm text-white font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-white/40 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-white/50">Click to select a file or drag and drop</p>
                      <p className="text-xs text-white/30 mt-1">PDF, CSV, XLSX, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" className="hidden"
                  accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileSelect} />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => { setShowUpload(false); setSelectedFile(null); }}
              className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 transition-colors">
              Cancel
            </button>
            <button onClick={uploadAsn} disabled={uploading || !selectedFile}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors">
              {uploading ? 'Uploading...' : 'Upload ASN'}
            </button>
          </div>
        </div>
      )}

      {/* ASN Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">ASN #</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Order</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">File</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase">Size</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Notes</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td></tr>
              ))
            ) : asns.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No ASN documents yet. Upload your first ASN to get started.</td></tr>
            ) : (
              asns.map(a => (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-400">{a.asn_number}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{a.warehouse_orders?.order_number || '\u2014'}</td>
                  <td className="px-4 py-3">
                    {a.file_url ? (
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 underline truncate max-w-[200px] block">
                        {a.file_name}
                      </a>
                    ) : (
                      <span className="text-xs text-white/50">{a.file_name || '\u2014'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-white/40">
                    {a.file_size ? `${(a.file_size / 1024).toFixed(0)} KB` : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50 truncate max-w-[200px]">{a.notes || '\u2014'}</td>
                  <td className="px-4 py-3 text-xs text-white/50">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
